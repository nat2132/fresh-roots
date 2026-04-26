'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './FeaturedProducts.module.css';

// Import images
import broccoliImg from '../../images/products/broccoli.jpeg';
import tomatoImg from '../../images/products/tomato.jpeg';
import garlicImg from '../../images/products/garlic.jpeg';
import onionImg from '../../images/products/onion.jpeg';
import potatoImg from '../../images/products/potato.jpeg';

const mockProducts = [
  { id: 1, name: 'Organic Baby Spinach', price: 250, unit: 'bunch', farmer: "Mama Green's Garden", image: broccoliImg, freshness: 100, label: 'Just Harvested', organic: true },
  { id: 2, name: 'Rainbow Carrots', price: 280, unit: 'bunch', farmer: 'Earth Harvest Farms', image: potatoImg, freshness: 95, label: 'Very Fresh', organic: true },
  { id: 3, name: 'Heirloom Tomatoes', price: 350, unit: 'kg', farmer: "Mama Green's Garden", image: tomatoImg, freshness: 95, label: 'Very Fresh', organic: true },
  { id: 4, name: 'Fresh Basil Bundle', price: 180, unit: 'bunch', farmer: 'Santos Family Farm', image: garlicImg, freshness: 100, label: 'Just Harvested', organic: false },
  { id: 5, name: 'Sweet Bell Peppers', price: 300, unit: 'kg', farmer: 'Santos Family Farm', image: tomatoImg, freshness: 100, label: 'Just Harvested', organic: false },
  { id: 6, name: 'Organic Broccoli', price: 200, unit: 'piece', farmer: 'Earth Harvest Farms', image: broccoliImg, freshness: 95, label: 'Very Fresh', organic: true },
];

export default function FeaturedProducts() {
  const sectionRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('[data-animate]');
    elements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className="container">
        <div className={styles.header} data-animate>
          <span className={styles.handwritten}>Picked just for you</span>
          <h2>Today&apos;s Fresh Picks</h2>
          <p className={styles.headerSub}>
            The freshest vegetables from our partner farms, harvested within the last 24 hours.
          </p>
        </div>

        <div className={styles.grid} data-animate>
          {mockProducts.map((product, index) => (
            <Link
              href={`/products/${product.name.toLowerCase().replace(/\s+/g, '-')}`}
              key={product.id}
              className={styles.card}
              style={{ animationDelay: `${index * 0.1}s` }}
              onMouseEnter={() => setHoveredId(product.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
            <div className={styles.cardTop}>
              <div className={styles.cardImageContainer}>
                <Image src={product.image} alt={product.name} className={styles.cardImage} />
              </div>
                {product.organic && (
                  <span className={`badge badge-organic ${styles.organicBadge}`}>🌱 Organic</span>
                )}
                <div className={styles.freshnessBadge}>
                  <span className={`freshness-dot ${product.freshness >= 90 ? 'freshness-excellent' : 'freshness-good'}`}></span>
                  {product.label}
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardName}>{product.name}</h3>
                <p className={styles.cardFarmer}>by {product.farmer}</p>

                <div className={styles.cardBottom}>
                  <div className={styles.productPrice}>
                    <span className={styles.priceValue}>{product.price.toFixed(0)} ETB</span>
                    <span className={styles.priceUnit}>/ {product.unit}</span>
                  </div>

                  <button
                    className={`${styles.addBtn} ${hoveredId === product.id ? styles.addBtnVisible : ''}`}
                    onClick={(e) => { e.preventDefault(); }}
                  >
                    +
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.viewAll} data-animate>
          <Link href="/products" className="btn btn-secondary btn-lg">
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
}
