// SOAP client for the ESPOCH OASIS interoperability services.
// All service credentials live here (server side) and are read from the
// environment — they are never exposed to the browser.
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
import { parseXml, asArray } from "./xml.mjs";

const NS = "http://academico.espoch.edu.ec/";
const BASE = (process.env.OASIS_BASE || "http://swoasis.espoch.edu.ec/OASis/OAS_Interop").replace(/\/+$/, "");
const OASIS_USER = process.env.OASIS_USER || "";
const OASIS_PASS = process.env.OASIS_PASS || "";
const TIMEOUT = Number(process.env.OASIS_TIMEOUT || 20000);

function escapeXml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildEnvelope(innerBody) {
  return (
    '<?xml version="1.0" encoding="utf-8"?>' +
    '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
    ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
    ' xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
    "<soap:Header>" +
    '<credentials xmlns="' + NS + '">' +
    "<username>" + escapeXml(OASIS_USER) + "</username>" +
    "<password>" + escapeXml(OASIS_PASS) + "</password>" +
    "</credentials>" +
    "</soap:Header>" +
    "<soap:Body>" + innerBody + "</soap:Body>" +
    "</soap:Envelope>"
  );
}

function httpPost(serviceUrl, action, envelope) {
  return new Promise((resolve, reject) => {
    const url = new URL(serviceUrl);
    const lib = url.protocol === "https:" ? https : http;
    const payload = Buffer.from(envelope, "utf8");
    const req = lib.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: url.pathname + url.search,
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          "Content-Length": payload.length,
          SOAPAction: '"' + NS + action + '"',
        },
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body }));
      }
    );
    req.on("error", reject);
    req.setTimeout(TIMEOUT, () => req.destroy(new Error("Tiempo de espera agotado con el servicio OASIS")));
    req.write(payload);
    req.end();
  });
}

// Call an operation and return the inner `<Op>Result` object (parsed to JSON).
async function callSoap(service, op, params = {}) {
  const inner =
    "<" + op + ' xmlns="' + NS + '">' +
    Object.entries(params)
      .map(([key, value]) => "<" + key + ">" + escapeXml(value) + "</" + key + ">")
      .join("") +
    "</" + op + ">";

  const { status, body } = await httpPost(BASE + "/" + service + ".asmx", op, buildEnvelope(inner));
  const parsed = parseXml(body);
  const soapBody = parsed?.Envelope?.Body;

  if (soapBody?.Fault) {
    const message = soapBody.Fault.faultstring || "Error en el servicio OASIS";
    const error = new Error(String(message).split("--->").pop().trim());
    error.soapFault = true;
    throw error;
  }
  if (status >= 400) {
    throw new Error("El servicio OASIS respondió con estado " + status);
  }
  return soapBody?.[op + "Response"]?.[op + "Result"] ?? null;
}

// ---- High level operations (only what the grading assistant needs) ----

export async function getPeriodoActual() {
  const r = (await callSoap("InfoGeneral", "GetPeriodoActual")) || {};
  return {
    codigo: r.Codigo || "",
    descripcion: r.Descripcion || "",
    fechaInicio: r.FechaInicio || "",
    fechaFin: r.FechaFin || "",
  };
}

export async function getFacultades() {
  const r = await callSoap("InfoGeneral", "GetTodasFacultades");
  return asArray(r?.Facultad).map((f) => ({ codigo: f.Codigo || "", nombre: f.Nombre || "" }));
}

export async function getUsuarioFacultad(login, password) {
  const r = (await callSoap("Seguridad", "GetUsuarioFacultad", { login, password })) || {};
  return {
    cedula: r.Cedula || "",
    apellidos: r.Apellidos || "",
    nombres: r.Nombres || "",
    email: r.Email || "",
  };
}

export async function login(usuario, password) {
  let r;
  try {
    r = await callSoap("Seguridad", "AutenticarUsuarioCarrera", { login: usuario, password });
  } catch (err) {
    // The service throws a .NET null-reference fault for unknown users.
    if (/referencia a objeto/i.test(err.message)) {
      const e = new Error("Usuario o contraseña incorrectos.");
      e.soapFault = true;
      throw e;
    }
    throw err;
  }
  const roles = asArray(r?.RolCarrera).map((x) => ({
    codigoCarrera: x.CodigoCarrera || "",
    nombreRol: x.NombreRol || "",
  }));
  // Best-effort profile (cédula + correo institucional / WebMail). Never fail
  // the login because the profile lookup failed.
  let perfil = { cedula: "", apellidos: "", nombres: "", email: "" };
  try {
    perfil = await getUsuarioFacultad(usuario, password);
  } catch {
    /* profile is optional */
  }
  return { roles, perfil };
}

