import { Clock, Instagram, Mail, MapPin, Phone, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE } from "@config/site";
import { usePageTitle } from "@hooks/usePageTitle";

export function ContactPage() {
  usePageTitle("Visítanos en Barranquilla | Delikatessen Beyrouth");

  return (
    <div className="route-page">
      <section className="arabesque border-b border-border py-16 text-center">
        <p className="eyebrow">Ven a la tienda</p>
        <h1 className="mt-3 font-display text-5xl text-sand md:text-6xl">Visítanos</h1>
        <div className="rule-gold mt-5" />
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="card-onyx min-w-0 p-4 sm:p-7">
            <p className="eyebrow flex min-w-0 items-center gap-2 wrap-anywhere">
              <MapPin className="h-4 w-4" /> Dirección
            </p>
            <p className="mt-3 font-display text-2xl text-sand">{SITE.address}</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Barrio El Prado, a una cuadra de la Calle 84. Parqueo sobre la vía.
            </p>
          </div>

          <div className="card-onyx min-w-0 p-4 sm:p-7">
            <p className="eyebrow flex min-w-0 items-center gap-2 wrap-anywhere">
              <Clock className="h-4 w-4" /> Horarios
            </p>
            <p className="mt-3 text-sm leading-8 text-sand">
              {SITE.hoursWeek}
              <br />
              {SITE.hoursSunday}
            </p>
          </div>

          <div className="card-onyx min-w-0 p-4 sm:p-7">
            <p className="eyebrow">Contacto directo</p>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li className="flex min-w-0 items-center gap-2 wrap-anywhere">
                <Phone className="h-4 w-4 shrink-0 text-gold" /> {SITE.phoneDisplay}
              </li>
              <li className="flex min-w-0 items-center gap-2 wrap-anywhere">
                <Mail className="h-4 w-4 shrink-0 text-gold" /> {SITE.email}
              </li>
              <li className="flex min-w-0 items-center gap-2 wrap-anywhere">
                <Instagram className="h-4 w-4 shrink-0 text-gold" />
                <a
                  href={SITE.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gold"
                >
                  {SITE.instagramHandle}
                </a>
              </li>
            </ul>
            <Link to="/tienda" className="btn-gold mt-8">
              <Store className="h-4 w-4" /> Ver tienda
            </Link>
          </div>
        </div>

        <div className="min-h-[420px] border border-border">
          <iframe
            title="Mapa de Delikatessen Beyrouth"
            src={SITE.mapEmbed}
            className="h-full min-h-[420px] w-full"
            loading="lazy"
          />
        </div>
      </section>
    </div>
  );
}
