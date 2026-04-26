'use client';

import { useEffect, useRef } from 'react';
import styles from './FarmToTable.module.css';

const steps = [
  {
    icon: '🌱',
    title: 'Planted with Care',
    description: 'Local farmers select the finest heritage seeds, planting them in rich, nurtured soil using sustainable practices.',
    accent: '#4A7C59',
  },
  {
    icon: '☀️',
    title: 'Grown Naturally',
    description: 'Sun, water, and patience. Our farmers let nature do its work — no shortcuts, no chemicals, just honest farming.',
    accent: '#E8A847',
  },
  {
    icon: '✋',
    title: 'Harvested Fresh',
    description: 'Picked at peak ripeness, often the same morning you order. That\'s freshness you can taste in every bite.',
    accent: '#C94C3D',
  },
  {
    icon: '🏠',
    title: 'Delivered to You',
    description: 'From the farm gate straight to your table. No warehouses, no middlemen — just farm-fresh goodness.',
    accent: '#8B6F47',
  },
];

export default function FarmToTable() {
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
      { threshold: 0.15 }
    );

    const elements = sectionRef.current?.querySelectorAll('[data-animate]');
    elements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} id="farm-to-table" ref={sectionRef}>
      <div className="container">
        <div className={styles.header} data-animate>
          <span className={styles.handwritten}>The journey of your food</span>
          <h2>From Farm to Your Table</h2>
          <p className={styles.headerSub}>
            Every vegetable has a story. Here&apos;s how fresh produce travels
            from our partner farms directly to your kitchen.
          </p>
        </div>

        <div className={styles.timeline}>
          {steps.map((step, index) => (
            <div
              key={index}
              className={styles.step}
              data-animate
              style={{ '--step-color': step.accent, animationDelay: `${index * 0.15}s` }}
            >
              <div className={styles.stepConnector}>
                <div className={styles.stepDot}></div>
                {index < steps.length - 1 && <div className={styles.stepLine}></div>}
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepIcon}>{step.icon}</div>
                <div className={styles.stepNumber}>0{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