export async function getMateriasDocente(codCarrera, cedula, codPeriodo) {
  const r = await callSoap("InfoCarrera", "GetMateriasDocente", {
    CodCarrera: codCarrera,
    Cedula: cedula,
    CodPeriodo: codPeriodo,
  });
  return asArray(r?.Materia).map((m) => ({ codigo: m.Codigo || "", nombre: m.Nombre || "" }));
}

export async function getAlumnosMateria({ codCarrera, codNivel, codParalelo, codPeriodo, codMateria }) {
  const r = await callSoap("InfoCarrera", "GetAlumnosMateria", {
    strCodCarrera: codCarrera,
    strCodNivel: codNivel,
    strCodParalelo: codParalelo,
    strCodPeriodo: codPeriodo,
    strCodMateria: codMateria,
  });
  return asArray(r?.Estudiante).map((e) => ({
    cedula: e.Cedula || "",
    nombres: (e.Nombres || "").trim(),
    apellidos: (e.Apellidos || "").trim(),
  }));
}

export async function getCarreras() {
  const r = await callSoap("InfoGeneral", "GetTodasCarreras");
  return asArray(r?.UnidadAcademica)
    .map((c) => ({ codigo: c.Codigo || "", nombre: c.Nombre || "", estado: c.CodEstado || "" }))
    .filter((c) => c.codigo);
}

export async function getMalla(codCarrera) {
  const r = await callSoap("InfoCarrera", "GetMallaCurricularPensumVigenteSinDescripcion", { strCodCarrera: codCarrera });
  return asArray(r?.Materia_Pensum).map((m) => ({
    codMateria: m.CodMateria || "",
    materia: (m.Materia || "").trim(),
    codNivel: m.CodNivel || "",
    nivel: m.Nivel || "",
  }));
}

export async function getDictados(codCarrera, codMateria) {
  const r = await callSoap("InfoCarrera", "GetDictadosMateria", { CodCarrera: codCarrera, CodMateria: codMateria });
  return asArray(r?.Dictado_Materia).map((d) => ({
    codNivel: d.CodNivel || "",
    nivel: d.DescripcionNivel || "",
    paralelo: d.Paralelo || "",
    docente: {
      cedula: d.Docente?.Cedula || "",
      apellidos: (d.Docente?.Apellidos || "").trim(),
      nombres: (d.Docente?.Nombres || "").trim(),
      email: d.Docente?.Email || "",
    },
  }));
}

