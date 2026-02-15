'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import LandingPage from './components/LandingPage';

const IntroScene = dynamic(() => import('./components/IntroScene'), { ssr: false });

export default function Home() {
  const [showLanding, setShowLanding] = useState(false);

  const handleNavigateToMain = useCallback(() => {
    setShowLanding(true);
  }, []);

  if (showLanding) {
    return (
      <div className="animate-fade-in">
        <LandingPage />
      </div>
    );
  }

  return <IntroScene onNavigateToMain={handleNavigateToMain} />;
}
