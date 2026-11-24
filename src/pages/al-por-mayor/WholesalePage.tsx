import { ArrowUpRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE } from "@config/site";
import { usePageTitle } from "@hooks/usePageTitle";
import catalogPhoto from "@assets/hero-productos-beirut.webp";

const quoteEmail = `mailto:${SITE.email}?subject=${encodeURIComponent("Cotización al por mayor")}&body=${encodeURIComponent("Hola, Beirut. Quisiera solicitar una cotización al por mayor.\n\nNombre del negocio:\nCiudad:\nProductos y cantidades:\n")}`;

export function WholesalePage() {
  usePageTitle("Al por mayor | Delikatessen Beyrouth");

  return (
    <section className="route-page mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:items-center md:gap-12 md:py-16">
      <div>
        <h1 className="font-display text-5xl leading-none text-sand sm:text-6xl">Al por mayor</h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
          Café con cardamomo, aceitunas, especias y otros productos de nuestra tienda para
          restaurantes, tiendas y negocios.
        </p>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Cuéntanos qué productos necesitas, en qué cantidades y en qué ciudad. Te responderemos por
          correo con disponibilidad y precios.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-4">
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
        src={catalogPhoto}
        alt="Aceite de oliva Koura, café Najjar, aceitunas verdes y pan con zaatar"
        className="aspect-[5/4] w-full rounded-xl object-cover md:aspect-square"
      />
    </section>
  );
}
