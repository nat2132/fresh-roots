'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  Star,
  MessageCircle
} from 'lucide-react';
import api from '@/lib/api';
import SalesChart from '@/components/admin/SalesChart';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Connect to WebSocket for real-time updates
    const ws = api.createDashboardWebSocket((message) => {
      if (message.type === 'dashboard_update') {
        setStats(prev => ({ ...prev, ...message.data }));
      }
    });
    
    return () => {
      if (ws) ws.close();
    };
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading Dashboard...</div>;
  if (!stats) return <div>Error loading dashboard stats.</div>;

  const statCards = [
    { 
      title: 'Total Revenue', 
      value: `${stats.total_revenue.toLocaleString()} ETB`, 
      icon: TrendingUp, 
      color: 'text-green-600',
      bg: 'bg-green-100' 
    },
    { 
      title: 'Orders Today', 
      value: stats.orders_today, 
      icon: ShoppingCart, 
      color: 'text-blue-600',
      bg: 'bg-blue-100' 
    },
    { 
      title: 'Pending Orders', 
      value: stats.pending_orders, 
      icon: Clock, 
      color: 'text-orange-600',
      bg: 'bg-orange-100' 
    },
    { 
      title: 'Active Farmers', 
      value: stats.total_farmers, 
      icon: Users, 
      color: 'text-purple-600',
      bg: 'bg-purple-100' 
    },
    { 
      title: 'Avg. Rating', 
      value: `${parseFloat(stats.avg_rating || 0).toFixed(1)} / 5`, 
      icon: Star, 
      color: 'text-amber-600',
      bg: 'bg-amber-100' 
    },
    { 
      title: 'Open Tickets', 
      value: stats.open_tickets || 0, 
      icon: MessageCircle, 
      color: 'text-red-600',
      bg: 'bg-red-100' 
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back. Here's what's happening with Fresh Roots today.</p>
      </div>

      {/* Low Stock Alert */}
      {stats.low_stock_items > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-800">
          <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium">
            Attention: {stats.low_stock_items} inventory items are at low or zero stock. 
            <a href="/admin/warehouse" className="ml-2 underline font-bold">Manage Inventory</a>
          </p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="border-none shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Sales Trends (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={stats.sales_chart} />
          </CardContent>
        </Card>

        {/* Quick Tips or Announcements */}
        <Card className="border-none shadow-sm bg-gradient-to-br from-green-600 to-green-800 text-white">
          <CardContent className="p-8 h-full flex flex-col justify-center">
            <h3 className="text-xl font-bold mb-4">Supply Chain Tip</h3>
            <p className="text-green-50/80 leading-relaxed mb-6">
              Batch traceability is verified for 100% of current inventory. Remember to check expiration dates for "Perishables" in Section B-12.
            </p>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-fit rounded-full px-6">
              Inventory Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center">
            <Clock className="mr-2 h-5 w-5 text-slate-400" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recent_orders.map((order) => (
                <TableRow key={order.order_number} className="cursor-pointer hover:bg-slate-50">
                  <TableCell className="font-medium text-blue-600">
                    <a href={`/admin/orders/${order.order_number}`}>#{order.order_number}</a>
                  </TableCell>
                  <TableCell>{order.customer_name || 'Guest'}</TableCell>
                  <TableCell>{parseFloat(order.total_amount).toFixed(0)} ETB</TableCell>
                  <TableCell>
                    <Badge 
                      className={`capitalize ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                        order.status === 'pending' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        'bg-blue-100 text-blue-700 border-blue-200'
                      }`}
                      variant="outline"
                    >
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