// Accent/case-insensitive normalization for fuzzy name matching.
function norm(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Resolve a career name (+ facultad/sede hint) to its OASIS code.
export async function resolverCarrera(nombre, facultad) {
  const carreras = (await getCarreras()).filter((c) => c.estado === "ABI");
  const target = norm(nombre);
  if (!target) return null;
  const wantOrellana = /ORELLANA/.test(norm(facultad));
  const baseName = (n) => norm(n).replace(/ SEDE.*$/, "").replace(/ MORONA.*$/, "").trim();
  const matches = carreras.filter((c) => {
    const cn = baseName(c.nombre);
    return cn === target || cn.includes(target) || target.includes(cn);
  });
  if (!matches.length) return null;
  if (wantOrellana) {
    const orellana = matches.find((c) => /ORELLANA/.test(norm(c.nombre)));
    if (orellana) return orellana;
  }
  const plain = matches.find((c) => !/SEDE|MORONA|\(/.test(c.nombre));
  return plain || matches[0];
}

// Full automatic resolution: career name + subject name -> real student roster.
export async function resolverNomina({ carrera, asignatura, facultad, codCarrera, docente }) {
  const carreraOasis = codCarrera
    ? { codigo: codCarrera, nombre: carrera || codCarrera }
    : await resolverCarrera(carrera, facultad);
  if (!carreraOasis) {
    const e = new Error(`No se encontró la carrera "${carrera}" en OASIS.`);
    e.soapFault = true;
    throw e;
  }

  const malla = await getMalla(carreraOasis.codigo);
  const objetivo = norm(asignatura);
  const materia =
    malla.find((m) => norm(m.materia) === objetivo) ||
    malla.find((m) => norm(m.materia).includes(objetivo) || objetivo.includes(norm(m.materia)));
  if (!materia) {
    const e = new Error(`La asignatura "${asignatura}" no está en la malla de ${carreraOasis.nombre}.`);
    e.soapFault = true;
    throw e;
  }

  const dictados = await getDictados(carreraOasis.codigo, materia.codMateria);
  if (!dictados.length) {
    const e = new Error(`"${materia.materia}" no tiene paralelos activos este período.`);
    e.soapFault = true;
    throw e;
  }
  // Prefer the paralelo dictated by the configured docente, else the first.
  const docNorm = norm(docente);
  const elegido =
    (docNorm && dictados.find((d) => norm(d.docente.apellidos + " " + d.docente.nombres).includes(docNorm))) ||
    dictados[0];

  const periodo = await getPeriodoActual();
  const estudiantes = await getAlumnosMateria({
    codCarrera: carreraOasis.codigo,
    codNivel: elegido.codNivel || materia.codNivel,
    codParalelo: elegido.paralelo,
    codPeriodo: periodo.codigo,
    codMateria: materia.codMateria,
  });

  return {
    resuelto: {
      codCarrera: carreraOasis.codigo,
      carrera: carreraOasis.nombre,
      codMateria: materia.codMateria,
      materia: materia.materia,
      codNivel: elegido.codNivel || materia.codNivel,
      nivel: elegido.nivel || materia.nivel,
      paralelo: elegido.paralelo,
      codPeriodo: periodo.codigo,
      periodo: periodo.descripcion,
      docente: elegido.docente,
      paralelosDisponibles: dictados.map((d) => d.paralelo),
    },
    estudiantes,
  };
}

// Aggregate the docentes currently teaching in a career, with their loads.
export async function getDocentesCarrera({ carrera, facultad, codCarrera }) {
  const carreraOasis = codCarrera
    ? { codigo: codCarrera, nombre: carrera || codCarrera }
    : await resolverCarrera(carrera, facultad);
  if (!carreraOasis) {
    const e = new Error(`No se encontró la carrera "${carrera}" en OASIS.`);
    e.soapFault = true;
    throw e;
  }

  const malla = await getMalla(carreraOasis.codigo);
  const porDocente = new Map();

  // Limited-concurrency fan-out over the malla subjects.
  const limit = 8;
  let index = 0;
  async function worker() {
    while (index < malla.length) {
      const m = malla[index++];
      let dictados = [];
      try {
        dictados = await getDictados(carreraOasis.codigo, m.codMateria);
      } catch {
        dictados = [];
      }
      for (const d of dictados) {
        const ced = d.docente.cedula;
        if (!ced) continue;
        if (!porDocente.has(ced)) {
          porDocente.set(ced, {
            cedula: ced,
            apellidos: d.docente.apellidos,
            nombres: d.docente.nombres,
            email: d.docente.email,
            cargas: [],
          });
        }
        porDocente.get(ced).cargas.push({
          codMateria: m.codMateria,
          materia: m.materia,
          codNivel: d.codNivel || m.codNivel,
          nivel: d.nivel || m.nivel,
          paralelo: d.paralelo,
        });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, malla.length || 1) }, worker));

  const docentes = Array.from(porDocente.values()).sort((a, b) =>
    (a.apellidos + a.nombres).localeCompare(b.apellidos + b.nombres)
  );
  return { carrera: carreraOasis.nombre, codCarrera: carreraOasis.codigo, docentes };
}

// Horario de clases de un docente (InfoCarrera.GetHorariosDocente).
export async function getHorarioDocente({ codCarrera, carrera, facultad, cedula, codPeriodo }) {
  let cod = codCarrera;
  if (!cod) {
    const c = await resolverCarrera(carrera, facultad);
    if (!c) {
      const e = new Error(`No se encontró la carrera "${carrera}" en OASIS.`);
      e.soapFault = true;
      throw e;
    }
    cod = c.codigo;
  }
  const periodo = codPeriodo || (await getPeriodoActual()).codigo;
  const r = await callSoap("InfoCarrera", "GetHorariosDocente", {
    strCodCarrera: cod,
    strCedula: cedula,
    strCodPeriodo: periodo,
  });
  const clases = asArray(r?.HorarioClase).map((h) => ({
    codMateria: h.CodMateria || "",
    materia: (h.Materia || "").trim(),
    codDia: h.CodDia || "",
    dia: (h.Dia || "").trim(),
    inicio: h.Inicio || "",
    fin: h.Fin || "",
  }));
  return { codCarrera: cod, codPeriodo: periodo, clases };
}

export async function getNotas(codCarrera, cedula) {
  const r = await callSoap("InfoCarrera", "GetUltimasNotasEstudianteCarrera", {
    strCodCarrera: codCarrera,
    strCedula: cedula,
  });
  return asArray(r?.Notas).map((n) => ({
    codMateria: n.CodMateria || "",
    materia: n.Materia || "",
    nota: Number(n.Acumulado ?? n.Principal ?? 0) || 0,
  }));
}

export const config = { base: BASE, hasCredentials: Boolean(OASIS_USER) };
