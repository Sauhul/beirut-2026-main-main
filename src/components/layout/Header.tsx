import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingBag, Instagram } from "lucide-react";
import { SITE } from "@config/site";
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

        <nav aria-label="Navegación principal" className="hidden items-center gap-10 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="nav-motion-link text-[0.7rem] font-bold tracking-[0.22em] uppercase text-muted-foreground transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/carrito"
            aria-label="Ver carrito"
            className="motion-press relative inline-flex text-muted-foreground transition-colors hover:text-gold"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span
                key={count}
                className="motion-value absolute -right-2.5 -top-2 flex h-5 min-w-[1.15rem] items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-bold text-primary-foreground"
              >
                {count}
              </span>
            )}
          </Link>
          <a
            href="https://www.instagram.com/delikatessenbeyrouth_84?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-gold transition-colors"
          >
            <Instagram className="h-5 w-5" />
          </a>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/carrito"
            aria-label="Ver carrito"
            className="motion-press relative grid size-11 touch-manipulation place-items-center text-muted-foreground hover:text-gold"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span
                key={count}
                className="motion-value absolute right-0 top-0 flex h-5 min-w-[1.15rem] items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-bold text-primary-foreground"
              >
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            className="motion-press grid size-11 touch-manipulation place-items-center text-gold"
          >
            <span key={String(open)} className="motion-value">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </span>
          </button>
        </div>
      </div>

      <nav
        id="mobile-navigation"
        aria-label="Navegación móvil"
        inert={!open}
        data-open={open}
        className="mobile-nav-motion border-t border-border bg-card px-5 py-5 shadow-lg md:hidden"
      >
        <div className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="flex min-h-11 touch-manipulation items-center text-sm font-bold tracking-[0.15em] uppercase text-muted-foreground hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
