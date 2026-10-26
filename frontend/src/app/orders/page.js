'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Search, 
  ChevronRight,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';

// Fallback images
import broccoliImg from '../../images/products/broccoli.jpeg';
import tomatoImg from '../../images/products/tomato.jpeg';
import onionImg from '../../images/products/onion.jpeg';
import potatoImg from '../../images/products/potato.jpeg';
import garlicImg from '../../images/products/garlic.jpeg';

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data.results || data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (orderNumber) => {
    setReordering(orderNumber);
    try {
      await api.reorder(orderNumber);
      router.push('/cart');
    } catch (err) {
      console.error('Reorder failed', err);
      alert('Failed to reorder items.');
    } finally {
      setReordering(null);
    }
  };

  const getStatusInfo = (status) => {
    switch(status) {
      case 'pending': return { color: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400', icon: <Clock className="h-3 w-3" />, label: 'Pending' };
      case 'confirmed': return { color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Confirmed' };
      case 'processing': return { color: 'bg-brand-green/10 dark:bg-brand-green/20 text-brand-green', icon: <Package className="h-3 w-3" />, label: 'Processing' };
      case 'out_for_delivery': return { color: 'bg-brand-sunrise/20 dark:bg-brand-sunrise/30 text-brand-sunrise-dark dark:text-brand-sunrise', icon: <Truck className="h-3 w-3" />, label: 'Out for Delivery' };
      case 'delivered': return { color: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Delivered' };
      case 'completed': return { color: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Completed' };
      case 'cancelled': return { color: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Cancelled' };
      default: return { color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300', icon: <Package className="h-3 w-3" />, label: status };
    }
  };

  const getProductImage = (slug) => {
    if (slug?.includes('tomato') || slug?.includes('pepper')) return tomatoImg;
    if (slug?.includes('carrot') || slug?.includes('beet')) return potatoImg;
    if (slug?.includes('onion') || slug?.includes('squash')) return onionImg;
    if (slug?.includes('garlic') || slug?.includes('basil')) return garlicImg;
    return broccoliImg;
  };

  if (loading || authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-32 container text-center space-y-4">
          <div className="h-12 w-12 border-4 border-brand-green/30 border-t-brand-green rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Fetching your order history...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-500 pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <span className="font-accent text-2xl text-brand-soil dark:text-brand-sunrise block">Track your favorites</span>
              <h1 className="font-serif text-5xl text-brand-forest dark:text-white tracking-tight">Order History</h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl">
                Review your past purchases and track real-time delivery status for current orders.
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {orders.map(order => {
              const status = getStatusInfo(order.status);
              return (
                <Card key={order.order_number} className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden hover:shadow-md transition-all duration-500">
                  <CardHeader className="p-6 md:p-8 flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800 transition-colors duration-500">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                      <Link href={`/orders/${order.order_number}`} className="font-serif text-xl md:text-2xl text-brand-forest dark:text-white hover:text-brand-green transition-colors flex items-center gap-2 group">
                        Order #{order.order_number}
                        <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </Link>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">{parseFloat(order.total_amount).toFixed(0)} ETB</span>
                      <Badge className={`${status.color} border-none flex items-center gap-1.5 px-3 py-1 transition-colors duration-500`}>
                        {status.icon}
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-wrap gap-4">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="relative group">
                          <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-105">
                            <Image 
                              src={getProductImage(item.product_slug)} 
                              alt={item.product_name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          {item.quantity > 1 && (
                            <span className="absolute -top-2 -right-2 bg-brand-green text-white text-[10px] font-bold h-6 w-6 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800 shadow-sm transition-colors duration-500">
                              {item.quantity}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="p-6 md:p-8 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row gap-4 items-center justify-end transition-colors duration-500">
                    <Button 
                      variant="ghost" 
                      className="w-full sm:w-auto rounded-full font-bold text-slate-600 dark:text-slate-400"
                      nativeButton={false}
                      render={<Link href={`/orders/${order.order_number}`} />}
                    >
                      Track Delivery
                    </Button>
                    <Button 
                      className="w-full sm:w-auto bg-brand-green hover:bg-brand-forest text-white rounded-full font-bold px-8"
                      onClick={() => handleReorder(order.order_number)}
                      disabled={reordering === order.order_number}
                    >
                      {reordering === order.order_number ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span className="flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Reorder Items</span>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}

            {orders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-6 transition-colors duration-500">
                <div className="h-24 w-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-4xl mx-auto transition-colors duration-500">📦</div>
                <div className="space-y-2">
                  <h3 className="font-serif text-3xl text-brand-forest dark:text-white">No orders yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm">When you buy farm-fresh food, your orders and tracking status will appear here.</p>
                </div>
                <Button 
                  size="lg" 
                  className="bg-brand-green hover:bg-brand-forest rounded-full px-10"
                  nativeButton={false}
                  render={<Link href="/products" />}
                >
                  Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
