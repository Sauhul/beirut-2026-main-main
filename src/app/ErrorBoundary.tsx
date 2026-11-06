import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Red de seguridad de la app.
 * Si un error de runtime tumba el árbol de React, mostramos un mensaje
 * recuperable en vez de dejar la pantalla en blanco.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Sin servicio de errores por ahora: dejamos rastro en consola.
    console.error("[Beirut] Error no controlado:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          background: "#f9efde",
          color: "#2b2118",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Algo salió mal</h1>
        <p style={{ maxWidth: 420, lineHeight: 1.6 }}>
          No pudimos cargar esta página. Recarga para intentarlo de nuevo; tu carrito sigue guardado.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            borderRadius: 999,
            padding: "12px 28px",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            background: "#cda037",
            color: "#fff",
          }}
        >
          Recargar página
        </button>
      </div>
    );
  }
}
