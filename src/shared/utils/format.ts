export function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Nombres del catálogo vienen en MAYÚSCULAS; los pasamos a Capital Case. */
export function titleCase(value: string) {
  return value
    .toLocaleLowerCase("es-CO")
    .replace(/(^|\s|\(|-|\/)([\p{L}])/gu, (_m, p1, p2: string) => p1 + p2.toLocaleUpperCase("es-CO"));
}
