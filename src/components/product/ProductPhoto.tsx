import { useState } from "react";
import { ImageOff } from "lucide-react";
import { productImageSrc } from "@shared/utils/category-images";

type ProductPhotoProps = {
  imageUrl?: string | null;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
};

export function ProductPhoto({
  imageUrl,
  alt,
  className = "",
  loading = "lazy",
}: ProductPhotoProps) {
  const [failedSource, setFailedSource] = useState<string>();
  const source = imageUrl ? productImageSrc(imageUrl) : undefined;

  return (
    <div className={`product-photo ${className}`}>
      {source && source !== failedSource ? (
        <img
          src={source}
          alt={alt}
          width={1000}
          height={1200}
          loading={loading}
          decoding="async"
          onError={() => setFailedSource(source)}
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
