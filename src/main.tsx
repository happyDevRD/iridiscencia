import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Portal privado de selección de fotos (iridiscencia.com/seleccion/<token>): carga aparte.
const SelectionApp = lazy(() => import("./seleccion/SelectionApp"));
const isSelection = window.location.pathname.startsWith("/seleccion/");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isSelection ? (
      <Suspense fallback={null}>
        <SelectionApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>
);
