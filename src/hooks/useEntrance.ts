import type { RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

gsap.registerPlugin(useGSAP);

export function useEntrance(scope: RefObject<HTMLElement | null>, section?: string) {
  useGSAP(
    () => {
      const container = scope.current;
      if (!container) return;

      const motion = gsap.matchMedia();
      motion.add("(prefers-reduced-motion: no-preference)", () => {
        const lines = container.querySelectorAll("[data-enter='line']");
        const photo = container.querySelector("[data-enter='photo']");
        const details = container.querySelectorAll("[data-enter='detail']");
        const entrance = gsap.timeline({
          defaults: { duration: 1.24, ease: "power2.out", clearProps: "transform,opacity" },
        });

        if (lines.length) entrance.from(lines, { yPercent: 105, stagger: 0.19 }, 0);
        if (photo) {
          entrance.fromTo(
            photo,
            { yPercent: 105, clipPath: "inset(0% -12% 100% -12%)" },
            {
              yPercent: 0,
              clipPath: "inset(-12% -12% -12% -12%)",
              clearProps: "transform,clipPath",
            },
            0,
          );
        }
        if (details.length) entrance.from(details, { y: 14, opacity: 0.65, duration: 0.8 }, 0.48);
      });

      return () => motion.revert();
    },
    { scope, dependencies: [section], revertOnUpdate: true },
  );
}
