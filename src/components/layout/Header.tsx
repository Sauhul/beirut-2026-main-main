import { Link, NavLink } from "react-router-dom";
import { Menu, ShoppingBag, X, Search } from "lucide-react";
import { useState } from "react";
import { useCart } from "@domain/cart/use-cart";

const navLinks = [
  { to: "/", label: "INICIO", end: true },
  { to: "/tienda", label: "TIENDA", end: false },
  { to: "/contacto", label: "CONTACTO", end: false },
] as const;

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top announcement bar — cream background */}
      <div
        className="hidden md:flex items-center justify-center gap-1 px-5 py-2 text-center"
        style={{
          background: "var(--dk-cream)",
          borderBottom: "1px solid rgba(61,26,10,0.1)",
          fontSize: "0.68rem",
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--dk-brown)",
        }}
      >
        <span>✦</span>
        <span className="mx-3">¡Delicias artesanales premium, elaboradas con tradición!</span>
        <span>✦</span>
      </div>

      {/* Main nav bar — dark brown */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: "var(--dk-brown)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.35)",
        }}
      >
        <div className="mx-auto flex h-[3.8rem] max-w-7xl items-center justify-between px-5">
          {/* Logo */}
          <Link
            to="/"
            className="flex flex-col items-start leading-none shrink-0"
            onClick={() => setOpen(false)}
          >
            <span
              className="font-display font-black uppercase"
              style={{
                fontSize: "clamp(1.4rem,3vw,1.9rem)",
                letterSpacing: "0.18em",
                color: "var(--dk-gold)",
              }}
            >
              BEIRUT
            </span>
            <span
              className="font-sans font-bold uppercase"
              style={{
                fontSize: "0.46rem",
                letterSpacing: "0.38em",
                color: "rgba(229,196,120,0.7)",
                marginTop: "-1px",
              }}
            >
              DELIKATESSEN
            </span>
          </Link>

          {/* Desktop nav — centered */}
          <nav className="hidden md:flex items-center gap-0">
            {navLinks.map((l) => (
              <NavLink
                key={`${l.to}-${l.label}`}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-[10.5px] font-sans font-black uppercase tracking-[0.2em] transition-colors duration-200 ${
                    isActive ? "text-dk-gold" : "text-white/60 hover:text-white/90"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    {isActive && (
                      <span
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] w-2/3 rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, var(--dk-gold), transparent)",
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              aria-label="Buscar"
              className="hidden md:inline-flex h-9 w-9 items-center justify-center transition-transform hover:-translate-y-0.5"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Cart */}
            <Link
              to="/carrito"
              aria-label="Ver carrito"
              className="relative inline-flex h-9 w-9 items-center justify-center transition-transform hover:-translate-y-0.5"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-4.5 min-w-[1.1rem] items-center justify-center rounded-full px-1 text-[9px] font-black"
                  style={{
                    background: "var(--dk-gold)",
                    color: "var(--dk-brown)",
                  }}
                >
                  {count}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              className="inline-flex h-9 w-9 items-center justify-center md:hidden"
              style={{ color: "rgba(255,255,255,0.7)" }}
              onClick={() => setOpen((v) => !v)}
              aria-label="Abrir menú"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav
            className="border-t md:hidden"
            style={{
              borderColor: "rgba(255,255,255,0.1)",
              background: "var(--dk-brown-deep)",
            }}
          >
            {navLinks.map((l) => (
              <NavLink
                key={`mobile-${l.to}-${l.label}`}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-6 py-3.5 text-[10.5px] font-black uppercase tracking-[0.2em] border-b transition-colors ${
                    isActive
                      ? "text-dk-gold"
                      : "text-white/55 hover:text-white/85"
                  }`
                }
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                {l.label}
              </NavLink>
            ))}
            <NavLink
              to="/carrito"
              onClick={() => setOpen(false)}
              className="block px-6 py-3.5 text-[10.5px] font-black uppercase tracking-[0.2em] text-white/55 hover:text-white/85"
            >
              CARRITO {count > 0 && `(${count})`}
            </NavLink>
          </nav>
        )}
      </header>
    </>
  );
}
