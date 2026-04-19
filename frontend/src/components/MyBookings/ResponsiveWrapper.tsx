/**
 * ResponsiveWrapper Component
 * Handles responsive layout switching between desktop, tablet, and mobile
 */

import React, { useState, useEffect } from 'react';
import styles from './ResponsiveWrapper.module.css';

interface ResponsiveWrapperProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({ leftPanel, rightPanel }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'details'>('list');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop layout (≥1024px): side-by-side
  if (!isMobile && !isTablet) {
    return (
      <div className={styles.desktopLayout}>
        <div className={styles.leftColumn}>{leftPanel}</div>
        <div className={styles.rightColumn}>{rightPanel}</div>
      </div>
    );
  }

  // Tablet layout (768px-1023px): side-by-side with adjusted widths
  if (isTablet) {
    return (
      <div className={styles.tabletLayout}>
        <div className={styles.leftColumn}>{leftPanel}</div>
        <div className={styles.rightColumn}>{rightPanel}</div>
      </div>
    );
  }

  // Mobile layout (<768px): stacked with tabs
  return (
    <div className={styles.mobileLayout}>
      <div className={styles.mobileTabs}>
        <button
          className={`${styles.tab} ${activeTab === 'list' ? styles.active : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <i className="ri-list-check-line"></i> Bookings
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'details' ? styles.active : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <i className="ri-file-list-line"></i> Details
        </button>
      </div>

      <div className={styles.mobileContent}>
        {activeTab === 'list' && <div className={styles.mobilePanel}>{leftPanel}</div>}
        {activeTab === 'details' && <div className={styles.mobilePanel}>{rightPanel}</div>}
      </div>
    </div>
  );
};

export default ResponsiveWrapper;
