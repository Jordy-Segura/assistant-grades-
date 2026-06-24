// Módulo de autenticación
import * as oasis from "../services/oasisApi.js";
import { getState, setState, save } from "./storage.js";

const ROLE_LABEL = {
  admin: "Administrador",
  docente: "Docente",
  coordinador: "Coordinador",
};

function deriveRole(roles) {
  var names = (roles || []).map(function (r) {
    return (r.nombreRol || "").toUpperCase();
  });
  if (
    names.some(function (n) {
      return n.indexOf("COORDINADOR") !== -1;
    })
  )
    return "coordinador";
  if (
    names.some(function (n) {
      return n.indexOf("DECANO") !== -1 || n.indexOf("ADMIN") !== -1;
    })
  )
    return "admin";
  return "docente";
}

export function buildUserFromOasis(loginValue, result) {
  var perfil = (result && result.perfil) || {};
  var roles = (result && result.roles) || [];
  var name =
    ((perfil.nombres || "") + " " + (perfil.apellidos || "")).trim() ||
    loginValue;
  var token = result && result.token;
  if (token) {
    oasis.setAuthToken(token);
  }
  return {
    email: perfil.email || loginValue,
    role: deriveRole(roles),
    name: name,
    cedula: perfil.cedula || "",
    roles: roles,
    source: "oasis",
    token: token,
  };
}

export function findUserByEmail(email) {
  var STATE = getState();
  var lower = String(email || "").toLowerCase();
  var docentes = STATE.docentes || [];
  return docentes.find(function (u) {
    return u.email.toLowerCase() === lower;
  }) || null;
}

export function getCurrentAporte() {
  var STATE = getState();
  if (!STATE.oasisPeriodo) return "FIN DE CICLO";
  var start = STATE.oasisPeriodo.fechaInicio;
  var end = STATE.oasisPeriodo.fechaFin;
  if (!start || !end) return "FIN DE CICLO";
  var now = new Date();
  var startDate = new Date(start);
  var endDate = new Date(end);
  if (now > endDate) return "RECUPERACIÓN";
  if (now <= startDate) return "MEDIO CICLO";
  var midpoint = new Date((startDate.getTime() + endDate.getTime()) / 2);
  return now < midpoint ? "MEDIO CICLO" : "FIN DE CICLO";
}

export function resetDraftIfNotMine() {
  var STATE = getState();
  var email = STATE.currentUser && STATE.currentUser.email;
  var active = (STATE.savedConfigs || []).find(function (c) {
    return c.id === STATE.activeConfigId;
  });
  var mineActive = active && (active.ownerEmail || "") === email;
  if (mineActive) {
    loadActiveConfigData();
    return;
  }
  STATE.configLocked = false;
  STATE.activeConfigId = "";
  STATE.courseConfig = {
    periodoAcademico:
      (STATE.oasisPeriodo && STATE.oasisPeriodo.descripcion) || "",
    facultad: "SEDE ORELLANA",
    carrera: "",
    asignatura: "",
    docente:
      (STATE.currentUser && STATE.currentUser.name) || "",
    pao: "",
    aporte: getCurrentAporte(),
  };
  STATE.selectedRACIds = [];
  STATE.raauEntries = [];
  STATE.activities = [];
  STATE.students = [];
  STATE.grades = [];
  save();
}

function loadActiveConfigData() {
  var STATE = getState();
  var key = STATE.activeConfigId || "";
  if (!key) return;
  if (!STATE.studentsByConfig[key]) STATE.studentsByConfig[key] = [];
  if (!STATE.gradesByConfig[key]) STATE.gradesByConfig[key] = [];
  STATE.students = JSON.parse(JSON.stringify(STATE.studentsByConfig[key]));
  STATE.grades = JSON.parse(JSON.stringify(STATE.gradesByConfig[key]));
}

export function setAuthLoading(loading) {
  var btn = document.querySelector(".auth-main-btn");
  if (btn) {
    btn.disabled = loading;
    btn.textContent = loading ? "Verificando…" : "Ingresar";
  }
}

export async function doLogin() {
  var STATE = getState();
  var emailEl = document.getElementById("auth-email");
  var passEl = document.getElementById("auth-pass");
  var msgEl = document.getElementById("auth-msg");
  var email = ((emailEl && emailEl.value) || "").trim();
  var pass = ((passEl && passEl.value) || "").trim();
  if (!email || !pass) {
    if (msgEl) msgEl.textContent = "Ingrese su correo institucional y contraseña.";
    return;
  }
  var local = findUserByEmail(email);
  if (local && local.password === pass) {
    finishLogin({
      email: local.email,
      role: local.role,
      name: local.name,
      cedula: local.cedula || "",
      source: "local",
    });
    return;
  }
  setAuthLoading(true);
  try {
    if (email.indexOf("dev.") === 0) {
      if (import.meta.env.PROD) {
        throw new Error("dev-login no disponible en producción.");
      }
      var devResult = await oasis.devLogin(email, pass);
      if (devResult) {
        finishLogin(buildUserFromOasis(email, devResult));
        return;
      }
    }
    try {
      var dbUser = await oasis.loginDb(email, pass);
      if (dbUser && !dbUser.disabled) {
        if (dbUser.token) oasis.setAuthToken(dbUser.token);
        finishLogin(dbUser);
        return;
      }
    } catch {
      /* probar OASIS */
    }
    var result = await oasis.login(email, pass);
    finishLogin(buildUserFromOasis(email, result));
  } catch (err) {
    if (msgEl) {
      msgEl.textContent =
        err && err.offline
          ? "No se pudo contactar el servidor. Verifique su conexión."
          : err.message || "Usuario o contraseña incorrectos.";
    }
  } finally {
    setAuthLoading(false);
  }
}

