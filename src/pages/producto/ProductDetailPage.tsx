import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, MessageCircle, Minus, Plus, Truck } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";
import { productQuery } from "@domain/catalog/queries";
import { categoryImage } from "@shared/utils/category-images";
import { formatCOP, titleCase } from "@shared/utils/format";
import { formatPresentation } from "@shared/utils/product-format";
import { useCart } from "@domain/cart/use-cart";
import { whatsappLink } from "@config/site";
import { ProductCard } from "@components/product/ProductCard";
import { usePageTitle } from "@hooks/usePageTitle";
import { getMotionQuality } from "@hooks/useAnimationQuality";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function ProductoNoEncontrado() {
  return (
    <div className="route-page mx-auto max-w-xl px-5 py-28 text-center">
      <p className="font-display text-4xl text-sand">No encontramos ese producto</p>
      <Link to="/tienda" className="btn-gold mx-auto mt-8 max-w-max">
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
  const name = titleCase(product.name);

  return (
    <div ref={containerRef} className="route-page mx-auto max-w-7xl px-5 pb-24 pt-10">
      <Link
        to="/tienda"
        className="inline-flex items-center gap-2 text-[0.65rem] font-bold tracking-[0.22em] uppercase text-muted-foreground hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a la tienda
      </Link>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1.1fr]">
        <div className="detail-image detail-motion">
          <div className="card-onyx p-8">
            <img
              src={categoryImage(product.category_slug, product.image_url)}
              alt={name}
              className="mx-auto aspect-square w-full max-w-md object-contain"
            />
            <span className="mt-6 inline-flex border border-gold/50 px-3 py-1.5 text-[0.6rem] font-bold tracking-[0.2em] uppercase text-gold">
              {product.category_name}
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <p className="detail-meta detail-motion eyebrow">Importación directa</p>
          <h1 className="detail-title detail-motion mt-3 font-display text-5xl leading-tight text-sand md:text-6xl">
            {name}
          </h1>
          <p className="detail-meta detail-motion mt-2 text-[0.65rem] font-bold tracking-[0.22em] uppercase text-muted-foreground">
            {formatPresentation(product.unit)}
          </p>
          <p className="detail-meta detail-motion mt-6 max-w-xl text-base leading-8 text-muted-foreground">
            {product.description}
          </p>
          <p className="detail-meta detail-motion mt-6 font-display text-5xl text-gold">
            {formatCOP(product.price)}
          </p>

          <div className="detail-actions detail-motion mt-10 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 border border-input bg-onyx px-3 py-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-9 w-9 place-items-center text-muted-foreground hover:text-gold"
                aria-label="Restar"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-6 text-center text-sm font-bold text-sand">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid h-9 w-9 place-items-center text-muted-foreground hover:text-gold"
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
                toast.success(`${name} agregado al carrito`);
              }}
              className="btn-gold flex-1 sm:flex-none"
            >
              <CheckCircle2 className="h-4 w-4" /> Agregar al carrito
            </button>
            <a
              href={whatsappLink(`Hola, me interesa ${name} (${formatCOP(product.price)}).`)}
              target="_blank"
              rel="noreferrer"
              className="btn-outline-gold !px-5"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>

          <ul className="detail-meta detail-motion mt-12 space-y-3 border-t border-border pt-8 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-gold" /> Envíos a toda Colombia
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-gold" /> Pago seguro con Wompi
            </li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Para completar la mesa</p>
              <h2 className="mt-3 font-display text-4xl text-sand">Combina con este producto</h2>
            </div>
          </div>
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