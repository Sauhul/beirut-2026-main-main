export function getCorrectCategory(productName: string): string {
  const name = productName.toLowerCase();
  
  if (name.includes("aceite")) return "aceites";
  if (name.includes("cafe") || name.includes("te") || name.includes("azahar")) return "cafe-y-te";
  if (name.includes("empanada") || name.includes("pan") || name.includes("baklawa") || name.includes("galletas") || name.includes("turrones")) return "panaderia-y-dulces";
  if (name.includes("tahine") || name.includes("labne") || name.includes("queso") || name.includes("aceitunas") || name.includes("chanclis")) return "lacteos-y-aderezos";
  if (name.includes("especias") || name.includes("zaatar") || name.includes("hierbabuena") || name.includes("vinagre")) return "especias-y-aderezos";
  if (name.includes("molde") || name.includes("cafetera") || name.includes("bandeja") || name.includes("juego de cafe")) return "accesorios";
  
  return "otros";
}
