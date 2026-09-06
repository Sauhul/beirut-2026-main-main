import { useEffect } from "react";

/** Actualiza el título del documento (equivalente SPA del meta title). */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
