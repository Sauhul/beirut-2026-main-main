// Configuración del negocio. Cambia el número de WhatsApp aquí (formato internacional, sin "+").
export const SITE = {
  name: "BEIRUT",
  brandFull: "Delikatessen Beyrouth",
  tagline: "Sabores del Líbano, en tu mesa",
  whatsappNumber: "573128527325",
  phoneDisplay: "+57 312 852 7325",
  email: "hola@delikatessenbeyrouth.co",
  address: "Cra. 43 #84-26, Barranquilla, Colombia",
  hours: "Lun a Sáb: 9:00 – 19:00 · Dom: 10:00 – 14:00",
  instagram: "https://instagram.com/delikatessenbeyrouth_84",
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
