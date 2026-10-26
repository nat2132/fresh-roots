import json
from channels.generic.websocket import AsyncWebsocketConsumer


class OrderTrackingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.order_number = self.scope['url_route']['kwargs']['order_number']
        self.group_name = f'order_{self.order_number}'

        # Join order group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave order group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Receive message from room group
    async def order_update(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'order_update',
            'data': message
        }))


class DeliveryLocationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.delivery_id = self.scope['url_route']['kwargs']['delivery_id']
        self.group_name = f'delivery_{self.delivery_id}'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def location_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'location_update',
            'data': event['message']
        }))


class AdminDashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'admin_dashboard'

        # Only allow admin users
        user = self.scope['user']
        if user.is_authenticated and user.role in ('admin', 'content_manager', 'warehouse_manager'):
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def dashboard_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'dashboard_update',
            'data': event['message']
        }))
