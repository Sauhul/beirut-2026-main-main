import { useState, type CSSProperties } from "react";
import sectionPhotoSources from "@domain/catalog/section-photos.json";
import { ImageOff } from "lucide-react";
import { productImageSrc } from "@shared/utils/category-images";
import { getProductPhotoFraming } from "./product-photo-framing";

const sectionPhotos = new Map(Object.entries(sectionPhotoSources));

export type SectionPhoto = { productSlug: string; groupSlug: string };

type ProductPhotoProps = {
  imageUrl?: string | null;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  showDetail?: boolean;
  sectionPhoto?: SectionPhoto;
};

export function ProductPhoto({
  imageUrl,
  alt,
  className = "",
  loading = "lazy",
  showDetail = false,
  sectionPhoto,
}: ProductPhotoProps) {
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const originalSource = imageUrl ? productImageSrc(imageUrl) : undefined;
  const { focalPoint, enlarge, studioSource, detailSource } = getProductPhotoFraming(
    originalSource,
    sectionPhoto?.productSlug,
  );
  const cutoutUrl =
    !showDetail &&
    sectionPhoto &&
    imageUrl &&
    sectionPhotos.get(sectionPhoto.productSlug)?.includes(imageUrl)
      ? `/catalog-cutouts/${encodeURIComponent(sectionPhoto.productSlug)}.webp`
      : undefined;
  const cutout = cutoutUrl && !failedSources.includes(cutoutUrl) ? cutoutUrl : undefined;
  const source =
    (showDetail && detailSource && !failedSources.includes(detailSource)
      ? detailSource
      : undefined) ??
    cutout ??
    (!showDetail && studioSource && !failedSources.includes(studioSource)
      ? studioSource
      : originalSource);
  const backdrop =
    cutout && sectionPhoto
      ? `url("/catalog-backdrops/${encodeURIComponent(sectionPhoto.groupSlug)}.webp")`
      : undefined;
  const detailPoint = showDetail ? focalPoint : undefined;
  const modifiers = [
    backdrop && "product-photo--section",
    !cutout && enlarge && "product-photo--framed",
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
    <div className={`product-photo ${modifiers}`} style={{ backgroundImage: backdrop }}>
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
