import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
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
  const client = supabase;

  useEffect(() => {
    if (!client) {
      setChecking(false);
      return;
    }
    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    return () => subscription.unsubscribe();
  }, [client]);

  if (!client) {
    return (
      <div className="mx-auto max-w-md px-5 py-28 text-center text-sm text-muted-foreground">
        Supabase no está configurado.
      </div>
    );
  }

  if (checking) {
    return (
      <div className="mx-auto max-w-md px-5 py-28 text-center text-sm text-muted-foreground">
        Cargando…
      </div>
    );
  }

  if (!session) return <LoginForm />;

  return <AdminPanel onLogout={() => client.auth.signOut()} />;
}

/* ── Login ─────────────────────────────────────────────────── */

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error("Credenciales inválidas");
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-24">
      <h1 className="text-center font-script text-5xl text-primary">Beirut Admin</h1>
      <form onSubmit={onSubmit} className="mt-10 space-y-4 rounded-2xl border border-border p-7">
        <label className="block text-sm font-medium">
          Correo
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className="block text-sm font-medium">
          Contraseña
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground smooth-button disabled:opacity-60"
        >
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}

/* ── Panel con pestañas ────────────────────────────────────── */

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<"productos" | "pedidos">("productos");

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-semibold">Administración</h1>
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium smooth-button hover:border-destructive hover:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Salir
        </button>
      </div>

      <div className="mt-8 flex gap-2">
        {(["productos", "pedidos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-6 py-2.5 text-[13px] font-medium capitalize smooth-button ${
              tab === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">{tab === "productos" ? <ProductsManager /> : <OrdersManager />}</div>
    </div>
  );
}
