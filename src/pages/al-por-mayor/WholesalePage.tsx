import { useRef } from "react";
import { ArrowUpRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE } from "@config/site";
import { usePageTitle } from "@hooks/usePageTitle";
import { useEntrance } from "@hooks/useEntrance";
import catalogPhoto from "@assets/hero-productos-beirut.webp";

const quoteEmail = `mailto:${SITE.email}?subject=${encodeURIComponent("Cotización al por mayor")}&body=${encodeURIComponent("Hola, Beirut. Quisiera solicitar una cotización al por mayor.\n\nNombre del negocio:\nCiudad:\nProductos y cantidades:\n")}`;

export function WholesalePage() {
  const heroRef = useRef<HTMLElement>(null);
  useEntrance(heroRef);
  usePageTitle("Al por mayor | Delikatessen Beyrouth");

  return (
    <section
      ref={heroRef}
      className="route-page mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:items-center md:gap-12 md:py-16"
    >
      <div>
        <h1 className="beirut-hero-line text-5xl leading-none text-sand sm:text-6xl [font-family:'DM_Serif_Display',Georgia,serif]">
          <span data-enter="line">Al por mayor</span>
        </h1>
        <p
          data-enter="detail"
          className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground"
        >
          Café con cardamomo, aceitunas, especias y otros productos de nuestra tienda para
          restaurantes, tiendas y negocios.
        </p>
        <p
          data-enter="detail"
          className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground"
        >
          Cuéntanos qué productos necesitas, en qué cantidades y en qué ciudad. Te responderemos por
          correo con disponibilidad y precios.
        </p>
        <div data-enter="detail" className="mt-7 flex flex-wrap items-center gap-4">
          <a href={quoteEmail} className="btn-gold">
            <Mail aria-hidden="true" size={17} /> Solicitar cotización
          </a>
          <Link
            to="/tienda"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-foreground hover:underline"
          >
            Ver catálogo <ArrowUpRight aria-hidden="true" size={15} />
          </Link>
        </div>
      </div>
      <img
        data-enter="photo"
        src={catalogPhoto}
        alt="Aceite de oliva Koura, café Najjar, aceitunas verdes y pan con zaatar"
        width={1120}
        height={1400}
        className="h-auto w-full max-w-[28rem] justify-self-center rounded-xl shadow-lg"
      />
    </section>
  );
}
