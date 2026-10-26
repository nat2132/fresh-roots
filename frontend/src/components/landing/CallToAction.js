'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CallToAction() {
  return (
    <section className="py-24 px-4 md:px-0 bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="container mx-auto">
        <div className="relative overflow-hidden bg-brand-forest dark:bg-slate-900 rounded-[3rem] p-12 md:p-24 text-center text-white shadow-2xl">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 p-12 text-white/5">
            <Sparkles className="h-64 w-64" />
          </div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] bg-brand-green/20 rounded-leaf blur-3xl" />
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-10">
            <div className="space-y-6">
              <span className="font-accent text-3xl text-brand-sunrise animate-pulse block">Freshness is just a click away</span>
              <h2 className="font-serif text-5xl md:text-7xl leading-tight">
                Ready to Taste the Difference?
              </h2>
              <p className="text-xl text-white/70 leading-relaxed max-w-xl mx-auto">
                Join thousands of families supporting local agriculture and eating the freshest produce in the city.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button size="lg" className="bg-brand-green hover:bg-white hover:text-brand-forest text-white h-16 px-12 rounded-full text-xl font-bold shadow-xl shadow-brand-green/20 group" asChild>
                <Link href="/signup">
                  Start Your Basket
                  <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className="h-16 px-10 rounded-full text-lg font-bold text-white hover:bg-white/10" asChild>
                <Link href="/products">Browse Today&apos;s Harvest</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
