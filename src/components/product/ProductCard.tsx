import { Link } from "react-router-dom";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@domain/catalog/types";
import { categoryImage } from "@shared/utils/category-images";
import { formatCOP, titleCase } from "@shared/utils/format";
import { formatPresentation } from "@shared/utils/product-format";
import { useCart } from "@domain/cart/use-cart";
import { whatsappLink } from "@config/site";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const name = titleCase(product.name);

  return (
    <article className="card-onyx group flex flex-col overflow-hidden rounded-2xl">
            <Link
        to={`/producto/${product.slug}`}
        className="relative block aspect-[5/6] overflow-hidden rounded-t-2xl"
        style={{ backgroundColor: '#f5f0dc' }}
      >
        <img
          src={categoryImage(product.category_slug, product.image_url)}
          alt={name}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 bg-background/80 px-2 py-1 text-[0.55rem] font-bold tracking-[0.18em] uppercase text-gold">
          {product.category_name}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link to={`/producto/${product.slug}`}>
          <h3 className="font-display text-xl leading-tight text-sand">{name}</h3>
        </Link>
        <p className="mt-2 text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
          {formatPresentation(product.unit)}
        </p>
        <p className="mt-2 line-clamp-2 text-xs leading-6 text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-4 flex items-end justify-between">
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
            className="btn-gold flex-1 !py-3 !text-[0.62rem]"
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Agregar
          </button>
          <a
            href={whatsappLink(`Hola, me interesa ${name} (${formatCOP(product.price)}).`)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Pedir ${name} por WhatsApp`}
            className="btn-outline-gold !px-3.5 !py-3"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}