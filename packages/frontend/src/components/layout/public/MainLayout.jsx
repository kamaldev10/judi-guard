// src/components/layout/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '@/components/ui/ScrollToTop';

const MainLayout = () => {
  return (
    // reducedMotion="user" makes every <motion.*> in the tree honor the
    // OS-level prefers-reduced-motion setting automatically — no per-component checks.
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </MotionConfig>
  );
};

export default MainLayout;
