import { useApp } from "../store/AppContext";
import { DB_ESPOCH, DB_RACS_TI } from "../data/careerData";
import { useMemo, useState, useEffect } from "react";

export function CoordinacionDashboard() {
  const { state } = useApp();
  const configs = state.savedConfigs || [];
  const docentes = state.docentes || [];
  const assignments = state.teacherAssignments || [];

  return (
    <>
      <div className="page-header"><div className="page-title">Panel de Coordinación</div><div className="page-sub">Monitoreo de aplicación RAC/RAAU y mapeo curricular</div></div>
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 18 }}>
        {[
          { label: "Docentes", val: docentes.length, color: "var(--blue)" },
          { label: "Asignaciones", val: assignments.length, color: "var(--green)" },
          { label: "PAOs configurados", val: configs.length, color: "var(--amber)" },
          { label: "Estudiantes total", val: Object.values(state.studentsByConfig || {}).reduce((s, a) => s + (Array.isArray(a) ? a.length : 0), 0), color: "var(--purple)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: ".75rem", color: "var(--gray-400)" }}>{s.label}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: s.color, marginTop: 3 }}>{s.val}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Últimas configuraciones</div></div>
        <div className="card-body">
          {configs.length === 0 ? <div style={{ color: "var(--gray-400)", fontSize: ".82rem" }}>Sin configuraciones aún.</div> :
            configs.slice(0, 10).map(c => (
              <div key={c.id} className="item-row">
                <div style={{ flex: 1 }}>
                  <div className="item-name">{c.courseConfig?.asignatura || "—"}</div>
                  <div className="item-sub">{c.courseConfig?.carrera} · PAO {c.courseConfig?.pao} · {c.savedAt}</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

export function CoordAsignaturas() {
  const { state } = useApp();
  const assignments = state.teacherAssignments || [];
  const docentes = state.docentes || [];
  return (
    <>
      <div className="page-header"><div className="page-title">Asignaturas</div><div className="page-sub">Asignación docente y seguimiento por asignatura</div></div>
      <div className="card">
        <div className="card-header"><div className="card-title">Asignaciones ({assignments.length})</div></div>
        <div style={{ overflowX: "auto" }}>
          <table className="data">
            <thead><tr><th>Docente</th><th>Carrera</th><th>PAO</th><th>Asignatura</th><th>Cód. Materia</th></tr></thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--gray-400)", padding: 20 }}>Sin asignaciones.</td></tr>
              ) : assignments.map((a, i) => (
                <tr key={i}>
                  <td>{a.docenteEmail || "—"}</td>
                  <td>{a.carrera || "—"}</td>
                  <td>PAO {a.pao || "—"}</td>
                  <td>{a.asignatura || "—"}</td>
                  <td style={{ fontFamily: "var(--mono)", fontSize: ".78rem" }}>{a.codMateria || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function CoordRAC() {
  const racs = DB_RACS_TI;
  return (
    <>
      <div className="page-header"><div className="page-title">RAC</div><div className="page-sub">Resultados de Aprendizaje de la Carrera — Tecnologías de la Información</div></div>
      <div className="card">
        <div className="card-header"><div className="card-title">RAC — TI ({racs.length})</div></div>
        <div className="card-body">
          {racs.map(rac => (
            <div key={rac.id} className="item-row">
              <div style={{ minWidth: 50, fontWeight: 700, fontSize: ".85rem", color: "var(--navy)" }}>{rac.code}</div>
              <div style={{ flex: 1, fontSize: ".82rem", color: "var(--gray-700)" }}>{rac.description}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function CoordRAAU() {
  const { state } = useApp();
  const configs = state.savedConfigs || [];
  return (
    <>
      <div className="page-header"><div className="page-title">RAAU</div><div className="page-sub">Resultados de Aprendizaje de la Asignatura</div></div>
      {configs.flatMap(c => (c.raauEntries || [])).length === 0 ? (
        <div className="card"><div className="card-body" style={{ textAlign: "center", padding: 40, color: "var(--gray-500)" }}>No hay RAAU configurados en ninguna asignatura.</div></div>
      ) : configs.slice(0, 5).map(c => (
        <div key={c.id} className="card" style={{ marginBottom: 12 }}>
          <div className="card-header"><div className="card-title">{c.courseConfig?.asignatura} — PAO {c.courseConfig?.pao}</div></div>
          <div className="card-body">
            {(c.raauEntries || []).map((r, i) => (
              <div key={i} className="item-row">
                <div style={{ minWidth: 60, fontWeight: 700, fontSize: ".78rem", color: "var(--gray-700)" }}>{r.code}</div>
                <div style={{ flex: 1, fontSize: ".78rem", color: "var(--gray-600)" }}>{r.description}</div>
                <div style={{ fontSize: ".72rem", color: "var(--gray-400)" }}>RAC: {r.racId}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export function CoordDocentes() {
  const { state } = useApp();
  const docentes = state.docentes || [];
  const assignments = state.teacherAssignments || [];

  const docByEmail = {};
  docentes.forEach(d => { docByEmail[d.email] = d; });

  const grouped = {};
  assignments.forEach(a => {
    const key = a.docenteEmail || "unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(a);
  });

  return (
    <>
      <div className="page-header"><div className="page-title">Docentes por Asignatura</div><div className="page-sub">Monitoreo y matriz docente/asignaturas</div></div>
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 18 }}>
        {[
          { label: "Docentes", val: docentes.length, color: "var(--blue)" },
          { label: "Asignaciones", val: assignments.length, color: "var(--green)" },
          { label: "Asignaturas únicas", val: [...new Set(assignments.map(a => a.asignatura))].length, color: "var(--amber)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: ".75rem", color: "var(--gray-400)" }}>{s.label}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: s.color, marginTop: 3 }}>{s.val}</div>
          </div>
        ))}
      </div>
      {Object.entries(grouped).map(([email, asgs]) => {
        const doc = docByEmail[email];
        return (
          <div key={email} className="card" style={{ marginBottom: 12 }}>
            <div className="card-header">
              <div className="card-title">{doc?.name || doc?.nombre || email}</div>
              <span style={{ fontSize: ".75rem", color: "var(--gray-500)" }}>{asgs.length} asignación(es)</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="data" style={{ fontSize: ".78rem" }}>
                <thead><tr><th>Carrera</th><th>PAO</th><th>Asignatura</th><th>Cód. Materia</th></tr></thead>
                <tbody>{asgs.map((a, i) => (
                  <tr key={i}><td>{a.carrera || "—"}</td><td>PAO {a.pao || "—"}</td><td>{a.asignatura || "—"}</td><td style={{ fontFamily: "var(--mono)" }}>{a.codMateria || "—"}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        );
      })}
      {Object.keys(grouped).length === 0 && (
        <div className="card"><div className="card-body" style={{ textAlign: "center", padding: 40, color: "var(--gray-500)" }}>Sin asignaciones de docentes.</div></div>
      )}
    </>
  );
}
