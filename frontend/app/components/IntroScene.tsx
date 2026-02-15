'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';

const SpaceScene = dynamic(() => import('./intro/SpaceScene'), { ssr: false });

// ── Ambient Sound ──
function createAmbientSound() {
  const ctx = new AudioContext();

  // Low drone
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 55;

  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 82.5;

  const osc3 = ctx.createOscillator();
  osc3.type = 'triangle';
  osc3.frequency.value = 165;

  // LFO
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.08;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 3;
  lfo.connect(lfoGain);
  lfoGain.connect(osc2.frequency);

  // Filter
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 350;
  filter.Q.value = 0.7;

  // Reverb via delay
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.6;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.55;
  delay.connect(feedback);
  feedback.connect(delay);

  // Noise for texture
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 180;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.015;
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);

  // Master
  const master = ctx.createGain();
  master.gain.value = 0;

  osc1.connect(filter);
  osc2.connect(filter);
  osc3.connect(filter);
  filter.connect(master);
  filter.connect(delay);
  feedback.connect(master);
  noiseGain.connect(master);
  master.connect(ctx.destination);

  // Fade in over 4 seconds
  master.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 4);

  osc1.start();
  osc2.start();
  osc3.start();
  lfo.start();
  noise.start();

  return {
    ctx,
    master,
    fadeOut: () => {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      setTimeout(() => ctx.close(), 2000);
    },
  };
}

// ── Main Component ──
interface IntroSceneProps {
  onNavigateToMain: () => void;
}

export default function IntroScene({ onNavigateToMain }: IntroSceneProps) {
  const [phase, setPhase] = useState(0);
  const [textReveal, setTextReveal] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const soundRef = useRef<ReturnType<typeof createAmbientSound> | null>(null);
  const textRevealIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.fadeOut();
      }
      if (textRevealIntervalRef.current) {
        clearInterval(textRevealIntervalRef.current);
      }
    };
  }, []);

  // Mark loaded after a brief delay (R3F initialization)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handlePhaseChange = useCallback((newPhase: number, reveal: number) => {
    setPhase(newPhase);
    setTextReveal(reveal);
  }, []);

  const handleComplete = useCallback(() => {
    setCompleted(true);
  }, []);

  const handleSkip = useCallback(() => {
    setSkipped(true);
    setCompleted(true);
    setTextReveal(1);
    setPhase(5);
    if (soundRef.current) {
      soundRef.current.fadeOut();
      soundRef.current = null;
    }
  }, []);

  const toggleSound = useCallback(() => {
    if (soundEnabled && soundRef.current) {
      soundRef.current.fadeOut();
      soundRef.current = null;
      setSoundEnabled(false);
    } else if (!soundEnabled) {
      soundRef.current = createAmbientSound();
      setSoundEnabled(true);
    }
  }, [soundEnabled]);

  const handleMainPage = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.fadeOut();
      soundRef.current = null;
    }
    onNavigateToMain();
  }, [onNavigateToMain]);

  const showFinalUI = completed || skipped;

  return (
    <div className="intro-container">
      {/* Loading overlay */}
      {loading && (
        <div className="intro-loading">
          <div className="intro-loading-text">Preparing your journey...</div>
        </div>
      )}

      {/* 3D Canvas */}
      {!skipped && (
        <SpaceScene onPhaseChange={handlePhaseChange} onComplete={handleComplete} />
      )}

      {/* Skipped state — static background */}
      {skipped && <div className="intro-static-bg" />}

      {/* Skip button */}
      {!showFinalUI && !loading && (
        <button className="intro-skip" onClick={handleSkip}>
          Skip
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 4l10 8-10 8V4z" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>
      )}

      {/* Sound toggle */}
      {!loading && (
        <button className="intro-sound" onClick={toggleSound} aria-label={soundEnabled ? 'Mute' : 'Enable sound'}>
          {soundEnabled ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>
      )}

      {/* Final UI overlay */}
      <div
        className="intro-final"
        style={{
          opacity: showFinalUI ? 1 : Math.max(0, textReveal),
          pointerEvents: showFinalUI ? 'auto' : 'none',
        }}
      >
        <div className="intro-stardrop-label">Stardrop</div>

        <p className="intro-quote">
          &ldquo;I have circled many stars, but only yours brought me down to Earth.
          <br />
          I am Stardrop, here to serve your vision.&rdquo;
        </p>

        <div className="intro-actions">
          <div className="intro-input-wrapper">
            <input
              type="text"
              className="intro-input"
              placeholder="Ask Stardrop anything..."
              aria-label="Command for Stardrop"
            />
            <button className="intro-input-send" aria-label="Send">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>

          <button className="intro-main-btn" onClick={handleMainPage}>
            Main Page
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
