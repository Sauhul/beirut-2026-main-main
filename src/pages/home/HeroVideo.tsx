import { useEffect, useRef, useState } from "react";

const HERO_VIDEO = "/media/beirut-hero-0548f127.mp4";
const HERO_POSTER = "/media/beirut-hero-0548f127.webp";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!motion.matches) void video.play().catch(() => {});

    function pauseForReducedMotion() {
      if (motion.matches) video?.pause();
    }

    motion.addEventListener("change", pauseForReducedMotion);
    return () => motion.removeEventListener("change", pauseForReducedMotion);
  }, []);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => {});
    else video.pause();
  }

  return (
    <>
      <video
        ref={videoRef}
        src={HERO_VIDEO}
        poster={HERO_POSTER}
        aria-label="Video de aceitunas, dátiles, baklawa y galletas mamoul"
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
