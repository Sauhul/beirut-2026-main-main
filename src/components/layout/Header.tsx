import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Phone, ShoppingBag } from "lucide-react";
import { SITE, whatsappLink } from "@config/site";
import { useCart } from "@domain/cart/use-cart";
import logo from "@assets/beirut-logo.png";

const NAV = [
  { to: "/", label: "Inicio" },
  { to: "/tienda", label: "Tienda" },
  { to: "/contacto", label: "Visítanos" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/92 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src={logo} alt={SITE.brandFull} className="h-11 w-auto" />
          <span className="leading-none">
            <span className="block font-display text-xl tracking-[0.3em] text-gold">BEIRUT</span>
            <span className="block text-[0.55rem] font-semibold tracking-[0.28em] text-muted-foreground uppercase">
              Delikatessen
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-[0.7rem] font-bold tracking-[0.22em] uppercase text-muted-foreground transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/carrito"
            aria-label="Ver carrito"
            className="relative inline-flex text-muted-foreground transition-colors hover:text-gold"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2.5 -top-2 flex h-5 min-w-[1.15rem] items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          <a
            href={whatsappLink("Hola, quiero hacer un pedido en Delikatessen Beyrouth.")}
            target="_blank"
            rel="noreferrer"
            className="btn-outline-gold !px-5 !py-2.5"
          >
            <Phone className="h-3.5 w-3.5" /> Pedir
          </a>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/carrito"
            aria-label="Ver carrito"
            className="relative inline-flex text-muted-foreground transition-colors hover:text-gold"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2.5 -top-2 flex h-5 min-w-[1.15rem] items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menú"
            className="text-gold"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-card px-5 py-5 shadow-lg md:hidden">
          <div className="flex flex-col gap-4">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="text-[0.72rem] font-bold tracking-[0.22em] uppercase text-muted-foreground hover:text-gold"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={whatsappLink("Hola, quiero hacer un pedido en Delikatessen Beyrouth.")}
              target="_blank"
              rel="noreferrer"
              className="btn-gold mt-2"
            >
              Pedir por WhatsApp
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}