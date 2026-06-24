import { createContext, useContext, useReducer, useEffect } from "react";

const STORAGE_KEY = "espoch_state_v1";

const INITIAL = {
  currentUser: null,
  courseConfig: { periodoAcademico: "", facultad: "SEDE ORELLANA", carrera: "", asignatura: "", docente: "", pao: "", aporte: "FIN DE CICLO" },
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
  oasisPeriodo: null,
  page: "dashboard",
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...INITIAL, ...parsed, page: "dashboard" };
    }
  } catch {}
  return { ...INITIAL };
}

function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

function reducer(s, a) {
  switch (a.type) {
    case "SET_USER":
      return { ...s, currentUser: a.payload };
    case "LOGOUT":
      return { ...s, currentUser: null, activeConfigId: "", editingConfigId: "", students: [], grades: [] };
    case "NAV":
      return { ...s, page: a.payload };
    case "PATCH_COURSE_CONFIG":
      return { ...s, courseConfig: { ...s.courseConfig, ...a.payload } };
    case "SET_COURSE_CONFIG":
      return { ...s, courseConfig: { ...s.courseConfig, ...a.payload } };
    case "SET_SELECTED_RAC":
      return { ...s, selectedRACIds: a.payload };
    case "SET_RAAU_ENTRIES":
      return { ...s, raauEntries: a.payload };
    case "SET_ACTIVITIES":
      return { ...s, activities: a.payload };
    case "SET_CONFIG_LOCKED":
      return { ...s, configLocked: a.payload };
    case "SET_ACTIVE_CONFIG_ID":
      return { ...s, activeConfigId: a.payload };
    case "SET_EDITING_CONFIG_ID":
      return { ...s, editingConfigId: a.payload };
    case "ADD_RECENT_ACTIVITY": {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const item = { text: a.payload.text || a.payload, type: a.payload.type || "config", time, date: now.toLocaleDateString() };
      const list = [item, ...(s.recentActivity || [])].slice(0, 20);
      return { ...s, recentActivity: list };
    }
    case "SAVE_CONFIG": {
      const cfg = a.payload;
      const id = cfg.id || `cfg_${Date.now()}`;
      const existingIdx = s.savedConfigs.findIndex(c => c.id === id);
      let list;
      if (existingIdx >= 0) {
        list = s.savedConfigs.map((c, i) => i === existingIdx ? { ...cfg, id, savedAt: new Date().toLocaleString() } : c);
      } else {
        const entry = { ...cfg, id, savedAt: new Date().toLocaleString(), ownerEmail: s.currentUser?.email || "" };
        list = [entry, ...(s.savedConfigs || [])].slice(0, 8);
      }
      return { ...s, savedConfigs: list };
    }
    case "DELETE_CONFIG": {
      const delId = a.payload;
      const filtered = (s.savedConfigs || []).filter(c => c.id !== delId);
      const { [delId]: _, ...sb } = s.studentsByConfig || {};
      const { [delId]: _g, ...gb } = s.gradesByConfig || {};
      const newState = { ...s, savedConfigs: filtered, studentsByConfig: sb, gradesByConfig: gb };
      if (s.activeConfigId === delId) newState.activeConfigId = "";
      if (s.activeConfigId === delId) newState.students = [];
      if (s.activeConfigId === delId) newState.grades = [];
      return newState;
    }
    case "ACTIVATE_CONFIG": {
      const found = (s.savedConfigs || []).find(c => c.id === a.payload);
      if (!found) return s;
      return {
        ...s,
        activeConfigId: a.payload,
        courseConfig: deepClone(found.courseConfig),
        selectedRACIds: [...(found.selectedRACIds || [])],
        raauEntries: deepClone(found.raauEntries || []),
        activities: deepClone(found.activities || []),
        configLocked: true,
      };
    }
    case "UNLOCK_CONFIG":
      return { ...s, configLocked: false, activeConfigId: "", editingConfigId: "" };
    case "SET_STUDENTS":
      return { ...s, students: a.payload };
    case "SET_GRADES":
      return { ...s, grades: a.payload };
    case "SET_STUDENTS_BY_CONFIG":
      return { ...s, studentsByConfig: { ...s.studentsByConfig, ...a.payload } };
    case "SET_GRADES_BY_CONFIG":
      return { ...s, gradesByConfig: { ...s.gradesByConfig, ...a.payload } };
    default:
      return s;
  }
}

const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, load);

  useEffect(() => {
    if (typeof window !== "undefined") window.STATE = state;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
