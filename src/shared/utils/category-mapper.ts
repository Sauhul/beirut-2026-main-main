export function getCorrectCategory(productName: string): string {
  const name = productName.toLowerCase();

  if (
    name.includes("especias") ||
    name.includes("zaatar") ||
    name.includes("hierbabuena") ||
    name.includes("vinagre") ||
    name.includes("aceite") ||
    name.includes("tahine") ||
    name.includes("salsa")
  )
    return "salsas";
  if (
    name.includes("molde") ||
    name.includes("cafetera") ||
    name.includes("bandeja") ||
    name.includes("juego de cafe")
  )
    return "accesorios";

  return "otros";
}
