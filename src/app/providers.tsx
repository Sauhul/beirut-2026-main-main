import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CartProvider } from "@domain/cart/cart-context";
import { Toaster } from "@components/ui/sonner";
import { supabase } from "@data/supabase/client";

// Registrar el plugin useGSAP globalmente para que funcione en todos los componentes
gsap.registerPlugin(useGSAP);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

/** Proveedores globales: TanStack Query, Router, Carrito y notificaciones. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const refreshCatalog = () => {
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
      void queryClient.invalidateQueries({ queryKey: ["product"] });
    };
    const channel = client
      .channel("catalog-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, refreshCatalog)
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, refreshCatalog)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") refreshCatalog();
      });

    return () => {
      void client.removeChannel(channel);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CartProvider>
          {children}
          <Toaster position="top-right" duration={2500} richColors />
        </CartProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
