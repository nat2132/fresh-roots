'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import styles from './cart.module.css';

// Import images
import broccoliImg from '../../images/products/broccoli.jpeg';
import tomatoImg from '../../images/products/tomato.jpeg';

// Mock intial cart data
const initialCart = [
  { id: 1, name: 'Organic Baby Spinach', slug: 'organic-baby-spinach', price: 250.00, quantity: 2, unit: 'bunch', image: broccoliImg, freshness: 100 },
  { id: 2, name: 'Rainbow Carrots', slug: 'rainbow-carrots', price: 280.00, quantity: 1, unit: 'bunch', image: broccoliImg, freshness: 95 },
  { id: 4, name: 'Heirloom Tomatoes', slug: 'heirloom-tomatoes', price: 350.00, quantity: 1, unit: 'kg', image: tomatoImg, freshness: 95 },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCart);
  const [checkingOut, setCheckingOut] = useState(false);

  const updateQuantity = (id, delta) => {
    setCartItems(items => 
      items.map(item => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const delivery = subtotal > 0 ? 5.00 : 0;
  const total = subtotal + delivery;

  const handleCheckout = () => {
    setCheckingOut(true);
    setTimeout(() => {
      setCheckingOut(false);
      alert('Checkout functionality connected to Django backend. Start API to process orders.');
    }, 1500);
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div className={styles.page}>
          <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
            <div className={styles.emptyCartIcon}>🛒</div>
            <h2>Your basket is empty</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Looks like you haven't added any fresh vegetables yet.
            </p>
            <Link href="/products" className="btn btn-primary">
              Browse the Market
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className="container">
          <div className={styles.header}>
            <h1>Your Basket</h1>
            <p>{cartItems.length} items from local farmers</p>
          </div>

          <div className={styles.layout}>
            {/* Cart Items */}
            <div className={styles.itemsList}>
              {cartItems.map(item => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemImage}>
                    <Image src={item.image} alt={item.name} className={styles.itemThumb} />
                  </div>
                  
                  <div className={styles.itemDetails}>
                    <Link href={`/products/${item.slug}`} className={styles.itemName}>
                      {item.name}
                    </Link>
                    <div className={styles.itemMeta}>
                      <span className={styles.price}>{item.price.toFixed(0)} ETB</span>
                      <span className={styles.unit}>/ {item.unit}</span>
                    </div>
                    
                    <div className={styles.freshnessIndicator}>
                      <span className={`freshness-dot ${item.freshness >= 90 ? 'freshness-excellent' : 'freshness-good'}`}></span>
                      Fresh
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <div className={styles.quantityControl}>
                      <button onClick={() => updateQuantity(item.id, -1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                    <div className={styles.itemTotal}>
                      {(item.price * item.quantity).toFixed(0)} ETB
                    </div>
                    <button 
                      className={styles.removeBtn} 
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className={styles.summaryBox}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>
              
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span className={styles.summaryValue}>{subtotal.toFixed(0)} ETB</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Delivery (Climate Neutral)</span>
                <span className={styles.summaryValue}>{delivery.toFixed(0)} ETB</span>
              </div>
              
              <div className={styles.divider}></div>
              
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>{total.toFixed(0)} ETB</span>
              </div>

              <div className={styles.checkoutSection}>
                <button 
                  className={`btn btn-primary ${styles.checkoutBtn}`}
                  onClick={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? <span className={styles.spinner}></span> : 'Proceed to Checkout'}
                </button>
                <p className={styles.secureText}>🔒 Secure payment. Freshness guaranteed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
