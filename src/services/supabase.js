/**
 * @deprecated
 * Este módulo está en desuso. Todas las operaciones de persistencia deben
 * realizarse a través del BFF (backend PHP) usando oasisApi.js.
 *
 * Razones:
 * 1. Seguridad: claves privadas no deben estar en el frontend.
 * 2. Consistencia: el backend valida autenticación y roles con token.
 * 3. IDOR: el backend fuerza el email del token autenticado.
 *
 * Usar oasisApi.getStore() y oasisApi.putStore() en su lugar.
 */

export async function getStore() {
  console.warn("[supabase.js] Deprecated: use oasisApi.getStore()");
  return { disabled: true };
}

export async function putStore() {
  console.warn("[supabase.js] Deprecated: use oasisApi.putStore()");
  return { ok: false };
}

export async function dbHealth() {
  return { enabled: false };
}
