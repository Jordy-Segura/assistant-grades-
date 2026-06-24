const envUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
const API_BASE_URL = envUrl || `http://${hostname}:3001`;

let _authToken = null;

export function setAuthToken(token) {
  _authToken = token;
}

export function getAuthToken() {
  return _authToken;
}

async function request(path, { method = "GET", body } = {}) {
  const headers = {};
  if (body) {
    headers["Content-Type"] = "application/json";
  }
  if (_authToken) {
    headers["Authorization"] = "Bearer " + _authToken;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new Error("No se pudo contactar el servicio OASIS (BFF sin conexión).");
    err.offline = true;
    throw err;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const msg = (data && data.error) || `Error ${response.status} consultando OASIS`;
    const err = new Error(msg);
    if (data && data.code === "AUTH_REQUIRED") {
      err.authRequired = true;
    }
    throw err;
  }
  return data;
}

export async function checkHealth() {
  try {
    return await request("/api/health");
  } catch {
    return null;
  }
}

export function login(usuario, password) {
  return request("/api/login", { method: "POST", body: { login: usuario, password } });
}

export function getPeriodoActual() {
  return request("/api/periodo-actual");
}

export function getMateriasDocente({ codCarrera, cedula, codPeriodo }) {
  return request("/api/materias-docente", { method: "POST", body: { codCarrera, cedula, codPeriodo } });
}

export function getAlumnosMateria(params) {
  return request("/api/alumnos-materia", { method: "POST", body: params });
}

export function getNotas({ codCarrera, cedula }) {
  return request("/api/notas", { method: "POST", body: { codCarrera, cedula } });
}

export function getDatosEstudiante({ cedula }) {
  return request("/api/estudiante", { method: "POST", body: { cedula } });
}

export function getEstudianteFull({ cedula }) {
  return request("/api/estudiante-full", { method: "POST", body: { cedula } });
}

export function getMateriasEstudiante({ codCarrera, cedula, codPeriodo }) {
  return request("/api/materias-estudiante", { method: "POST", body: { codCarrera, cedula, codPeriodo } });
}

export function getCarreras() {
  return request("/api/carreras");
}

export function importarNomina({ carrera, asignatura, facultad, docente, codCarrera }) {
  return request("/api/nomina", {
    method: "POST",
    body: { carrera, asignatura, facultad, docente, codCarrera },
  });
}

export function getDocentesCarrera({ carrera, facultad, codCarrera }) {
  return request("/api/docentes-carrera", { method: "POST", body: { carrera, facultad, codCarrera } });
}

export function getHorarioDocente({ codCarrera, carrera, facultad, cedula, codPeriodo }) {
  return request("/api/horario-docente", {
    method: "POST",
    body: { codCarrera, carrera, facultad, cedula, codPeriodo },
  });
}

// ---- Persistencia en PostgreSQL (a través del BFF) ----

export async function dbHealth() {
  try {
    return await request("/api/db/health");
  } catch {
    return { enabled: false };
  }
}

export function getStore({ email, role }) {
  const qs = new URLSearchParams({ email: email || "", role: role || "" }).toString();
  return request(`/api/store?${qs}`);
}

export function putStore(payload) {
  return request("/api/store", { method: "PUT", body: payload });
}

export function devLogin(usuario, password) {
  if (import.meta.env.PROD) {
    throw new Error("dev-login no está disponible en producción.");
  }
  return request("/api/dev-login", { method: "POST", body: { login: usuario, password } });
}

export function loginDb(usuario, password) {
  return request("/api/db-login", { method: "POST", body: { login: usuario, password } });
}

export const apiBaseUrl = API_BASE_URL;
