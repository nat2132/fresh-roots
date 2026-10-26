'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowRight, CheckCircle2, Leaf, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(form.username, form.password);
      // Wait for AuthContext to update and get the user
      const profile = await api.getProfile();
      if (profile.role !== 'customer') {
        router.push('/admin');
      } else {
        router.push('/products');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (typeof err === 'object') {
        setError(err.detail || err.error || JSON.stringify(err));
      } else {
        setError(err || 'Invalid username or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-stretch bg-white dark:bg-slate-950 transition-colors duration-500">
        {/* Left Side: Illustration / Brand Content */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-forest dark:bg-slate-900 items-center justify-center p-20 text-white transition-colors duration-500">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-brand-green/20 rounded-leaf blur-3xl animate-pulse" />
            <div className="absolute bottom-[10%] right-[10%] w-[35%] h-[35%] bg-brand-sunrise/20 rounded-blob blur-3xl" />
          </div>
          
          <div className="relative z-10 max-w-lg space-y-8 animate-in fade-in slide-in-from-left duration-1000">
            <div className="space-y-4">
              <span className="text-6xl mb-6 block">🌿</span>
              <h2 className="font-serif text-5xl md:text-6xl leading-tight">Welcome Back to the Roots</h2>
              <p className="text-xl text-white/80 leading-relaxed font-medium">
                Your farm-fresh favorites are waiting for you. Log in to manage your basket and support local farmers.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 pt-4">
              {[
                { icon: <Leaf className="h-5 w-5" />, text: "45+ Varieties of Produce" },
                { icon: <User className="h-5 w-5" />, text: "12 Certified Local Farms" },
                { icon: <CheckCircle2 className="h-5 w-5" />, text: "Always Fresh, Never Stocked" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <div className="h-8 w-8 rounded-full bg-brand-green flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <span className="font-semibold tracking-wide">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 pt-32 lg:pt-0">
          <Card className="w-full max-w-md border-none shadow-none bg-transparent">
            <CardHeader className="space-y-2 p-0 mb-8">
              <CardTitle className="font-serif text-4xl text-brand-forest dark:text-white transition-colors duration-500">Log In</CardTitle>
              <CardDescription className="text-base text-slate-500 dark:text-slate-400 transition-colors duration-500">
                Enter your credentials to access your farm-to-table experience
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in zoom-in duration-300 transition-colors duration-500">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-bold text-slate-700 dark:text-slate-300">Username</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-green transition-colors" />
                    <Input 
                      id="username" 
                      placeholder="Enter your username" 
                      className="h-14 pl-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white transition-all focus:ring-brand-green/20 focus:border-brand-green"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-bold text-slate-700 dark:text-slate-300">Password</Label>
                    <Link href="/forgot-password" size="sm" className="text-sm font-bold text-brand-green hover:text-brand-forest dark:hover:text-white transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-green transition-colors" />
                    <Input 
                      id="password" 
                      type="password"
                      placeholder="••••••••" 
                      className="h-14 pl-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white transition-all focus:ring-brand-green/20 focus:border-brand-green"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-full bg-brand-green hover:bg-brand-forest text-white text-lg font-bold shadow-xl shadow-brand-green/20 transition-all active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">Log In to Market <ArrowRight className="h-5 w-5" /></span>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="p-0 mt-8 flex flex-col space-y-4">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100 dark:border-slate-800 transition-colors duration-500"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-950 px-4 text-slate-400 dark:text-slate-500 font-bold tracking-widest transition-colors duration-500">or</span>
                </div>
              </div>
              <p className="text-center text-slate-500 dark:text-slate-400 font-medium transition-colors duration-500">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-brand-green font-bold hover:underline underline-offset-4">
                  Create Account
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
