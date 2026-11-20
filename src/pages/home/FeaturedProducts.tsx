import { Link } from "react-router-dom";
import { ProductCard } from "@components/product/ProductCard";
import type { Product } from "@domain/catalog/types";

export function FeaturedProducts({ products, loading }: { products: Product[]; loading: boolean }) {
  if (!products.length && !loading) return null;

  return (
    <section className="featured-products" aria-labelledby="featured-products-title">
      <div className="mx-auto max-w-7xl px-5">
        <h2 id="featured-products-title" className="font-display text-4xl text-sand md:text-5xl">
          Productos destacados
        </h2>
        {loading && (
          <p role="status" className="mt-6 text-muted-foreground">
            Cargando productos…
          </p>
        )}
        {products.length > 0 && (
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <li key={product.id} className="min-w-0 [&>article]:h-full">
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
        <Link to="/tienda" className="btn-outline-gold mt-5">
          Ver todo el catálogo
        </Link>
      </div>
    </section>
  );
}
