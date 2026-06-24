import { useMemo } from "react";
import { useApp } from "../store/AppContext";

export default function DashboardPage() {
  const { state } = useApp();
  const { courseConfig, students, activities, grades, selectedRACIds, raauEntries, recentActivity, activeConfigId } = state;

  const totals = useMemo(() => {
    return students.map(s => {
      const sum = activities.reduce((acc, act) => {
        const g = (grades || []).find(x => x.studentId === s.id && x.activityId === act.id);
        return acc + (g?.score || 0);
      }, 0);
      return { student: s, total: sum };
    });
  }, [students, activities, grades]);

  const maxTotal = activities.reduce((s, a) => s + (a.maxScore || 0), 0);
  const approved = totals.filter(t => t.total >= 7).length;
  const failed = totals.filter(t => t.total > 0 && t.total < 7).length;
  const noGrade = totals.filter(t => t.total === 0).length;
  const avg = totals.length > 0 ? (totals.reduce((a, b) => a + b.total, 0) / totals.length).toFixed(2) : "—";

  if (!activeConfigId) {
    return (
      <>
        <div className="page-header">
          <div className="page-title">Panel Principal</div>
          <div className="page-sub">Seleccione o configure un PAO para comenzar.</div>
        </div>
        <div style={{ padding: 30, textAlign: "center", color: "var(--gray-500)", fontSize: ".9rem" }}>
          Seleccione un PAO desde MIS PAOs para comenzar.
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Panel Principal</div>
        <div className="page-sub">{courseConfig.asignatura || "Sin Asignatura"} — {courseConfig.periodoAcademico}</div>
      </div>
      <div className="course-banner">
        <div className="course-banner-fields">
          {["Carrera", "PAO", "Aporte", "Docente"].map((label, i) => {
            const keys = ["carrera", "pao", "aporte", "docente"];
            return (
              <div key={label} className="banner-field">
                <div className="lbl">{label}</div>
                <div className="val">{courseConfig[keys[i]] || "—"}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 18 }}>
        {[
          { title: "Estudiantes", value: students.length, sub: "Matriculados", color: "var(--espoch-red)" },
          { title: "Aprobados", value: approved, sub: "Nota ≥ 7.0", color: "var(--green)" },
          { title: "Reprobados", value: failed, sub: "Nota < 7.0", color: "var(--red)" },
          { title: "Promedio", value: avg, sub: `de ${maxTotal.toFixed(1)} pts`, color: "var(--amber)" },
        ].map(item => (
          <div key={item.title} className="stat-card animate-in">
            <div className="stat-row">
              <div>
                <div className="stat-label">{item.title}</div>
                <div className="stat-val" style={{ color: item.color }}>{item.value}</div>
                <div className="stat-sub">{item.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 320px", gap: 18, marginBottom: 18 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Distribución de Calificaciones</div></div>
          <div className="card-body">
            {totals.length > 0 ? (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 180, padding: "10px 0" }}>
                {[0, 1, 2, 3].map(i => {
                  const ranges = ["0-4", "5-6", "7-8", "9-10"];
                  const count = totals.filter(t => {
                    if (i === 0) return t.total < 5;
                    if (i === 1) return t.total >= 5 && t.total < 7;
                    if (i === 2) return t.total >= 7 && t.total < 9;
                    return t.total >= 9;
                  }).length;
                  const pct = totals.length > 0 ? (count / totals.length) * 180 : 0;
                  const colors = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6"];
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                      <div style={{ width: "100%", maxWidth: 60, height: Math.max(pct, 4), background: colors[i], borderRadius: "6px 6px 0 0", transition: "height .3s" }} />
                      <div style={{ fontSize: ".72rem", color: "var(--gray-500)", marginTop: 6 }}>{ranges[i]}</div>
                      <div style={{ fontSize: ".7rem", color: "var(--gray-400)" }}>{count}</div>
                    </div>
                  );
                })}
              </div>
            ) : <div style={{ color: "var(--gray-400)", textAlign: "center", padding: 20 }}>Sin datos</div>}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Notas por Estudiante</div></div>
          <div className="card-body" style={{ padding: 0, overflow: "auto", maxHeight: 220 }}>
            {totals.slice(0, 15).map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 12px", fontSize: ".75rem", borderBottom: "1px solid var(--gray-100)" }}>
                <span style={{ minWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.student.apellidos?.split(" ")[0]}
                </span>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div className="progress-fill" style={{ width: `${Math.min((t.total / Math.max(maxTotal, 1)) * 100, 100)}%`, background: t.total >= 7 ? "var(--green)" : "var(--red)" }} />
                </div>
                <span style={{ fontWeight: 700, color: t.total >= 7 ? "var(--green)" : "var(--red)" }}>{t.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Resumen</div></div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto" }}>
                <svg viewBox="0 0 32 32" style={{ transform: "rotate(-90deg)", width: 140, height: 140 }}>
                  {(() => {
                    const total = approved + failed + noGrade;
                    if (total === 0) return <circle r="14" cx="16" cy="16" fill="none" stroke="#e5e7eb" strokeWidth="4" />;
                    const a1 = (approved / total) * 100;
                    const a2 = (failed / total) * 100;
                    const r = 14, c = 2 * Math.PI * r;
                    const off1 = c * (1 - a1 / 100);
                    const off2 = c * (1 - (a1 + a2) / 100);
                    return (
                      <>
                        <circle r={r} cx="16" cy="16" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray={c} strokeDashoffset={off1} />
                        <circle r={r} cx="16" cy="16" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray={c} strokeDashoffset={off2} />
                        <circle r={r} cx="16" cy="16" fill="none" stroke="#9ca3af" strokeWidth="4" strokeDasharray={c} strokeDashoffset={0} />
                      </>
                    );
                  })()}
                </svg>
              </div>
              <div style={{ fontSize: ".8rem", color: "var(--gray-500)", marginTop: 8 }}>{students.length} estudiantes evaluados</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[["RAC seleccionados", selectedRACIds.length, "var(--blue)"], ["RAAU definidos", raauEntries.length, "var(--green)"], ["Actividades", activities.length, "var(--amber)"]].map(([label, val, color]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--gray-50)", borderRadius: "var(--radius)" }}>
                  <span style={{ fontSize: ".78rem", color: "var(--gray-600)" }}>{label}</span>
                  <span style={{ fontSize: "1rem", fontWeight: 700, color }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Progreso por Componente</div></div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {["ACD", "APEX", "AAUT"].map(comp => {
              const compActs = activities.filter(a => a.component === comp);
              const maxPts = compActs.reduce((s, a) => s + (a.maxScore || 0), 0);
              const weights = { ACD: 3.5, APEX: 3.5, AAUT: 3 };
              const colors = { ACD: "#3b82f6", APEX: "#22c55e", AAUT: "#f59e0b" };
              const weight = weights[comp] || 3.5;
              const pct = Math.min((maxPts / weight) * 100, 100);
              return (
                <div key={comp}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".78rem" }}>
                    <span style={{ color: colors[comp], fontWeight: 600 }}>{comp}</span>
                    <span style={{ color: "var(--gray-500)" }}>{maxPts.toFixed(1)} / {weight} pts ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%`, background: colors[comp] }} /></div>
                  <div style={{ fontSize: ".7rem", color: "var(--gray-400)", marginTop: 3 }}>{compActs.length} actividad{compActs.length !== 1 ? "es" : ""}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Actividad Reciente</div></div>
          <div className="card-body">
            {recentActivity?.length > 0 ? recentActivity.slice(0, 8).map((act, i) => (
              <div key={i} className="activity-item animate-in">
                <div className="activity-icon" style={{ background: act.type === "grade" ? "#f0fdf4" : act.type === "student" ? "#f5f3ff" : "#eff6ff", color: act.type === "grade" ? "var(--green)" : act.type === "student" ? "var(--purple)" : "var(--blue)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={act.type === "grade" ? "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01 9 11.01" : "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"} />
                  </svg>
                </div>
                <div className="activity-text">{act.text}</div>
                <div className="activity-time">{act.time}</div>
              </div>
            )) : <div style={{ textAlign: "center", padding: 20, color: "var(--gray-400)", fontSize: ".82rem" }}>Aún no hay actividad reciente</div>}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Nómina de Estudiantes</div></div>
        <div style={{ overflowX: "auto" }}>
          <table className="data">
            <thead><tr><th style={{ width: 40 }}>#</th><th>Estudiante</th><th>Nota</th><th>Estado</th></tr></thead>
            <tbody>
              {totals.slice(0, 10).map((t, i) => (
                <tr key={t.student.id}>
                  <td style={{ color: "var(--gray-400)" }}>{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: ".83rem" }}>{t.student.apellidos} {t.student.nombres}</div>
                    <div style={{ fontSize: ".72rem", color: "var(--gray-400)", fontFamily: "var(--mono)" }}>{t.student.cedula}</div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="progress-bar" style={{ width: 60 }}>
                        <div className="progress-fill" style={{ width: `${Math.min((t.total / Math.max(maxTotal, 1)) * 100, 100)}%`, background: t.total >= 7 ? "var(--green)" : "var(--red)" }} />
                      </div>
                      <span style={{ fontWeight: 700, color: t.total >= 7 ? "var(--green)" : "var(--red)", fontSize: ".83rem" }}>{t.total.toFixed(2)}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${t.total >= 7 ? "badge-green" : "badge-red"}`}>{t.total >= 7 ? "✓ Aprobado" : "✗ Reprobado"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
