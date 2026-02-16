'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

const ANIMATIONS = [
  { src: '/intro.mp4', label: 'Animation 1' },
  { src: '/intro2.mp4', label: 'Animation 2' },
  { src: '/intro3.mp4', label: 'Animation 3' },
];

// ── Selection Screen ──
function SelectionScreen({ onSelect }: { onSelect: (src: string) => void }) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((v) => v?.play().catch(() => {}));
  }, []);

  return (
    <div className="intro-container">
      <div className="select-screen">
        <div className="select-header intro-stagger animate delay-1">
          <h1 className="select-title">Stardrop</h1>
          <p className="select-subtitle">Choose your experience</p>
        </div>

        <div className="select-options intro-stagger animate delay-2">
          {ANIMATIONS.map((anim, i) => (
            <button
              key={anim.src}
              className="select-card"
              onClick={() => onSelect(anim.src)}
            >
              <div className="select-preview">
                <video
                  ref={(el) => { videoRefs.current[i] = el; }}
                  src={anim.src}
                  muted
                  loop
                  playsInline
                  preload="auto"
                />
              </div>
              <span className="select-label">{anim.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Intro Player ──
function IntroPlayer({
  videoSrc,
  onNavigateToMain,
  onGoBack,
}: {
  videoSrc: string;
  onNavigateToMain: () => void;
  onGoBack: () => void;
}) {
  const [completed, setCompleted] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fadeRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => setCompleted(true);
    video.addEventListener('ended', handleEnded);
    video.play().catch(() => {});

    return () => {
      video.removeEventListener('ended', handleEnded);
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    };
  }, []);

  // Fade music out when final UI appears
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !completed) return;

    // Gradually reduce volume over ~2 seconds
    const startVolume = video.volume;
    const startTime = performance.now();
    const duration = 2000;

    function fadeStep(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      video!.volume = startVolume * (1 - progress);
      if (progress < 1) {
        fadeRef.current = requestAnimationFrame(fadeStep);
      }
    }

    fadeRef.current = requestAnimationFrame(fadeStep);
  }, [completed]);

  const handleSkip = useCallback(() => {
    setSkipped(true);
    setCompleted(true);
    videoRef.current?.pause();
  }, []);

  const toggleSound = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = soundEnabled;
    setSoundEnabled(!soundEnabled);
  }, [soundEnabled]);

  const handleMainPage = useCallback(() => {
    if (videoRef.current) videoRef.current.muted = true;
    onNavigateToMain();
  }, [onNavigateToMain]);

  const handleGoBack = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.muted = true;
    }
    onGoBack();
  }, [onGoBack]);

  const showFinalUI = completed || skipped;
  const anim = showFinalUI ? 'intro-stagger animate' : 'intro-stagger';

  return (
    <div className="intro-container">
      <video
        ref={videoRef}
        className="intro-video"
        src={videoSrc}
        muted
        playsInline
        preload="auto"
      />

      <div className={`intro-dim${showFinalUI ? ' visible' : ''}`} />

      {/* Top-left controls: go back + skip */}
      {!showFinalUI && (
        <>
          <button className="intro-back" onClick={handleGoBack}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button className="intro-skip" onClick={handleSkip}>
            Skip
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 4l10 8-10 8V4z" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </>
      )}

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

      {/* Final overlay */}
      <div
        className="intro-final"
        style={{ pointerEvents: showFinalUI ? 'auto' : 'none' }}
      >
        <div className={`${anim} delay-1 intro-stardrop-label`}>Stardrop</div>

        <p className={`${anim} delay-2 intro-quote`}>
          &ldquo;I have circled many stars, but only yours brought me down to Earth.
          <br />
          I am Stardrop, here to serve your vision.&rdquo;
        </p>

        <div className={`${anim} delay-3 intro-actions`}>
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

          <div className="intro-final-btns">
            <button className="intro-main-btn" onClick={handleGoBack}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Go Back
            </button>
            <button className="intro-main-btn" onClick={handleMainPage}>
              Enter
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ──
export default function IntroScene({ onNavigateToMain }: { onNavigateToMain: () => void }) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const handleGoBack = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  if (selectedVideo) {
    return (
      <IntroPlayer
        videoSrc={selectedVideo}
        onNavigateToMain={onNavigateToMain}
        onGoBack={handleGoBack}
      />
    );
  }

  return <SelectionScreen onSelect={setSelectedVideo} />;
}
