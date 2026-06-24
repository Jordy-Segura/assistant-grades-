import { createContext, useContext, useReducer, useEffect, useCallback } from "react";

const STORAGE_KEY = "espoch_state_v1";

const INITIAL = {
  currentUser: null,
  courseConfig: {},
  selectedRACIds: [],
  raauEntries: [],
  activities: [],
  configLocked: false,
  activeConfigId: "",
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
    return raw ? { ...INITIAL, ...JSON.parse(raw) } : { ...INITIAL };
  } catch { return { ...INITIAL }; }
}

function reducer(s, a) {
  switch (a.type) {
    case "SET_USER": return { ...s, currentUser: a.payload };
    case "LOGOUT": return { ...s, currentUser: null, activeConfigId: "", students: [], grades: [] };
    case "NAV": return { ...s, page: a.payload };
    case "PATCH": return { ...s, ...a.payload };
    default: return s;
  }
}

const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, load);

  const persist = useCallback((fn) => {
    dispatch(fn);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.STATE = state;
    }
  }, [state]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  return <Ctx.Provider value={{ state, dispatch, persist }}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
