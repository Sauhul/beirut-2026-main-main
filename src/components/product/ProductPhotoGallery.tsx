import { useState } from "react";
import { Image, ZoomIn } from "lucide-react";
import { productImageSrc } from "@shared/utils/category-images";
import { ProductPhoto } from "./ProductPhoto";
import { getProductPhotoFraming } from "./product-photo-framing";

type ProductPhotoGalleryProps = {
  imageUrl?: string | null;
  name: string;
  productSlug?: string;
};

export function ProductPhotoGallery({ imageUrl, name, productSlug }: ProductPhotoGalleryProps) {
  const [showDetail, setShowDetail] = useState(false);
  const source = imageUrl ? productImageSrc(imageUrl) : undefined;
  const { focalPoint } = getProductPhotoFraming(source, productSlug);

  return (
    <div className="mx-auto max-w-xl">
      <ProductPhoto
        key={String(showDetail)}
        className="motion-gallery-frame"
        imageUrl={imageUrl}
        alt={showDetail ? `Detalle de ${name}` : name}
        loading="eager"
        showDetail={showDetail}
        productSlug={productSlug}
      />
      {focalPoint && (
        <div className="product-gallery-controls" role="group" aria-label="Vistas del producto">
          <button
            type="button"
            className="motion-press"
            aria-pressed={!showDetail}
            onClick={() => setShowDetail(false)}
          >
            <Image size={16} aria-hidden="true" />
            Juego completo
          </button>
          <button
            type="button"
            className="motion-press"
            aria-pressed={showDetail}
            onClick={() => setShowDetail(true)}
          >
            <ZoomIn size={16} aria-hidden="true" />
            Ver detalle
          </button>
        </div>
      )}
    </div>
  );
}
