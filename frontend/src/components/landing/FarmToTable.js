'use client';

import { Leaf, Truck, ShoppingBag, Heart } from 'lucide-react';

export default function FarmToTable() {
  const steps = [
    {
      icon: <Leaf className="h-8 w-8 text-brand-green" />,
      title: "Grown Locally",
      description: "Farmers nurture every seed using sustainable practices right in your region."
    },
    {
      icon: <ShoppingBag className="h-8 w-8 text-brand-green" />,
      title: "You Choose",
      description: "Browse the morning's harvest and select exactly what your family needs."
    },
    {
      icon: <Truck className="h-8 w-8 text-brand-green" />,
      title: "Fresh Delivery",
      description: "Produce is picked to order and delivered to your door within 24 hours."
    },
    {
      icon: <Heart className="h-8 w-8 text-brand-green" />,
      title: "Shared Value",
      description: "Fair prices for you, and more profit directly in the hands of local farmers."
    }
  ];

  return (
    <section id="farm-to-table" className="py-24 bg-brand-cream/30 dark:bg-slate-900/50 relative overflow-hidden transition-colors duration-500">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center space-y-4 mb-20">
          <span className="font-accent text-2xl text-brand-soil dark:text-brand-sunrise block">The Journey</span>
          <h2 className="font-serif text-4xl md:text-5xl text-brand-forest dark:text-white">From Farm to Your Table</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto italic">
            We&apos;ve cut out the middlemen to bring you a shorter, cleaner, and fairer food system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-6 group">
              <div className="h-20 w-20 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:shadow-xl relative">
                {step.icon}
                <div className="absolute -top-2 -right-2 h-8 w-8 bg-brand-sunrise text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                  {idx + 1}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-brand-forest dark:text-brand-green-light">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Path */}
      <div className="hidden lg:block absolute top-[60%] left-0 w-full h-px border-t-2 border-dashed border-brand-green/10 dark:border-white/5 -z-0" />
    </section>
  );
}
