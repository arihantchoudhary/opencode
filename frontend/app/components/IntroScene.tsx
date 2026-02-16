'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// ── Selection Screen ──
interface SelectionScreenProps {
  onSelect: (video: string) => void;
}

function SelectionScreen({ onSelect }: SelectionScreenProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const vid1Ref = useRef<HTMLVideoElement>(null);
  const vid2Ref = useRef<HTMLVideoElement>(null);

  // Auto-play preview videos on mount (muted for autoplay)
  useEffect(() => {
    vid1Ref.current?.play().catch(() => {});
    vid2Ref.current?.play().catch(() => {});
  }, []);

  return (
    <div className="intro-container">
      <div className="select-screen">
        <div className="select-header intro-stagger animate delay-1">
          <h1 className="select-title">Stardrop</h1>
          <p className="select-subtitle">Choose your experience</p>
        </div>

        <div className="select-options intro-stagger animate delay-2">
          <button
            className={`select-card${hovered === '1' ? ' hovered' : ''}`}
            onClick={() => onSelect('/intro.mp4')}
            onMouseEnter={() => setHovered('1')}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="select-preview">
              <video
                ref={vid1Ref}
                src="/intro.mp4"
                muted
                loop
                playsInline
                preload="auto"
              />
            </div>
            <span className="select-label">Animation 1</span>
          </button>

          <button
            className={`select-card${hovered === '2' ? ' hovered' : ''}`}
            onClick={() => onSelect('/intro2.mp4')}
            onMouseEnter={() => setHovered('2')}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="select-preview">
              <video
                ref={vid2Ref}
                src="/intro2.mp4"
                muted
                loop
                playsInline
                preload="auto"
              />
            </div>
            <span className="select-label">Animation 2</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Intro Player ──
interface IntroPlayerProps {
  videoSrc: string;
  onNavigateToMain: () => void;
}

function IntroPlayer({ videoSrc, onNavigateToMain }: IntroPlayerProps) {
  const [completed, setCompleted] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => setCompleted(true);

    video.addEventListener('ended', handleEnded);
    video.play().catch(() => {});

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

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

      {!showFinalUI && (
        <button className="intro-skip" onClick={handleSkip}>
          Skip
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 4l10 8-10 8V4z" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>
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

          <button className="intro-main-btn" onClick={handleMainPage}>
            Enter
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ──
interface IntroSceneProps {
  onNavigateToMain: () => void;
}

export default function IntroScene({ onNavigateToMain }: IntroSceneProps) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  if (selectedVideo) {
    return <IntroPlayer videoSrc={selectedVideo} onNavigateToMain={onNavigateToMain} />;
  }

  return <SelectionScreen onSelect={setSelectedVideo} />;
}
