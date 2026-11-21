import { queryOptions } from "@tanstack/react-query";
import { getCatalog, getProductBySlug } from "./service";

/** Query compartida del catálogo completo (categorías + productos). */
export const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: getCatalog,
  staleTime: 0,
});

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    staleTime: 0,
  });
