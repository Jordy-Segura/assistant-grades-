import { useMemo } from "react";
import { useApp } from "../store/AppContext";
import { COMPONENTS, COMPONENT_COLORS, COMPONENT_LABELS, COMPONENT_WEIGHTS } from "../data/careerData";

export default function ReportePage() {
  const { state } = useApp();
  const { activeConfigId, courseConfig, students, activities, grades } = state;

  const maxTotal = activities.reduce((s, a) => s + (a.maxScore || 0), 0);

  function getGrade(sid, aid) {
    const g = (grades || []).find(x => x.studentId === sid && x.activityId === aid);
    return g?.score;
  }

  function studentTotal(sid) {
    return activities.reduce((sum, act) => sum + (getGrade(sid, act.id) || 0), 0);
  }

  const grouped = COMPONENTS.map(comp => ({
    comp,
    acts: activities.filter(a => a.component === comp),
  }));

  const totals = students.map(s => ({ student: s, total: studentTotal(s.id) }));
  const approved = totals.filter(t => t.total >= 7).length;
  const failed = totals.filter(t => t.total > 0 && t.total < 7).length;
  const noGrade = totals.filter(t => t.total === 0).length;
  const avg = totals.length > 0 ? (totals.reduce((a, b) => a + b.total, 0) / totals.length).toFixed(2) : "—";

  function printReport() {
    const compRows = students.map(s => {
      const tot = studentTotal(s.id);
      return `<tr>
        <td>${esc(s.codigo || "")}</td><td>${esc(formatCed(s.cedula))}</td><td>${esc(s.apellidos)}</td><td>${esc(s.nombres)}</td>
        ${grouped.map(g => {
          const compActs = g.acts;
          const compTotal = compActs.reduce((sum, a) => sum + (getGrade(s.id, a.id) || 0), 0);
          return `<td style="text-align:center;font-weight:600">${compTotal.toFixed(2)}</td>`;
        }).join("")}
        <td style="text-align:center;font-weight:700">${tot.toFixed(2)}</td>
        <td style="text-align:center">${tot >= 7 ? "✓" : "✗"}</td>
      </tr>`;
    }).join("");

    const w = window.open("", "_blank", "width=1400,height=800");
    if (!w) return;
    w.document.write(`<html><head><title>Reporte - ${esc(courseConfig.asignatura || "")}</title>
      <style>
        body{font-family:Inter,Arial,sans-serif;margin:20px;color:#111;font-size:11px}
        .header{text-align:center;margin-bottom:16px;border-bottom:2px solid #003366;padding-bottom:12px}
        .header h1{font-size:20px;color:#003366;margin:0 0 4px}
        .header .sub{font-size:12px;color:#666}
        table{width:100%;border-collapse:collapse;font-size:10px;page-break-inside:auto}
        th,td{border:1px solid #aaa;padding:4px 5px;text-align:left}
        th{background:#003366;color:white;font-weight:600;font-size:9px}
        .footer{text-align:center;font-size:10px;color:#999;margin-top:16px;border-top:1px solid #ddd;padding-top:8px}
      </style></head><body>
      <div class="header">
        <h1>ESPOCH · Sede Orellana</h1>
        <div style="font-size:14px;font-weight:600">Reporte Final de Calificaciones</div>
        <div class="sub">${esc(courseConfig.carrera || "")} · ${esc(courseConfig.asignatura || "")} · PAO ${courseConfig.pao || ""} · ${esc(courseConfig.aporte || "")}</div>
        <div class="sub">Docente: ${esc(courseConfig.docente || "")} · ${esc(courseConfig.periodoAcademico || "")}</div>
      </div>
      <table>
        <thead><tr>
          <th>Código</th><th>Cédula</th><th>Apellidos</th><th>Nombres</th>
          ${grouped.map(g => `<th>${g.comp}</th>`).join("")}
          <th>Nota Final</th><th>Estado</th>
        </tr></thead>
        <tbody>${compRows}</tbody>
      </table>
      <div class="footer">
        <p>Aprobados: ${approved} · Reprobados: ${failed} · Sin nota: ${noGrade} · Promedio: ${avg} · Total máximo: ${maxTotal.toFixed(1)} pts</p>
        <p>Fecha de emisión: ${new Date().toLocaleString()} · Escuela Superior Politécnica de Chimborazo</p>
      </div>
      </body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 300);
  }

  if (!activeConfigId) {
    return (
      <>
        <div className="page-header">
          <div className="page-title">Reporte Final</div>
          <div className="page-sub">Seleccione un PAO para ver el reporte.</div>
        </div>
        <div className="card"><div className="card-body" style={{ textAlign: "center", padding: 40, color: "var(--gray-500)" }}>Seleccione o configure un PAO desde Configuración.</div></div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="page-title">Reporte Final</div>
            <div className="page-sub">Evaluación formativa y sumativa para alcanzar los resultados de aprendizaje</div>
          </div>
          <button className="btn btn-primary" onClick={printReport} disabled={students.length === 0}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
            Imprimir reporte detallado
          </button>
        </div>
      </div>
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 18 }}>
        {[
          { label: "Estudiantes", value: students.length, color: "var(--espoch-red)" },
          { label: "Aprobados", value: approved, color: "var(--green)" },
          { label: "Reprobados", value: failed, color: "var(--red)" },
          { label: "Promedio", value: avg, color: "var(--amber)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: ".75rem", color: "var(--gray-400)" }}>{s.label}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: s.color, marginTop: 3 }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="rep-layout">
        <div className="card">
          <div className="card-header"><div className="card-title">Reporte Detallado</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data" style={{ fontSize: ".78rem" }}>
              <thead>
                <tr>
                  <th>Código</th><th>Cédula</th><th>Apellidos</th><th>Nombres</th>
                  {grouped.map(g => <th key={g.comp} style={{ color: COMPONENT_COLORS[g.comp], textAlign: "center" }}>{g.comp}</th>)}
                  <th style={{ textAlign: "center" }}>Nota Final</th><th style={{ textAlign: "center" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {totals.length === 0 ? (
                  <tr><td colSpan={grouped.length + 5} style={{ textAlign: "center", color: "var(--gray-400)", padding: 28 }}>Sin datos de estudiantes.</td></tr>
                ) : (
                  totals.map(t => {
                    const passed = t.total >= 7;
                    return (
                      <tr key={t.student.id}>
                        <td style={{ fontFamily: "var(--mono)", fontSize: ".72rem" }}>{t.student.codigo || "—"}</td>
                        <td style={{ fontFamily: "var(--mono)", fontSize: ".72rem" }}>{formatCed(t.student.cedula)}</td>
                        <td>{t.student.apellidos}</td><td>{t.student.nombres}</td>
                        {grouped.map(g => {
                          const compActs = g.acts;
                          const compTotal = compActs.reduce((sum, a) => sum + (getGrade(t.student.id, a.id) || 0), 0);
                          return <td key={g.comp} style={{ textAlign: "center", fontWeight: 600 }}>{compTotal.toFixed(2)}</td>;
                        })}
                        <td style={{ textAlign: "center", fontWeight: 700, color: passed ? "var(--green)" : "var(--red)" }}>{t.total.toFixed(2)}</td>
                        <td style={{ textAlign: "center" }}><span className={`badge ${passed ? "badge-green" : "badge-red"}`}>{passed ? "✓ Aprobado" : "✗ Reprobado"}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="card-header"><div className="card-title">Distribución</div></div>
            <div className="card-body">
              {totals.length > 0 ? (
                <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 120, padding: "10px 0" }}>
                  {[
                    { label: "0-4", count: totals.filter(t => t.total < 5).length, color: "#ef4444" },
                    { label: "5-6", count: totals.filter(t => t.total >= 5 && t.total < 7).length, color: "#f59e0b" },
                    { label: "7-8", count: totals.filter(t => t.total >= 7 && t.total < 9).length, color: "#22c55e" },
                    { label: "9-10", count: totals.filter(t => t.total >= 9).length, color: "#3b82f6" },
                  ].map(b => {
                    const pct = totals.length > 0 ? (b.count / totals.length) * 120 : 0;
                    return (
                      <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                        <div style={{ fontSize: ".7rem", color: "var(--gray-500)", marginBottom: 2 }}>{b.count}</div>
                        <div style={{ width: "100%", maxWidth: 50, height: Math.max(pct, 4), background: b.color, borderRadius: "4px 4px 0 0" }} />
                        <div style={{ fontSize: ".7rem", color: "var(--gray-400)", marginTop: 4 }}>{b.label}</div>
                      </div>
                    );
                  })}
                </div>
              ) : <div style={{ color: "var(--gray-400)", textAlign: "center", padding: 20 }}>Sin datos</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function esc(s) { if (typeof s !== "string") return ""; const d = document.createElement("div"); d.appendChild(document.createTextNode(s)); return d.innerHTML; }
function formatCed(c) { if (!c) return "—"; const clean = c.replace(/-/g, ""); return clean.length === 10 ? `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}` : clean; }
