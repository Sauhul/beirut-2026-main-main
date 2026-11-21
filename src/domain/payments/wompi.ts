import { supabase } from "@data/supabase/client";

export type WompiConfig = { ready: boolean; sandbox: boolean };
export type WompiCheckout = {
  orderId: string;
  orderNumber: number;
  amountInCents: number;
  publicKey: string;
  signature: string;
  expirationTime: string;
  sandbox: boolean;
};

function wompiEndpoint() {
  const url = process.env.REACT_APP_SUPABASE_URL;
  if (!supabase || !url) throw new Error("El pago en línea no está disponible.");
  return new URL("/functions/v1/wompi-checkout", url);
}

export async function getWompiConfig(): Promise<WompiConfig> {
  const response = await fetch(wompiEndpoint(), { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("No se pudo comprobar la disponibilidad de Wompi.");
  return response.json();
}

async function wompiRequest<T>(body: unknown): Promise<T> {
  const response = await fetch(wompiEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Wompi no está disponible.");
  return data as T;
}

export function prepareWompiOrder(order: {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_method: "domicilio" | "recogida";
  address?: string;
  city?: string;
  notes?: string;
  items: { product_id: string; quantity: number }[];
}) {
  return wompiRequest<WompiCheckout>({ action: "prepare", order });
}

export function verifyWompiPayment(orderId: string, transactionId: string) {
  return wompiRequest<{ status: WompiTransactionStatus; orderNumber: number; sandbox: boolean }>({
    action: "verify",
    orderId,
    transactionId,
  });
}

type WompiWidget = new (options: {
  currency: "COP";
  amountInCents: number;
  reference: string;
  publicKey: string;
  redirectUrl: string;
  signature: { integrity: string };
  expirationTime: string;
  customerData?: {
    email?: string;
    fullName?: string;
    phoneNumber?: string;
    phoneNumberPrefix: string;
  };
}) => {
  open(callback: (result?: { transaction?: { status?: string; id?: string } }) => void): void;
};

declare global {
  interface Window {
    WidgetCheckout?: WompiWidget;
    WompiCheckout?: WompiWidget;
    Wompi?: { WidgetCheckout?: WompiWidget };
  }
}

export type WompiTransactionStatus =
  "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING" | "CLOSED" | "UNKNOWN";

export type WompiWidgetResult = {
  status: WompiTransactionStatus;
  transactionId: string | null;
};

const WOMPI_SCRIPT_URL = "https://checkout.wompi.co/widget.js";
let scriptPromise: Promise<void> | null = null;

function loadWompiScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Wompi requiere navegador"));
  // Comprobación más robusta de instancias posibles
  if (window.WidgetCheckout || window.WompiCheckout || window.Wompi?.WidgetCheckout)
    return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const timeout = window.setTimeout(fail, 12000);

    function fail() {
      window.clearTimeout(timeout);
      script.remove();
      scriptPromise = null;
      reject(new Error("No se pudo cargar el widget de Wompi"));
    }

    script.src = WOMPI_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export type WompiPaymentInput = WompiCheckout & {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
};

/** El widget solo recibe el monto y la firma emitidos por el servidor. */
export async function openWompiCheckout(input: WompiPaymentInput): Promise<WompiWidgetResult> {
  await loadWompiScript();
  const Widget = window.WidgetCheckout || window.WompiCheckout || window.Wompi?.WidgetCheckout;
  if (!Widget) throw new Error("El widget de Wompi no está disponible");

  const redirectUrl = new URL("/pedido-confirmado", window.location.origin);
  redirectUrl.searchParams.set("pedido", input.orderId);
  const phone = input.customerPhone.replace(/\D/g, "");
  const widget = new Widget({
    currency: "COP",
    amountInCents: input.amountInCents,
    reference: input.orderId,
    publicKey: input.publicKey,
    signature: { integrity: input.signature },
    expirationTime: input.expirationTime,
    redirectUrl: redirectUrl.href,
    customerData: {
      email: input.customerEmail,
      fullName: input.customerName,
      phoneNumber: phone.length === 12 && phone.startsWith("57") ? phone.slice(2) : phone,
      phoneNumberPrefix: "+57",
    },
  });

  return new Promise<WompiWidgetResult>((resolve, reject) => {
    let mounted = false;
    let finished = false;
    let closeTimeout: number | undefined;
    const previousFocus = document.activeElement;
    const statuses: readonly string[] = ["APPROVED", "DECLINED", "VOIDED", "ERROR", "PENDING"];
    const exitButton = document.createElement("button");
    exitButton.type = "button";
    exitButton.textContent = "Salir de Wompi";
    exitButton.className =
      "fixed top-3 right-3 z-[2147483647] min-h-11 border border-gold bg-card px-4 text-sm font-semibold text-sand shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";
    exitButton.addEventListener("click", closeWidget);

    const observer = new MutationObserver(checkWidget);
    const startupTimeout = window.setTimeout(() => {
      if (!mounted) finish({ status: "UNKNOWN", transactionId: null });
    }, 12000);

    function cleanup() {
      observer.disconnect();
      window.clearTimeout(startupTimeout);
      window.clearTimeout(closeTimeout);
      document.removeEventListener("keydown", handleEscape);
      exitButton.remove();
    }

    function finish(result: WompiWidgetResult) {
      if (finished) return;
      finished = true;
      cleanup();
      resolve(result);
      if (result.status === "CLOSED" && previousFocus instanceof HTMLElement) {
        window.requestAnimationFrame(() => previousFocus.focus());
      }
    }

    function closeWidget() {
      const backdrop = document.querySelector(".waybox-backdrop:not([hidden])");
      // El widget escucha Escape en su fondo y se encarga de restaurar el DOM.
      backdrop?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", keyCode: 27 }));
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (event.target instanceof Element && event.target.closest(".waybox-backdrop")) return;
      closeWidget();
    }

    function checkWidget() {
      const backdrop = document.querySelector(".waybox-backdrop");
      if (backdrop && !backdrop.hasAttribute("hidden")) {
        if (mounted) return;
        mounted = true;
        document.body.append(exitButton);
        document.addEventListener("keydown", handleEscape);
      } else if (mounted && closeTimeout === undefined) {
        // Da tiempo al callback de Wompi si el cierre vino de un pago terminado.
        closeTimeout = window.setTimeout(
          () => finish({ status: "CLOSED", transactionId: null }),
          1000,
        );
      }
    }

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["hidden"],
    });
    try {
      widget.open((result) => {
        const transaction = result?.transaction;
        const rawStatus = transaction?.status ?? "";
        finish({
          status: statuses.includes(rawStatus) ? (rawStatus as WompiTransactionStatus) : "UNKNOWN",
          transactionId: transaction?.id ?? null,
        });
      });
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
}
