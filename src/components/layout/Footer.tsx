import { Link } from "react-router-dom";
import { Instagram, Mail, MapPin, Phone, Clock } from "lucide-react";
import { SITE } from "@config/site";

export function Footer() {
  return (
    <footer className="arabesque border-t border-border bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <p className="font-display text-3xl tracking-[0.24em] text-gold-soft">BEIRUT</p>
          <p className="mt-1 text-[0.6rem] font-semibold tracking-[0.3em] uppercase text-secondary-foreground/80">
            {SITE.brandFull}
          </p>
          <p className="mt-5 max-w-sm text-sm leading-7 text-secondary-foreground/85">
            Importamos y seleccionamos productos del Líbano y del Medio Oriente para las cocinas de
            Barranquilla: especias, café, dulces, conservas y utensilios tradicionales.
          </p>
        </div>

        <div>
          <p className="eyebrow text-gold-soft">Navegación</p>
          <ul className="mt-4 space-y-3 text-sm text-secondary-foreground/85">
            <li>
              <Link to="/" className="hover:text-gold-soft">
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/tienda" className="hover:text-gold-soft">
                Tienda
              </Link>
            </li>
            <li>
              <Link to="/contacto" className="hover:text-gold-soft">
                Visítanos
              </Link>
            </li>
            <li>
              <Link to="/carrito" className="hover:text-gold-soft">
                Tu pedido
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-gold-soft">Contacto</p>
          <ul className="mt-4 space-y-3 text-sm text-secondary-foreground/85">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-soft" />
              {SITE.address}
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-soft" />
              <span>
                {SITE.hoursWeek}
                <br />
                {SITE.hoursSunday}
              </span>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-soft" />
              <span>{SITE.phoneDisplay}</span>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-soft" />
              <span className="min-w-0 [overflow-wrap:anywhere]">{SITE.email}</span>
            </li>
            <li className="flex gap-2">
              <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-gold-soft" />
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 [overflow-wrap:anywhere] hover:text-gold-soft"
              >
                {SITE.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-secondary-foreground/15 px-5 py-6 text-center text-[0.65rem] tracking-[0.2em] uppercase text-secondary-foreground/80">
        © {new Date().getFullYear()} {SITE.brandFull} · Barranquilla, Colombia
      </div>
    </footer>
  );
}
