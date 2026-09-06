import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Minus, Plus, Truck } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";
import { productQuery } from "@domain/catalog/queries";
import { categoryImage } from "@shared/utils/category-images";
import { formatCOP } from "@shared/utils/format";
import { formatPresentation } from "@shared/utils/product-format";
import { useCart } from "@domain/cart/use-cart";
import { ProductCard } from "@components/product/ProductCard";
import { usePageTitle } from "@hooks/usePageTitle";
import { getMotionQuality } from "@hooks/useAnimationQuality";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function ProductoNoEncontrado() {
  return (
    <div className="route-page mx-auto max-w-xl px-5 py-28 text-center">
      <p className="font-script text-5xl text-primary">No encontramos ese producto</p>
      <Link to="/tienda" className="liquid-button mx-auto mt-8 max-w-max">
        Volver a la tienda
      </Link>
    </div>
  );
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data } = useQuery(productQuery(slug ?? ""));
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  usePageTitle(data ? `${data.product.name} · Beirut` : "Producto · Beirut");

  useGSAP(
    () => {
      const motion = getMotionQuality();
      gsap.set(".detail-motion", { autoAlpha: 1 });
      if (motion === "minimal") return;

      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".detail-image", { x: -44, autoAlpha: 0, scale: 0.92, duration: 0.85 })
        .from(".detail-title", { y: 32, autoAlpha: 0, duration: 0.7 }, "-=0.5")
        .from(".detail-meta", { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.52 }, "-=0.45")
        .from(".detail-actions", { y: 22, autoAlpha: 0, duration: 0.55 }, "-=0.36");

      gsap.from(".related-card", {
        y: 48,
        autoAlpha: 0,
        scale: 0.93,
        stagger: 0.07,
        duration: 0.62,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".related-grid",
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: containerRef, dependencies: [data?.product.id], revertOnUpdate: true },
  );

  if (!data) return <ProductoNoEncontrado />;
  const { product, related } = data;

  return (
    <div ref={containerRef} className="route-page mx-auto max-w-7xl px-5 pb-24 pt-10">
      <Link to="/tienda" className="ghost-button !py-3 !text-xs">
        <ArrowLeft className="h-4 w-4" /> Volver a la tienda
      </Link>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1.1fr]">
        <div className="detail-image detail-motion">
          <div className="rounded-[2.5rem] border border-foreground/10 bg-background/80 p-8 shadow-[var(--shadow-soft)] backdrop-blur-xl">
            <img
              src={categoryImage(product.category_slug, product.image_url)}
              alt={product.name}
              className="mx-auto aspect-square w-full max-w-md object-contain"
            />
            <span className="mt-6 inline-flex rounded-full bg-primary/12 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-primary">
              {product.category_name}
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="detail-title detail-motion display-slab">{product.name}</h1>
          <p className="detail-meta detail-motion mt-2 text-xs font-black uppercase tracking-[0.2em] text-foreground/50">
            {formatPresentation(product.unit)}
          </p>
          <p className="detail-meta detail-motion mt-6 max-w-xl text-lg leading-8 text-foreground/68">
            {product.description}
          </p>
          <p className="detail-meta detail-motion mt-6 text-5xl font-black tracking-[-0.06em]">
            {formatCOP(product.price)}
          </p>

          <div className="detail-actions detail-motion mt-10 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-foreground/10 bg-background/70 px-3 py-2 backdrop-blur-xl">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-foreground/5"
                aria-label="Restar"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-6 text-center text-sm font-black">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-foreground/5"
                aria-label="Sumar"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => {
                for (let i = 0; i < qty; i += 1) {
                  add({
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    unit: product.unit,
                    categorySlug: product.category_slug,
                    imageUrl: product.image_url,
                  });
                }
                toast.success(`${product.name} agregado al carrito`);
              }}
              className="liquid-button"
            >
              <CheckCircle2 className="h-4 w-4" /> Agregar al carrito
            </button>
          </div>

          <ul className="detail-meta detail-motion mt-12 space-y-3 text-sm text-foreground/65">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" /> Envíos a toda Colombia
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Pago seguro con Wompi
            </li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="display-slab">Combina con este producto</h2>
          <div className="related-grid mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <div key={p.id} className="related-card">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
