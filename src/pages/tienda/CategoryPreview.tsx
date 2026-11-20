import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProductPhoto } from "@components/product/ProductPhoto";
import type { Product } from "@domain/catalog/types";
import { titleCase } from "@shared/utils/format";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type CategoryPreviewProps = {
  slug: string;
  products: Product[];
};

export function CategoryPreview({ slug, products }: CategoryPreviewProps) {
  const stage = useRef<HTMLDivElement>(null);
  const photos = products.filter((product) => product.image_url);
  const oilPrefix = "aceite-";
  const samples =
    slug === "salsas"
      ? [
          ...photos.filter((product) => product.slug.startsWith(oilPrefix)),
          ...photos.filter((product) => !product.slug.startsWith(oilPrefix)),
        ]
      : photos;

  useGSAP(
    () => {
      if (!stage.current) return;
      const motion = gsap.matchMedia();

      motion.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".category-preview-item", {
          y: 18,
          scale: 0.97,
          opacity: 0.65,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: stage.current, start: "top 90%", once: true },
        });
      });

      return () => motion.revert();
    },
    { scope: stage },
  );

  if (!samples.length) return null;

  return (
    <div ref={stage} className="category-preview">
      {samples.slice(0, 3).map((product) => (
        <ProductPhoto
          key={product.id}
          imageUrl={product.image_url}
          alt={titleCase(product.name)}
          className="category-preview-item"
        />
      ))}
    </div>
  );
}
