/**
 * Integración con el Widget de Checkout de Wompi (Colombia).
 * Docs: https://docs.wompi.co/docs/colombia/widget-checkout
 *
 * Variables de entorno (ver .env.example):
 *  - REACT_APP_WOMPI_PUBLIC_KEY: llave pública (sandbox: pub_test_...)
 *
 * ⚠️ SEGURIDAD: aquí NO va ningún secreto. La firma de integridad, si se
 * activa en Wompi, debe generarse en el SERVIDOR (n8n / edge function),
 * nunca en el navegador.
 */

declare global {
  interface Window {
    WidgetCheckout?: any;
    WompiCheckout?: any;
    Wompi?: any;
  }
}

export type WompiTransactionStatus =
  "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING" | "UNKNOWN";

export type WompiWidgetResult = {
  status: WompiTransactionStatus;
  transactionId: string | null;
};

const WOMPI_SCRIPT_URL = "https://checkout.wompi.co/widget.js";
let scriptPromise: Promise<void> | null = null;

function loadWompiScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Wompi requiere navegador"));
  // Comprobación más robusta de instancias posibles
  if (window.WidgetCheckout || window.WompiCheckout || window.Wompi?.WidgetCheckout) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WOMPI_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => {
        scriptPromise = null;
        reject(new Error("No se pudo cargar el widget de Wompi"));
      });
      return;
    }

    const script = document.createElement("script");
    script.src = WOMPI_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("No se pudo cargar el widget de Wompi"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export type WompiPaymentInput = {
  /** Referencia única del pedido (se sanitiza a formato válido Wompi). */
  reference: string;
  /** Total en centavos de COP (nunca se envía el monto sin validar). */
  amountInCents: number;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
};

/**
 * Sanitiza la referencia al formato que Wompi Colombia acepta:
 * solo letras, números, guion bajo y guion; sin espacios ni acentos;
 * máxima longitud de Wompi.
 */
function toValidReference(reference: string): string {
  const cleaned = reference
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 40);
  return cleaned || "BEIRUT-ORDER";
}

/** Abre el widget modal y resuelve cuando Wompi reporta el resultado. */
export async function openWompiCheckout(input: WompiPaymentInput): Promise<WompiWidgetResult> {
  const publicKey = process.env.REACT_APP_WOMPI_PUBLIC_KEY;
  if (!publicKey) throw new Error("Falta configurar REACT_APP_WOMPI_PUBLIC_KEY");

  await loadWompiScript();
  const Widget = window.WidgetCheckout || window.WompiCheckout || window.Wompi?.WidgetCheckout;
  if (!Widget) throw new Error("El widget de Wompi no está disponible");

  const amountInCents = Math.round(input.amountInCents);

  return new Promise<WompiWidgetResult>((resolve, reject) => {
    try {
      const widget = new Widget({
        currency: "COP",
        amountInCents,
        reference: toValidReference(input.reference),
        publicKey,
        redirectUrl: window.location.origin + "/pedido-confirmado",
        customerEmail: input.customerEmail || undefined,
        customerData:
          input.customerName || input.customerPhone
            ? { fullName: input.customerName, phoneNumber: input.customerPhone }
            : undefined,
      });

      let resolved = false;

      const observer = new MutationObserver(() => {
        if (resolved) return;
        const backdrop = document.querySelector(".waybox-backdrop");
        const iframe = document.querySelector("iframe.waybox-iframe, iframe[src*='checkout.wompi']");
        if (!backdrop && !iframe) {
          resolved = true;
          observer.disconnect();
          resolve({ status: "UNKNOWN", transactionId: null });
        }
      });

      widget.open((result: any) => {
        resolved = true;
        observer.disconnect();
        const transaction = result?.transaction;
        const rawStatus = transaction?.status as string | undefined;
        const status = (
          ["APPROVED", "DECLINED", "VOIDED", "ERROR", "PENDING"].includes(rawStatus ?? "")
            ? rawStatus
            : "UNKNOWN"
        ) as WompiTransactionStatus;

        resolve({ status, transactionId: transaction?.id ?? null });
      });

      setTimeout(() => {
        observer.observe(document.body, { childList: true, subtree: true });
      }, 1000);
    } catch (err) {
      console.error("[Wompi] Error al abrir widget:", err);
      reject(err);
    }
  });
}
