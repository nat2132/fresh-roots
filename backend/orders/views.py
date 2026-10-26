from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import F

from core.permissions import IsAdmin, IsStaff, IsCustomer, IsOwnerOrAdmin
from .models import Order, OrderItem, OrderStatusLog
from .serializers import (
    OrderSerializer, OrderListSerializer,
    CreateOrderSerializer, UpdateOrderStatusSerializer,
)
from cart.models import Cart
from warehouse.models import InventoryItem, StockMovement
from farmers.models import Farmer
from django.utils import timezone
from django.db.models import Sum, Count, Avg


class OrderListView(generics.ListAPIView):
    """
    Customer: own orders.
    Admin: all orders (with filters).
    """
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'payment_method']
    ordering_fields = ['created_at', 'total']
    ordering = ['-created_at']

    def get_serializer_class(self):
        return OrderListSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Order.objects.all().prefetch_related('items')
        return Order.objects.filter(user=user).prefetch_related('items')


class OrderDetailView(generics.RetrieveAPIView):
    """View order details."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'order_number'

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.prefetch_related('items', 'status_logs')
        if user.role in ('admin', 'warehouse_manager', 'delivery_partner'):
            return qs
        return qs.filter(user=user)


class CreateOrderView(APIView):
    """
    Customer: create order from cart.

    Business logic:
    1. Validate cart is not empty
    2. Validate stock availability (with locking)
    3. Reserve stock in warehouse
    4. Create order + items with traceability snapshot
    5. Clear cart
    6. For digital payments: order stays 'pending' until payment confirmed
    7. For COD: order auto-transitions to 'confirmed'
    """
    permission_classes = [IsCustomer]

    @transaction.atomic
    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # 1. Get cart
        try:
            cart = Cart.objects.prefetch_related('items__product__farmer', 'items__product__batch').get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        cart_items = cart.items.all()
        if not cart_items.exists():
            return Response({'error': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Validate stock & reserve
        insufficient = []
        inventory_updates = []

        for cart_item in cart_items:
            product = cart_item.product
            # Lock inventory rows for this product
            inv_items = InventoryItem.objects.select_for_update().filter(
                product=product, quantity__gt=F('reserved_quantity')
            ).order_by('received_at')

            available = sum(i.available_quantity for i in inv_items)
            if available < cart_item.quantity:
                insufficient.append({
                    'product': product.name,
                    'requested': cart_item.quantity,
                    'available': available,
                })
                continue

            # Reserve stock across inventory items (FIFO)
            remaining = cart_item.quantity
            for inv_item in inv_items:
                if remaining <= 0:
                    break
                can_reserve = inv_item.available_quantity
                to_reserve = min(remaining, can_reserve)
                inventory_updates.append((inv_item, to_reserve))
                remaining -= to_reserve

        if insufficient:
            return Response({
                'error': 'Insufficient stock for some items.',
                'details': insufficient,
            }, status=status.HTTP_400_BAD_REQUEST)

        # 3. Calculate total & Apply Coupon
        subtotal = sum(item.product.price * item.quantity for item in cart_items)
        delivery_fee = 50.00  # Default delivery fee
        discount_amount = 0
        coupon = None

        if data.get('coupon_code'):
            from promotions.models import Coupon
            try:
                coupon = Coupon.objects.get(code=data['coupon_code'])
                if coupon.is_valid and subtotal >= coupon.min_purchase:
                    discount_amount = coupon.calculate_discount(subtotal)
                    # Increment use count
                    coupon.used_count += 1
                    coupon.save(update_fields=['used_count'])
                else:
                    return Response({'error': 'Coupon is invalid or requirements not met.'}, status=status.HTTP_400_BAD_REQUEST)
            except Coupon.DoesNotExist:
                return Response({'error': 'Coupon not found.'}, status=status.HTTP_404_NOT_FOUND)

        total = subtotal + delivery_fee - discount_amount

        # 4. Create order
        order = Order.objects.create(
            user=request.user,
            payment_method=data['payment_method'],
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            discount_amount=discount_amount,
            coupon=coupon,
            total=total,
            delivery_address=data['delivery_address'],
            delivery_phone=data.get('delivery_phone', ''),
            notes=data.get('notes', ''),
        )

        # 5. Create order items with traceability snapshot
        for cart_item in cart_items:
            product = cart_item.product
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                farmer_code=product.farmer.farmer_code if product.farmer else '',
                batch_number=product.batch.batch_number if product.batch else '',
                quantity=cart_item.quantity,
                price=product.price,
                unit=product.unit,
            )

        # 6. Apply inventory reservations
        for inv_item, qty in inventory_updates:
            inv_item.reserved_quantity += qty
            inv_item.save(update_fields=['reserved_quantity', 'updated_at'])
            StockMovement.objects.create(
                inventory_item=inv_item,
                movement_type='reserved',
                quantity_change=-qty,
                quantity_after=inv_item.available_quantity,
                reference=order.order_number,
                performed_by=request.user,
                notes=f'Reserved for order {order.order_number}',
            )

        # 7. Clear cart
        cart_items.delete()

        # 8. Auto-confirm COD orders
        if data['payment_method'] == 'cod':
            order.transition_to('confirmed', changed_by=request.user, note='COD order auto-confirmed.')

        return Response(
            OrderSerializer(order, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class UpdateOrderStatusView(APIView):
    """Staff: update order status with state machine enforcement."""
    permission_classes = [IsStaff]

    def put(self, request, order_number):
        serializer = UpdateOrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = serializer.validated_data['status']
        note = serializer.validated_data.get('note', '')

        try:
            order.transition_to(new_status, changed_by=request.user, note=note)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(OrderSerializer(order, context={'request': request}).data)


class OrderTrackingView(generics.RetrieveAPIView):
    """Customer/Delivery Partner: track order status and history."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'order_number'

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.prefetch_related('items', 'status_logs')
        if user.role == 'customer':
            return qs.filter(user=user)
        return qs  # Staff/delivery can see all


