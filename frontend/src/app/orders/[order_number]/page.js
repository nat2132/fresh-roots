'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Package, 
  ShoppingBag, 
  MapPin, 
  Key,
  Calendar,
  AlertTriangle,
  XCircle,
  MessageSquare
} from 'lucide-react';
import ReviewForm from '@/components/orders/ReviewForm';

export default function OrderTrackingPage(props) {
  const params = use(props.params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    let ws = null;

    const fetchOrderAndConnectWS = async () => {
      try {
        const data = await api.getOrderTracking(params.order_number);
        setOrder(data);

        // Connect to WebSocket
        ws = api.createOrderWebSocket(params.order_number, (wsData) => {
          if (wsData.type === 'order_status_update') {
            setOrder(prev => {
              if (!prev) return prev;
              return { ...prev, status: wsData.data.status, status_display: wsData.data.status_display };
            });
          }
        });
      } catch (err) {
        console.error('Failed to fetch order', err);
        setError('Order not found or you do not have permission.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndConnectWS();

    return () => {
      if (ws) ws.close();
    };
  }, [user, authLoading, router, params.order_number]);

  if (loading || authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-32 container text-center space-y-4">
          <div className="h-12 w-12 border-4 border-brand-green/30 border-t-brand-green rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Fetching live tracking data...</p>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-32 container flex flex-col items-center justify-center text-center space-y-6">
          <div className="h-20 w-20 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center text-4xl">⚠️</div>
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-brand-forest dark:text-white transition-colors duration-500">Oops! Order not found</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm">{error || "We couldn't find the order you're looking for."}</p>
          </div>
          <Button className="bg-brand-green hover:bg-brand-forest rounded-full px-8" asChild>
            <Link href="/orders">Back to My Orders</Link>
          </Button>
        </div>
      </>
    );
  }

  const timelineSteps = [
    { key: 'pending', label: 'Order Placed', icon: <ShoppingBag className="h-4 w-4" /> },
    { key: 'confirmed', label: 'Confirmed', icon: <CheckCircle2 className="h-4 w-4" /> },
    { key: 'processing', label: 'Processing', icon: <Package className="h-4 w-4" /> },
    { key: 'packed', label: 'Packed', icon: <Package className="h-4 w-4" /> },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: <Truck className="h-4 w-4" /> },
    { key: 'delivered', label: 'Delivered', icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  const currentStepIndex = timelineSteps.findIndex(s => s.key === order.status);
  
  const isCompleted = (index) => {
    if (order.status === 'completed') return true;
    if (order.status === 'cancelled') return false;
    return currentStepIndex >= index;
  };
  
  const isCurrent = (index) => {
    if (order.status === 'completed' || order.status === 'cancelled') return false;
    return currentStepIndex === index;
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-500 pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <Button variant="ghost" className="mb-8 group text-slate-500 dark:text-slate-400" asChild>
            <Link href="/orders">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Orders
            </Link>
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="space-y-1">
                <h1 className="font-serif text-4xl text-brand-forest dark:text-white tracking-tight transition-colors duration-500">Order Tracking</h1>
                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className="font-bold text-slate-700 dark:text-slate-200 transition-colors duration-500">#{order.order_number}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span>Placed on {new Date(order.created_at).toLocaleDateString()}</span>
                </p>
              </div>
              <Badge className={`px-4 py-1.5 text-sm border-none shadow-sm transition-colors duration-500 ${
                order.status === 'cancelled' ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400' : 
                order.status === 'completed' || order.status === 'delivered' ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400' : 
                'bg-brand-green/10 dark:bg-brand-green/20 text-brand-green'
              }`}>
                {order.status_display}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Delivery Code Alert */}
              {order.verification_code && !['completed', 'cancelled', 'delivered'].includes(order.status) && (
                <div className="relative overflow-hidden bg-brand-sunrise dark:bg-brand-sunrise text-white p-8 rounded-[3rem] shadow-xl shadow-brand-sunrise/20 animate-in slide-in-from-top duration-700">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Key className="h-32 w-32" />
                  </div>
                  <div className="relative z-10 text-center space-y-4">
                    <p className="text-sm font-bold uppercase tracking-widest opacity-90">Delivery Verification Code</p>
                    <h2 className="text-6xl md:text-7xl font-serif tracking-[12px] font-bold drop-shadow-sm">{order.verification_code}</h2>
                    <p className="text-sm max-w-xs mx-auto opacity-90 font-medium">Provide this code to your driver when they arrive to confirm delivery.</p>
                  </div>
                </div>
              )}

              {/* Status Banner */}
              {order.status === 'completed' && (
                <div className="bg-green-600 dark:bg-green-700 text-white p-6 rounded-3xl flex items-center gap-4 animate-in fade-in duration-1000">
                  <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Delivery Completed!</h3>
                    <p className="text-white/80">Your farm-fresh produce has been delivered. Enjoy!</p>
                  </div>
                </div>
              )}

              {/* Review / Feedback Section */}
              {order.status === 'completed' && !order.has_review && (
                <div className="animate-in slide-in-from-bottom duration-1000 delay-300">
                  <ReviewForm 
                    orderId={order.id} 
                    onSubmitted={() => setOrder(prev => ({ ...prev, has_review: true }))} 
                  />
                </div>
              )}

              {order.status === 'cancelled' && (
                <div className="bg-red-600 dark:bg-red-700 text-white p-6 rounded-3xl flex items-center gap-4 animate-in fade-in duration-1000">
                  <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <XCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Order Cancelled</h3>
                    <p className="text-white/80">This order has been cancelled. Please contact support for more information.</p>
                  </div>
                </div>
              )}

              {/* Tracking Timeline */}
              <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-500">
                <CardHeader className="p-8 pb-0">
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 transition-colors duration-500">
                    <Truck className="h-5 w-5 text-brand-green" /> Delivery Journey
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800 transition-colors duration-500" />
                    
                    {/* Animated Progress Line */}
                    <div 
                      className="absolute left-6 top-0 w-0.5 bg-brand-green transition-all duration-1000 ease-in-out" 
                      style={{ 
                        height: order.status === 'completed' || order.status === 'delivered' ? '100%' : 
                                order.status === 'cancelled' ? '0%' : 
                                `${(Math.max(0, currentStepIndex) / (timelineSteps.length - 1)) * 100}%` 
                      }}
                    />

                    <div className="space-y-10 relative">
                      {timelineSteps.map((step, idx) => {
                        const completed = isCompleted(idx);
                        const current = isCurrent(idx);
                        return (
                          <div key={idx} className="flex items-start gap-6 group">
                            <div className={`relative z-10 h-12 w-12 rounded-full flex items-center justify-center transition-all duration-500 shrink-0 ${
                              completed ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 
                              current ? 'bg-white dark:bg-slate-800 border-2 border-brand-green text-brand-green shadow-xl' : 
                              'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 transition-colors duration-500'
                            }`}>
                              {completed ? <CheckCircle2 className="h-6 w-6" /> : step.icon}
                              {current && (
                                <span className="absolute inset-0 rounded-full bg-brand-green/20 animate-ping" />
                              )}
                            </div>
                            <div className="pt-2.5">
                              <h4 className={`font-bold transition-colors duration-500 ${
                                completed ? 'text-slate-900 dark:text-white' : 
                                current ? 'text-brand-green text-lg' : 
                                'text-slate-400 dark:text-slate-600'
                              }`}>
                                {step.label}
                              </h4>
                              {current && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-500">Live tracking update: We are currently {step.label.toLowerCase()} your order.</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator className="my-10 bg-slate-50 dark:bg-slate-800 transition-colors duration-500" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors duration-500">
                        <MapPin className="h-4 w-4 text-brand-green" /> Delivery Details
                      </h4>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors duration-500">
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors duration-500">
                          {order.delivery_address}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors duration-500">
                        <ShoppingBag className="h-4 w-4 text-brand-green" /> Order Value
                      </h4>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors duration-500">
                        <div className="flex justify-between items-baseline">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white transition-colors duration-500">{parseFloat(order.total_amount).toFixed(0)} ETB</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{order.items?.length || 0} Items</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Info */}
              <div className="flex flex-col md:flex-row items-center gap-6 justify-center py-6">
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Need help with your delivery?</p>
                <div className="flex gap-4">
                  <Button variant="outline" className="rounded-full border-slate-200 dark:border-slate-800 dark:text-white dark:hover:bg-slate-800">Contact Support</Button>
                  <Button variant="ghost" className="text-brand-green hover:bg-brand-green/10" asChild>
                    <Link href="/faq">Delivery FAQ</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
