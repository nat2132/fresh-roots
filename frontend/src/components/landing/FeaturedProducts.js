'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ShoppingCart, Leaf, Sparkles, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

// Import fallback images
import broccoliImg from '../../images/products/broccoli.jpeg';
import tomatoImg from '../../images/products/tomato.jpeg';
import garlicImg from '../../images/products/garlic.jpeg';
import onionImg from '../../images/products/onion.jpeg';
import potatoImg from '../../images/products/potato.jpeg';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const data = await api.getFeaturedProducts();
      const items = data.results || data;
      
      const mapped = items.slice(0, 8).map(p => {
        let fallbackImg = broccoliImg;
        if (p.slug.includes('tomato') || p.slug.includes('pepper')) fallbackImg = tomatoImg;
        else if (p.slug.includes('carrot') || p.slug.includes('beet')) fallbackImg = potatoImg;
        else if (p.slug.includes('onion') || p.slug.includes('squash')) fallbackImg = onionImg;
        else if (p.slug.includes('garlic') || p.slug.includes('basil')) fallbackImg = garlicImg;

        return {
          ...p,
          image: p.image || fallbackImg,
          price: parseFloat(p.price) || 0,
        };
      });
      setProducts(mapped);
    } catch (err) {
      console.error('Failed to load featured products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.in_stock) return;
    
    const res = await addToCart(product.id, 1);
    if (!res.success) {
      alert(res.error);
    }
  };

  return (
    <section className="py-24 bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <span className="font-accent text-2xl text-brand-soil dark:text-brand-sunrise animate-in fade-in duration-1000">
            Picked just for you
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-brand-forest dark:text-white">Today&apos;s Fresh Picks</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            The freshest vegetables from our partner farms, harvested within the last 24 hours and delivered straight to your door.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="bg-slate-100 dark:bg-slate-800 aspect-square rounded-2xl" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <Link
                href={`/products/${product.slug}`}
                key={product.id}
                className="group block"
              >
                <Card className="border-none shadow-none bg-transparent overflow-visible transition-transform duration-500 group-hover:-translate-y-2">
                  <CardHeader className="p-0 relative mb-4">
                    <div className="aspect-square rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-500 relative bg-brand-cream/30 dark:bg-slate-900">
                      <Image 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.is_organic && (
                        <Badge className="bg-brand-green/90 text-white border-none shadow-sm backdrop-blur-sm">
                          <Leaf className="h-3 w-3 mr-1" /> Organic
                        </Badge>
                      )}
                      <Badge className="bg-white/90 dark:bg-slate-800/90 text-brand-forest dark:text-white border-none shadow-sm backdrop-blur-sm">
                        <Sparkles className="h-3 w-3 mr-1 text-brand-sunrise" /> {product.freshness_label}
                      </Badge>
                    </div>

                    {!product.in_stock && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <Badge variant="destructive" className="text-lg px-4 py-1.5 shadow-xl rotate-12">
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="p-0 space-y-1">
                    <h3 className="font-serif text-xl text-brand-forest dark:text-white group-hover:text-brand-green transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">by {product.farmer_name}</p>
                  </CardContent>

                  <CardFooter className="p-0 pt-3 flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-slate-900 dark:text-white">{product.price.toFixed(0)} ETB</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">/ {product.unit}</span>
                    </div>

                    <Button 
                      size="icon" 
                      className={`rounded-full h-10 w-10 transition-all duration-300 shadow-md ${
                        product.in_stock 
                          ? 'bg-brand-green hover:bg-brand-forest text-white group-hover:scale-110' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                      disabled={!product.in_stock}
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      {product.in_stock ? <Plus className="h-5 w-5" /> : '...'}
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-20 text-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full border-brand-green text-brand-green hover:bg-brand-green hover:text-white px-10 group dark:hover:bg-brand-green dark:hover:text-white"
            nativeButton={false}
            render={<Link href="/products" />}
          >
            View All Products
            <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
}
