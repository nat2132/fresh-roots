'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Leaf, Tractor, Sparkles, MapPin, ArrowRight } from 'lucide-react';

// Import images
import tomatoImg from '../../images/products/tomato.jpeg';
import broccoliImg from '../../images/products/broccoli.jpeg';
import onionImg from '../../images/products/onion.jpeg';
import potatoImg from '../../images/products/potato.jpeg';
import farmerImg from '../../images/dashboard/farmer1.webp';

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-brand-cream/50 dark:bg-slate-950/50 pt-20 transition-colors duration-500">
      {/* Background organic shapes */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-brand-green/5 dark:bg-brand-green/10 rounded-blob blur-3xl animate-pulse" />
        <div className="absolute bottom-[10%] right-[5%] w-[35%] h-[35%] bg-brand-sunrise/5 dark:bg-brand-sunrise/10 rounded-blob blur-3xl" />
        <div className="absolute top-[20%] right-[15%] w-[25%] h-[25%] bg-brand-olive/5 dark:bg-brand-olive/10 rounded-organic blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Content */}
          <div className={`space-y-8 transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="space-y-4">
              <span className="font-accent text-2xl text-brand-soil dark:text-brand-sunrise block animate-in slide-in-from-left duration-700">
                From the heart of the earth
              </span>
              <h1 className="font-serif text-5xl md:text-7xl leading-tight text-brand-forest dark:text-white">
                Fresh Vegetables,<br />
                <span className="text-brand-green italic">Grown With Love</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                Skip the supermarket. Buy directly from local farmers who nurture
                every seed, tend every row, and harvest at the peak of freshness —
                just for you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button 
                size="lg" 
                className="bg-brand-green hover:bg-brand-forest text-white rounded-full px-8 h-14 text-lg font-bold shadow-lg shadow-brand-green/20 group"
                nativeButton={false}
                render={<Link href="/products" />}
              >
                Explore the Market
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="ghost" 
                size="lg" 
                className="rounded-full h-14 text-lg font-semibold text-brand-forest dark:text-slate-200 hover:bg-brand-green/10"
                nativeButton={false}
                render={<Link href="#farm-to-table" />}
              >
                How It Works
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 pt-4">
              {[
                { icon: <Leaf className="h-5 w-5" />, text: "100% Local" },
                { icon: <Tractor className="h-5 w-5" />, text: "Farm Direct" },
                { icon: <Sparkles className="h-5 w-5" />, text: "Always Fresh" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                    {item.icon}
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual Composition */}
          <div className={`relative transition-all duration-1000 delay-300 transform ${
            isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-20 opacity-0 scale-90'
          }`}>
            <div className="relative w-full aspect-square max-w-[500px] mx-auto">
              <div className="absolute top-[5%] left-[5%] w-[45%] h-[45%] rounded-leaf overflow-hidden shadow-xl animate-float">
                <Image src={tomatoImg} alt="Fresh Tomato" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-[0%] right-[10%] w-[40%] h-[40%] rounded-organic overflow-hidden shadow-xl animate-float delay-75">
                <Image src={broccoliImg} alt="Fresh Broccoli" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-[5%] left-[10%] w-[42%] h-[42%] rounded-blob overflow-hidden shadow-xl animate-float delay-150">
                <Image src={onionImg} alt="Fresh Onion" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-[0%] right-[5%] w-[45%] h-[45%] rounded-leaf overflow-hidden shadow-xl animate-float delay-300">
                <Image src={potatoImg} alt="Fresh Potato" className="w-full h-full object-cover" />
              </div>
              
              {/* Center Farmer Image */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%] rounded-full p-2 bg-white dark:bg-slate-800 shadow-2xl z-20 transition-transform hover:scale-105 duration-500">
                <div className="w-full h-full rounded-full overflow-hidden relative group">
                  <Image src={farmerImg} alt="Meet Your Farmer" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-brand-forest/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-center p-4">
                    <span className="text-white font-serif text-lg font-bold leading-tight">Meet Your<br/>Farmer</span>
                  </div>
                </div>
              </div>

              {/* Floating Badges */}
              <Badge className="absolute top-[20%] -left-4 z-30 bg-white dark:bg-slate-800 text-brand-forest dark:text-white shadow-lg px-4 py-2 rounded-full border-none animate-wiggle">
                <Sparkles className="h-4 w-4 mr-2 text-brand-sunrise" /> Just Harvested
              </Badge>
              <Badge className="absolute bottom-[20%] -right-4 z-30 bg-white dark:bg-slate-800 text-brand-forest dark:text-white shadow-lg px-4 py-2 rounded-full border-none animate-wiggle delay-300">
                <MapPin className="h-4 w-4 mr-2 text-brand-green" /> 12 Local Farms
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-6 h-10 rounded-full border-2 border-brand-forest/20 dark:border-white/20 flex justify-center p-1">
          <div className="w-1.5 h-1.5 bg-brand-forest/40 dark:bg-white/40 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
