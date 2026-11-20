import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocation } from "react-router-dom";
import { Header } from "@components/layout/Header";
import { Footer } from "@components/layout/Footer";
import { AppRouter } from "./router";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

export default function App() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      {pathname !== "/" && <Header />}
      <main className="flex-1">
        <AppRouter />
      </main>
      <Footer />
    </div>
  );
}
