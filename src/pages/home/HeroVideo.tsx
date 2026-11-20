import { useEffect, useRef, useState } from "react";

const HERO_VIDEO = "/media/beirut-hero-b89f3645.mp4";
const HERO_POSTER = "/media/beirut-hero-b89f3645.webp";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const manualPlayback = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;

    function syncPlayback() {
      if (!visible || motion.matches) video?.pause();
      else if (!manualPlayback.current) void video?.play().catch(() => {});
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.45 },
    );
    observer.observe(video);
    motion.addEventListener("change", syncPlayback);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", syncPlayback);
    };
  }, []);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    manualPlayback.current = true;
    if (video.paused) void video.play().catch(() => {});
    else video.pause();
  }

  return (
    <>
      <video
        ref={videoRef}
        src={HERO_VIDEO}
        poster={HERO_POSTER}
        aria-label="Video de productos de Delikatessen Beyrouth"
        width={720}
        height={1280}
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button type="button" onClick={togglePlayback} className="beirut-hero-video-control">
        {playing ? "Pausar video" : "Reproducir video"}
      </button>
    </>
  );
}
