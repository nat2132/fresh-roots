'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HeroSection.module.css';

// Import vegetable and farmer images
import tomatoImg from '../../images/products/tomato.jpeg';
import broccoliImg from '../../images/products/broccoli.jpeg';
import onionImg from '../../images/products/onion.jpeg';
import potatoImg from '../../images/products/potato.jpeg';
import farmerImg from '../../images/dashboard/farmer1.webp';

export default function HeroSection() {
  const heroRef = useRef(null);

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

    const elements = heroRef.current?.querySelectorAll('[data-animate]');
    elements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.hero} ref={heroRef}>
      {/* Background organic shapes */}
      <div className={styles.bgShapes}>
        <div className={`${styles.shape} ${styles.shape1}`}></div>
        <div className={`${styles.shape} ${styles.shape2}`}></div>
        <div className={`${styles.shape} ${styles.shape3}`}></div>
      </div>

      <div className={`container ${styles.inner}`}>
        {/* Left: Copy */}
        <div className={styles.content} data-animate>
          <span className={styles.handwritten}>From the heart of the earth</span>
          <h1 className={styles.title}>
            Fresh Vegetables,<br />
            <span className={styles.titleAccent}>Grown With Love</span>
          </h1>
          <p className={styles.subtitle}>
            Skip the supermarket. Buy directly from local farmers who nurture
            every seed, tend every row, and harvest at the peak of freshness —
            just for you.
          </p>

          <div className={styles.cta}>
            <Link href="/products" className="btn btn-primary btn-lg">
              🥬 Explore the Market
            </Link>
            <Link href="#farm-to-table" className="btn btn-ghost btn-lg">
              How It Works →
            </Link>
          </div>

          {/* Trust indicators */}
          <div className={styles.trust}>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>🌱</span>
              <span>100% Local</span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>🚜</span>
              <span>Farm Direct</span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>🍃</span>
              <span>Always Fresh</span>
            </div>
          </div>
        </div>

        {/* Right: Visual composition */}
        <div className={styles.visual} data-animate>
          {/* Main hero image area with organic shapes */}
          <div className={styles.imageComposition}>
            <div className={`${styles.imageBlob} ${styles.blob1}`}>
              <Image src={tomatoImg} alt="Fresh Tomato" className={styles.blobImage} />
            </div>
            <div className={`${styles.imageBlob} ${styles.blob2}`}>
              <Image src={broccoliImg} alt="Fresh Broccoli" className={styles.blobImage} />
            </div>
            <div className={`${styles.imageBlob} ${styles.blob3}`}>
              <Image src={onionImg} alt="Fresh Onion" className={styles.blobImage} />
            </div>
            <div className={`${styles.imageBlob} ${styles.blob4}`}>
              <Image src={potatoImg} alt="Fresh Potato" className={styles.blobImage} />
            </div>
            <div className={`${styles.imageBlob} ${styles.blobCenter}`}>
              <Image src={farmerImg} alt="Meet Your Farmer" className={styles.blobImage} />
              <div className={styles.centerOverlay}>
                <span className={styles.blobLabel}>Meet Your<br/>Farmer</span>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className={`${styles.floatingBadge} ${styles.badge1}`}>
            <span>✨</span> Just Harvested
          </div>
          <div className={`${styles.floatingBadge} ${styles.badge2}`}>
            <span>📍</span> 12 Local Farms
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollDot}></div>
      </div>
    </section>
  );
}
