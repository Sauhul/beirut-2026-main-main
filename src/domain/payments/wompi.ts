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

type WompiWidget = new (options: {
  currency: "COP";
  amountInCents: number;
  reference: string;
  publicKey: string;
  redirectUrl: string;
  customerEmail?: string;
  customerData?: { fullName?: string; phoneNumber?: string; phoneNumberPrefix: string };
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

  const widget = new Widget({
    currency: "COP",
    amountInCents: Math.round(input.amountInCents),
    reference: toValidReference(input.reference),
    publicKey,
    redirectUrl: window.location.origin + "/pedido-confirmado",
    customerEmail: input.customerEmail,
    customerData:
      input.customerName || input.customerPhone
        ? { fullName: input.customerName, phoneNumber: input.customerPhone, phoneNumberPrefix: "57" }
        : undefined,
  });

  return new Promise<WompiWidgetResult>((resolve, reject) => {
    let mounted = false;
    const statuses: readonly string[] = ["APPROVED", "DECLINED", "VOIDED", "ERROR", "PENDING"];

    const observer = new MutationObserver(checkWidget);
    const startupTimeout = window.setTimeout(() => {
      if (!mounted) finish({ status: "UNKNOWN", transactionId: null });
    }, 12000);
    let closeTimeout: number | undefined;

    function cleanup() {
      observer.disconnect();
      window.clearTimeout(startupTimeout);
      window.clearTimeout(closeTimeout);
    }

    function finish(result: WompiWidgetResult) {
      cleanup();
      resolve(result);
    }

    function checkWidget() {
      const visible = Boolean(
        document.querySelector(".waybox-backdrop, iframe.waybox-iframe, iframe[src*='checkout.wompi']"),
      );
      if (visible) {
        mounted = true;
        window.clearTimeout(closeTimeout);
        closeTimeout = undefined;
      } else if (mounted && closeTimeout === undefined) {
        closeTimeout = window.setTimeout(() => finish({ status: "UNKNOWN", transactionId: null }), 1000);
      }
    }

    observer.observe(document.body, { childList: true, subtree: true });
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