class ReorderView(APIView):
    """Customer: re-add items from a previous order to cart."""
    permission_classes = [IsCustomer]

    def post(self, request, order_number):
        try:
            order = Order.objects.prefetch_related('items__product').get(
                order_number=order_number, user=request.user
            )
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        cart, _ = Cart.objects.get_or_create(user=request.user)

        added = []
        unavailable = []
        for item in order.items.all():
            if item.product and item.product.in_stock and item.product.is_visible:
                from cart.models import CartItem
                cart_item, created = CartItem.objects.get_or_create(
                    cart=cart,
                    product=item.product,
                    defaults={'quantity': item.quantity}
                )
                if not created:
                    cart_item.quantity += item.quantity
                    cart_item.save()
                added.append(item.product_name)
            else:
                unavailable.append(item.product_name)

        return Response({
            'message': 'Items added to cart!',
            'added': added,
            'unavailable': unavailable,
        })


class AdminStatsView(APIView):
    """Staff: get overview metrics for the admin dashboard."""
    permission_classes = [IsStaff]

    def get(self, request):
        today = timezone.now().date()
        from feedback.models import Review
        from support.models import SupportTicket
        
        stats = {
            'total_revenue': Order.objects.filter(status='completed').aggregate(total=Sum('total'))['total'] or 0,
            'orders_today': Order.objects.filter(created_at__date=today).count(),
            'pending_orders': Order.objects.exclude(status__in=['completed', 'cancelled']).count(),
            'total_farmers': Farmer.objects.filter(is_active=True).count(),
            'low_stock_items': InventoryItem.objects.filter(quantity__lte=F('reserved_quantity')).count(),
            'avg_rating': Review.objects.aggregate(avg=Avg('rating'))['avg'] or 0,
            'total_reviews': Review.objects.count(),
            'open_tickets': SupportTicket.objects.filter(status='open').count(),
            'recent_orders': OrderListSerializer(Order.objects.all()[:5], many=True).data,
            'sales_chart': self.get_sales_chart_data()
        }
        return Response(stats)

    def get_sales_chart_data(self):
        from django.db.models.functions import TruncDate
        from datetime import timedelta
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=6)
        
        # Get data from DB
        daily_sales = Order.objects.filter(
            status='completed',
            created_at__date__range=[start_date, end_date]
        ).annotate(date=TruncDate('created_at')).values('date').annotate(revenue=Sum('total')).order_by('date')
        
        # Fill gaps
        data_map = {item['date']: float(item['revenue']) for item in daily_sales}
        chart_data = []
        for i in range(7):
            curr_date = start_date + timedelta(days=i)
            chart_data.append({
                'name': curr_date.strftime('%a'), # Day name
                'revenue': data_map.get(curr_date, 0)
            })
        return chart_data
