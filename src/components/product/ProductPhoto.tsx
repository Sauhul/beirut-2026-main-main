import { useState, type CSSProperties } from "react";
import { ImageOff } from "lucide-react";
import { productImageSrc } from "@shared/utils/category-images";
import { getProductPhotoFraming } from "./product-photo-framing";

type ProductPhotoProps = {
  imageUrl?: string | null;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  showDetail?: boolean;
};

export function ProductPhoto({
  imageUrl,
  alt,
  className = "",
  loading = "lazy",
  showDetail = false,
}: ProductPhotoProps) {
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const originalSource = imageUrl ? productImageSrc(imageUrl) : undefined;
  const { focalPoint, enlarge, studioSource } = getProductPhotoFraming(originalSource);
  const source =
    !showDetail && studioSource && !failedSources.includes(studioSource)
      ? studioSource
      : originalSource;
  const detailPoint = showDetail ? focalPoint : undefined;
  const modifiers = [
    enlarge && "product-photo--framed",
    detailPoint && "product-photo--detail",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const detailStyle = detailPoint
    ? ({
        "--product-photo-detail-offset": `-${detailPoint[0]}% -${detailPoint[1]}%`,
      } as CSSProperties)
    : undefined;

  return (
    <div className={`product-photo ${modifiers}`}>
      {source && !failedSources.includes(source) ? (
        <img
          src={source}
          alt={alt}
          width={1000}
          height={1200}
          loading={loading}
          decoding="async"
          style={detailStyle}
          onError={() => setFailedSources((previous) => [...previous, source])}
        />
      ) : (
        <span
          className="product-photo-placeholder"
          role={alt ? "img" : undefined}
          aria-label={alt ? `Foto no disponible: ${alt}` : undefined}
          aria-hidden={alt ? undefined : true}
        >
          <ImageOff size={24} aria-hidden="true" />
        </span>
      )}
    </div>
  );
}
