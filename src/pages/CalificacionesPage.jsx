import { useState, useMemo } from "react";
import { useApp } from "../store/AppContext";
import { COMPONENTS, COMPONENT_COLORS, COMPONENT_LABELS, COMPONENT_WEIGHTS } from "../data/careerData";

export default function CalificacionesPage() {
  const { state, dispatch } = useApp();
  const { activeConfigId, courseConfig, students, activities, grades } = state;
  const [localGrades, setLocalGrades] = useState({});
  const [saving, setSaving] = useState(false);

  function getGrade(sid, aid) {
    const key = `${sid}_${aid}`;
    if (localGrades[key] !== undefined) return localGrades[key];
    const g = (grades || []).find(x => x.studentId === sid && x.activityId === aid);
    return g?.score;
  }

  function setGrade(sid, aid, score) {
    const key = `${sid}_${aid}`;
    setLocalGrades(prev => ({ ...prev, [key]: score }));
  }

  function commitGrades() {
    const updatedGrades = [...(grades || [])];
    Object.entries(localGrades).forEach(([key, score]) => {
      const [sid, aid] = key.split("_");
      const idx = updatedGrades.findIndex(g => g.studentId === sid && g.activityId === aid);
      const entry = { studentId: sid, activityId: aid, score };
      if (idx >= 0) updatedGrades[idx] = entry;
      else updatedGrades.push(entry);
    });
    dispatch({ type: "SET_GRADES", payload: updatedGrades });
    setLocalGrades({});
  }

  function persistGrades() {
    commitGrades();
    setSaving(true);
    setTimeout(() => {
      const finalGrades = [...(grades || [])];
      Object.entries(localGrades).forEach(([key, score]) => {
        const [sid, aid] = key.split("_");
        const idx = finalGrades.findIndex(g => g.studentId === sid && g.activityId === aid);
        const entry = { studentId: sid, activityId: aid, score };
        if (idx >= 0) finalGrades[idx] = entry;
        else finalGrades.push(entry);
      });
      dispatch({ type: "SET_GRADES", payload: finalGrades });
      setLocalGrades({});
      if (activeConfigId) {
        dispatch({ type: "SET_GRADES_BY_CONFIG", payload: { [activeConfigId]: finalGrades } });
      }
      dispatch({ type: "ADD_RECENT_ACTIVITY", payload: { text: `Calificaciones guardadas (${students.length} estudiantes)`, type: "grade" } });
      setSaving(false);
      window.showToast?.("Calificaciones guardadas.", "success");
    }, 200);
  }

  function studentTotal(sid) {
    let sum = 0;
    activities.forEach(act => {
      const score = getGrade(sid, act.id);
      if (score != null) sum += Number(score);
    });
    return sum;
  }

  const hasLocalChanges = Object.keys(localGrades).length > 0;

  const grouped = useMemo(() => {
    return COMPONENTS.map(comp => ({
      comp,
      acts: activities.filter(a => a.component === comp),
    }));
  }, [activities]);

  const maxTotal = activities.reduce((s, a) => s + (a.maxScore || 0), 0);
  let totalEntered = 0, totalExpected = students.length * activities.length;
  students.forEach(s => activities.forEach(a => { if (getGrade(s.id, a.id) != null) totalEntered++; }));
  const pct = totalExpected > 0 ? Math.round((totalEntered / totalExpected) * 100) : 0;

  if (!activeConfigId) {
    return (
      <>
        <div className="page-header">
          <div className="page-title">Registro de Calificaciones</div>
          <div className="page-sub">Seleccione un PAO para gestionar calificaciones.</div>
        </div>
        <div className="card"><div className="card-body" style={{ textAlign: "center", padding: 40, color: "var(--gray-500)" }}>Seleccione o configure un PAO desde Configuración.</div></div>
      </>
    );
  }

  if (students.length === 0) {
    return (
      <>
        <div className="page-header">
          <div className="page-title">Registro de Calificaciones</div>
          <div className="page-sub">—</div>
        </div>
        <div className="card"><div className="card-body" style={{ textAlign: "center", padding: 40, color: "var(--gray-500)" }}>No hay estudiantes. Importe la nómina desde Estudiantes.</div></div>
      </>
    );
  }

  if (activities.length === 0) {
    return (
      <>
        <div className="page-header">
          <div className="page-title">Registro de Calificaciones</div>
          <div className="page-sub">—</div>
        </div>
        <div className="card"><div className="card-body" style={{ textAlign: "center", padding: 40, color: "var(--gray-500)" }}>Configure actividades en Configuración antes de registrar notas.</div></div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Registro de Calificaciones</div>
        <div className="page-sub">{courseConfig.asignatura || "—"} · {students.length} estudiantes · {activities.length} actividades</div>
      </div>

      <div className="comp-bar" style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        {grouped.map(g => (
          <div key={g.comp} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".75rem" }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: COMPONENT_COLORS[g.comp] }} />
            <span style={{ color: "var(--gray-600)" }}>{g.comp} ({COMPONENT_LABELS[g.comp].split(" ")[0]})</span>
            <span style={{ color: "var(--gray-400)", fontSize: ".7rem" }}>{g.acts.length} acts</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">
          <div className="card-title">Progreso</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, marginLeft: 20 }}>
            <div className="progress-bar" style={{ flex: 1 }}>
              <div className="progress-fill" style={{ width: `${pct}%`, background: "var(--espoch-green)" }} />
            </div>
            <span style={{ fontSize: ".75rem", fontWeight: 600, color: "var(--gray-600)" }}>{pct}%</span>
            <span style={{ fontSize: ".72rem", color: "var(--gray-400)" }}>{totalEntered}/{totalExpected} notas</span>
          </div>
          <button className="btn btn-success btn-sm" onClick={persistGrades} disabled={saving}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
            {saving ? "Guardando…" : "Guardar"}
          </button>
          <button className="btn btn-primary btn-sm" onClick={exportGrades}>Exportar</button>
          <button className="btn btn-edit btn-sm" onClick={showQR}>QR</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ overflowX: "auto", maxHeight: "calc(100vh - 340px)", overflowY: "auto" }}>
          <table className="data" style={{ fontSize: ".78rem" }}>
            <thead>
              <tr>
                <th style={{ position: "sticky", top: 0, background: "var(--gray-50)", zIndex: 2, width: 40 }}>#</th>
                <th style={{ position: "sticky", top: 0, background: "var(--gray-50)", zIndex: 2, minWidth: 160 }}>Estudiante</th>
                {grouped.map(g => g.acts.map(a => (
                  <th key={a.id} style={{ position: "sticky", top: 0, background: `${COMPONENT_COLORS[g.comp]}10`, zIndex: 2, minWidth: 60, fontSize: ".7rem", fontWeight: 600, color: COMPONENT_COLORS[g.comp], textAlign: "center" }}>
                    {a.name}
                    <div style={{ fontWeight: 400, fontSize: ".65rem", color: "var(--gray-400)" }}>/ {a.maxScore}</div>
                  </th>
                )))}
                <th style={{ position: "sticky", top: 0, background: "var(--gray-50)", zIndex: 2, minWidth: 80, textAlign: "center" }}>Total</th>
                <th style={{ position: "sticky", top: 0, background: "var(--gray-50)", zIndex: 2, minWidth: 70, textAlign: "center" }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => {
                const tot = studentTotal(s.id);
                const passed = tot >= 7;
                return (
                  <tr key={s.id}>
                    <td style={{ color: "var(--gray-400)", textAlign: "center" }}>{idx + 1}</td>
                    <td style={{ fontWeight: 500, fontSize: ".76rem" }}>
                      <div>{s.apellidos} {s.nombres}</div>
                      <div style={{ fontSize: ".65rem", color: "var(--gray-400)", fontFamily: "var(--mono)" }}>{formatCed(s.cedula)}</div>
                    </td>
                    {grouped.map(g => g.acts.map(a => (
                      <td key={a.id} style={{ textAlign: "center", padding: "2px 4px" }}>
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          max={a.maxScore || 10}
                          style={{ width: 52, textAlign: "center", padding: "3px 4px", border: "1px solid var(--gray-200)", borderRadius: "var(--radius)", fontSize: ".78rem", fontFamily: "var(--mono)" }}
                          value={getGrade(s.id, a.id) ?? ""}
                          onChange={e => {
                            const v = e.target.value;
                            setGrade(s.id, a.id, v === "" ? null : parseFloat(v));
                          }}
                        />
                      </td>
                    )))}
                    <td style={{ textAlign: "center", fontWeight: 700, fontFamily: "var(--mono)", color: passed ? "var(--green)" : "var(--red)" }}>{tot.toFixed(2)}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`badge ${passed ? "badge-green" : "badge-red"}`} style={{ fontSize: ".68rem" }}>
                        {passed ? "✓ Aprobado" : "✗ Reprobado"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  function exportGrades() {
    const headerRow = `<tr><th rowspan="2">No.</th><th rowspan="2">Código</th><th rowspan="2">Cédula</th><th rowspan="2">Apellidos</th><th rowspan="2">Nombres</th>
      ${grouped.map(g => g.acts.map(() => `<th rowspan="2" style="font-size:9px">${g.comp}</th>`).join("")).join("")}
      <th rowspan="2" style="font-size:9px">Nota</th></tr>`;
    const rows = students.map((s, idx) => {
      const tot = studentTotal(s.id);
      const cols = `<td>${idx + 1}</td><td>${esc(s.codigo || "")}</td><td>${esc(formatCed(s.cedula))}</td><td>${esc(s.apellidos)}</td><td>${esc(s.nombres)}</td>
        ${grouped.map(g => g.acts.map(a => {
          const score = getGrade(s.id, a.id);
          return `<td style="text-align:center">${score != null ? score.toFixed(2) : "—"}</td>`;
        }).join("")).join("")}
        <td style="text-align:center;font-weight:700">${tot.toFixed(2)}</td>`;
      return `<tr>${cols}</tr>`;
    }).join("");
    const w = window.open("", "_blank", "width=1400,height=800");
    if (!w) { window.showToast?.("Permita ventanas emergentes.", "error"); return; }
    w.document.write(`<html><head><title>Calificaciones - ${esc(courseConfig.asignatura || "")}</title>
      <style>body{font-family:Inter,Arial,sans-serif;margin:14px;color:#111;font-size:11px}h1{font-size:16px;margin:0 0 4px}.sub{font-size:12px;color:#666;margin-bottom:10px}table{width:100%;border-collapse:collapse;font-size:10px}th,td{border:1px solid #bbb;padding:4px 5px;text-align:left}th{background:#f0f0f0;font-weight:600}</style></head><body>
      <h1>Registro de Calificaciones</h1>
      <div class="sub">${esc(courseConfig.carrera || "")} · ${esc(courseConfig.asignatura || "")} · ${esc(courseConfig.aporte || "")} · PAO ${courseConfig.pao || ""} · Total: ${students.length} estudiantes</div>
      <table><thead>${headerRow}</thead><tbody>${rows}</tbody></table>
      <p style="margin-top:12px;font-size:10px;color:#999">Total máximo: ${maxTotal.toFixed(1)} pts · Fecha: ${new Date().toLocaleString()}</p>
      </body></html>`);
    w.document.close(); w.focus(); w.print();
  }

  function showQR() {
    const actNames = activities.map(a => a.name);
    const allTotals = students.map(s => studentTotal(s.id));
    const avg = allTotals.length > 0 ? (allTotals.reduce((a, b) => a + b, 0) / allTotals.length).toFixed(2) : "—";
    const compHeaders = grouped.map(g => {
      if (g.acts.length === 0) return "";
      return `<th colspan="${g.acts.length}" style="background:#e8f5e9;font-size:10px">${g.comp}</th>`;
    }).join("");
    const actHeaders = activities.map(a =>
      `<th style="font-size:9px">${esc(a.name)}<br><span style="font-weight:400;color:#888">/${a.maxScore}</span></th>`
    ).join("");
    const tbodyRows = students.map((s, idx) => {
      const tot = studentTotal(s.id);
      const pass = tot >= 7;
      const cols = `<td>${idx + 1}</td><td>${esc(s.codigo || "")}</td><td>${esc(formatCed(s.cedula))}</td><td>${esc(s.apellidos)}</td><td>${esc(s.nombres)}</td>
        ${activities.map(a => {
          const score = getGrade(s.id, a.id);
          return `<td style="text-align:center">${score != null ? score.toFixed(2) : "—"}</td>`;
        }).join("")}
        <td style="text-align:center;font-weight:700">${tot.toFixed(2)}</td>
        <td style="text-align:center">${pass ? "✓" : "✗"}</td>`;
      return `<tr>${cols}</tr>`;
    }).join("");
    const qrData = `
      <div style="font-family:Inter,Arial,sans-serif;padding:20px;max-width:100%">
        <h2 style="font-size:18px;margin:0">${esc(courseConfig.asignatura || "")}</h2>
        <div style="font-size:13px;color:#666">${esc(courseConfig.carrera || "")} · PAO ${courseConfig.pao || ""} · ${esc(courseConfig.aporte || "")}</div>
        <div style="font-size:12px;color:#666;margin-bottom:12px">Docente: ${esc(courseConfig.docente || "")} · ${esc(courseConfig.periodoAcademico || "")}</div>
        <table style="width:100%;border-collapse:collapse;font-size:11px">
          <thead><tr><th rowspan="2">No.</th><th rowspan="2">Cod.</th><th rowspan="2">Cédula</th><th rowspan="2">Apellidos</th><th rowspan="2">Nombres</th>
          ${compHeaders}${actHeaders}<th rowspan="2">Nota</th><th rowspan="2">Est.</th></tr><tr>${actHeaders}</tr></thead>
          <tbody>${tbodyRows}</tbody>
        </table>
        <p style="margin-top:8px;font-size:11px;color:#999">Promedio: ${avg} · ${new Date().toLocaleString()}</p>
      </div>`;
    const w = window.open("", "_blank", "width=1400,height=800");
    if (!w) { window.showToast?.("Permita ventanas emergentes.", "error"); return; }
    w.document.write(`<html><head><title>QR - ${esc(courseConfig.asignatura || "")}</title>
      <style>body{margin:0}table{border-collapse:collapse}th,td{border:1px solid #ccc;padding:3px 4px;text-align:left}th{background:#f0f0f0}</style></head><body>${qrData}</body></html>`);
    w.document.close(); w.focus();
  }
}

function esc(s) { if (typeof s !== "string") return ""; const d = document.createElement("div"); d.appendChild(document.createTextNode(s)); return d.innerHTML; }
function formatCed(c) { if (!c) return "—"; const clean = c.replace(/-/g, ""); return clean.length === 10 ? `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}` : clean; }
