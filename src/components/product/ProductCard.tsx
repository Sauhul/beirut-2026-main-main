import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@domain/catalog/types";
import { ProductPhoto } from "./ProductPhoto";
import { formatCOP } from "@shared/utils/format";
import { useCart } from "@domain/cart/use-cart";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { name } = product;

  return (
    <article className="card-onyx group flex flex-col overflow-hidden rounded-2xl">
      <Link
        to={`/producto/${product.slug}`}
        className="product-card-photo relative block overflow-hidden"
      >
        <ProductPhoto imageUrl={product.image_url} alt={name} />
        <span className="absolute top-3 left-3 bg-background/80 px-2 py-1 text-[0.55rem] font-bold tracking-[0.18em] uppercase text-gold">
          {product.category_name}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link to={`/producto/${product.slug}`}>
          <h3 className="font-display text-xl leading-tight text-sand">{name}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-xs leading-6 text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <span className="font-display text-2xl text-gold">{formatCOP(product.price)}</span>
        </div>

        <div className="mt-5 flex gap-2">
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
              toast.success(`${name} agregado al carrito`);
            }}
            aria-label={`Agregar ${name} al carrito`}
            className="btn-gold w-full !py-3 !text-[0.62rem]"
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Agregar al carrito
          </button>
        </div>
      </div>
    </article>
  );
}
