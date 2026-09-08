import React, { useRef, useEffect } from "react";
import { Application } from "@splinetool/runtime";

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
  fallbackColor = "var(--gold)",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const spline = new Application(canvas);
    spline.load(sceneUrl).catch((error) => {
      console.warn("Failed to load Spline scene, showing fallback:", error);
      if (canvas) {
        canvas.style.background = fallbackColor;
        canvas.style.opacity = "0.15";
      }
    });

    return () => {
      spline.dispose();
    };
  }, [sceneUrl, fallbackColor]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ width, height, position: "relative", ...style }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};