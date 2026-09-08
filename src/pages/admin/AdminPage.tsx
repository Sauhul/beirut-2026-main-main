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
      <div className="text-center">
        <p className="eyebrow">Acceso Restringido</p>
        <h1 className="mt-2 font-display text-4xl text-sand">Beirut Admin</h1>
      </div>
      <form onSubmit={onSubmit} className="mt-8 card-onyx p-7 space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Correo
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
          className="btn-gold w-full mt-4 !py-3"
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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="eyebrow">Gestión Interna</p>
          <h1 className="mt-1 font-display text-4xl text-sand">Administración</h1>
        </div>
        <button
          onClick={onLogout}
          className="btn-outline-gold !px-5 !py-2 text-xs"
        >
          <LogOut className="h-4 w-4" /> Salir
        </button>
      </div>

      <div className="mt-8 flex gap-2">
        {(["productos", "pedidos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2.5 text-[0.65rem] font-bold tracking-[0.2em] uppercase transition-colors ${
              tab === t
                ? "border border-gold bg-gold text-primary-foreground"
                : "border border-border text-muted-foreground hover:border-gold hover:text-gold"
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