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
import { AlertCircle, ArrowRight, CheckCircle2, Leaf, Mail, Lock, User, AtSign } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { register: registerAuth } = useAuth();
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '',
    password: '', password_confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirm) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await registerAuth({
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        email: form.email,
        password: form.password,
        password_confirm: form.password_confirm,
      });
      
      const profile = await api.getProfile();
      if (profile.role !== 'customer') {
        router.push('/admin');
      } else {
        router.push('/products');
      }
    } catch (err) {
      console.error('Signup error:', err);
      if (typeof err === 'object' && !err.detail && !err.error) {
        // Handle field errors: {"username": ["..."], "email": ["..."]}
        const fieldErrors = Object.entries(err)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(' ') : messages}`)
          .join(' | ');
        setError(fieldErrors || 'Failed to create account.');
      } else {
        setError(err.detail || err.error || err.message || 'Failed to create account. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => setForm({ ...form, [field]: value });

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-stretch bg-white dark:bg-slate-950 transition-colors duration-500">
        {/* Left Side: Brand Content */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-forest dark:bg-slate-900 items-center justify-center p-20 text-white transition-colors duration-500">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[20%] right-[10%] w-[45%] h-[45%] bg-brand-sunrise/10 rounded-leaf blur-3xl animate-pulse" />
            <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] bg-brand-green/20 rounded-blob blur-3xl" />
          </div>
          
          <div className="relative z-10 max-w-lg space-y-8 animate-in fade-in slide-in-from-left duration-1000">
            <div className="space-y-4">
              <span className="text-6xl mb-6 block">🌱</span>
              <h2 className="font-serif text-5xl md:text-6xl leading-tight">Join the Fresh Movement</h2>
              <p className="text-xl text-white/80 leading-relaxed font-medium">
                Start your journey to fresher, healthier food — straight from local farms to your doorstep.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 pt-4">
              {[
                { icon: <CheckCircle2 className="h-5 w-5" />, text: "Free and instant sign up" },
                { icon: <Leaf className="h-5 w-5" />, text: "Support small-scale local agriculture" },
                { icon: <ArrowRight className="h-5 w-5" />, text: "Next-day delivery available" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <div className="h-8 w-8 rounded-full bg-brand-sunrise flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <span className="font-semibold tracking-wide">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 pt-32 lg:pt-0">
          <Card className="w-full max-w-lg border-none shadow-none bg-transparent">
            <CardHeader className="space-y-2 p-0 mb-8">
              <CardTitle className="font-serif text-4xl text-brand-forest dark:text-white transition-colors duration-500">Create Account</CardTitle>
              <CardDescription className="text-base text-slate-500 dark:text-slate-400 transition-colors duration-500">
                Join as a customer to browse and buy farm-fresh products.
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-sm font-bold text-slate-700 dark:text-slate-300">First Name</Label>
                    <Input 
                      id="first_name" 
                      placeholder="John" 
                      className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white transition-all focus:ring-brand-green/20"
                      value={form.first_name}
                      onChange={(e) => updateField('first_name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-sm font-bold text-slate-700 dark:text-slate-300">Last Name</Label>
                    <Input 
                      id="last_name" 
                      placeholder="Doe" 
                      className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white transition-all focus:ring-brand-green/20"
                      value={form.last_name}
                      onChange={(e) => updateField('last_name', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-bold text-slate-700 dark:text-slate-300">Username</Label>
                  <div className="relative group">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-green transition-colors" />
                    <Input 
                      id="username" 
                      placeholder="johndoe" 
                      className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white transition-all focus:ring-brand-green/20"
                      value={form.username}
                      onChange={(e) => updateField('username', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-green transition-colors" />
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="john@example.com" 
                      className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white transition-all focus:ring-brand-green/20"
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-bold text-slate-700 dark:text-slate-300">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-green transition-colors" />
                      <Input 
                        id="password" 
                        type="password"
                        placeholder="••••••••" 
                        className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white transition-all focus:ring-brand-green/20"
                        value={form.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password_confirm" className="text-sm font-bold text-slate-700 dark:text-slate-300">Confirm Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-green transition-colors" />
                      <Input 
                        id="password_confirm" 
                        type="password"
                        placeholder="••••••••" 
                        className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white transition-all focus:ring-brand-green/20"
                        value={form.password_confirm}
                        onChange={(e) => updateField('password_confirm', e.target.value)}
                        required
                      />
                    </div>
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
                    <span className="flex items-center gap-2">Create My Account <ArrowRight className="h-5 w-5" /></span>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="p-0 mt-8 flex flex-col space-y-4">
              <p className="text-center text-slate-500 dark:text-slate-400 font-medium transition-colors duration-500">
                Already have an account?{' '}
                <Link href="/login" className="text-brand-green font-bold hover:underline underline-offset-4">
                  Log In instead
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
