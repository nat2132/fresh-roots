'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/landing/HeroSection';
import FarmToTable from '@/components/landing/FarmToTable';
import FeaturedProducts from '@/components/landing/FeaturedProducts';
import SupportFarmers from '@/components/landing/SupportFarmers';
import Testimonials from '@/components/landing/Testimonials';
import CallToAction from '@/components/landing/CallToAction';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FarmToTable />
        <FeaturedProducts />
        <SupportFarmers />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
