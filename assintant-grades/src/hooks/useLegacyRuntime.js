import { useEffect } from "react";
import { initLegacyRuntime } from "../legacyRuntime";

/**
 * Inicializa el runtime legacy (JS vanilla) al montar la aplicación.
 * Se ejecuta de forma síncrona justo después del render inicial.
 */
export default function useLegacyRuntime() {
  useEffect(() => {
    initLegacyRuntime();
  }, []);
}
