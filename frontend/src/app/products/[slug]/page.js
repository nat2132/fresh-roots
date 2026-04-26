'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import styles from './product-detail.module.css';

// Import images
import broccoliImg from '../../../images/products/broccoli.jpeg';
import tomatoImg from '../../../images/products/tomato.jpeg';
import onionImg from '../../../images/products/onion.jpeg';
import potatoImg from '../../../images/products/potato.jpeg';
import garlicImg from '../../../images/products/garlic.jpeg';

import farmer1Img from '../../../images/dashboard/farmer1.webp';
import farmer2Img from '../../../images/dashboard/farmer2.jpg';
import farmer3Img from '../../../images/dashboard/farmer3.jpg';

// Using mock data for the static UI since the backend might not be running
const getMockProduct = (slug) => {
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Logic to pick a matching image
  let image = broccoliImg;
  if (slug.includes('tomato') || slug.includes('pepper')) image = tomatoImg;
  else if (slug.includes('carrot') || slug.includes('beet')) image = potatoImg;
  else if (slug.includes('onion') || slug.includes('squash')) image = onionImg;
  else if (slug.includes('garlic') || slug.includes('basil') || slug.includes('rosemary')) image = garlicImg;

  const farmers = [
    { name: 'Sarah Mendes', farm_name: "Mama Green's Garden", avatar: farmer1Img, location: 'Riverside Valley, CA' },
    { name: 'James Okonkwo', farm_name: 'Earth Harvest Farms', avatar: farmer2Img, location: 'Sunnyvale Hills, OR' },
    { name: 'Maria Santos', farm_name: 'Santos Family Farm', avatar: farmer3Img, location: 'Green Meadow, WA' },
  ];
  
  const farmer = farmers[Math.floor(Math.random() * farmers.length)];

  return {
    id: 1,
    name: name,
    slug: slug,
    description: `Fresh, locally grown ${name.toLowerCase()} straight from the farm. Nurtured with care in rich, organic soil to bring you the best flavor and nutrition.`,
    story: `The ${name.toLowerCase()} at our farm are an heirloom variety that we've been growing for over three generations. We wake up before sunrise to hand-pick them when the dew is still fresh on the leaves.`,
    price: 350,
    unit: 'bunch',
    farmer: farmer,
    image: image,
    freshness: 95,
    label: 'Just Harvested',
    organic: true,
    category: { name: 'Local Produce', slug: 'local-produce' },
    harvestDate: 'Yesterday',
    stock: 50
  };
};

export default function ProductDetailPage({ params }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    // In a real app, we'd fetch this. Using mock for now.
    setProduct(getMockProduct(params.slug));
  }, [params.slug]);

  if (!product) return null;

  const handleAddToCart = () => {
    setAdding(true);
    setTimeout(() => {
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }, 600);
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
          <Link href="/products" className={styles.backLink}>
            ← Back to Market
          </Link>

          <div className={styles.layout}>
            {/* Left: Image/Hero */}
            <div className={styles.imageColumn}>
              <div className={styles.imageBox}>
                <Image src={product.image} alt={product.name} className={styles.mainImage} />
                {product.organic && (
                  <span className={styles.organicTag}>🌱 Organic Certified</span>
                )}
              </div>

              {/* Farmer Mini Profile */}
              <div className={styles.farmerCard}>
                <div className={styles.farmerHeader}>
                  <div className={styles.farmerAvatar}>
                    <Image src={product.farmer.avatar} alt={product.farmer.name} className={styles.farmerAvatarImg} />
                  </div>
                  <div>
                    <h4 className={styles.farmerName}>{product.farmer.farm_name}</h4>
                    <p className={styles.farmerLocation}>📍 {product.farmer.location}</p>
                  </div>
                </div>
                <p className={styles.farmerBio}>
                  Grown by {product.farmer.name}
                </p>
              </div>
            </div>

            {/* Right: Details */}
            <div className={styles.detailsColumn}>
              <div className={styles.categoryWrap}>
                <Link href={`/products?category=${product.category.slug}`} className={styles.categoryLink}>
                  {product.category.name}
                </Link>
              </div>

              <h1 className={styles.title}>{product.name}</h1>
              
              <div className={styles.priceSection}>
                  <span className={styles.price}>{product.price.toFixed(0)} ETB</span>
                  <span className={styles.unit}>/ {product.unit}</span>
                </div>

              {/* Freshness Meter */}
              <div className={styles.freshnessContainer}>
                <div className={styles.freshnessHeader}>
                  <div className={styles.freshnessTitle}>
                    <span className={`freshness-dot ${getFreshnessClass(product.freshness)}`}></span>
                    Freshness Indicator
                  </div>
                  <span className={styles.freshnessLabel}>{product.label}</span>
                </div>
                <div className={styles.freshnessBarBg}>
                  <div 
                    className={styles.freshnessBarFill} 
                    style={{ 
                      width: `${product.freshness}%`,
                      backgroundColor: product.freshness >= 90 ? 'var(--fresh-green)' : 
                                     product.freshness >= 60 ? 'var(--fresh-yellow)' : 'var(--fresh-orange)'
                    }}
                  ></div>
                </div>
                <p className={styles.harvestText}>
                  🕐 Harvested: <strong>{product.harvestDate}</strong>
                </p>
              </div>

              <div className={styles.description}>
                <p>{product.description}</p>
                <div className={styles.storyBox}>
                  <strong>The Story:</strong> {product.story}
                </div>
              </div>

              {/* Add to Cart Actions */}
              <div className={styles.actionArea}>
                <div className={styles.quantityWrap}>
                  <button 
                    className={styles.qtyBtn} 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >−</button>
                  <span className={styles.qtyValue}>{quantity}</span>
                  <button 
                    className={styles.qtyBtn}
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  >+</button>
                </div>

                <button 
                  className={`btn btn-primary btn-lg ${styles.addToCartBtn} ${added ? styles.added : ''}`}
                  onClick={handleAddToCart}
                  disabled={adding || added}
                >
                  {adding ? <span className={styles.spinner}></span> : 
                   added ? '✓ Added to Cart' : 
                   '🌱 Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
