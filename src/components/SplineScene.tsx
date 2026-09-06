import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { Spline } from "@splinetool/runtime";

interface SplineSceneProps {
  sceneUrl: string;
  className?: string;
  style?: React.CSSProperties;
  height?: number | string;
  width?: number | string;
  fallbackColor?: string;
}

export const SplineScene: React.FC<SplineSceneProps> = ({
  sceneUrl,
  className = "",
  style = {},
  height = "100%",
  width = "100%",
  fallbackColor = "var(--moss)",
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const loadSpline = async () => {
      try {
        const spline = await Spline.load(sceneUrl);
        spline.addToCanvas(canvasRef.current);
        return () => spline.removeFromCanvas();
      } catch (error) {
        console.warn("Failed to load Spline scene, showing fallback:", error);
        canvasRef.current.style.background = fallbackColor;
        canvasRef.current.style.opacity = "0.15";
        return () => {};
      }
    };

    const cleanup = loadSpline();
    return cleanup;
  }, [sceneUrl, fallbackColor]);

  return (
    <div
      ref={canvasRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        width,
        height,
        position: "relative",
        ...style,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none spline-fallback"
        style={{ background: `linear-gradient(135deg, var(--moss) 0%, var(--coral) 100%)` }}
      />
    </div>
  );
};
