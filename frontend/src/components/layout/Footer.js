import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.topWave}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>
      
      <div className={styles.content}>
        <div className="container">
          <div className={styles.grid}>
            {/* Brand */}
            <div className={styles.brand}>
              <div className={styles.logo}>
                <span>🌱</span>
                <span className={styles.logoText}>Fresh<span>Roots</span></span>
              </div>
              <p className={styles.tagline}>
                A digital farmers market connecting you directly to the people who grow your food.
              </p>
              <div className={styles.social}>
                <a href="#" className={styles.socialIcon} aria-label="Instagram">📸</a>
                <a href="#" className={styles.socialIcon} aria-label="Twitter">🐦</a>
                <a href="#" className={styles.socialIcon} aria-label="Facebook">👥</a>
              </div>
            </div>

            {/* Quick Links */}
            <div className={styles.column}>
              <h4 className={styles.columnTitle}>Market</h4>
              <Link href="/products" className={styles.link}>Browse Vegetables</Link>
              <Link href="/products?filter=organic" className={styles.link}>Organic Only</Link>
              <Link href="/products?filter=featured" className={styles.link}>Featured Items</Link>
              <Link href="/products" className={styles.link}>Seasonal Picks</Link>
            </div>

            {/* Support */}
            <div className={styles.column}>
              <h4 className={styles.columnTitle}>Support</h4>
              <Link href="#" className={styles.link}>How It Works</Link>
              <Link href="#" className={styles.link}>Delivery Info</Link>
              <Link href="#" className={styles.link}>FAQ</Link>
              <Link href="#" className={styles.link}>Contact Us</Link>
            </div>

            {/* For Farmers */}
            <div className={styles.column}>
              <h4 className={styles.columnTitle}>For Farmers</h4>
              <Link href="/signup" className={styles.link}>Join as Seller</Link>
              <Link href="#" className={styles.link}>Seller Guidelines</Link>
              <Link href="#" className={styles.link}>Success Stories</Link>
              <Link href="#" className={styles.link}>Resources</Link>
            </div>
          </div>

          <div className={styles.bottom}>
            <p>© 2026 Fresh Roots. Made with 💚 for local farmers.</p>
            <div className={styles.bottomLinks}>
              <Link href="#">Privacy</Link>
              <Link href="#">Terms</Link>
              <Link href="#">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
