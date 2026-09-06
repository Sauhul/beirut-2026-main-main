import { Link } from "react-router-dom";
import { MapPin, MessageCircle, Clock, Mail, Instagram } from "lucide-react";
import { SITE, whatsappLink } from "@config/site";
import { usePageTitle } from "@hooks/usePageTitle";

export function ContactPage() {
  usePageTitle("Contacto · Beirut");

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Contacto</p>
      <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Ven a la tienda o escríbenos</h1>

      <div className="mt-12 grid gap-12 md:grid-cols-2">
        <div className="space-y-7">
          <div className="flex gap-4">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em]">Dirección</h2>
              <p className="mt-2 text-[15px] text-muted-foreground">{SITE.address}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Clock className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em]">Horario</h2>
              <p className="mt-2 text-[15px] text-muted-foreground">{SITE.hours}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Mail className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em]">Correo</h2>
              <p className="mt-2 text-[15px] text-muted-foreground">{SITE.email}</p>
            </div>
          </div>

          <a
            href={whatsappLink("Hola Beirut, tengo una consulta.")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            <MessageCircle className="h-4 w-4" /> Escribir por WhatsApp
          </a>

          <div className="flex gap-3 pt-2">
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border">
          <iframe
            title="Ubicación de Beirut"
            src={SITE.mapEmbed}
            className="h-[420px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <div className="mt-20 rounded-3xl bg-cream p-12 text-center">
        <p className="font-script text-4xl text-primary md:text-5xl">
          Te esperamos con café y cardamomo
        </p>
        <Link
          to="/tienda"
          className="mt-7 inline-block rounded-full border border-primary px-8 py-4 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Ver productos
        </Link>
      </div>
    </div>
  );
}
