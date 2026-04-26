'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import styles from './products.module.css';

// Import product images
import broccoliImg from '../../images/products/broccoli.jpeg';
import tomatoImg from '../../images/products/tomato.jpeg';
import onionImg from '../../images/products/onion.jpeg';
import potatoImg from '../../images/products/potato.jpeg';
import garlicImg from '../../images/products/garlic.jpeg';

const categories = [
  { slug: 'all', name: 'All', icon: '🥗' },
  { slug: 'leafy-greens', name: 'Leafy Greens', icon: '🥬' },
  { slug: 'root-vegetables', name: 'Root Vegetables', icon: '🥕' },
  { slug: 'herbs', name: 'Herbs', icon: '🌿' },
  { slug: 'tomatoes-peppers', name: 'Tomatoes & Peppers', icon: '🍅' },
  { slug: 'cruciferous', name: 'Cruciferous', icon: '🥦' },
  { slug: 'squash', name: 'Squash', icon: '🎃' },
  { slug: 'alliums', name: 'Alliums', icon: '🧅' },
  { slug: 'legumes', name: 'Legumes', icon: '🫘' },
];

const allProducts = [
  { id: 1, name: 'Organic Baby Spinach', slug: 'organic-baby-spinach', price: 250, unit: 'bunch', farmer: "Mama Green's Garden", image: broccoliImg, freshness: 100, label: 'Just Harvested', organic: true, category: 'leafy-greens', location: 'Riverside Valley, CA', harvestDate: 'Today' },
  { id: 2, name: 'Rainbow Carrots', slug: 'rainbow-carrots', price: 280, unit: 'bunch', farmer: 'Earth Harvest Farms', image: potatoImg, freshness: 95, label: 'Very Fresh', organic: true, category: 'root-vegetables', location: 'Sunnyvale Hills, OR', harvestDate: 'Yesterday' },
  { id: 3, name: 'Fresh Basil Bundle', slug: 'fresh-basil-bundle', price: 180, unit: 'bunch', farmer: 'Santos Family Farm', image: garlicImg, freshness: 100, label: 'Just Harvested', organic: false, category: 'herbs', location: 'Green Meadow, WA', harvestDate: 'Today' },
  { id: 4, name: 'Heirloom Tomatoes', slug: 'heirloom-tomatoes', price: 350, unit: 'kg', farmer: "Mama Green's Garden", image: tomatoImg, freshness: 95, label: 'Very Fresh', organic: true, category: 'tomatoes-peppers', location: 'Riverside Valley, CA', harvestDate: 'Yesterday' },
  { id: 5, name: 'Purple Kale', slug: 'purple-kale', price: 220, unit: 'bunch', farmer: 'Earth Harvest Farms', image: broccoliImg, freshness: 80, label: 'Fresh', organic: true, category: 'leafy-greens', location: 'Sunnyvale Hills, OR', harvestDate: '2 days ago' },
  { id: 6, name: 'Sweet Bell Peppers', slug: 'sweet-bell-peppers', price: 300, unit: 'kg', farmer: 'Santos Family Farm', image: tomatoImg, freshness: 100, label: 'Just Harvested', organic: false, category: 'tomatoes-peppers', location: 'Green Meadow, WA', harvestDate: 'Today' },
  { id: 7, name: 'Golden Beets', slug: 'golden-beets', price: 240, unit: 'kg', farmer: "Mama Green's Garden", image: potatoImg, freshness: 60, label: 'Good', organic: true, category: 'root-vegetables', location: 'Riverside Valley, CA', harvestDate: '3 days ago' },
  { id: 8, name: 'Organic Broccoli', slug: 'organic-broccoli', price: 200, unit: 'piece', farmer: 'Earth Harvest Farms', image: broccoliImg, freshness: 95, label: 'Very Fresh', organic: true, category: 'cruciferous', location: 'Sunnyvale Hills, OR', harvestDate: 'Yesterday' },
  { id: 9, name: 'Sugar Snap Peas', slug: 'sugar-snap-peas', price: 260, unit: 'pack', farmer: 'Santos Family Farm', image: broccoliImg, freshness: 100, label: 'Just Harvested', organic: false, category: 'legumes', location: 'Green Meadow, WA', harvestDate: 'Today' },
  { id: 10, name: 'Fresh Rosemary', slug: 'fresh-rosemary', price: 150, unit: 'bunch', farmer: "Mama Green's Garden", image: garlicImg, freshness: 95, label: 'Very Fresh', organic: true, category: 'herbs', location: 'Riverside Valley, CA', harvestDate: 'Yesterday' },
  { id: 11, name: 'Butternut Squash', slug: 'butternut-squash', price: 175, unit: 'piece', farmer: 'Earth Harvest Farms', image: onionImg, freshness: 40, label: 'Good', organic: false, category: 'squash', location: 'Sunnyvale Hills, OR', harvestDate: '5 days ago' },
  { id: 12, name: 'Red Onions', slug: 'red-onions', price: 125, unit: 'kg', farmer: 'Santos Family Farm', image: onionImg, freshness: 60, label: 'Good', organic: false, category: 'alliums', location: 'Green Meadow, WA', harvestDate: '4 days ago' },
];

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState('freshness');
  const [priceRange, setPriceRange] = useState([0, 20]);
  const [addedId, setAddedId] = useState(null);

  const filteredProducts = allProducts
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .filter(p => !organicOnly || p.organic)
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .sort((a, b) => {
      if (sortBy === 'freshness') return b.freshness - a.freshness;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });

  const handleAddToCart = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    setAddedId(productId);
    setTimeout(() => setAddedId(null), 1500);
  };

  const getFreshnessClass = (score) => {
    if (score >= 90) return 'freshness-excellent';
    if (score >= 60) return 'freshness-good';
    if (score >= 40) return 'freshness-fair';
    return 'freshness-low';
  };

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className="container">
          {/* Page header */}
          <div className={styles.pageHeader}>
            <div>
              <span className={styles.handwritten}>Fresh from the farm</span>
              <h1>The Market</h1>
              <p className={styles.pageSubtitle}>
                Browse our collection of locally-grown, farm-fresh vegetables
              </p>
            </div>
            <div className={styles.resultCount}>
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Category tabs */}
          <div className={styles.categoryTabs}>
            {categories.map(cat => (
              <button
                key={cat.slug}
                className={`${styles.catTab} ${activeCategory === cat.slug ? styles.catActive : ''}`}
                onClick={() => setActiveCategory(cat.slug)}
              >
                <span className={styles.catIcon}>{cat.icon}</span>
                <span className={styles.catLabel}>{cat.name}</span>
              </button>
            ))}
          </div>

          <div className={styles.layout}>
            {/* Sidebar filters */}
            <aside className={styles.sidebar}>
              <div className={styles.filterGroup}>
                <h4 className={styles.filterTitle}>Sort By</h4>
                <select
                  className={`input-field ${styles.sortSelect}`}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="freshness">Freshness</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <h4 className={styles.filterTitle}>Preferences</h4>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={organicOnly}
                    onChange={(e) => setOrganicOnly(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxCustom}></span>
                  🌱 Organic Only
                </label>
              </div>

              <div className={styles.filterGroup}>
                <h4 className={styles.filterTitle}>Price Range</h4>
                <div className={styles.priceRange}>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className={styles.rangeSlider}
                  />
                  <div className={styles.priceLabels}>
                    <span>0 ETB</span>
                    <span>{priceRange[1]} ETB</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Product grid */}
            <div className={styles.grid}>
              {filteredProducts.map((product, index) => (
                <Link
                  href={`/products/${product.slug}`}
                  key={product.id}
                  className={styles.card}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardImageContainer}>
                      <Image src={product.image} alt={product.name} className={styles.cardImage} />
                    </div>
                    {product.organic && (
                      <span className={styles.organicTag}>🌱 Organic</span>
                    )}
                    <div className={styles.freshnessTag}>
                      <span className={`freshness-dot ${getFreshnessClass(product.freshness)}`}></span>
                      {product.label}
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <h3 className={styles.cardName}>{product.name}</h3>
                    <p className={styles.cardFarmer}>🧑‍🌾 {product.farmer}</p>
                    <p className={styles.cardLocation}>📍 {product.location}</p>
                    <p className={styles.cardHarvest}>🕐 Harvested: {product.harvestDate}</p>

                    <div className={styles.cardFooter}>
                      <div className={styles.productPrice}>
                        <span className={styles.priceValue}>{product.price.toFixed(0)} ETB</span>
                        <span className={styles.priceUnit}>/ {product.unit}</span>
                      </div>
                      <button
                        className={`${styles.addBtn} ${addedId === product.id ? styles.added : ''}`}
                        onClick={(e) => handleAddToCart(e, product.id)}
                      >
                        {addedId === product.id ? '✓' : '+'}
                      </button>
                    </div>
                  </div>
                </Link>
              ))}

              {filteredProducts.length === 0 && (
                <div className={styles.empty}>
                  <span className={styles.emptyEmoji}>🔍</span>
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or browse all categories.</p>
                  <button className="btn btn-secondary" onClick={() => { setActiveCategory('all'); setOrganicOnly(false); setPriceRange([0, 20]); }}>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
