'use client';

import { useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';

export default function FarmerForm({ onCancel, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    location: '',
    region: 'Addis Ababa',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.createFarmer(formData);
      onSuccess();
    } catch (err) {
      console.error('Failed to create farmer', err);
      setError(err.detail || err.error || 'Failed to register farmer. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Register New Farmer</h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input 
            id="full_name" 
            name="full_name" 
            required 
            value={formData.full_name} 
            onChange={handleChange}
            placeholder="e.g. Abebe Bikila"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange}
              placeholder="09..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Input 
              id="region" 
              name="region" 
              value={formData.region} 
              onChange={handleChange}
              placeholder="e.g. Oromia"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Farm Location *</Label>
          <Input 
            id="location" 
            name="location" 
            required 
            value={formData.location} 
            onChange={handleChange}
            placeholder="e.g. Sululta, West Shewa"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes text-muted-foreground">Internal Notes</Label>
          <Textarea 
            id="notes" 
            name="notes" 
            value={formData.notes} 
            onChange={handleChange}
            placeholder="Crop types, seasonal availability, etc."
            className="min-h-[100px]"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm font-medium">{error}</p>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-green-700 hover:bg-green-800 px-8"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Save Farmer</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
