'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const data = await api.getAdminOrders(params);
      setOrders(data.results || data);
    } catch (err) {
      console.error('Failed to fetch admin orders', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderNumber, newStatus) => {
    try {
      await api.updateOrderStatus(orderNumber, newStatus);
      fetchOrders(); // Refresh
    } catch (err) {
      console.error('Failed to update status', err);
      alert(err.error || 'Failed to update status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle2 className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'out_for_delivery': return <Truck className="h-4 w-4" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'packed', label: 'Packed' },
    { value: 'out_for_delivery', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'completed', label: 'Completed' },
  ];

  if (loading && orders.length === 0) return <div>Loading Orders...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Order Management</h1>
        <p className="text-slate-500 mt-1">Review and process customer orders through the supply chain.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusOptions.map((opt) => (
          <Button 
            key={opt.value}
            variant={statusFilter === opt.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(opt.value)}
            className={statusFilter === opt.value ? 'bg-blue-600' : ''}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.order_number} className="hover:bg-slate-50">
                  <TableCell className="pl-6 font-bold text-blue-600">
                    #{order.order_number}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customer_name}</div>
                    <div className="text-xs text-slate-400">{order.delivery_phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{parseFloat(order.total_amount).toFixed(0)} ETB</div>
                    <div className="text-xs text-slate-400">{order.items?.length} items</div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`capitalize flex items-center gap-1 w-fit ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-[10px]">
                      {order.payment_method}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      {order.status === 'pending' && order.payment_method === 'digital' && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => updateStatus(order.order_number, 'confirmed')}
                        >
                          Confirm Payment
                        </Button>
                      )}
                      {order.status === 'confirmed' && (
                        <Button size="sm" onClick={() => updateStatus(order.order_number, 'processing')}>
                          Process
                        </Button>
                      )}
                      {order.status === 'processing' && (
                        <Button size="sm" onClick={() => updateStatus(order.order_number, 'packed')}>
                          Pack
                        </Button>
                      )}
                      {!['completed', 'cancelled', 'out_for_delivery', 'delivered'].includes(order.status) && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => updateStatus(order.order_number, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/orders/${order.order_number}`}>Details</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
