'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  ShoppingBag, 
  Leaf, 
  Sparkles, 
  ChevronRight, 
  Plus,
  ArrowRight,
  MapPin,
  Clock
} from 'lucide-react';
import api from '@/lib/api';

// Fallback images
import broccoliImg from '../../images/products/broccoli.jpeg';
import tomatoImg from '../../images/products/tomato.jpeg';
import onionImg from '../../images/products/onion.jpeg';
import potatoImg from '../../images/products/potato.jpeg';
import garlicImg from '../../images/products/garlic.jpeg';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isOrganic, setIsOrganic] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, [selectedCategory, isOrganic]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.getProducts({ 
          category: selectedCategory !== 'all' ? selectedCategory : '',
          is_organic: isOrganic || ''
        }),
        api.getCategories()
      ]);
      
      const items = productsData.results || productsData;
      const mapped = items.map(p => {
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
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load market data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.in_stock) return;
    const res = await addToCart(product.id, 1);
    if (!res.success) alert(res.error);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-500 pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          {/* Market Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <span className="font-accent text-2xl text-brand-soil dark:text-brand-sunrise block">Freshly Harvested</span>
              <h1 className="font-serif text-5xl text-brand-forest dark:text-white tracking-tight">Today&apos;s Market</h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-lg">
                Directly from local family farms within 100km of the city. Picked this morning, delivered today.
              </p>
            </div>
            
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-green transition-colors" />
              <Input 
                placeholder="Search vegetables..." 
                className="h-14 pl-12 rounded-2xl border-none shadow-sm dark:bg-slate-900 dark:text-white dark:ring-white/10 ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-green transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Filters */}
            <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-28">
              <Card className="border-none shadow-sm dark:bg-slate-900 rounded-3xl overflow-hidden">
                <CardHeader className="bg-brand-forest text-white p-6">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Filters
                  </h3>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm uppercase tracking-widest text-slate-400">Categories</h4>
                    <div className="space-y-2">
                      <Button 
                        variant={selectedCategory === 'all' ? 'default' : 'ghost'} 
                        className={`w-full justify-start rounded-xl ${selectedCategory === 'all' ? 'bg-brand-green' : 'text-slate-600 dark:text-slate-400'}`}
                        onClick={() => setSelectedCategory('all')}
                      >
                        All Produce
                      </Button>
                      {categories.map(cat => (
                        <Button 
                          key={cat.id}
                          variant={selectedCategory === cat.slug ? 'default' : 'ghost'} 
                          className={`w-full justify-start rounded-xl ${selectedCategory === cat.slug ? 'bg-brand-green' : 'text-slate-600 dark:text-slate-400'}`}
                          onClick={() => setSelectedCategory(cat.slug)}
                        >
                          {cat.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-sm uppercase tracking-widest text-slate-400">Preferences</h4>
                    <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl transition-colors">
                      <Checkbox 
                        id="organic" 
                        checked={isOrganic} 
                        onCheckedChange={setIsOrganic}
                        className="data-[state=checked]:bg-brand-green"
                      />
                      <label htmlFor="organic" className="text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                        Organic Certified Only
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Promo Widget */}
              <div className="bg-brand-sunrise rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
                <div className="relative z-10 space-y-2">
                  <h4 className="font-bold text-lg">Climate Neutral</h4>
                  <p className="text-sm opacity-90 leading-tight">All our deliveries are carbon offset through local reforestation.</p>
                </div>
                <Leaf className="absolute -bottom-4 -right-4 h-24 w-24 opacity-20 rotate-12 transition-transform group-hover:scale-110" />
              </div>
            </aside>

            {/* Product Grid */}
            <div className="lg:col-span-9">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4 animate-pulse">
                      <div className="bg-slate-200 dark:bg-slate-800 aspect-square rounded-3xl" />
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-32 space-y-6">
                  <div className="h-24 w-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-4xl mx-auto">🥬</div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif text-brand-forest dark:text-white">No vegetables found</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Try adjusting your filters or search term to find what you&apos;re looking for.</p>
                  </div>
                  <Button variant="outline" className="rounded-full border-brand-green text-brand-green" onClick={() => {setSearchTerm(''); setSelectedCategory('all'); setIsOrganic(false);}}>
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <Link
                      href={`/products/${product.slug}`}
                      key={product.id}
                      className="group block"
                    >
                      <Card className="border-none shadow-none bg-transparent overflow-visible transition-all duration-500 group-hover:-translate-y-2">
                        <CardHeader className="p-0 relative mb-4">
                          <div className="aspect-square rounded-3xl overflow-hidden shadow-sm group-hover:shadow-2xl transition-shadow duration-500 relative bg-white dark:bg-slate-900">
                            <Image 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                            {product.is_organic && (
                              <Badge className="bg-brand-green/90 text-white border-none shadow-sm backdrop-blur-md">
                                <Leaf className="h-3 w-3 mr-1" /> Organic
                              </Badge>
                            )}
                            <Badge className="bg-white/90 dark:bg-slate-800/90 text-brand-forest dark:text-white border-none shadow-sm backdrop-blur-md">
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
                        
                        <CardContent className="p-0 space-y-2">
                          <h3 className="font-serif text-2xl text-brand-forest dark:text-white group-hover:text-brand-green transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-brand-green" /> {product.farmer_name}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-brand-sunrise" /> {product.harvest_date}</span>
                          </div>
                        </CardContent>

                        <CardFooter className="p-0 pt-4 flex items-center justify-between">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">{product.price.toFixed(0)} ETB</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">/ {product.unit}</span>
                          </div>

                          <Button 
                            size="icon" 
                            className={`rounded-full h-12 w-12 transition-all duration-300 shadow-lg ${
                              product.in_stock 
                                ? 'bg-brand-green hover:bg-brand-forest text-white group-hover:scale-110' 
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            }`}
                            disabled={!product.in_stock}
                            onClick={(e) => handleAddToCart(e, product)}
                          >
                            {product.in_stock ? <Plus className="h-6 w-6" /> : '...'}
                          </Button>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
