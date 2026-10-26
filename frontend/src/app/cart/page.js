'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Truck, 
  Lock, 
  ArrowLeft, 
  CreditCard,
  AlertCircle,
  Leaf
} from 'lucide-react';
import api from '@/lib/api';
import CouponInput from '@/components/cart/CouponInput';

// Fallback images
import broccoliImg from '../../images/products/broccoli.jpeg';
import tomatoImg from '../../images/products/tomato.jpeg';
import onionImg from '../../images/products/onion.jpeg';
import potatoImg from '../../images/products/potato.jpeg';
import garlicImg from '../../images/products/garlic.jpeg';

export default function CartPage() {
  const router = useRouter();
  const { cart, loading: cartLoading, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  
  const [checkingOut, setCheckingOut] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  if (cartLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-32 container text-center space-y-4">
          <div className="h-12 w-12 border-4 border-brand-green/30 border-t-brand-green rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Loading your basket...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-32 container flex flex-col items-center justify-center space-y-6 text-center">
          <div className="h-20 w-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-3xl">🔒</div>
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-brand-forest dark:text-white">Please Log In</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm">You need to be logged in to view your cart and place orders.</p>
          </div>
          <Button 
            size="lg" 
            className="bg-brand-green hover:bg-brand-forest px-10 rounded-full"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Log In to Continue
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  const items = cart?.items || [];
  
  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-32 container flex flex-col items-center justify-center space-y-6 text-center">
          <div className="h-24 w-24 bg-brand-cream dark:bg-slate-900 rounded-full flex items-center justify-center text-4xl transition-colors duration-500">🛒</div>
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-brand-forest dark:text-white">Your basket is empty</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm">Looks like you haven&apos;t added any fresh vegetables yet.</p>
          </div>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white rounded-full px-10"
            nativeButton={false}
            render={<Link href="/products" />}
          >
            Browse the Market
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  const subtotal = cart.total_price || 0;
  const discount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const delivery = subtotal > 0 ? 50.00 : 0;
  const total = subtotal + delivery - discount;

  const handleCheckout = async () => {
    if (!address || !phone) {
      setError('Delivery address and phone number are required.');
      return;
    }
    setError('');
    setCheckingOut(true);
    
    try {
      const orderData = {
        delivery_address: address,
        delivery_phone: phone,
        payment_method: paymentMethod,
        notes: notes,
        coupon_code: appliedCoupon?.code
      };
      
      const response = await api.createOrder(orderData);
      clearCart();
      router.push(`/orders/${response.order_number}`);
    } catch (err) {
      console.error(err);
      setError(err.error || err.detail || 'Failed to place order. Some items might be out of stock.');
      setCheckingOut(false);
    }
  };

  const getProductImage = (slug) => {
    if (slug?.includes('tomato') || slug?.includes('pepper')) return tomatoImg;
    if (slug?.includes('carrot') || slug?.includes('beet')) return potatoImg;
    if (slug?.includes('onion') || slug?.includes('squash')) return onionImg;
    if (slug?.includes('garlic') || slug?.includes('basil')) return garlicImg;
    return broccoliImg;
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-500 pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-10">
            <h1 className="font-serif text-4xl text-brand-forest dark:text-white transition-colors duration-500">Your Market Bag</h1>
            <p className="text-slate-500 dark:text-slate-400">{items.length} items from local farmers</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 transition-colors duration-500">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
              
              <div className="space-y-4">
                {items.map(item => {
                  const img = item.product.image || getProductImage(item.product.slug);
                  return (
                    <Card key={item.id} className="border-none shadow-sm overflow-hidden group dark:bg-slate-900 transition-colors duration-500">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex gap-4 md:gap-6">
                          <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                            <Image src={img} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <Link href={`/products/${item.product.slug}`} className="font-serif text-lg md:text-xl text-brand-forest dark:text-white hover:text-brand-green transition-colors">
                                  {item.product.name}
                                </Link>
                                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                                  <span className="font-bold text-slate-900 dark:text-white">{parseFloat(item.product.price).toFixed(0)} ETB</span>
                                  <span>/ {item.product.unit}</span>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full h-8 w-8"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-end justify-between">
                              <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-full p-1 border border-slate-100 dark:border-slate-700 transition-colors duration-500">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 rounded-full text-brand-forest dark:text-white"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 rounded-full text-brand-forest dark:text-white"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{parseFloat(item.subtotal).toFixed(0)} ETB</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Button 
                variant="ghost" 
                className="text-brand-green group"
                nativeButton={false}
                render={<Link href="/products" />}
              >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Continue Shopping
              </Button>
            </div>

            {/* Order Summary & Checkout */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-none shadow-lg rounded-3xl overflow-hidden dark:bg-slate-900 transition-colors duration-500">
                <CardHeader className="bg-brand-forest dark:bg-brand-green/20 text-white dark:text-white pb-6 pt-8 transition-colors duration-500">
                  <CardTitle className="font-serif text-2xl flex items-center gap-2">
                    <Truck className="h-6 w-6" /> Delivery & Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6 bg-white dark:bg-slate-900 pt-8 transition-colors duration-500">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-bold text-slate-700 dark:text-slate-300">Delivery Address *</Label>
                      <Input 
                        id="address"
                        placeholder="e.g. Bole Medhanialem, House 123" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)}
                        className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number *</Label>
                      <Input 
                        id="phone"
                        placeholder="e.g. 0911234567" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment" className="text-sm font-bold text-slate-700 dark:text-slate-300">Payment Method *</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                          <SelectValue placeholder="Select payment" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-800 border-slate-700">
                          <SelectItem value="cod">Cash on Delivery</SelectItem>
                          <SelectItem value="digital">Digital Payment (Telebirr/CBE Birr)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-bold text-slate-700 dark:text-slate-300 text-muted-foreground">Notes (Optional)</Label>
                      <Textarea 
                        id="notes"
                        placeholder="Any instructions for the driver?" 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)}
                        className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-brand-green/20 focus:border-brand-green min-h-[80px] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Promo Code</Label>
                    <CouponInput 
                      subtotal={subtotal} 
                      onApply={setAppliedCoupon} 
                      onRemove={() => setAppliedCoupon(null)}
                      appliedCoupon={appliedCoupon}
                    />
                  </div>

                  <Separator className="bg-slate-100 dark:bg-slate-800" />

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                      <span className="font-bold text-slate-900 dark:text-white">{subtotal.toFixed(0)} ETB</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-sm text-brand-green animate-in fade-in duration-300">
                        <span>Discount ({appliedCoupon.code})</span>
                        <span className="font-bold">-{discount.toFixed(0)} ETB</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Delivery Fee</span>
                      <span className="font-bold text-slate-900 dark:text-white">{delivery.toFixed(0)} ETB</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-2 border-t border-slate-100 dark:border-slate-800 mt-2 transition-colors duration-500">
                      <span className="text-brand-forest dark:text-brand-green-light">Total</span>
                      <span className="text-brand-green">{total.toFixed(0)} ETB</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    <Button 
                      size="lg" 
                      className="w-full h-14 rounded-full bg-brand-green hover:bg-brand-forest text-lg font-bold shadow-xl shadow-brand-green/20 transition-all active:scale-[0.98]"
                      onClick={handleCheckout}
                      disabled={checkingOut || !address || !phone}
                    >
                      {checkingOut ? (
                        <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Confirm Order</span>
                      )}
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest">
                      <Lock className="h-3 w-3" /> Secure Checkout
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Promo Info */}
              <div className="bg-brand-cream/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-brand-green/10 dark:border-brand-green/20 flex items-start gap-3 transition-colors duration-500">
                <Leaf className="h-5 w-5 text-brand-green shrink-0 mt-1" />
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>Sustainability Tip:</strong> Every delivery from Fresh Roots is grouped with other orders in your area to reduce carbon emissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
