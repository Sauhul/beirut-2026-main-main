import { Link } from "react-router-dom";
import { Instagram, Mail, MapPin, Phone, Clock } from "lucide-react";
import { SITE } from "@config/site";
import { whatsappLink } from "@config/site";

export function Footer() {
  return (
    <footer className="arabesque border-t border-border bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-3xl tracking-[0.24em] text-gold">BEIRUT</p>
          <p className="mt-1 text-[0.6rem] font-semibold tracking-[0.3em] uppercase text-secondary-foreground/65">
            {SITE.brandFull}
          </p>
          <p className="mt-5 max-w-sm text-sm leading-7 text-secondary-foreground/70">
            Importamos y seleccionamos productos del Líbano y del Medio Oriente para las cocinas de
            Barranquilla: especias, café, dulces, conservas y utensilios tradicionales.
          </p>
        </div>

        <div>
          <p className="eyebrow">Navegación</p>
          <ul className="mt-4 space-y-3 text-sm text-secondary-foreground/70">
            <li>
              <Link to="/" className="hover:text-gold">
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/tienda" className="hover:text-gold">
                Tienda
              </Link>
            </li>
            <li>
              <Link to="/contacto" className="hover:text-gold">
                Visítanos
              </Link>
            </li>
            <li>
              <Link to="/carrito" className="hover:text-gold">
                Tu pedido
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Contacto</p>
          <ul className="mt-4 space-y-3 text-sm text-secondary-foreground/70">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {SITE.address}
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>
                {SITE.hoursWeek}
                <br />
                {SITE.hoursSunday}
              </span>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a
                href={whatsappLink("Hola, quiero hacer un pedido en Delikatessen Beyrouth.")}
                target="_blank"
                rel="noreferrer"
                className="hover:text-gold"
              >
                {SITE.phoneDisplay}
              </a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {SITE.email}
            </li>
            <li className="flex gap-2">
              <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a href={SITE.instagram} target="_blank" rel="noreferrer" className="hover:text-gold">
                {SITE.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-secondary-foreground/15 px-5 py-6 text-center text-[0.65rem] tracking-[0.2em] uppercase text-secondary-foreground/55">
        © {new Date().getFullYear()} {SITE.brandFull} · Barranquilla, Colombia
      </div>
    </footer>
  );
}