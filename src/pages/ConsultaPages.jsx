import { useState, useEffect } from "react";
import { useApp } from "../store/AppContext";
import * as oasis from "../services/oasisApi";
import { DB_ESPOCH } from "../data/careerData";

export function ConsultaSede() {
  const { state } = useApp();
  const [carrera, setCarrera] = useState("");
  const [pao, setPao] = useState("");
  const [materias, setMaterias] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(false);

  const careerData = DB_ESPOCH[carrera];

  useEffect(() => { setPao(""); setMaterias([]); setDocentes([]); }, [carrera]);

  useEffect(() => {
    if (!carrera || !pao) { setMaterias([]); return; }
    const m = (careerData?.malla?.[pao]) || [];
    setMaterias(m);
  }, [carrera, pao]);

  async function loadDocentes() {
    setLoading(true);
    try {
      const d = await oasis.getDocentesCarrera({ carrera, facultad: "SEDE ORELLANA", codCarrera: "" });
      setDocentes(Array.isArray(d?.docentes) ? d.docentes : []);
    } catch { setDocentes([]); }
    finally { setLoading(false); }
  }

  return (
    <>
      <div className="page-header"><div className="page-title">Sede Orellana</div><div className="page-sub">Explorador académico por carrera, PAO, materias y docentes</div></div>
      <div className="form-grid-3" style={{ marginBottom: 18 }}>
        <div className="form-group"><label className="form-label">Carrera</label>
          <select className="form-select" value={carrera} onChange={e => setCarrera(e.target.value)}>
            <option value="">-- Seleccione --</option>
            {Object.keys(DB_ESPOCH).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">PAO</label>
          <select className="form-select" value={pao} onChange={e => setPao(e.target.value)} disabled={!carrera}>
            <option value="">-- PAO --</option>
            {careerData && ["NIVELACIÓN", ...Array.from({ length: careerData.maxPao || 8 }, (_, i) => String(i + 1))].map(p => <option key={p} value={p}>PAO {p}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label"> </label>
          <button className="btn btn-edit" onClick={loadDocentes} disabled={loading || !carrera}>{loading ? "Cargando…" : "Cargar docentes"}</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Materias ({materias.length})</div></div>
          <div className="card-body">
            {materias.length === 0 ? <div style={{ color: "var(--gray-400)", fontSize: ".82rem" }}>Seleccione carrera y PAO.</div> :
              materias.map((m, i) => <div key={i} className="item-row"><span className="item-name">{m}</span></div>)
            }
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Docentes ({docentes.length})</div></div>
          <div className="card-body">
            {docentes.length === 0 ? <div style={{ color: "var(--gray-400)", fontSize: ".82rem" }}>{carrera ? "Presione 'Cargar docentes'" : "Seleccione una carrera."}</div> :
              docentes.map((d, i) => (
                <div key={i} className="item-row">
                  <div style={{ flex: 1 }}>
                    <div className="item-name">{d.nombre || d.name || "—"}</div>
                    <div className="item-sub">{d.email || d.cedula || "—"}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </>
  );
}

export function ConsultaInfo() {
  const [periodo, setPeriodo] = useState(null);
  const [carreras, setCarreras] = useState([]);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    oasis.getPeriodoActual().then(p => setPeriodo(p)).catch(() => {});
    oasis.getCarreras().then(c => setCarreras(Array.isArray(c) ? c : [])).catch(() => {});
    oasis.checkHealth().then(h => setHealth(h)).catch(() => {});
    oasis.catalogoHealth().then(h => setHealth(prev => ({ ...prev, v1: h }))).catch(() => {});
  }, []);

  return (
    <>
      <div className="page-header"><div className="page-title">Información General</div><div className="page-sub">Período actual, carreras activas y estado del sistema</div></div>
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 18 }}>
        <div className="card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: ".75rem", color: "var(--gray-400)" }}>Período Actual</div>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--gray-800)", marginTop: 3 }}>{periodo?.descripcion || "—"}</div>
          {periodo?.fechaInicio && <div style={{ fontSize: ".72rem", color: "var(--gray-400)", marginTop: 4 }}>{periodo.fechaInicio} → {periodo.fechaFin}</div>}
        </div>
        <div className="card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: ".75rem", color: "var(--gray-400)" }}>Carreras Activas (OASIS)</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--green)", marginTop: 3 }}>{carreras.length}</div>
        </div>
        <div className="card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: ".75rem", color: "var(--gray-400)" }}>BFF (OASIS API)</div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: health ? "var(--green)" : "var(--red)", marginTop: 3 }}>{health ? "Conectado" : "Desconectado"}</div>
          {health?.v1 && <div style={{ fontSize: ".72rem", color: "var(--gray-400)", marginTop: 4 }}>Catálogo v1: {health.v1.available ? "OK" : "No disponible"}</div>}
        </div>
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Carreras (cached)</div></div>
        <div className="card-body">
          {Object.keys(DB_ESPOCH).map(c => (
            <div key={c} className="item-row">
              <span className="item-name">{c}</span>
              <span className="item-sub">Max PAO: {DB_ESPOCH[c].maxPao} · RACs: {DB_ESPOCH[c].racs?.length || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function ConsultaEstudiante() {
  const [cedula, setCedula] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search() {
    const clean = cedula.replace(/-/g, "").trim();
    if (!clean || clean.length < 7) { setError("Ingrese una cédula válida."); return; }
    setLoading(true); setError(""); setData(null);
    try {
      const r = await oasis.getEstudianteFull({ cedula: clean });
      setData(r);
    } catch (err) {
      setError(err.message || "Estudiante no encontrado.");
    } finally { setLoading(false); }
  }

  return (
    <>
      <div className="page-header"><div className="page-title">Datos de Estudiante</div><div className="page-sub">Consultar información completa del estudiante por cédula</div></div>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-body">
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Cédula</label>
              <input className="form-input" placeholder="Ingrese la cédula" value={cedula} onChange={e => setCedula(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} autoFocus />
            </div>
            <button className="btn btn-primary" onClick={search} disabled={loading}>{loading ? "Buscando…" : "Buscar"}</button>
          </div>
          {error && <div className="auth-msg" style={{ marginTop: 8 }}>{error}</div>}
        </div>
      </div>
      {data && (
        <div className="card">
          <div className="card-header"><div className="card-title">Datos del Estudiante</div></div>
          <div className="card-body">
            <div className="form-grid">
              <div><label className="form-label">Nombres</label><div style={{ fontWeight: 500 }}>{data.nombres || "—"}</div></div>
              <div><label className="form-label">Apellidos</label><div style={{ fontWeight: 500 }}>{data.apellidos || "—"}</div></div>
              <div><label className="form-label">Cédula</label><div style={{ fontFamily: "var(--mono)" }}>{data.cedula || "—"}</div></div>
              <div><label className="form-label">Correo</label><div>{data.email || "—"}</div></div>
              <div><label className="form-label">Código</label><div style={{ fontFamily: "var(--mono)" }}>{data.codigo || "—"}</div></div>
              <div><label className="form-label">Teléfono</label><div>{data.telefono || "—"}</div></div>
            </div>
            {data.materias && Array.isArray(data.materias) && data.materias.length > 0 && (
              <>
                <div style={{ fontWeight: 600, fontSize: ".85rem", marginTop: 18, marginBottom: 8 }}>Materias</div>
                <table className="data" style={{ fontSize: ".78rem" }}>
                  <thead><tr><th>Asignatura</th><th>Nota</th><th>Estado</th></tr></thead>
                  <tbody>{data.materias.map((m, i) => (
                    <tr key={i}><td>{m.asignatura || m.nombre || "—"}</td><td style={{ textAlign: "center", fontWeight: 700 }}>{m.nota != null ? Number(m.nota).toFixed(2) : "—"}</td><td style={{ textAlign: "center" }}>{m.estado || "—"}</td></tr>
                  ))}</tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
