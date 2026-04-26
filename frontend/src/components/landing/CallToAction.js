'use client';

import Link from 'next/link';
import styles from './CallToAction.module.css';

export default function CallToAction() {
  return (
    <section className={styles.section}>
      <div className={styles.bgOrganics}>
        <span className={styles.floatVeg} style={{ top: '10%', left: '5%', animationDelay: '0s' }}>🥕</span>
        <span className={styles.floatVeg} style={{ top: '60%', left: '8%', animationDelay: '1s' }}>🥬</span>
        <span className={styles.floatVeg} style={{ top: '20%', right: '10%', animationDelay: '2s' }}>🍅</span>
        <span className={styles.floatVeg} style={{ top: '70%', right: '5%', animationDelay: '0.5s' }}>🌿</span>
        <span className={styles.floatVeg} style={{ top: '40%', right: '15%', animationDelay: '1.5s' }}>🥦</span>
      </div>

      <div className="container">
        <div className={styles.content}>
          <span className={styles.handwritten}>Join our growing community</span>
          <h2 className={styles.title}>Ready to Taste the Difference?</h2>
          <p className={styles.subtitle}>
            Join thousands of families who&apos;ve ditched the supermarket aisle
            for farm-fresh vegetables delivered with care.
          </p>
          <div className={styles.cta}>
            <Link href="/signup" className="btn btn-accent btn-lg">
              🌱 Start Shopping Fresh
            </Link>
            <Link href="/signup" className="btn btn-ghost btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              Join as a Farmer →
            </Link>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>3,200+</span>
              <span className={styles.statLabel}>Happy Customers</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <span className={styles.statValue}>45+</span>
              <span className={styles.statLabel}>Local Farms</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <span className={styles.statValue}>12,000+</span>
              <span className={styles.statLabel}>Orders Delivered</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
