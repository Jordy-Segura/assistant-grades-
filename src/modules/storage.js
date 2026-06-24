// Módulo de estado y persistencia (delega en window.* que legacyRuntime define)

export const DEFAULT_STATE = {
  courseConfig: {
    periodoAcademico: "",
    facultad: "SEDE ORELLANA",
    carrera: "",
    asignatura: "",
    docente: "",
    pao: "",
    aporte: "FIN DE CICLO",
  },
  selectedRACIds: [],
  raauEntries: [],
  activities: [],
  configLocked: false,
  activeConfigId: "",
  editingConfigId: "",
  savedConfigs: [],
  studentsByConfig: {},
  gradesByConfig: {},
  teacherAssignments: [],
  docentes: [],
  students: [],
  grades: [],
  recentActivity: [],
  currentUser: null,
  oasisPeriodo: null,
};

export function getState() {
  return typeof window !== "undefined" ? window.STATE : {};
}

export function setState(newState) {
  if (typeof window !== "undefined") window.STATE = newState;
}

export function getDbReady() {
  return typeof window !== "undefined" ? window._dbReady : false;
}

export function setDbReady(v) {
  if (typeof window !== "undefined") window._dbReady = v;
}

export function save() {
  if (typeof window.save === "function") window.save();
}

export function load() {
  if (typeof window.load === "function") return window.load();
}

export function pushToDb() {
  if (typeof window.pushToDb === "function") window.pushToDb();
}

export function hydrateFromDb() {
  if (typeof window.hydrateFromDb === "function") return window.hydrateFromDb();
}

export function initState() {
  if (typeof window.load === "function") {
    window.load();
  } else {
    // fallback si legacyRuntime aún no cargó
    try {
      const stored = localStorage.getItem("espoch_state_v1");
      const state = stored
        ? JSON.parse(stored)
        : JSON.parse(JSON.stringify(DEFAULT_STATE));
      window.STATE = state;
    } catch {
      window.STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }
}
