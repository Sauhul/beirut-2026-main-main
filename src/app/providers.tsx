import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CartProvider } from "@domain/cart/cart-context";
import { Toaster } from "@components/ui/sonner";

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
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CartProvider>
          {children}
          <Toaster position="top-center" richColors />
        </CartProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
