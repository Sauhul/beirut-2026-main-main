// Configuración del negocio. Cambia el número de WhatsApp aquí (formato internacional, sin "+").
export const SITE = {
  name: "BEIRUT",
  brandFull: "Delikatessen Beyrouth",
  tagline: "Sabores del Líbano, en tu mesa",
  whatsappNumber: "573128527325",
  phoneDisplay: "+57 312 852 7325",
  email: "hola@delikatessenbeyrouth.co",
  address: "Cra. 43 #84-26, Barranquilla, Colombia",
  hoursWeek: "Lunes a Sábado · 9:00 – 19:00",
  hoursSunday: "Domingo · 10:00 – 14:00",
  instagram: "https://instagram.com/delikatessenbeyrouth_84",
  instagramHandle: "@delikatessenbeyrouth_84",
  mapEmbed:
    "https://www.google.com/maps?q=Cra.+43+%2384-26,+Barranquilla,+Colombia&output=embed",
  stats: {
    posts: 105,
    years: 12,
    products: 240,
    families: 4,
  },
} as const;

export function whatsappLink(message: string, phone: string = SITE.whatsappNumber) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
