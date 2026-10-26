'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, Calendar, User, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminFeedbackPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await api.getReviews();
        setReviews(data.results || data);
      } catch (err) {
        console.error('Failed to fetch reviews', err);
        setError('Failed to load customer feedback.');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading feedback...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 font-bold">Customer Feedback</h1>
          <p className="text-slate-500">Review and monitor customer satisfaction ratings.</p>
        </div>
        <Badge variant="outline" className="px-4 py-1 text-sm bg-white">
          {reviews.length} Total Reviews
        </Badge>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {reviews.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-dashed border-slate-200">
            <MessageSquare className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No reviews submitted yet.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="border-none shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Rating & User info */}
                  <div className="md:w-64 space-y-3 shrink-0">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-5 w-5 ${
                            review.rating >= s ? 'fill-brand-sunrise text-brand-sunrise' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="font-bold">{review.user_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <ShoppingBag className="h-4 w-4 text-slate-400" />
                        <span>Order #{review.order_number}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="flex-1">
                    <div className="bg-slate-50 p-4 rounded-2xl relative">
                      <div className="absolute -left-2 top-4 w-4 h-4 bg-slate-50 rotate-45 hidden md:block" />
                      <p className="text-slate-700 leading-relaxed italic">
                        &ldquo;{review.comment || 'No comment provided.'}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
