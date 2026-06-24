import { useApp } from "../../store/AppContext";
import * as oasis from "../../services/oasisApi";

const NAV_ITEMS = [
  { page: "dashboard", label: "Dashboard", icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z", roles: ["docente", "coordinador", "admin"] },
  { page: "configuracion", label: "Configuración", icon: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42", roles: ["docente", "coordinador", "admin"] },
  { page: "estudiantes", label: "Estudiantes", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", roles: ["docente", "coordinador", "admin"] },
  { page: "calificaciones", label: "Calificaciones", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6", roles: ["docente", "coordinador", "admin"] },
  { page: "reporte", label: "Reporte Final", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6", roles: ["docente", "coordinador", "admin"] },
  { page: "coordinacion", label: "Coordinación", icon: "M3 3h18v18H3zM3 9h18M9 21V9", roles: ["coordinador", "admin"] },
  { page: "coord-asignaturas", label: "Asignaturas", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H4z", roles: ["coordinador", "admin"] },
  { page: "coord-rac", label: "RAC", icon: "M12 12a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", roles: ["coordinador", "admin"] },
  { page: "coord-raau", label: "RAAU", icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01", roles: ["coordinador", "admin"] },
  { page: "coord-docentes", label: "Docentes", icon: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", roles: ["coordinador", "admin"] },
  { page: "consulta-sede", label: "Sede Orellana", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10", roles: ["coordinador", "admin"] },
  { page: "consulta-informacion", label: "Información General", icon: "M12 12a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 16v-4M12 8h.01", roles: ["coordinador", "admin"] },
  { page: "consulta-estudiante", label: "Datos de Estudiante", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", roles: ["coordinador", "admin"] },
];

export default function AppShell({ children }) {
  const { state, dispatch } = useApp();
  const { currentUser, courseConfig, page, activeConfigId } = state;

  function navigate(p) { dispatch({ type: "NAV", payload: p }); }

  function doLogout() {
    oasis.setAuthToken(null);
    dispatch({ type: "LOGOUT" });
  }

  const configs = (state.savedConfigs || []).filter(c => c.ownerEmail === currentUser?.email);
  const activeCfg = configs.find(c => c.id === activeConfigId);
  const role = currentUser?.role;
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role));

  return (
    <div id="app-shell" style={{ display: "flex" }}>
      <aside id="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-row">
            <img src="/escudo_espoch.png" alt="ESPOCH" className="brand-logo-img" />
            <div className="brand-text">
              <div className="title">ESPOCH</div>
              <div className="sub">Auxiliar de Calificaciones</div>
            </div>
          </div>
        </div>
        <div className="sidebar-course">
          <div className="course-label">Asignatura</div>
          <div className="course-name" id="sb-asignatura">{activeCfg?.courseConfig?.asignatura || "—"}</div>
          <div className="course-tags">
            <span className="tag-pao" id="sb-pao">{activeCfg ? `PAO ${activeCfg.courseConfig.pao}` : "—"}</span>
            <span className="tag-aporte" id="sb-aporte">{activeCfg?.courseConfig?.aporte || "—"}</span>
          </div>
        </div>
        <div className="sidebar-pao-section" id="sidebar-pao-section">
          <div className="sidebar-pao-header">
            <span>Mis PAOs</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("configuracion")} title="Nuevo PAO" style={{ padding: "1px 6px", fontSize: "1.1rem", lineHeight: 1 }}>+</button>
          </div>
          <div id="sidebar-pao-list">
            {configs.length === 0 ? (
              <div className="pao-sidebar-empty">No existen PAOs configurados.<br />Cree uno desde Configuración.</div>
            ) : (
              <div className="pao-dropdown">
                <div className="pao-dropdown-toggle" onClick={() => {}}>
                  <span className="pao-dropdown-text">{activeCfg ? `PAO ${activeCfg.courseConfig.pao} — ${activeCfg.courseConfig.asignatura}` : "Seleccionar PAO"}</span>
                  <svg className="pao-dropdown-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
            )}
          </div>
        </div>
        <nav className="sidebar-nav">
          {visibleItems.map(item => (
            <a key={item.page} className={`nav-item${page === item.page ? " active" : ""}`} href={`#${item.page}`} onClick={e => { e.preventDefault(); navigate(item.page); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={item.icon} /></svg>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="footer-avatar">
            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
          <div>
            <div className="footer-name" id="sb-docente">{currentUser?.name || "—"}</div>
            <div className="footer-role" id="sb-role">{role === "coordinador" ? "Coordinador" : role === "admin" ? "Administrador" : "Docente"}</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={doLogout}>Salir</button>
        </div>
      </aside>
      <div id="main">
        {children}
        <footer className="app-footer">ESPOCH · Sistema de Calificaciones · © 2026</footer>
      </div>
    </div>
  );
}
