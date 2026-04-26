'use client';

import { useEffect, useRef } from 'react';
import styles from './Testimonials.module.css';

const testimonials = [
  {
    name: 'Emma W.',
    text: "I haven't bought supermarket vegetables in months. The difference in taste is incredible — my family actually looks forward to salads now!",
    rating: 5,
    avatar: '🧑',
  },
  {
    name: 'David K.',
    text: "Knowing exactly who grew my food and when it was harvested gives me so much peace of mind. Fresh Roots changed how I think about groceries.",
    rating: 5,
    avatar: '👨',
  },
  {
    name: 'Priya S.',
    text: 'The freshness indicators are genius — I always know what to cook first. Plus, the reorder feature saves me so much time every week.',
    rating: 5,
    avatar: '👩',
  },
];

export default function Testimonials() {
  const sectionRef = useRef(null);

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
          <span className={styles.handwritten}>What our community says</span>
          <h2>Loved by Families</h2>
        </div>

        <div className={styles.grid}>
          {testimonials.map((t, index) => (
            <div key={index} className={styles.card} data-animate style={{ animationDelay: `${index * 0.15}s` }}>
              <div className={styles.stars}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i}>⭐</span>
                ))}
              </div>
              <p className={styles.text}>&ldquo;{t.text}&rdquo;</p>
              <div className={styles.author}>
                <span className={styles.authorAvatar}>{t.avatar}</span>
                <span className={styles.authorName}>{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
