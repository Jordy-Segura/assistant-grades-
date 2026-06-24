import { useState, useMemo, useCallback } from "react";
import { useApp } from "../store/AppContext";
import { DB_ESPOCH, EVAL_PROCEDURES, COMPONENT_WEIGHTS, COMPONENT_COLORS, COMPONENT_LABELS, COMPONENTS } from "../data/careerData";

const STEPS = ["Información", "RAC de la Carrera", "RAAU de la Asignatura", "Actividades"];

export default function ConfiguracionPage() {
  const { state, dispatch } = useApp();
  const { courseConfig, savedConfigs, currentUser, activeConfigId, editingConfigId } = state;

  const [step, setStep] = useState(0);
  const [dirty, setDirty] = useState({});

  const careerData = DB_ESPOCH[courseConfig.carrera];
  const RACS = (careerData && careerData.racs) || [];
  const isLocked = state.configLocked && !editingConfigId;

  const userConfigs = (savedConfigs || []).filter(c => c.ownerEmail === currentUser?.email);

  function updateCourseConfig(patch) {
    dispatch({ type: "SET_COURSE_CONFIG", payload: patch });
    setDirty({ ...dirty, ...patch });
  }

  function handleCarreraChange(carrera) {
    updateCourseConfig({ carrera, pao: "", asignatura: "" });
    dispatch({ type: "SET_SELECTED_RAC", payload: [] });
    dispatch({ type: "SET_RAAU_ENTRIES", payload: [] });
    dispatch({ type: "SET_ACTIVITIES", payload: [] });
  }

  function handlePaoChange(pao) {
    updateCourseConfig({ pao, asignatura: "" });
  }

  function getAsignaturas() {
    if (!courseConfig.carrera || !courseConfig.pao) return [];
    if (currentUser) {
      const asigns = (state.teacherAssignments || [])
        .filter(a => a.carrera === courseConfig.carrera && String(a.pao) === String(courseConfig.pao))
        .map(a => a.asignatura);
      return [...new Set(asigns)];
    }
    if (!careerData) return [];
    return careerData.malla[courseConfig.pao] || [];
  }

  function handleAsignaturaChange(asignatura) {
    updateCourseConfig({ asignatura });
    const asignaturaData = careerData?.asignaturas?.[asignatura];
    if (asignaturaData?.raau?.length) {
      const entries = asignaturaData.raau.map((r, i) => ({
        id: `raau_auto_${r.racId}_${r.code || i}`,
        code: r.code,
        description: r.description,
        racId: r.racId,
      }));
      dispatch({ type: "SET_RAAU_ENTRIES", payload: entries });
      const racIds = [...new Set(entries.map(e => e.racId))];
      dispatch({ type: "SET_SELECTED_RAC", payload: racIds });
    } else {
      dispatch({ type: "SET_RAAU_ENTRIES", payload: [] });
      dispatch({ type: "SET_SELECTED_RAC", payload: [] });
    }
    dispatch({ type: "SET_ACTIVITIES", payload: [] });
  }

  function toggleRAC(racId) {
    const current = state.selectedRACIds;
    const next = current.includes(racId) ? current.filter(id => id !== racId) : [...current, racId];
    dispatch({ type: "SET_SELECTED_RAC", payload: next });
    regenerateRAAU(next);
  }

  function regenerateRAAU(selectedRacIds) {
    if (selectedRacIds.length === 0) {
      dispatch({ type: "SET_RAAU_ENTRIES", payload: [] });
      return;
    }
    const mapped = careerData?.asignaturas?.[courseConfig.asignatura]?.raau || [];
    const generated = [];
    selectedRacIds.forEach((racId, idx) => {
      const byRac = mapped.filter(m => m.racId === racId);
      if (byRac.length > 0) {
        byRac.forEach((m, i) => {
          generated.push({ id: `raau_auto_${racId}_${m.code || i}`, code: m.code || `RAAU${generated.length + 1}`, description: m.description, racId });
        });
      } else {
        const rac = RACS.find(r => r.id === racId);
        generated.push({ id: `raau_auto_${racId}_${idx}`, code: `RAAU${generated.length + 1}`, description: `Resultado asociado a ${rac?.code || `RAC ${idx + 1}`}`, racId });
      }
    });
    dispatch({ type: "SET_RAAU_ENTRIES", payload: generated });
  }

  function addRAAU() {
    const newCode = `RAAU${(state.raauEntries.length + 1)}`;
    const selected = state.selectedRACIds;
    if (selected.length === 0) return;
    const firstRac = RACS.find(r => r.id === selected[0]);
    const entry = { id: `raau_${Date.now()}`, code: newCode, description: "", racId: firstRac?.id || selected[0] };
    dispatch({ type: "SET_RAAU_ENTRIES", payload: [...state.raauEntries, entry] });
  }

  function updateRAAU(idx, patch) {
    const list = [...state.raauEntries];
    list[idx] = { ...list[idx], ...patch };
    dispatch({ type: "SET_RAAU_ENTRIES", payload: list });
  }

  function removeRAAU(idx) {
    const list = state.raauEntries.filter((_, i) => i !== idx);
    dispatch({ type: "SET_RAAU_ENTRIES", payload: list });
  }

  function addActivity(comp) {
    if (state.raauEntries.length === 0 || state.selectedRACIds.length === 0) return;
    const currentTotal = state.activities.filter(a => a.component === comp).reduce((s, a) => s + (a.maxScore || 0), 0);
    const remaining = COMPONENT_WEIGHTS[comp] - currentTotal;
    if (remaining <= 0) return;
    const firstRaau = state.raauEntries[0];
    const firstRac = RACS.find(r => state.selectedRACIds.includes(r.id));
    const act = {
      id: `act_${Date.now()}`,
      name: "",
      component: comp,
      maxScore: Math.min(1, remaining),
      racId: firstRaau?.racId || firstRac?.id || "",
      raauId: firstRaau?.id || "",
      procedureId: (EVAL_PROCEDURES[comp] || [])[0]?.id || "",
    };
    dispatch({ type: "SET_ACTIVITIES", payload: [...state.activities, act] });
  }

  function updateActivity(id, patch) {
    const list = state.activities.map(a => a.id === id ? { ...a, ...patch } : a);
    dispatch({ type: "SET_ACTIVITIES", payload: list });
  }

  function removeActivity(id) {
    dispatch({ type: "SET_ACTIVITIES", payload: state.activities.filter(a => a.id !== id) });
  }

  function validate() {
    const issues = [];
    if (!courseConfig.carrera) issues.push("Seleccione una carrera.");
    if (!courseConfig.pao) issues.push("Seleccione un PAO.");
    if (!courseConfig.asignatura) issues.push("Seleccione una asignatura.");
    if (!courseConfig.periodoAcademico) issues.push("Ingrese el período académico.");
    if (state.selectedRACIds.length === 0) issues.push("Seleccione al menos un RAC.");
    if (state.raauEntries.length === 0) issues.push("Configure al menos un RAAU.");
    COMPONENTS.forEach(comp => {
      const acts = state.activities.filter(a => a.component === comp);
      const total = acts.reduce((s, a) => s + (a.maxScore || 0), 0);
      if (acts.length < 2) issues.push(`${comp}: requiere ≥2 actividades (tiene ${acts.length})`);
      const diff = Math.abs(total - COMPONENT_WEIGHTS[comp]);
      if (diff > 0.01) {
        issues.push(`${comp}: suma ${total.toFixed(1)}/${COMPONENT_WEIGHTS[comp].toFixed(1)} (${total > COMPONENT_WEIGHTS[comp] ? "excede" : "faltan"} ${diff.toFixed(1)} pts)`);
      }
    });
    return issues;
  }

  function handleSave() {
    const issues = validate();
    if (issues.length > 0) {
      window.showToast?.(issues[0], "error");
      return;
    }
    const snapshot = {
      id: editingConfigId || activeConfigId || "",
      courseConfig: { ...courseConfig },
      selectedRACIds: [...state.selectedRACIds],
      raauEntries: [...state.raauEntries],
      activities: [...state.activities],
      ownerEmail: currentUser?.email || "",
    };
    dispatch({ type: "SAVE_CONFIG", payload: snapshot });
    dispatch({ type: "ADD_RECENT_ACTIVITY", payload: { text: `Configuración guardada: ${courseConfig.asignatura}`, type: "config" } });
    dispatch({ type: "SET_EDITING_CONFIG_ID", payload: "" });
    setStep(0);
    window.showToast?.("Configuración guardada correctamente.", "success");
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Configuración</div>
        <div className="page-sub">Configure los parámetros de la asignatura, RAC, RAAU y actividades</div>
      </div>
      <div id="cfg-wizard">
        <div className="stepper">
          {STEPS.map((label, i) => {
            const cls = i < step ? "done" : i === step ? "active" : "pending";
            return (
              <div key={i} className="step-item" onClick={() => i < step && setStep(i)} style={{ cursor: i < step ? "pointer" : "default" }}>
                <div className={`step-dot ${cls}`}>{i < step ? "✓" : i + 1}</div>
                <span className={`step-label ${cls}`}>{label}</span>
                {i < STEPS.length - 1 && <div className={`step-line${i < step ? " done" : ""}`} />}
              </div>
            );
          })}
        </div>

        {step === 0 && (
          <div className="card">
            <div className="card-header"><div className="card-title">Información de la Asignatura</div></div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Período Académico</label>
                  <input className="form-input" value={courseConfig.periodoAcademico} onChange={e => updateCourseConfig({ periodoAcademico: e.target.value })} placeholder="Ej: SEPTIEMBRE 2025 - FEBRERO 2026" />
                </div>
                <div className="form-group">
                  <label className="form-label">Facultad / Sede</label>
                  <input className="form-input" value={courseConfig.facultad || "SEDE ORELLANA"} readOnly />
                </div>
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Carrera</label>
                  <select className="form-select" value={courseConfig.carrera} onChange={e => handleCarreraChange(e.target.value)}>
                    <option value="">-- Seleccione la carrera --</option>
                    {Object.keys(DB_ESPOCH).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">PAO (Semestre)</label>
                  <select className="form-select" value={courseConfig.pao} onChange={e => handlePaoChange(e.target.value)} disabled={!courseConfig.carrera}>
                    <option value="">-- Seleccione PAO --</option>
                    {careerData && (() => {
                      const paos = currentUser
                        ? [...new Set((state.teacherAssignments || []).filter(a => a.carrera === courseConfig.carrera).map(a => String(a.pao)))]
                        : ["NIVELACIÓN", ...Array.from({ length: careerData.maxPao || 8 }, (_, i) => String(i + 1))];
                      return paos.map(p => <option key={p} value={p}>PAO {p}</option>);
                    })()}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Asignatura</label>
                  <select className="form-select" value={courseConfig.asignatura} onChange={e => handleAsignaturaChange(e.target.value)} disabled={!courseConfig.pao}>
                    <option value="">-- Seleccione Asignatura --</option>
                    {getAsignaturas().map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Docente</label>
                  <input className="form-input" value={courseConfig.docente} onChange={e => updateCourseConfig({ docente: e.target.value })} placeholder="Nombre del docente" />
                </div>
                <div className="form-group">
                  <label className="form-label">Aporte / Corte</label>
                  <select className="form-select" value={courseConfig.aporte} onChange={e => updateCourseConfig({ aporte: e.target.value })}>
                    <option value="MEDIO CICLO">MEDIO CICLO</option>
                    <option value="FIN DE CICLO">FIN DE CICLO</option>
                    <option value="RECUPERACIÓN">RECUPERACIÓN</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="card">
            <div className="card-header"><div className="card-title">Resultados de Aprendizaje de la Carrera (RAC)</div></div>
            <div className="card-body">
              <div className="info-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                <p>Seleccione los RAC que se trabajarán en esta asignatura.</p>
              </div>
              <div style={{ fontSize: ".85rem", fontWeight: 600, color: "var(--navy)", marginBottom: 12 }}>
                RAC disponibles — Carrera: {courseConfig.carrera || "—"}
              </div>
              {RACS.length === 0 ? (
                <div className="info-box" style={{ background: "#fee2e2", borderColor: "#fca5a5" }}><p style={{ color: "#991b1b" }}>No hay RACs configurados para esta carrera.</p></div>
              ) : (
                RACS.map(rac => {
                  const selected = state.selectedRACIds.includes(rac.id);
                  return (
                    <div key={rac.id} className={`rac-card${selected ? " selected" : ""}`} onClick={() => toggleRAC(rac.id)}>
                      <div className="rac-checkbox">
                        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <div>
                        <div className="rac-code">{rac.code}</div>
                        <div className="rac-desc">{rac.description}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <div className="card-header"><div className="card-title">Resultados de Aprendizaje de la Asignatura (RAAU)</div></div>
            <div className="card-body">
              <div className="info-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                <p>Los RAAU se cargan automáticamente desde RAC. Puede editarlos o agregar más.</p>
              </div>
              <div id="cfg-selected-summary" style={{ marginBottom: 12 }}>
                {state.selectedRACIds.length === 0 ? (
                  <div className="selected-box muted">Seleccione RAC para generar RAAU automáticamente.</div>
                ) : (
                  <div className="selected-box">
                    <div><strong>RAC seleccionados:</strong> {state.selectedRACIds.map(id => { const r = RACS.find(r => r.id === id); return <span key={id} className="sel-chip">{r?.code || id}</span>; })}</div>
                    <div style={{ marginTop: 8 }}><strong>RAAU generados:</strong> {state.raauEntries.length > 0 ? state.raauEntries.map((e, i) => <span key={i} className="sel-chip secondary">{e.code}</span>) : <span style={{ color: "var(--gray-400)" }}>—</span>}</div>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: ".85rem", fontWeight: 600, color: "var(--navy)" }}>RAAU definidos</span>
                <button className="btn btn-sm btn-primary" onClick={addRAAU} disabled={state.selectedRACIds.length === 0}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> Agregar RAAU
                </button>
              </div>
              {state.raauEntries.length === 0 ? (
                <p style={{ fontSize: ".8rem", color: "var(--gray-500)", textAlign: "center", padding: 20 }}>No hay RAAU definidos. Seleccione la asignatura correcta en el Paso 1.</p>
              ) : (
                state.raauEntries.map((entry, i) => {
                  const rac = RACS.find(r => r.id === entry.racId);
                  return (
                    <div key={entry.id || i} className="item-row" style={{ flexDirection: "column", gap: 6, padding: 12 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", width: "100%" }}>
                        <div style={{ flex: 1 }}>
                          <input className="form-input" style={{ fontSize: ".78rem", fontWeight: 700, padding: "4px 8px", width: 100 }} value={entry.code} onChange={e => updateRAAU(i, { code: e.target.value })} />
                          <textarea className="form-input" style={{ fontSize: ".78rem", marginTop: 4, padding: "4px 8px", resize: "vertical" }} rows={2} value={entry.description} onChange={e => updateRAAU(i, { description: e.target.value })} />
                          <select className="form-select" style={{ fontSize: ".72rem", marginTop: 4, padding: "4px 8px", width: "auto" }} value={entry.racId} onChange={e => updateRAAU(i, { racId: e.target.value })}>
                            {state.selectedRACIds.map(rid => { const r = RACS.find(rr => rr.id === rid); return <option key={rid} value={rid}>{r?.code || rid}</option>; })}
                          </select>
                        </div>
                        <button className="btn btn-danger btn-sm" onClick={() => removeRAAU(i)} title="Eliminar">Eliminar</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card">
            <div className="card-header"><div className="card-title">Actividades de Evaluación</div></div>
            <div className="card-body">
              <div className="info-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                <p>Nota sobre 10: ACD (3.5 pts) + APEX (3.5 pts) + AAUT (3.0 pts). Se requieren al menos 2 actividades por componente.</p>
              </div>
              <div id="cfg-activities-panels">
                {COMPONENTS.map(comp => {
                  const acts = state.activities.filter(a => a.component === comp);
                  const color = COMPONENT_COLORS[comp];
                  const totalMax = acts.reduce((s, a) => s + (a.maxScore || 0), 0);
                  const weight = COMPONENT_WEIGHTS[comp];
                  const remaining = weight - totalMax;
                  return (
                    <div key={comp} style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div>
                          <span style={{ fontWeight: 700, color, fontSize: ".85rem" }}>{comp}</span>
                          <span style={{ fontSize: ".75rem", color: "var(--gray-500)", marginLeft: 8 }}>{COMPONENT_LABELS[comp]}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: ".72rem", color: remaining < 0 ? "var(--red)" : "var(--gray-400)" }}>{remaining.toFixed(1)} pts disponibles</span>
                          <button className="btn btn-sm" style={{ background: `${color}15`, color }} onClick={() => addActivity(comp)} disabled={state.raauEntries.length === 0 || remaining <= 0}>Agregar</button>
                        </div>
                      </div>
                      <div id={`acts-${comp}`}>
                        {acts.map(act => {
                          const raauEntry = state.raauEntries.find(r => r.id === act.raauId);
                          const rac = RACS.find(r => r.id === (raauEntry?.racId || act.racId));
                          const procedure = (EVAL_PROCEDURES[comp] || []).find(p => p.id === act.procedureId);
                          return (
                            <div key={act.id} className="item-row" style={{ flexDirection: "column", gap: 6, padding: 12 }}>
                              <div style={{ display: "flex", gap: 8, width: "100%", alignItems: "flex-start" }}>
                                <span className="comp-pill" style={{ background: `${color}15`, color, whiteSpace: "nowrap" }}>{comp}</span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    <input className="form-input" style={{ flex: 2, fontSize: ".82rem", padding: "4px 8px" }} value={act.name} placeholder="Nombre de la actividad"
                                      onChange={e => updateActivity(act.id, { name: e.target.value })} />
                                    <input className="form-input" type="number" step="0.5" min="0.1" max={weight} style={{ width: 70, fontSize: ".82rem", padding: "4px 8px" }} value={act.maxScore}
                                      onChange={e => updateActivity(act.id, { maxScore: parseFloat(e.target.value) || 0 })} />
                                    <select className="form-select" style={{ fontSize: ".72rem", padding: "4px 8px", width: 80 }} value={act.raauId}
                                      onChange={e => {
                                        const raau = state.raauEntries.find(r => r.id === e.target.value);
                                        updateActivity(act.id, { raauId: e.target.value, racId: raau?.racId || "" });
                                      }}>
                                      {state.raauEntries.map(r => <option key={r.id} value={r.id}>{r.code}</option>)}
                                    </select>
                                    <select className="form-select" style={{ fontSize: ".72rem", padding: "4px 8px", width: 100 }} value={act.procedureId}
                                      onChange={e => updateActivity(act.id, { procedureId: e.target.value })}>
                                      {(EVAL_PROCEDURES[comp] || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <button className="btn btn-danger btn-sm" onClick={() => removeActivity(act.id)} title="Eliminar">Eliminar</button>
                                  </div>
                                  <div style={{ fontSize: ".72rem", color: "var(--gray-400)", marginTop: 4 }}>
                                    Max: {act.maxScore?.toFixed(1) || "0"} pts | RAAU: {raauEntry?.code || "—"} | RAC: {rac?.code || "—"} | Proc: {procedure?.name || "—"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {acts.length === 0 && <div style={{ fontSize: ".78rem", color: "var(--gray-400)", padding: 10 }}>Sin actividades para {comp}.</div>}
                    </div>
                  );
                })}
              </div>
              {state.activities.length > 0 && (
                <div id="cfg-activities-summary" style={{ marginTop: 16, padding: 14, background: "var(--gray-50)", borderRadius: "var(--radius)" }}>
                  <div style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: 8 }}>Resumen de Actividades</div>
                  {COMPONENTS.map(comp => {
                    const acts = state.activities.filter(a => a.component === comp);
                    const total = acts.reduce((s, a) => s + (a.maxScore || 0), 0);
                    const expected = COMPONENT_WEIGHTS[comp];
                    const pct = Math.round((total / expected) * 100);
                    return (
                      <div key={comp} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: "white", border: "1px solid var(--gray-200)", borderRadius: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: ".76rem", color: "var(--gray-600)" }}>{comp}: {acts.length} actividades</span>
                        <span style={{ fontSize: ".75rem", fontWeight: 700, color: COMPONENT_COLORS[comp] }}>{total.toFixed(1)}/{expected} pts ({Math.min(pct, 100)}%)</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={() => setStep(s => Math.max(0, s - 1))} style={{ display: step > 0 ? "" : "none" }}>← Anterior</button>
          <div />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={() => { if (step === 3) handleSave(); else setStep(s => Math.min(3, s + 1)); }}>
              {step < 3 ? "Siguiente →" : "Guardar para finalizar"}
            </button>
          </div>
        </div>

        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-header"><div className="card-title">Configuraciones guardadas</div></div>
          <div className="card-body">
            {userConfigs.length === 0 ? (
              <div style={{ fontSize: ".8rem", color: "var(--gray-500)" }}>Aún no existen configuraciones guardadas.</div>
            ) : (
              userConfigs.map(cfg => {
                const acts = cfg.activities?.length || 0;
                const raau = cfg.raauEntries?.length || 0;
                const isActive = cfg.id === activeConfigId;
                return (
                  <div key={cfg.id} className={`saved-config-item${isActive ? " active" : ""}`}>
                    <div style={{ flex: 1 }}>
                      <div className="saved-config-title">
                        {cfg.courseConfig?.asignatura || "Sin asignatura"}
                        {isActive && <span style={{ fontSize: ".7rem", color: "var(--espoch-green)", fontWeight: 600 }}> (Activo)</span>}
                      </div>
                      <div className="saved-config-sub">
                        {cfg.courseConfig?.carrera || "—"} · PAO {cfg.courseConfig?.pao || "—"} · {acts} actividades · {raau} RAAU · {cfg.savedAt || ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-sm btn-success" onClick={() => dispatch({ type: "ACTIVATE_CONFIG", payload: cfg.id })}>Activar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => { if (confirm("¿Eliminar configuración?")) dispatch({ type: "DELETE_CONFIG", payload: cfg.id }); }}>Eliminar</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
