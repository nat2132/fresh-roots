'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      name: "Tigist Tadesse",
      role: "Home Cook",
      content: "The quality of the vegetables is unmatched. I can actually taste the difference in my sauces. It's like having a garden in the city.",
      rating: 5
    },
    {
      name: "Daniel Bekele",
      role: "Nutritionist",
      content: "As someone who promotes healthy eating, I'm thrilled to have a service that makes organic, local produce accessible and easy.",
      rating: 5
    },
    {
      name: "Hanna Girma",
      role: "Busy Professional",
      content: "Delivery is always on time, and I love the tracking feature. The verification code gives me peace of mind that my order is safe.",
      rating: 4
    }
  ];

  return (
    <section className="py-24 bg-brand-cream/20 dark:bg-slate-900/30 relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-0 right-0 p-20 text-brand-green/5 dark:text-white/5">
        <Quote className="h-64 w-64" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center space-y-4 mb-20">
          <span className="font-accent text-2xl text-brand-soil dark:text-brand-sunrise block">Kind Words</span>
          <h2 className="font-serif text-4xl md:text-5xl text-brand-forest dark:text-white">Loved by the Community</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, i) => (
            <Card key={i} className="border-none shadow-sm rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <CardContent className="p-0 space-y-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, star) => (
                    <Star key={star} className={`h-4 w-4 ${star < rev.rating ? 'fill-brand-sunrise text-brand-sunrise' : 'text-slate-200 dark:text-slate-700'}`} />
                  ))}
                </div>
                <p className="text-lg text-slate-700 dark:text-slate-200 italic leading-relaxed font-medium">
                  &quot;{rev.content}&quot;
                </p>
              </CardContent>
              <div className="mt-8 flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-brand-green/20 dark:border-brand-green/40">
                  <AvatarFallback className="bg-brand-green/10 text-brand-green font-bold uppercase">
                    {rev.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{rev.name}</p>
                  <p className="text-xs text-brand-green font-bold uppercase tracking-widest">{rev.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
