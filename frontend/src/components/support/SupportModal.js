'use client';

import { useState } from 'react';
import { Loader2, Send, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import api from '@/lib/api';

export default function SupportModal({ onCancel }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.createSupportTicket(formData);
      setSuccess(true);
      setTimeout(onCancel, 3000);
    } catch (err) {
      console.error('Failed to create support ticket', err);
      setError('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-md mx-auto text-center space-y-4 animate-in zoom-in-95 duration-300">
        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-4xl">✅</div>
        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Message Sent!</h2>
        <p className="text-slate-500">Our support team has received your request and will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-brand-green/10 rounded-full flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-brand-green" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Contact Support</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Input 
            id="subject" 
            required 
            value={formData.subject} 
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="How can we help you?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(val) => setFormData(prev => ({ ...prev, priority: val }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low - General Inquiry</SelectItem>
              <SelectItem value="medium">Medium - Order Question</SelectItem>
              <SelectItem value="high">High - Delivery Issue</SelectItem>
              <SelectItem value="urgent">Urgent - Payment/Security</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message *</Label>
          <Textarea 
            id="message" 
            required 
            value={formData.message} 
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Please describe your issue in detail..."
            className="min-h-[120px]"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm font-medium">{error}</p>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button 
            type="submit" 
            disabled={loading || !formData.subject || !formData.message}
            className="bg-brand-green hover:bg-brand-forest text-white px-8 rounded-full h-11"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Send Message</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
