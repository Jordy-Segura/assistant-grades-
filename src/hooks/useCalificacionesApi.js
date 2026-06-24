import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "espoch_state_v1";

function loadLocal() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; }
}

function saveLocal(key, data) {
  try {
    const state = loadLocal();
    if (key === "gradesByConfig") state.gradesByConfig = { ...(state.gradesByConfig || {}), ...data };
    else if (key === "studentsByConfig") state.studentsByConfig = { ...(state.studentsByConfig || {}), ...data };
    else state[key] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useCalificacionesApi(configId) {
  const [saving, setSaving] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(null);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    import("../services/oasisApi").then(mod => {
      mod.calificacionesHealthV1().then(h => setApiAvailable(h?.available)).catch(() => setApiAvailable(false));
    });
  }, []);

  const load = useCallback(async () => {
    if (!configId) return null;
    if (apiAvailable) {
      try {
        const mod = await import("../services/oasisApi");
        const data = await mod.getCalificacionesV1(configId);
        if (data && !data.error) {
          return {
            grades: (data.grades || []).map(g => ({ studentId: g.estudiante_id, activityId: g.actividad_id, score: g.nota })),
            students: (data.students || []).map(s => ({ id: s.id, cedula: s.cedula, codigo: s.codigo, nombres: s.nombres, apellidos: s.apellidos })),
          };
        }
      } catch {}
    }
    // Fallback localStorage
    const state = loadLocal();
    const grades = state.gradesByConfig?.[configId] || [];
    const students = state.studentsByConfig?.[configId] || [];
    return { grades, students };
  }, [configId, apiAvailable]);

  const save = useCallback(async (payload) => {
    setSaving(true);
    const data = {
      periodo: payload.courseConfig?.periodoAcademico || "",
      pao: payload.courseConfig?.pao || "",
      aporte: payload.courseConfig?.aporte || "FIN DE CICLO",
      metadata: { carrera: payload.courseConfig?.carrera, asignatura: payload.courseConfig?.asignatura, docente: payload.courseConfig?.docente },
      activities: payload.activities || [],
      students: (payload.students || []).map(s => ({ id: s.id, cedula: s.cedula, codigo: s.codigo, nombres: s.nombres, apellidos: s.apellidos })),
      grades: payload.grades || [],
    };
    if (apiAvailable) {
      try {
        const mod = await import("../services/oasisApi");
        const r = await mod.putCalificacionesV1(configId, data);
        if (r && r.ok) {
          saveLocal("gradesByConfig", { [configId]: data.grades });
          saveLocal("studentsByConfig", { [configId]: data.students });
          setSaving(false);
          return true;
        }
      } catch {}
    }
    // Fallback localStorage
    saveLocal("gradesByConfig", { [configId]: data.grades });
    saveLocal("studentsByConfig", { [configId]: data.students });
    setSaving(false);
    return true;
  }, [configId, apiAvailable]);

  return { load, save, saving, apiAvailable };
}
