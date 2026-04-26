'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './SupportFarmers.module.css';

// Import farmer portraits
import farmer1Img from '../../images/dashboard/farmer1.webp';
import farmer2Img from '../../images/dashboard/farmer2.jpg';
import farmer3Img from '../../images/dashboard/farmer3.jpg';

const farmers = [
  {
    name: 'Sarah Mendes',
    farm: "Mama Green's Garden",
    location: 'Riverside Valley, CA',
    image: farmer1Img,
    quote: 'Every seed I plant is a promise to the earth and to the families I feed.',
    specialty: 'Leafy Greens & Herbs',
    years: 15,
  },
  {
    name: 'James Okonkwo',
    farm: 'Earth Harvest Farms',
    location: 'Sunnyvale Hills, OR',
    image: farmer2Img,
    quote: 'Sustainable farming isn\'t just what I do — it\'s who I am.',
    specialty: 'Root Vegetables & Cruciferous',
    years: 12,
  },
  {
    name: 'Maria Santos',
    farm: 'Santos Family Farm',
    location: 'Green Meadow, WA',
    image: farmer3Img,
    quote: 'When you buy from us, you\'re not just getting food — you\'re joining our family.',
    specialty: 'Tomatoes & Peppers',
    years: 20,
  },
];

export default function SupportFarmers() {
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
          <span className={styles.handwritten}>The faces behind your food</span>
          <h2>Meet Our Farmers</h2>
          <p className={styles.headerSub}>
            Real people, real stories. Every purchase supports a local farmer and their family.
          </p>
        </div>

        <div className={styles.grid}>
          {farmers.map((farmer, index) => (
            <div
              key={index}
              className={styles.card}
              data-animate
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={styles.cardAvatar}>
                <Image src={farmer.image} alt={farmer.name} className={styles.avatarImage} />
              </div>

              <div className={styles.cardContent}>
                <h3 className={styles.farmerName}>{farmer.name}</h3>
                <p className={styles.farmName}>{farmer.farm}</p>
                <p className={styles.location}>📍 {farmer.location}</p>

                <blockquote className={styles.quote}>
                  &ldquo;{farmer.quote}&rdquo;
                </blockquote>

                <div className={styles.meta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Specialty</span>
                    <span className={styles.metaValue}>{farmer.specialty}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Experience</span>
                    <span className={styles.metaValue}>{farmer.years} years</span>
                  </div>
                </div>
              </div>

              <div className={styles.cardDecor}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
