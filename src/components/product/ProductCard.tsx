import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@domain/catalog/types";
import { ProductPhoto } from "./ProductPhoto";
import { formatCOP } from "@shared/utils/format";
import { useCart } from "@domain/cart/use-cart";

export function ProductCard({
  product,
  compact = false,
  headingLevel = 3,
}: {
  product: Product;
  compact?: boolean;
  headingLevel?: 3 | 4;
}) {
  const { add } = useCart();
  const [addCount, setAddCount] = useState(0);
  const { name } = product;
  const Heading = headingLevel === 4 ? "h4" : "h3";

  return (
    <article
      data-catalog-item={compact || undefined}
      className="product-card card-onyx flex flex-col overflow-hidden rounded-2xl"
    >
      <Link to={`/producto/${product.slug}`} className="relative block overflow-hidden">
        <ProductPhoto imageUrl={product.image_url} alt={name} />
        {!compact && (
          <span className="absolute top-3 left-3 bg-background/80 px-2 py-1 text-[0.55rem] font-bold tracking-[0.18em] uppercase text-gold">
            {product.category_name}
          </span>
        )}
      </Link>

      <div className={`flex flex-1 flex-col ${compact ? "p-3 sm:p-4" : "p-5"}`}>
        <Link to={`/producto/${product.slug}`}>
          <Heading
            className={`font-display leading-tight text-sand ${compact ? "text-base break-words sm:text-xl" : "text-xl"}`}
          >
            {name}
          </Heading>
        </Link>
        {!compact && (
          <p className="mt-2 line-clamp-2 text-xs leading-6 text-muted-foreground">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between pt-4">
          <span
            className={`font-display tabular-nums text-gold ${compact ? "text-lg sm:text-xl" : "text-2xl"}`}
          >
            {formatCOP(product.price)}
          </span>
        </div>

        <div className={compact ? "mt-3" : "mt-5 flex gap-2"}>
          <button
            onClick={() => {
              add({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                unit: product.unit,
                categorySlug: product.category_slug,
                imageUrl: product.image_url,
              });
              setAddCount((count) => count + 1);
              toast.success(`${name} agregado al carrito`);
            }}
            aria-label={`Agregar ${name} al carrito`}
            className={`btn-gold w-full !py-3 !text-[0.62rem] ${compact ? "min-h-11 !px-1.5 !tracking-normal" : ""}`}
          >
            <ShoppingCart
              key={addCount}
              aria-hidden="true"
              className={`h-3.5 w-3.5 shrink-0 ${addCount ? "motion-added" : ""}`}
            />{" "}
            {compact ? "Agregar" : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </article>
  );
}
