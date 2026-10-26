'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ticket, Plus, Tag, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // New Promotion Form State
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_purchase: '0',
    valid_to: '',
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const data = await api.getPromotions();
      setPromotions(data.results || data);
    } catch (err) {
      console.error('Failed to fetch promotions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const newPromo = await api.createPromotion({
        ...formData,
        valid_to: new Date(formData.valid_to).toISOString(),
      });
      setPromotions([newPromo, ...promotions]);
      setIsDialogOpen(false);
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_purchase: '0',
        valid_to: '',
      });
    } catch (err) {
      console.error('Failed to create promotion', err);
      alert('Failed to create promotion. Please check your inputs.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 font-bold">Promotions & Coupons</h1>
          <p className="text-slate-500">Manage discount codes and promotional campaigns.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button className="bg-brand-green hover:bg-brand-forest rounded-full shadow-lg shadow-brand-green/20 h-11 px-6" />
          }>
            <Plus className="mr-2 h-4 w-4" /> Create Coupon
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif font-bold text-center mb-4">New Coupon</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input 
                  id="code" 
                  required 
                  placeholder="e.g. SUMMER2026"
                  className="uppercase"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select 
                    value={formData.discount_type} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, discount_type: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (ETB)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input 
                    type="number" 
                    required 
                    min="1"
                    placeholder={formData.discount_type === 'percentage' ? 'e.g. 15' : 'e.g. 500'}
                    value={formData.discount_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_purchase">Minimum Purchase (ETB)</Label>
                <Input 
                  id="min_purchase" 
                  type="number" 
                  required 
                  min="0"
                  value={formData.min_purchase}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_purchase: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_to">Valid Until</Label>
                <Input 
                  id="valid_to" 
                  type="datetime-local" 
                  required 
                  value={formData.valid_to}
                  onChange={(e) => setFormData(prev => ({ ...prev, valid_to: e.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full bg-brand-green hover:bg-brand-forest rounded-xl h-12 mt-4">
                Create Coupon
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-500">Loading promotions...</div>
        ) : promotions.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl text-center border border-dashed border-slate-200">
            <Ticket className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No active promotions found.</p>
          </div>
        ) : (
          promotions.map((promo) => {
            const isActive = promo.active && new Date(promo.valid_to) > new Date();
            
            return (
              <Card key={promo.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden relative">
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 blur-2xl ${isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="inline-flex items-center gap-2 bg-brand-green/10 text-brand-forest px-4 py-1.5 rounded-full font-mono font-bold text-lg border border-brand-green/20">
                      <Tag className="h-4 w-4" />
                      {promo.code}
                    </div>
                    {isActive ? (
                      <Badge className="bg-green-100 text-green-700 border-none flex gap-1 items-center">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-600 border-none flex gap-1 items-center">
                        <XCircle className="h-3 w-3" /> Expired
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Discount Value</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {promo.discount_type === 'percentage' ? `${parseFloat(promo.discount_value)}% OFF` : `${parseFloat(promo.discount_value)} ETB OFF`}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><ShoppingCart className="h-3 w-3"/> Min Order</p>
                        <p className="text-sm font-medium text-slate-700">{parseFloat(promo.min_purchase)} ETB</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Calendar className="h-3 w-3"/> Expires</p>
                        <p className="text-sm font-medium text-slate-700">{new Date(promo.valid_to).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

// Inline fallback for missing lucide-react icon if not imported above
function ShoppingCart({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
  );
}
