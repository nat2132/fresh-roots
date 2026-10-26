'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Leaf, 
  Sparkles, 
  MapPin, 
  Clock, 
  Minus, 
  Plus, 
  CheckCircle2,
  Info,
  Calendar
} from 'lucide-react';
import api from '@/lib/api';

// Import fallback images
import broccoliImg from '../../../images/products/broccoli.jpeg';
import tomatoImg from '../../../images/products/tomato.jpeg';
import onionImg from '../../../images/products/onion.jpeg';
import potatoImg from '../../../images/products/potato.jpeg';
import garlicImg from '../../../images/products/garlic.jpeg';
import farmer1Img from '../../../images/dashboard/farmer1.webp';

export default function ProductDetailPage(props) {
  const params = use(props.params);
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [params.slug]);

  const fetchProduct = async () => {
    try {
      const p = await api.getProduct(params.slug);
      
      let img = broccoliImg;
      if (p.slug.includes('tomato') || p.slug.includes('pepper')) img = tomatoImg;
      else if (p.slug.includes('carrot') || p.slug.includes('beet')) img = potatoImg;
      else if (p.slug.includes('onion') || p.slug.includes('squash')) img = onionImg;
      else if (p.slug.includes('garlic') || p.slug.includes('basil')) img = garlicImg;

      const mappedFarmer = {
        name: p.farmer ? `${p.farmer.first_name || ''} ${p.farmer.last_name || ''}`.trim() : 'Unknown Farmer',
        farm_name: p.farmer?.farm_name || 'Local Farm',
        location: p.farmer?.farm_location || 'Unknown Location',
        avatar: p.farmer?.avatar || farmer1Img,
        bio: p.farmer?.bio || ''
      };

      setProduct({
        ...p,
        image: p.image || img,
        price: parseFloat(p.price) || 0,
        farmer_profile: mappedFarmer,
        stock: p.available_stock || p.total_stock || 0
      });
    } catch (err) {
      console.error('Failed to load product', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product.in_stock) return;
    setAdding(true);
    const res = await addToCart(product.id, quantity);
    setAdding(false);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else {
      alert(res.error);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="container py-32 flex flex-col items-center justify-center animate-pulse">
        <div className="h-64 w-64 bg-slate-100 dark:bg-slate-800 rounded-3xl mb-8" />
        <div className="h-8 bg-slate-100 dark:bg-slate-800 w-48 rounded mb-4" />
        <div className="h-4 bg-slate-100 dark:bg-slate-800 w-32 rounded" />
      </div>
    </>
  );

  if (!product) return (
    <>
      <Navbar />
      <div className="container py-32 text-center">
        <h1 className="text-2xl font-serif text-brand-forest dark:text-white">Product not found.</h1>
        <Button variant="link" asChild className="mt-4 text-brand-green">
          <Link href="/products">Back to Market</Link>
        </Button>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500 pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <Button variant="ghost" className="mb-8 group text-slate-500 dark:text-slate-400" asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Market
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Visuals */}
            <div className="lg:col-span-6 space-y-8">
              <div className="relative aspect-square md:aspect-video lg:aspect-square rounded-[3rem] overflow-hidden shadow-2xl bg-brand-cream/30 dark:bg-slate-900 transition-colors duration-500">
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                />
                {product.is_organic && (
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-brand-green text-white px-4 py-1.5 text-sm border-none shadow-lg">
                      <Leaf className="h-4 w-4 mr-2" /> Organic Certified
                    </Badge>
                  </div>
                )}
                {!product.in_stock && (
                  <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm flex items-center justify-center">
                    <Badge variant="destructive" className="text-2xl px-8 py-3 shadow-2xl rotate-12">
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>

              {/* Farmer Info Card */}
              <div className="bg-brand-cream/40 dark:bg-slate-900/50 rounded-[2.5rem] p-6 border border-brand-green/10 dark:border-brand-green/20 flex items-center gap-6">
                <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-md shrink-0">
                  <Image 
                    src={product.farmer_profile.avatar} 
                    alt={product.farmer_profile.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h4 className="font-serif text-xl text-brand-forest dark:text-brand-green-light">{product.farmer_profile.farm_name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center mb-2">
                    <MapPin className="h-3 w-3 mr-1.5 text-slate-400" /> {product.farmer_profile.location}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    Grown by <span className="text-brand-green">{product.farmer_profile.name}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="lg:col-span-6 space-y-10">
              <div className="space-y-4">
                <Badge variant="outline" className="text-brand-green border-brand-green/20 bg-brand-green/5 dark:bg-brand-green/10 font-bold tracking-wide">
                  {product.category?.name || 'Fresh Produce'}
                </Badge>
                <h1 className="font-serif text-5xl md:text-6xl text-brand-forest dark:text-white leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">{product.price.toFixed(0)} ETB</span>
                  <span className="text-lg text-slate-400 font-medium">/ {product.unit}</span>
                </div>
              </div>

              <Separator className="bg-slate-100 dark:bg-slate-800" />

              {/* Freshness Indicator */}
              <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors duration-500">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full animate-pulse ${
                      product.freshness_score >= 90 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 
                      product.freshness_score >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
                    }`} />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Freshness Meter</span>
                  </div>
                  <Badge variant="secondary" className="bg-white dark:bg-slate-800 shadow-sm border-none px-3 font-bold text-brand-forest dark:text-brand-green-light">
                    {product.freshness_label}
                  </Badge>
                </div>
                <Progress value={product.freshness_score} className="h-3 bg-white dark:bg-slate-800" indicatorClassName={
                   product.freshness_score >= 90 ? 'bg-green-500' : 
                   product.freshness_score >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
                } />
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                  Harvested on <strong className="ml-1 text-slate-700 dark:text-slate-200">{product.harvest_date}</strong>
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Info className="h-4 w-4 text-brand-green" /> Product Description
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {product.description || 'No description available for this item.'}
                  </p>
                </div>

                {product.story && (
                  <div className="relative p-6 bg-brand-cream/30 dark:bg-slate-900/50 rounded-[2rem] border-l-4 border-brand-green italic text-slate-700 dark:text-slate-300 transition-colors duration-500">
                    <Sparkles className="absolute -top-3 -right-3 h-8 w-8 text-brand-sunrise opacity-20" />
                    &quot;{product.story}&quot;
                  </div>
                )}
              </div>

              {/* Action Area */}
              <div className="pt-6 space-y-6">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-full p-1.5 border border-slate-200 dark:border-slate-800 transition-colors duration-500">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full h-10 w-10 text-brand-forest dark:text-white hover:bg-white dark:hover:bg-slate-800 hover:text-brand-green"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-bold text-xl text-slate-900 dark:text-white">{quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full h-10 w-10 text-brand-forest dark:text-white hover:bg-white dark:hover:bg-slate-800 hover:text-brand-green"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-sm text-slate-400 font-medium">
                    {product.stock} {product.unit}s available
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className={`w-full h-16 rounded-full text-xl font-bold shadow-xl transition-all active:scale-[0.98] ${
                    added 
                      ? 'bg-green-600 hover:bg-green-600 text-white' 
                      : 'bg-brand-green hover:bg-brand-forest text-white'
                  }`}
                  disabled={adding || !product.in_stock || added}
                  onClick={handleAddToCart}
                >
                  {adding ? (
                    <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : added ? (
                    <span className="flex items-center gap-2"><CheckCircle2 className="h-6 w-6" /> Added to Cart!</span>
                  ) : !product.in_stock ? (
                    'Out of Stock'
                  ) : (
                    <span className="flex items-center gap-2"><ShoppingCart className="h-6 w-6" /> Add to Market Bag</span>
                  )}
                </Button>
                
                <p className="text-center text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase">
                  Farm-to-table delivery within 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
