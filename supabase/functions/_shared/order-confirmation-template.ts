type ConfirmationDetails = {
  number: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  delivery: string;
  address?: string | null;
  city?: string | null;
  notes?: string | null;
  items: { name: string; quantity: number; unitPrice: number; total: number }[];
  total: number;
  transaction: string;
  sandbox: boolean;
};

const storefront = "https://beirut-2026-main-main.saulu053.workers.dev";
const cop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const date = new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeZone: "America/Bogota" });

function escape(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildOrderConfirmation(order: ConfirmationDetails) {
  const heading = order.sandbox ? "Pedido de prueba confirmado" : "Tu pedido está confirmado";
  const subject = `${order.sandbox ? "[Prueba] " : ""}Confirmación de pedido #${order.number} · Beirut`;
  const greeting = `Hola, ${order.name}.`;
  const intro = order.sandbox
    ? "Wompi aprobó esta simulación. No hubo cobro real y el pedido no se despachará."
    : "Gracias por comprar en Beirut. Wompi confirmó tu pago y recibimos tu pedido.";
  const delivery = order.delivery === "domicilio" ? "Domicilio" : "Recogida en tienda";
  const place =
    order.delivery === "domicilio"
      ? [order.address, order.city].filter(Boolean).join(", ")
      : "Cra. 43 #84-26, Barranquilla, Atlántico";
  const details = [
    ["Fecha", date.format(new Date(order.date))],
    ["Entrega", delivery],
    ["Dirección", place],
    ["Teléfono de contacto", order.phone],
    ["Correo del pedido", order.email],
    ["Referencia de Wompi", order.transaction],
    ...(order.notes ? [["Notas del pedido", order.notes]] : []),
  ];
  const rows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:14px 10px 14px 0;border-bottom:1px solid #e9e1d1;font-size:14px;line-height:1.5;color:#113c30">
        <strong>${escape(item.name)}</strong><br>
        <span style="font-size:12px;color:#526359">${escape(cop.format(item.unitPrice))} por unidad</span>
      </td>
      <td align="center" style="padding:14px 4px;border-bottom:1px solid #e9e1d1;font-size:14px;color:#113c30">${item.quantity}</td>
      <td align="right" style="padding:14px 0 14px 8px;border-bottom:1px solid #e9e1d1;font-size:14px;color:#113c30;white-space:nowrap">${escape(cop.format(item.total))}</td>
    </tr>`,
    )
    .join("");
  const detailsHtml = details
    .map(
      ([label, value]) => `
    <tr>
      <td style="padding:5px 12px 5px 0;vertical-align:top;color:#526359">${escape(label)}</td>
      <td style="padding:5px 0;color:#113c30;overflow-wrap:anywhere;white-space:pre-wrap">${escape(value)}</td>
    </tr>`,
    )
    .join("");
  const text = [
    heading,
    `Pedido #${order.number}`,
    greeting,
    intro,
    "",
    ...order.items.map(
      (item) =>
        `${item.quantity} × ${item.name} · ${cop.format(item.unitPrice)} por unidad · ${cop.format(item.total)}`,
    ),
    `${order.sandbox ? "Total de prueba" : "Total pagado"} ${cop.format(order.total)} COP`,
    "",
    ...details.map(([label, value]) => `${label} — ${value}`),
    "",
    `Para consultas, menciona tu número de pedido. ${storefront}/contacto`,
  ].join("\n");
  const html = `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(subject)}</title></head>
<body style="margin:0;background-color:#f2ecdf;color:#113c30;font-family:Arial,sans-serif">
<span style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escape(intro)}</span>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#f2ecdf"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#fffcf6" style="max-width:600px;border:1px solid #e2d5b9">
    <tr><td bgcolor="#103e30" style="padding:27px 26px;color:#fff8e7;border-top:4px solid #bc8d34">
      <div style="font-family:Georgia,serif;font-weight:bold;letter-spacing:5px;font-size:25px">BEIRUT</div>
      <div style="margin-top:5px;letter-spacing:2px;font-size:10px;color:#f1d694">DELIKATESSEN BEYROUTH</div>
    </td></tr>
    <tr><td style="padding:28px 26px 10px">
      <p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#6b551f">Pedido #${order.number}</p>
      <h1 style="margin:0 0 18px;font:normal 34px/1.12 Georgia,serif;color:#113c30">${heading}</h1>
      <p style="margin:0 0 7px;font-size:15px;line-height:1.6">${escape(greeting)}</p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#526359">${intro}</p>
    </td></tr>
    <tr><td style="padding:18px 26px 0">
      <h2 style="margin:0 0 12px;font:normal 24px Georgia,serif">Resumen del pedido</h2>
      <table width="100%" cellspacing="0" cellpadding="0">
        <thead><tr bgcolor="#eee6d6">
          <th scope="col" align="left" style="padding:10px 6px;font-size:12px">Producto</th>
          <th scope="col" align="center" style="padding:10px 4px;font-size:12px">Cant.</th>
          <th scope="col" align="right" style="padding:10px 6px;font-size:12px">Importe</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
        <td style="padding:14px 8px 14px 0;font-size:14px;font-weight:bold">${order.sandbox ? "Total de prueba" : "Total pagado"}</td>
        <td align="right" style="padding:14px 0;font:normal 22px Georgia,serif;white-space:nowrap">${escape(cop.format(order.total))} <span style="font:12px Arial,sans-serif">COP</span></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:15px 26px 28px">
      <h2 style="margin:0 0 10px;font:normal 24px Georgia,serif">Entrega y contacto</h2>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;line-height:1.5">${detailsHtml}</table>
    </td></tr>
    <tr><td bgcolor="#eee6d6" style="padding:21px 26px;font-size:13px;line-height:1.6">
      Para consultas, menciona tu número de pedido.<br>
      <a href="${storefront}/contacto" style="color:#103e30;font-weight:bold">Contactar a Beirut</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
  return { subject, text, html };
}
