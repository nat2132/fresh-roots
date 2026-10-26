'use client';

import { useState } from 'react';
import { Star, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';

export default function ReviewForm({ orderId, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.createReview(orderId, rating, comment);
      setSubmitted(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error('Failed to submit review', err);
      setError(err.detail || 'Failed to submit your review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 p-8 rounded-3xl text-center space-y-4 animate-in zoom-in duration-500">
        <div className="h-16 w-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto text-2xl shadow-lg shadow-green-500/20">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-green-900 dark:text-green-400 text-xl transition-colors duration-500">Thank you for your feedback!</h3>
          <p className="text-green-700/70 dark:text-green-500/50 transition-colors duration-500">Your review helps us improve the Fresh Roots experience for everyone.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-6 transition-colors duration-500">
      <div className="space-y-1">
        <h3 className="font-bold text-slate-900 dark:text-white text-xl transition-colors duration-500">Rate your experience</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-500">How was the quality of your products and the delivery service?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 transition-transform active:scale-90"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={`h-10 w-10 transition-all duration-300 ${
                  (hoverRating || rating) >= star
                    ? 'fill-brand-sunrise text-brand-sunrise scale-110'
                    : 'text-slate-200 dark:text-slate-700'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Tell us what you liked or how we can improve..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[120px] rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-brand-green/20 focus:border-brand-green transition-all"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-1">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-full bg-brand-green hover:bg-brand-forest text-white font-bold shadow-lg shadow-brand-green/20 transition-all"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Review
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
