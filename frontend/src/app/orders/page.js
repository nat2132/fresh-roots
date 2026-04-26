'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import styles from './orders.module.css';

// Import images
import broccoliImg from '../../images/products/broccoli.jpeg';
import tomatoImg from '../../images/products/tomato.jpeg';
import potatoImg from '../../images/products/potato.jpeg';

// Mock order data
const mockOrders = [
  {
    id: 1042,
    date: 'Oct 24, 2026',
    status: 'delivering',
    total: 1250.00,
    items: [
      { name: 'Organic Baby Spinach', image: broccoliImg, qty: 2 },
      { name: 'Rainbow Carrots', image: potatoImg, qty: 1 },
      { name: 'Heirloom Tomatoes', image: tomatoImg, qty: 1 },
    ],
    timeline: [
      { step: 'placed', label: 'Order Placed', time: '8:00 AM', completed: true },
      { step: 'confirmed', label: 'Confirmed', time: '8:30 AM', completed: true },
      { step: 'harvesting', label: 'Harvested', time: '10:00 AM', completed: true },
      { step: 'packed', label: 'Packed', time: '1:00 PM', completed: true },
      { step: 'delivering', label: 'Out for Delivery', time: '2:30 PM', completed: true },
      { step: 'delivered', label: 'Delivered', time: '', completed: false },
    ]
  },
  {
    id: 1028,
    date: 'Oct 15, 2026',
    status: 'delivered',
    total: 980.00,
    items: [
      { name: 'Purple Kale', image: broccoliImg, qty: 1 },
      { name: 'Sweet Bell Peppers', image: tomatoImg, qty: 2 },
    ],
    timeline: [
      { step: 'placed', label: 'Order Placed', time: 'Oct 15', completed: true },
      { step: 'confirmed', label: 'Confirmed', time: 'Oct 15', completed: true },
      { step: 'harvesting', label: 'Harvested', time: 'Oct 16', completed: true },
      { step: 'packed', label: 'Packed', time: 'Oct 16', completed: true },
      { step: 'delivering', label: 'Out for Delivery', time: 'Oct 16', completed: true },
      { step: 'delivered', label: 'Delivered', time: 'Oct 16', completed: true },
    ]
  }
];

export default function OrdersPage() {
  const [reordering, setReordering] = useState(null);

  const handleReorder = (orderId) => {
    setReordering(orderId);
    setTimeout(() => {
      setReordering(null);
      alert('Items added to cart! (Backend mock)');
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'var(--fresh-green)';
      case 'delivering': return 'var(--sunrise)';
      case 'cancelled': return 'var(--tomato)';
      default: return 'var(--leaf-green)';
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className="container">
          <div className={styles.header}>
            <h1>Order History</h1>
            <p>Track your current deliveries and past purchases</p>
          </div>

          <div className={styles.ordersList}>
            {mockOrders.map(order => (
              <div key={order.id} className={styles.orderCard}>
                
                {/* Order Header */}
                <div className={styles.orderHeader}>
                  <div className={styles.orderMeta}>
                    <div className={styles.orderDate}>{order.date}</div>
                    <div className={styles.orderId}>Order #{order.id}</div>
                  </div>
                    <span className={styles.orderValue}>
                      {order.total.toFixed(0)} ETB
                    </span>
                </div>

                {/* Timeline */}
                <div className={styles.timelineContainer}>
                  <div className={styles.timeline}>
                    {order.timeline.map((event, idx) => (
                      <div 
                        key={idx} 
                        className={`${styles.timelineStep} ${event.completed ? styles.stepCompleted : ''} ${event.step === order.status ? styles.stepCurrent : ''}`}
                      >
                        <div className={styles.stepDot}></div>
                        <div className={styles.stepInfo}>
                          <div className={styles.stepLabel}>{event.label}</div>
                          {event.time && <div className={styles.stepTime}>{event.time}</div>}
                        </div>
                      </div>
                    ))}
                    {/* Background line for timeline */}
                    <div className={styles.timelineBgLine}></div>
                    {/* Active line for timeline */}
                    <div 
                      className={styles.timelineActiveLine}
                      style={{ 
                        width: `${(order.timeline.findIndex(e => e.step === order.status) / (order.timeline.length - 1)) * 100}%`,
                        backgroundColor: getStatusColor(order.status)
                      }}
                    ></div>
                  </div>
                </div>

                {/* Order Items & Actions */}
                <div className={styles.orderFooter}>
                  <div className={styles.itemThumbnails}>
                    {order.items.map((item, idx) => (
                      <div key={idx} className={styles.thumbWrapper} title={`${item.qty}x ${item.name}`}>
                        <Image src={item.image} alt={item.name} className={styles.thumbImg} />
                        {item.qty > 1 && <span className={styles.thumbBadge}>{item.qty}</span>}
                      </div>
                    ))}
                  </div>

                  <button 
                    className={`btn btn-secondary ${styles.reorderBtn}`}
                    onClick={() => handleReorder(order.id)}
                    disabled={reordering === order.id}
                  >
                    {reordering === order.id ? <span className={styles.spinner}></span> : '↻ Reorder'}
                  </button>
                </div>

              </div>
            ))}

            {mockOrders.length === 0 && (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📦</span>
                <h3>No orders yet</h3>
                <p>When you buy farm-fresh food, your orders will appear here.</p>
                <Link href="/products" className="btn btn-primary">Start Shopping</Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
