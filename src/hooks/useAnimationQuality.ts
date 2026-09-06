export type MotionQuality = "full" | "lite" | "minimal";

export function getMotionQuality(): MotionQuality {
  if (typeof window === "undefined") return "full";
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return "minimal";
    }
    const nav = navigator as Navigator & { deviceMemory?: number };
    const memory = nav.deviceMemory ?? 8;
    const cores =
      typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : 8;
    const mobile = /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);

    if (memory <= 4 || cores <= 4) return "lite";
    if (mobile && (memory <= 6 || cores <= 8)) return "lite";
  } catch {
    return "full";
  }
  return "full";
}

export function initMotionQuality(): MotionQuality {
  const quality = getMotionQuality();
  if (typeof document !== "undefined") {
    document.documentElement.dataset.motion = quality;
  }
  return quality;
}
