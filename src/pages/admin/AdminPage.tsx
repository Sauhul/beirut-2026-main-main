import { useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { Eye, EyeOff, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@data/supabase/client";
import { inputClass } from "@shared/utils/input-class";
import { usePageTitle } from "@hooks/usePageTitle";
import { ProductsManager } from "./products-manager";
import { OrdersManager } from "./orders-manager";

/**
 * Panel de administración.
 * Requiere sesión de Supabase Auth con un correo listado en admin_emails
 * (las políticas RLS de la base de datos hacen cumplir los permisos).
 */
export function AdminPage() {
  usePageTitle("Administración · BEIRUT");
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [access, setAccess] = useState<{ userId: string; allowed: boolean | null }>();
  const [attempt, setAttempt] = useState(0);
  const client = supabase;
  const userId = session?.user.id;

  useEffect(() => {
    if (!client) return;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setChecking(false);
      if (event === "SIGNED_OUT") setAccess(undefined);
    });
    return () => subscription.unsubscribe();
  }, [client]);

  useEffect(() => {
    if (!client || !userId) return;
    const controller = new AbortController();
    void client
      .rpc("is_current_admin")
      .abortSignal(controller.signal)
      .then(({ data, error }) => {
        if (!controller.signal.aborted)
          setAccess({ userId, allowed: error ? null : data === true });
      });
    return () => controller.abort();
  }, [client, userId, attempt]);

  async function logout() {
    const { error } = await client!.auth.signOut({ scope: "local" });
    if (error) toast.error("No se pudo cerrar la sesión. Intenta de nuevo.");
  }

  if (!client)
    return <AccessMessage>El panel no está disponible. Contacta a la tienda.</AccessMessage>;
  if (checking) return <AccessMessage>Abriendo el panel…</AccessMessage>;
  if (!session) return <LoginForm client={client} />;
  if (!access || access.userId !== userId) {
    return <AccessMessage>Comprobando el permiso de acceso…</AccessMessage>;
  }
  if (access.allowed !== true) {
    return (
      <section className="mx-auto max-w-lg px-5 py-16">
        <h1 className="font-display text-3xl text-sand">Acceso al panel</h1>
        <p className="mt-3 text-lg" role="alert">
          {access.allowed === null
            ? "No pudimos comprobar tu permiso de acceso."
            : "Este correo no tiene permiso para administrar la tienda."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {access.allowed === null && (
            <button
              className={actionClass}
              onClick={() => {
                setAccess(undefined);
                setAttempt(attempt + 1);
              }}
            >
              Intentar de nuevo
            </button>
          )}
          <button className={actionClass} onClick={() => void logout()}>
            Cerrar sesión
          </button>
        </div>
      </section>
    );
  }

  return <AdminPanel onLogout={() => void logout()} />;
}

const actionClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-input px-4 py-2 text-base font-semibold text-sand hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const fieldClass = `${inputClass} min-h-12 rounded-lg !text-lg focus-visible:outline-2 focus-visible:outline-primary`;

function AccessMessage({ children }: { children: string }) {
  return (
    <p role="status" className="mx-auto max-w-lg px-5 py-16 text-lg text-sand">
      {children}
    </p>
  );
}

function LoginForm({ client }: { client: SupabaseClient }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");
    try {
      const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (error?.code === "invalid_credentials") {
        setMessage("Revisa tu correo y contraseña e intenta de nuevo.");
      } else if (error) {
        setMessage("No pudimos iniciar sesión. Espera un momento e intenta de nuevo.");
      }
    } catch {
      setMessage("No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-lg px-5 py-10 sm:py-16" aria-labelledby="admin-login-title">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-9">
        <h1 id="admin-login-title" className="font-display text-3xl text-sand sm:text-4xl">
          Panel de Beirut
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Entra con tu correo de administración.
        </p>
        <form onSubmit={onSubmit} className="mt-7 grid gap-5" aria-busy={loading}>
          <label className="block text-base font-semibold text-sand">
            Correo electrónico
            <input
              type="email"
              name="email"
              autoComplete="username"
              autoCapitalize="none"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={fieldClass}
            />
          </label>
          <div>
            <label htmlFor="admin-password" className="block text-base font-semibold text-sand">
              Contraseña
            </label>
            <input
              id="admin-password"
              name="password"
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={fieldClass}
            />
            <button
              type="button"
              className={`mt-2 ${actionClass}`}
              aria-controls="admin-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} aria-hidden="true" />
              ) : (
                <Eye size={20} aria-hidden="true" />
              )}
              {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            </button>
          </div>
          {message && (
            <p
              role="alert"
              className="rounded-lg border border-destructive p-3 text-base text-destructive"
            >
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="min-h-12 rounded-lg bg-primary px-5 py-3 text-lg font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
          >
            {loading ? "Iniciando sesión…" : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </section>
  );
}

/* ── Panel con pestañas ────────────────────────────────────── */

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<"productos" | "pedidos">("productos");

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="mt-1 font-display text-4xl text-sand">Administración</h1>
        </div>
        <button onClick={onLogout} className={actionClass}>
          <LogOut className="h-5 w-5" aria-hidden="true" /> Cerrar sesión
        </button>
      </div>

      <nav aria-label="Secciones del panel" className="mt-6 flex flex-wrap gap-3">
        {(["productos", "pedidos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`${actionClass} capitalize ${
              tab === t ? "!border-primary !bg-primary !text-primary-foreground" : ""
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="mt-6">{tab === "productos" ? <ProductsManager /> : <OrdersManager />}</div>
    </div>
  );
}
