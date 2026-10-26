'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Star, Users, Map } from 'lucide-react';
import farmerImg from '../../images/dashboard/farmer2.jpg';

export default function SupportFarmers() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Image Card */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative z-10 border-8 border-white dark:border-slate-800">
              <Image src={farmerImg} alt="Local Farmer" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/60 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <p className="font-accent text-2xl mb-1 text-brand-sunrise">Meet Abebe</p>
                <p className="font-serif text-3xl">Grows the best kale in Debre Zeit</p>
              </div>
            </div>
            
            {/* Floating Decorative Cards */}
            <Card className="absolute -bottom-8 -right-8 z-20 w-64 border-none shadow-xl rounded-3xl bg-white dark:bg-slate-800 p-6 animate-float">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold text-xl">
                  98%
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Direct Profit to Farmers</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                By cutting out distributors, we ensure farmers earn nearly double what they would elsewhere.
              </p>
            </Card>

            <div className="absolute top-[20%] -left-8 z-0 w-48 h-48 bg-brand-sunrise/10 rounded-full blur-3xl" />
          </div>

          {/* Right: Content */}
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="font-accent text-2xl text-brand-soil dark:text-brand-sunrise block">Real People, Real Impact</span>
              <h2 className="font-serif text-4xl md:text-5xl text-brand-forest dark:text-white">Every Order Supports a Family</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Fresh Roots isn&apos;t just a store; it&apos;s a community. We partner with small-scale family farms within 100km of the city. When you buy from us, you&apos;re funding education, tools, and sustainable growth for rural families.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: <Heart className="h-5 w-5" />, title: "Fair Pricing", desc: "No hidden fees, no exploitation." },
                { icon: <Star className="h-5 w-5" />, title: "Certified Organic", desc: "Most of our farms use zero chemicals." },
                { icon: <Users className="h-5 w-5" />, title: "Direct Chat", desc: "Message farmers about their harvest." },
                { icon: <Map className="h-5 w-5" />, title: "100% Traceable", desc: "Scan a code to see the exact farm." }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-200">{feature.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-tight">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" className="bg-brand-forest dark:bg-brand-green hover:bg-brand-green dark:hover:bg-brand-forest text-white rounded-full px-10 h-14 text-lg font-bold">
              Join as a Farmer
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