export function finishLogin(user) {
  var STATE = getState();
  STATE.currentUser = user;
  resetDraftIfNotMine();
  save();
  var msgEl = document.getElementById("auth-msg");
  if (msgEl) msgEl.textContent = "";
  applyRoleUI();
  updateSidebar();
  navigate(user.role === "coordinador" ? "coord-docentes" : "dashboard");
  showToast("Bienvenido, " + user.name, "success");
  autoLoadPeriodo();
  hydrateFromDb();
}

export function doLogout() {
  var STATE = getState();
  STATE.currentUser = null;
  oasis.setAuthToken(null);
  save();
  applyRoleUI();
  updateSidebar();
  var msgEl = document.getElementById("auth-msg");
  if (msgEl) msgEl.textContent = "";
  var passEl = document.getElementById("auth-pass");
  if (passEl) passEl.value = "";
}

export function applyRoleUI() {
  var STATE = getState();
  var role = STATE.currentUser && STATE.currentUser.role;
  var appShell = document.getElementById("app-shell");
  var auth = document.getElementById("auth-screen");
  if (!role) {
    if (auth) auth.style.display = "flex";
    if (appShell) appShell.style.display = "none";
    return;
  }
  if (auth) auth.style.display = "none";
  if (appShell) appShell.style.display = "flex";
  var navCoord = document.getElementById("nav-coordinacion");
  if (navCoord)
    navCoord.style.display = role === "docente" ? "none" : "";
  [
    "nav-coord-asig",
    "nav-coord-rac",
    "nav-coord-raau",
    "nav-coord-docentes",
  ].forEach(function (id) {
    var item = document.getElementById(id);
    if (item)
      item.style.display =
        role === "coordinador" || role === "admin" ? "" : "none";
  });
  [
    "nav-consulta-divider",
    "nav-consulta-section",
    "nav-consulta-sede",
    "nav-consulta-info",
    "nav-consulta-est",
  ].forEach(function (id) {
    var item = document.getElementById(id);
    if (item)
      item.style.display =
        role === "coordinador" || role === "admin" ? "" : "none";
  });
}

export function roleCanAccess(page) {
  var STATE = getState();
  var role = STATE.currentUser && STATE.currentUser.role;
  if (!role) return false;
  if (page.indexOf("coord-") === 0) return role === "coordinador" || role === "admin";
  if (page.indexOf("consulta-") === 0) return role === "coordinador" || role === "admin";
  if (role === "docente") return page !== "coordinacion";
  return true;
}

function sanitize(str) {
  if (typeof str !== "string") return "";
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

export function openProfile() {
  var STATE = getState();
  var u = STATE.currentUser;
  if (!u) return;
  var local = findUserByEmail(u.email);
  var body =
    '<div style="font-size:.82rem;color:var(--gray-700);line-height:1.8">' +
    "<div><strong>Nombre:</strong> " +
    sanitize(u.name || "—") +
    "</div>" +
    "<div><strong>Correo:</strong> " +
    sanitize(u.email || "—") +
    "</div>" +
    (u.cedula
      ? "<div><strong>Cédula:</strong> " + sanitize(u.cedula) + "</div>"
      : "") +
    "<div><strong>Rol:</strong> " +
    (ROLE_LABEL[u.role] || u.role) +
    "</div>" +
    "<div><strong>Origen:</strong> " +
    (u.source === "oasis" ? "OASIS (institucional)" : "Local") +
    "</div></div>";
  if (local) {
    body +=
      '<div style="margin-top:14px;border-top:1px solid var(--gray-200);padding-top:12px">' +
      '<div style="font-weight:600;font-size:.82rem;margin-bottom:8px">Cambiar mi contraseña</div>' +
      '<div class="form-group"><input class="form-input" id="prof-pass" type="password" placeholder="Nueva contraseña"></div></div>';
  }
  var actions = [{ label: "Cerrar", cls: "btn-ghost", action: "close" }];
  if (local) {
    actions.push({
      label: "Guardar contraseña",
      cls: "btn-success",
      action: function () {
        var p = document.getElementById("prof-pass").value.trim();
        if (!p) {
          showToast("Ingrese una contraseña.", "error");
          return;
        }
        local.password = p;
        save();
        closeModal();
        showToast("Contraseña actualizada.", "success");
      },
    });
  }
  openModal("Mi perfil", body, actions);
}
