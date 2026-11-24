import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { catalogQuery } from "@domain/catalog/queries";
import { crossSellProducts } from "@domain/catalog/cross-sell";
import type { Product } from "@domain/catalog/types";
import { useCart } from "@domain/cart/use-cart";
import { CrossSellDialog } from "@components/cart/CrossSellDialog";

/** Both entry points use the same cart-level once-per-purchase guard. */
export function useCheckoutCrossSell() {
  const { items, consumeCrossSell } = useCart();
  const currentItems = useRef(items);
  currentItems.current = items;
  const queryClient = useQueryClient();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [checking, setChecking] = useState(false);
  const busy = useRef(false);
  const mounted = useRef(true);
  const resolve = useRef<((proceed: boolean) => void) | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      resolve.current?.(false);
      resolve.current = null;
    };
  }, []);

  async function requestCrossSell(): Promise<boolean> {
    if (busy.current || !currentItems.current.length) return false;
    busy.current = true;
    setChecking(true);
    try {
      const catalog = await queryClient.ensureQueryData(catalogQuery);
      if (!mounted.current || !currentItems.current.length) return false;
      const suggestions = crossSellProducts(
        catalog.products,
        currentItems.current.map(({ id }) => id),
      );
      if (!consumeCrossSell() || !suggestions.length) return true;
      setProducts(suggestions);
      return await new Promise<boolean>((done) => {
        resolve.current = done;
      });
    } catch {
      // An optional suggestion must never prevent checkout.
      return mounted.current && currentItems.current.length > 0;
    } finally {
      busy.current = false;
      if (mounted.current) setChecking(false);
    }
  }

  function finish(proceed: boolean) {
    setProducts(null);
    resolve.current?.(proceed);
    resolve.current = null;
  }

  return {
    requestCrossSell,
    checking,
    crossSellDialog: products ? <CrossSellDialog products={products} onFinish={finish} /> : null,
  };
}
