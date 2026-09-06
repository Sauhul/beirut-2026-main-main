import { Link } from "react-router-dom";
import { Instagram, Twitter } from "lucide-react";
import { useState } from "react";
import { SITE, whatsappLink } from "@config/site";

// TikTok icon (no lucide equivalent)
function TikTokIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.21 8.21 0 004.79 1.52V6.77a4.85 4.85 0 01-1.02-.08z" />
    </svg>
  );
}

const footerNav = {
  main: [
    { label: "Inicio", to: "/" },
    { label: "Tienda", to: "/tienda" },
    { label: "Contacto", to: "/contacto" },
  ],
  account: [
    { label: "Mi carrito", to: "/carrito" },
  ],
};

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  }

  return (
    <footer
      style={{
        background: "var(--dk-brown)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Main footer grid */}
      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.5fr]">

          {/* Col 1: Main nav */}
          <div>
            <ul className="space-y-2.5">
              {footerNav.main.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="footer-link"
                  >
                    {l.label.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2: Account */}
          <div>
            <ul className="space-y-2.5">
              {footerNav.account.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="footer-link">
                    {l.label.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Socials */}
          <div>
            <div className="flex gap-3">
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="footer-social-icon"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={whatsappLink("Hola Beirut")}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="footer-social-icon"
              >
                {/* WhatsApp icon */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="footer-social-icon"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="footer-social-icon"
              >
                <TikTokIcon />
              </a>
            </div>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h3
              className="font-sans font-black uppercase tracking-[0.2em]"
              style={{ fontSize: "0.72rem", color: "var(--dk-cream)" }}
            >
              ÚNETE A NUESTRA LISTA
            </h3>
            {submitted ? (
              <p
                className="mt-4 text-sm"
                style={{ color: "var(--dk-gold)" }}
              >
                ¡Gracias por suscribirte!
              </p>
            ) : (
              <form
                onSubmit={handleNewsletter}
                className="mt-4 flex gap-0"
                aria-label="Suscripción al boletín"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu correo electrónico"
                  required
                  className="flex-1 min-w-0 px-3 py-2.5 text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRight: "none",
                    borderRadius: "0.2rem 0 0 0.2rem",
                    color: "var(--dk-cream)",
                    fontSize: "0.78rem",
                  }}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 font-sans font-black uppercase tracking-[0.12em] shrink-0 transition hover:opacity-90"
                  style={{
                    background: "var(--dk-gold)",
                    color: "var(--dk-brown)",
                    border: "1px solid var(--dk-gold)",
                    borderRadius: "0 0.2rem 0.2rem 0",
                    fontSize: "0.62rem",
                  }}
                >
                  SUSCRIBIRSE
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        className="mx-auto max-w-7xl px-5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
      />

      {/* Copyright */}
      <div className="px-5 py-5 text-center">
        <p
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          © {new Date().getFullYear()} BEIRUT DELIKATESSEN
        </p>
      </div>
    </footer>
  );
}
