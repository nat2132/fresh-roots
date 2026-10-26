'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  MessageCircle, 
  Settings,
  ChevronRight,
  LogOut,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import SupportModal from '@/components/support/SupportModal';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [showSupport, setShowSupport] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20 transition-colors duration-500">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sidebar / User Info */}
            <div className="space-y-6">
              <Card className="border-none shadow-lg rounded-3xl overflow-hidden dark:bg-slate-900 transition-colors duration-500">
                <div className="h-24 bg-gradient-to-r from-brand-green to-brand-forest" />
                <CardContent className="px-6 pb-8 -mt-12 text-center">
                  <div className="h-24 w-24 rounded-full bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-xl mx-auto flex items-center justify-center text-3xl text-brand-forest dark:text-white font-bold mb-4">
                    {user.first_name?.[0] || user.username?.[0] || 'U'}
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
                    {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
                  </h2>
                  <Badge variant="outline" className="mt-2 capitalize bg-brand-green/10 text-brand-green border-brand-green/20">
                    {user.role}
                  </Badge>
                  
                  <div className="mt-8 space-y-4 text-left">
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full mt-8 rounded-full border-red-100 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between h-14 px-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50"
                  onClick={() => setShowSupport(true)}
                >
                  <span className="flex items-center gap-3 font-bold text-slate-700 dark:text-white">
                    <MessageCircle className="h-5 w-5 text-brand-green" /> Help & Support
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between h-14 px-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50"
                  asChild
                >
                  <Link href="/orders">
                    <span className="flex items-center gap-3 font-bold text-slate-700 dark:text-white">
                      <Package className="h-5 w-5 text-blue-500" /> My Orders
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Main Content / Activity */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                <Link href="/orders" className="text-sm font-bold text-brand-green hover:underline">View All</Link>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="p-12 text-center text-slate-400">Loading activity...</div>
                ) : orders.length === 0 ? (
                  <Card className="border-none shadow-sm p-12 text-center bg-white dark:bg-slate-900">
                    <Package className="h-12 w-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No recent orders yet.</p>
                    <Button variant="link" className="text-brand-green mt-2" asChild>
                      <Link href="/products">Start Shopping</Link>
                    </Button>
                  </Card>
                ) : (
                  orders.slice(0, 3).map(order => (
                    <Card key={order.order_number} className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer dark:bg-slate-900" asChild>
                      <Link href={`/orders/${order.order_number}`}>
                        <CardContent className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                              <Package className="h-6 w-6 text-slate-400" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">Order #{order.order_number}</p>
                              <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900 dark:text-white">{parseFloat(order.total).toFixed(0)} ETB</p>
                            <Badge className="bg-blue-50 text-blue-600 border-none capitalize text-[10px] mt-1">
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))
                )}
              </div>

              {/* Promo Banner */}
              <Card className="border-none bg-gradient-to-br from-brand-forest to-slate-900 text-white rounded-3xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/20 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-brand-green/30 transition-colors" />
                <CardContent className="p-10 relative z-10">
                  <h4 className="text-3xl font-serif font-bold mb-4">Fresh from the farm,<br />straight to your door.</h4>
                  <p className="text-slate-300 max-w-md mb-8 leading-relaxed">
                    Explore our latest harvest of organic vegetables from verified local farmers in the Oromia region.
                  </p>
                  <Button className="bg-brand-green hover:bg-white hover:text-brand-forest rounded-full px-10 h-12 font-bold transition-all shadow-xl shadow-brand-green/20" asChild>
                    <Link href="/products">Shop Latest Harvest</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </main>

      {showSupport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <SupportModal onCancel={() => setShowSupport(false)} />
        </div>
      )}

      <Footer />
    </>
  );
}

function Badge({ children, className, variant }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {children}
    </span>
  );
}
