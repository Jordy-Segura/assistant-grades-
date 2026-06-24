import { useState, useMemo } from "react";
import { useApp } from "../store/AppContext";
import * as oasis from "../services/oasisApi";

export default function EstudiantesPage() {
  const { state, dispatch } = useApp();
  const { activeConfigId, courseConfig, students, activities, grades } = state;
  const [query, setQuery] = useState("");
  const [importing, setImporting] = useState(false);

  const q = query.replace(/-/g, "").toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return students;
    return students.filter(s => {
      const cleanCed = (s.cedula || "").replace(/-/g, "");
      const raw = `${s.apellidos} ${s.nombres} ${s.cedula} ${s.codigo || ""} ${cleanCed}`.toLowerCase();
      return raw.includes(q) || raw.includes(query.toLowerCase());
    });
  }, [students, q, query]);

  function studentTotal(sid) {
    return activities.reduce((sum, act) => {
      const g = (grades || []).find(x => x.studentId === sid && x.activityId === act.id);
      return sum + (g?.score || 0);
    }, 0);
  }

  async function syncFromOasis() {
    if (!activeConfigId || !courseConfig.codCarrera) {
      try {
        const carreras = await oasis.getCarrerasV1();
        if (!courseConfig.codCarrera && courseConfig.carrera) {
          const found = (Array.isArray(carreras) ? carreras : []).find(c => c.nombre === courseConfig.carrera);
          if (found) courseConfig.codCarrera = found.codigo_oasis;
        }
      } catch {}
    }
    setImporting(true);
    try {
      const alumnos = await oasis.getAlumnosMateria({
        codCarrera: courseConfig.codCarrera || "",
        cedula: state.currentUser?.cedula || "",
        codPeriodo: courseConfig.codPeriodo || "",
        codMateria: courseConfig.codMateria || "",
        codNivel: courseConfig.codNivel || courseConfig.pao || "",
        codParalelo: courseConfig.codParalelo || "",
        carrera: courseConfig.carrera || "",
        asignatura: courseConfig.asignatura || "",
        facultad: courseConfig.facultad || "",
        docente: state.currentUser?.name || courseConfig.docente || "",
      });
      if (alumnos && Array.isArray(alumnos.alumnos)) {
        const existing = [...students];
        let added = 0, updated = 0;
        alumnos.alumnos.forEach(oasisStudent => {
          const idx = existing.findIndex(s => s.cedula === oasisStudent.cedula);
          const entry = {
            id: oasisStudent.cedula,
            codigo: oasisStudent.codigo || "",
            cedula: oasisStudent.cedula || "",
            apellidos: (oasisStudent.apellidos || "").trim(),
            nombres: (oasisStudent.nombres || "").trim(),
          };
          if (idx >= 0) { existing[idx] = { ...existing[idx], ...entry }; updated++; }
          else { existing.push(entry); added++; }
        });
        dispatch({ type: "SET_STUDENTS", payload: existing });
        dispatch({ type: "SET_STUDENTS_BY_CONFIG", payload: { [activeConfigId]: existing } });
        dispatch({ type: "ADD_RECENT_ACTIVITY", payload: { text: `OASIS: ${added} nuevos, ${updated} actualizados`, type: "student" } });
        window.showToast?.(`${added} nuevos, ${updated} actualizados desde OASIS`, "success");
      }
    } catch (err) {
      window.showToast?.(err.message || "Error al importar", "error");
    } finally { setImporting(false); }
  }

  function editStudent(sid) {
    const s = students.find(st => st.id === sid);
    if (!s) return;
    const newNombres = prompt("Nombres:", s.nombres || "");
    if (newNombres === null) return;
    const newApellidos = prompt("Apellidos:", s.apellidos || "");
    if (newApellidos === null) return;
    const updated = students.map(st => st.id === sid ? { ...st, nombres: newNombres, apellidos: newApellidos } : st);
    dispatch({ type: "SET_STUDENTS", payload: updated });
    if (activeConfigId) dispatch({ type: "SET_STUDENTS_BY_CONFIG", payload: { [activeConfigId]: updated } });
    window.showToast?.("Estudiante actualizado.", "success");
  }

  function removeStudent(sid) {
    if (!confirm("¿Eliminar este estudiante?")) return;
    const updated = students.filter(s => s.id !== sid);
    dispatch({ type: "SET_STUDENTS", payload: updated });
    dispatch({ type: "SET_GRADES", payload: (grades || []).filter(g => g.studentId !== sid) });
    if (activeConfigId) {
      dispatch({ type: "SET_STUDENTS_BY_CONFIG", payload: { [activeConfigId]: updated } });
    }
    window.showToast?.("Estudiante eliminado.", "success");
  }

  function exportPDF() {
    if (students.length === 0) { window.showToast?.("No hay estudiantes para exportar.", "error"); return; }
    const rows = students.map(s => {
      const tot = studentTotal(s.id);
      const maxTotal = activities.reduce((sum, a) => sum + (a.maxScore || 0), 0);
      const pct = maxTotal > 0 ? ((tot / maxTotal) * 100).toFixed(1) : "—";
      return `<tr><td>${esc(s.codigo || "")}</td><td>${esc(formatCed(s.cedula))}</td><td>${esc(s.apellidos)}</td><td>${esc(s.nombres)}</td><td style="text-align:right">${tot.toFixed(2)}</td><td style="text-align:right">${pct}%</td></tr>`;
    }).join("");
    const w = window.open("", "_blank", "width=1200,height=800");
    if (!w) { window.showToast?.("Permita ventanas emergentes.", "error"); return; }
    w.document.write(`<html><head><title>Nómina - ${esc(courseConfig.asignatura || "Estudiantes")}</title>
      <style>body{font-family:Inter,Arial,sans-serif;margin:14px;color:#111;font-size:11px}h1{font-size:16px;margin:0 0 4px}.sub{font-size:12px;color:#666;margin-bottom:10px}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #ddd;padding:5px 6px;text-align:left}th{background:#f5f5f5;font-weight:600}</style></head><body>
      <h1>Nómina de Estudiantes</h1>
      <div class="sub">${esc(courseConfig.carrera || "")} · ${esc(courseConfig.asignatura || "")} · ${esc(courseConfig.periodoAcademico || "")} · Total: ${students.length} estudiantes</div>
      <table><thead><tr><th>Código</th><th>Cédula</th><th>Apellidos</th><th>Nombres</th><th>Total</th><th>%</th></tr></thead><tbody>${rows}</tbody></table>
      </body></html>`);
    w.document.close(); w.focus(); w.print();
  }

  const hasActivities = activities.length > 0;
  const totals = students.map(s => ({ student: s, total: studentTotal(s.id) }));
  const approved = totals.filter(t => t.total >= 7).length;
  const avg = totals.length > 0 ? (totals.reduce((a, b) => a + b.total, 0) / totals.length).toFixed(2) : "—";

  return (
    <>
      <div className="page-header">
        <div className="page-title">Estudiantes</div>
        <div className="page-sub">
          {activeConfigId
            ? `${students.length} estudiantes matriculados${courseConfig.asignatura ? ` en ${courseConfig.asignatura}` : ""}`
            : "Seleccione un PAO para cargar estudiantes."}
        </div>
      </div>
      {activeConfigId && (
        <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 18 }}>
          {[
            { label: "Total", val: students.length, color: "var(--gray-800)" },
            { label: "Aprobados", val: hasActivities ? approved : "—", color: hasActivities ? "var(--green)" : "var(--gray-400)" },
            { label: "Promedio", val: hasActivities ? avg : "—", color: hasActivities ? "var(--amber)" : "var(--gray-400)" },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: "14px 18px" }}>
              <div style={{ fontSize: ".75rem", color: "var(--gray-400)" }}>{s.label}</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: s.color, marginTop: 3 }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Nómina ({filtered.length})</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {activeConfigId && (
              <>
                <div className="search-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <input className="search-input" placeholder="Buscar por nombre, cédula o código..." value={query} onChange={e => setQuery(e.target.value)} />
                </div>
                <button className="btn btn-edit btn-sm" onClick={syncFromOasis} disabled={importing}>{importing ? "Importando…" : "Actualizar"}</button>
                <button className="btn btn-primary btn-sm" onClick={exportPDF} disabled={students.length === 0}>Exportar PDF</button>
              </>
            )}
          </div>
        </div>
        {activeConfigId ? (
          <div style={{ overflowX: "auto" }}>
            <table className="data">
              <thead><tr><th style={{ width: 40 }}>#</th><th>Código</th><th>Cédula</th><th>Apellidos</th><th>Nombres</th><th>Nota</th><th>Estado</th><th style={{ width: 100 }}>Acciones</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--gray-400)", padding: 28, fontSize: ".82rem" }}>
                    {students.length === 0 ? "No hay estudiantes. Presione 'Actualizar' para importar." : `No se encontraron estudiantes para "${query}".`}
                  </td></tr>
                ) : (
                  filtered.map((s, i) => {
                    const tot = studentTotal(s.id);
                    const passed = tot >= 7;
                    return (
                      <tr key={s.id}>
                        <td style={{ color: "var(--gray-400)" }}>{i + 1}</td>
                        <td style={{ fontFamily: "var(--mono)", fontSize: ".78rem" }}>{s.codigo || "—"}</td>
                        <td style={{ fontFamily: "var(--mono)", fontSize: ".78rem" }}>{formatCed(s.cedula)}</td>
                        <td style={{ fontWeight: 500 }}>{s.apellidos}</td>
                        <td>{s.nombres}</td>
                        <td style={{ textAlign: "center", fontWeight: 700, fontFamily: "var(--mono)", color: passed ? "var(--green)" : "var(--red)" }}>{tot.toFixed(2)}</td>
                        <td style={{ textAlign: "center" }}><span className={`badge ${passed ? "badge-green" : "badge-red"}`}>{passed ? "Aprobado" : "Reprobado"}</span></td>
                        <td style={{ textAlign: "center" }}>
                          <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => editStudent(s.id)} title="Editar">Editar</button>
                            <button className="btn btn-danger btn-sm" onClick={() => removeStudent(s.id)} title="Eliminar">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card-body" style={{ textAlign: "center", padding: 40, color: "var(--gray-500)" }}>
            Seleccione o configure un PAO desde Configuración para cargar estudiantes.
          </div>
        )}
      </div>
    </>
  );
}

function esc(s) { if (typeof s !== "string") return ""; const d = document.createElement("div"); d.appendChild(document.createTextNode(s)); return d.innerHTML; }
function formatCed(c) { if (!c) return "—"; const clean = c.replace(/-/g, ""); return clean.length === 10 ? `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}` : clean; }
