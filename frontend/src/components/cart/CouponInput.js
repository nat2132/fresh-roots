'use client';

import { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export default function CouponInput({ subtotal, onApply, onRemove, appliedCoupon }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!code) return;
    setLoading(true);
    setError('');

    try {
      const result = await api.applyCoupon(code, subtotal);
      onApply(result);
      setCode('');
    } catch (err) {
      console.error('Failed to apply coupon', err);
      setError(err.error || 'Invalid or expired coupon code.');
    } finally {
      setLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="bg-brand-green/10 dark:bg-brand-green/20 border border-brand-green/20 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-right-2 duration-300">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-brand-green text-white rounded-full flex items-center justify-center">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-brand-green">Coupon Applied: {appliedCoupon.code}</p>
            <p className="text-xs text-brand-green/70">
              -{appliedCoupon.discount_amount.toFixed(0)} ETB Discount
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full text-brand-green hover:bg-brand-green/10"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Promo Code" 
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="pl-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 transition-all focus:ring-brand-green/20"
          />
        </div>
        <Button 
          onClick={handleApply} 
          disabled={loading || !code}
          className="rounded-xl bg-brand-forest hover:bg-slate-900 text-white font-bold px-6 shadow-md transition-all active:scale-95"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium ml-1 animate-in fade-in slide-in-from-top-1">{error}</p>
      )}
    </div>
  );
}
