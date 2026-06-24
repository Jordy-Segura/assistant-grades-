import { useState } from "react";
import { useApp } from "../store/AppContext";
import * as oasis from "../services/oasisApi";

export default function LoginPage() {
  const { dispatch } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function doLogin() {
    if (!email || !password) { setMsg("Ingrese su correo y contraseña."); return; }
    setLoading(true);
    setMsg("");
    try {
      let user = null;
      if (email.indexOf("dev.") === 0 && !import.meta.env.PROD) {
        const r = await oasis.devLogin(email, password);
        if (r) user = buildUser(email, r);
      }
      if (!user) {
        try {
          const r = await oasis.loginDb(email, password);
          if (r && !r.disabled) { user = r; if (r.token) oasis.setAuthToken(r.token); }
        } catch {}
      }
      if (!user) {
        const r = await oasis.login(email, password);
        user = buildUser(email, r);
      }
      if (user) {
        dispatch({ type: "SET_USER", payload: user });
        dispatch({ type: "NAV", payload: user.role === "coordinador" ? "coord-docentes" : "dashboard" });
      }
    } catch (err) {
      setMsg(err?.offline ? "Servidor no disponible." : err?.message || "Credenciales incorrectas.");
    } finally { setLoading(false); }
  }

  return (
    <div id="auth-screen" style={{ display: "flex" }}>
      <div className="auth-centered">
        <div className="auth-card">
          <img src="/escudo_espoch.png" alt="ESPOCH" className="auth-shield" />
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--gray-800)", marginBottom: 2 }}>Iniciar Sesión</div>
          <div style={{ fontSize: ".8rem", color: "var(--gray-500)", marginBottom: 18 }}>Ingrese sus credenciales institucionales</div>
          <div className="form-group">
            <label className="form-label">Correo Institucional</label>
            <input className="form-input" placeholder="correo@espoch.edu.ec" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" onKeyDown={e => e.key === "Enter" && doLogin()} />
          </div>
          <button className="btn btn-primary auth-main-btn" onClick={doLogin} disabled={loading}>
            {loading ? "Verificando…" : "Ingresar"}
          </button>
          {msg && <div className="auth-msg">{msg}</div>}
          <div className="auth-demo-box">
            <div className="demo-label">Acceso para pruebas</div>
            <div className="demo-creds">Contacte al administrador del sistema para obtener sus credenciales.</div>
            <div className="auth-demo-row">
              <button className="btn btn-ghost btn-sm" onClick={() => { setEmail("ppaguay@espoch.edu.ec"); setPassword(""); setMsg("Ingrese la contraseña del coordinador."); }}>Usar credencial del coordinador</button>
            </div>
            <div className="demo-note">Los docentes ingresan con el correo y la contraseña que les asigna el coordinador, o con sus credenciales OASIS.</div>
          </div>
          <div className="auth-footer">Escuela Superior Politécnica de Chimborazo · Sede Orellana</div>
        </div>
      </div>
    </div>
  );
}

function buildUser(loginValue, result) {
  if (!result) return null;
  const perfil = result.perfil || {};
  const roles = result.roles || [];
  const name = ((perfil.nombres || "") + " " + (perfil.apellidos || "")).trim() || loginValue;
  const token = result.token;
  if (token) oasis.setAuthToken(token);
  return {
    email: perfil.email || loginValue,
    role: deriveRole(roles),
    name,
    cedula: perfil.cedula || "",
    roles,
    source: "oasis",
    token,
  };
}

function deriveRole(roles) {
  const names = (roles || []).map(r => (r.nombreRol || "").toUpperCase());
  if (names.some(n => n.includes("COORDINADOR"))) return "coordinador";
  if (names.some(n => n.includes("DECANO") || n.includes("ADMIN"))) return "admin";
  return "docente";
}
