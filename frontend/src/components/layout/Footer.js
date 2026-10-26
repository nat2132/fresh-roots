import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Instagram, Twitter, Facebook, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-cream-dark/30 pt-20">
      {/* Top Wave Decoration */}
      <div className="w-full overflow-hidden leading-[0] rotate-180">
        <svg className="relative block w-[calc(100%+1.3px)] h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#FDF6EC"></path>
        </svg>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl">🌱</span>
              <span className="font-serif text-2xl font-bold tracking-tight text-brand-forest">
                Fresh<span className="text-brand-green">Roots</span>
              </span>
            </Link>
            <p className="text-slate-600 leading-relaxed max-w-xs">
              A digital farmers market connecting you directly to the people who grow your food. Fresh, traceable, and ethical.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-500 hover:text-brand-green hover:shadow-md transition-all">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-500 hover:text-brand-green hover:shadow-md transition-all">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-500 hover:text-brand-green hover:shadow-md transition-all">
                <Facebook className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-serif text-xl font-bold text-brand-forest">Market</h4>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-slate-600 hover:text-brand-green transition-colors">Browse Vegetables</Link></li>
              <li><Link href="/products?filter=organic" className="text-slate-600 hover:text-brand-green transition-colors">Organic Only</Link></li>
              <li><Link href="/products?filter=featured" className="text-slate-600 hover:text-brand-green transition-colors">Featured Items</Link></li>
              <li><Link href="/products" className="text-slate-600 hover:text-brand-green transition-colors">Seasonal Picks</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="font-serif text-xl font-bold text-brand-forest">Support</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-slate-600 hover:text-brand-green transition-colors">How It Works</Link></li>
              <li><Link href="#" className="text-slate-600 hover:text-brand-green transition-colors">Delivery Info</Link></li>
              <li><Link href="#" className="text-slate-600 hover:text-brand-green transition-colors">FAQ</Link></li>
              <li><Link href="#" className="text-slate-600 hover:text-brand-green transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* For Farmers */}
          <div className="space-y-6">
            <h4 className="font-serif text-xl font-bold text-brand-forest">For Farmers</h4>
            <ul className="space-y-3">
              <li><Link href="/signup" className="text-slate-600 hover:text-brand-green transition-colors">Join as Seller</Link></li>
              <li><Link href="#" className="text-slate-600 hover:text-brand-green transition-colors">Seller Guidelines</Link></li>
              <li><Link href="#" className="text-slate-600 hover:text-brand-green transition-colors">Success Stories</Link></li>
              <li><Link href="#" className="text-slate-600 hover:text-brand-green transition-colors">Resources</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="bg-brand-forest/10 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            © 2026 Fresh Roots. Made with <Heart className="h-3 w-3 fill-brand-green text-brand-green" /> for local farmers.
          </p>
          <div className="flex gap-8 text-sm text-slate-500">
            <Link href="#" className="hover:text-brand-green transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-brand-green transition-colors">Terms</Link>
            <Link href="#" className="hover:text-brand-green transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
