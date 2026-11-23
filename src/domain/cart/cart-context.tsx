import { useQuery } from "@tanstack/react-query";
import { catalogQuery } from "@domain/catalog/queries";
import { productPresentation } from "@shared/utils/product-format";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  unit: string;
  categorySlug: string;
  imageUrl?: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "beirut-cart-v1";
export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as CartItem[];
        setItems(saved.map((item) => ({ ...item, ...productPresentation(item) })));
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: Math.min(99, i.quantity + quantity) } : i,
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity: Math.min(99, quantity) } : i)),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { data: catalog } = useQuery({ ...catalogQuery, enabled: items.length > 0 });
  const currentItems = useMemo(() => {
    if (!catalog) return items;
    const products = new Map(catalog.products.map((product) => [product.id, product]));
    return items.map((item) => {
      const product = products.get(item.id);
      if (!product) return item;
      return {
        ...item,
        name: product.name,
        price: product.price,
        unit: product.unit,
        imageUrl: product.image_url,
      };
    });
  }, [catalog, items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: currentItems,
      count: currentItems.reduce((n, i) => n + i.quantity, 0),
      subtotal: currentItems.reduce((n, i) => n + i.price * i.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [currentItems, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
