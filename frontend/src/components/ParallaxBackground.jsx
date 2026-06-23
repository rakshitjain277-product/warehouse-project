import { useEffect, useRef } from 'react';

export default function ParallaxBackground() {
  const videoRef = useRef(null);
  const frameRef = useRef(null);
  const progressRef = useRef(null);
  const rafRef = useRef(null);
  const scrollTarget = useRef(0);
  const scrollSmooth = useRef(0);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseSmooth = useRef({ x: 0, y: 0 });
  const durationRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updateScrollTarget = () => {
      const scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      const maxScroll = Math.max(scrollHeight - window.innerHeight, 1);
      scrollTarget.current = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    };

    const updateDuration = () => {
      if (video?.duration && Number.isFinite(video.duration)) {
        durationRef.current = video.duration;
      }
    };

    const handlePointerMove = (event) => {
      mouseTarget.current = {
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    const tick = () => {
      scrollSmooth.current += (scrollTarget.current - scrollSmooth.current) * 0.09;
      mouseSmooth.current.x += (mouseTarget.current.x - mouseSmooth.current.x) * 0.05;
      mouseSmooth.current.y += (mouseTarget.current.y - mouseSmooth.current.y) * 0.05;

      const progress = scrollSmooth.current;
      const mx = prefersReducedMotion ? 0 : mouseSmooth.current.x;
      const my = prefersReducedMotion ? 0 : mouseSmooth.current.y;
      const dive = Math.sin(progress * Math.PI);

      if (video) {
        const duration = durationRef.current;
        if (duration > 0) {
          const targetTime = Math.min(duration - 0.05, Math.max(0, progress * duration));
          if (Math.abs(video.currentTime - targetTime) > 0.04) {
            video.currentTime = targetTime;
          }
        }

        const scale = 1.12 + dive * 0.18;
        const x = mx * -18;
        const y = progress * -42 + my * -12;
        video.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
        video.style.filter = `saturate(${1.08 + dive * 0.18}) contrast(${1.06 + progress * 0.1})`;
      }

      if (frameRef.current) {
        frameRef.current.style.setProperty('--fall-progress', progress.toFixed(4));
      }

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${Math.max(0.015, progress)})`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    updateScrollTarget();
    updateDuration();

    if (video) {
      video.pause();
      video.currentTime = 0;
      video.addEventListener('loadedmetadata', updateDuration);
      video.addEventListener('durationchange', updateDuration);
    }

    window.addEventListener('scroll', updateScrollTarget, { passive: true });
    window.addEventListener('resize', updateScrollTarget);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (video) {
        video.removeEventListener('loadedmetadata', updateDuration);
        video.removeEventListener('durationchange', updateDuration);
      }
      window.removeEventListener('scroll', updateScrollTarget);
      window.removeEventListener('resize', updateScrollTarget);
      window.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={frameRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0, background: '#050713' }}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/skydive.mp4"
        muted
        playsInline
        preload="auto"
        style={{
          opacity: 0.96,
          transform: 'scale(1.12)',
          transformOrigin: 'center center',
          willChange: 'transform, filter',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(3,7,18,0.24) 0%, rgba(3,7,18,0.02) 36%, rgba(3,7,18,0.72) 100%)',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 38%, rgba(255,255,255,0) 34%, rgba(0,0,0,0.58) 100%)',
        }}
      />

      <div
        className="absolute left-0 right-0 bottom-0 h-1 origin-left"
        ref={progressRef}
        style={{
          background: 'linear-gradient(90deg, #ffb36b, #ff4b3e)',
          transform: 'scaleX(0.015)',
          willChange: 'transform',
        }}
      />

      <div
        className="absolute inset-x-0 top-0 h-40"
        style={{ background: 'linear-gradient(to bottom, var(--site-bg), transparent)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-64"
        style={{ background: 'linear-gradient(to top, var(--site-bg), transparent)' }}
      />
    </div>
  );
}
