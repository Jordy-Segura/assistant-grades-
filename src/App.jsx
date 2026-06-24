import { AppProvider, useApp } from "./store/AppContext";
import LoginPage from "./pages/LoginPage";
import AppShell from "./components/layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import "./App.css";

function PlaceholderPage({ title }) {
  return (
    <>
      <div className="page-header">
        <div className="page-title">{title}</div>
        <div className="page-sub">Esta página se está migrando a React. Vuelva pronto.</div>
      </div>
      <div className="card">
        <div className="card-body" style={{ textAlign: "center", padding: "60px 20px", color: "var(--gray-400)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 48, height: 48, margin: "0 auto 16px", opacity: 0.3 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>Migración en progreso</div>
        </div>
      </div>
    </>
  );
}

function PageRouter() {
  const { state } = useApp();
  const { page } = state;

  const PAGES = {
    dashboard: DashboardPage,
    configuracion: () => <PlaceholderPage title="Configuración" />,
    estudiantes: () => <PlaceholderPage title="Estudiantes" />,
    calificaciones: () => <PlaceholderPage title="Calificaciones" />,
    reporte: () => <PlaceholderPage title="Reporte Final" />,
    coordinacion: () => <PlaceholderPage title="Coordinación" />,
    "coord-asignaturas": () => <PlaceholderPage title="Asignaturas" />,
    "coord-rac": () => <PlaceholderPage title="RAC" />,
    "coord-raau": () => <PlaceholderPage title="RAAU" />,
    "coord-docentes": () => <PlaceholderPage title="Docentes" />,
    "consulta-sede": () => <PlaceholderPage title="Sede Orellana" />,
    "consulta-informacion": () => <PlaceholderPage title="Información General" />,
    "consulta-estudiante": () => <PlaceholderPage title="Datos de Estudiante" />,
  };

  const PageComponent = PAGES[page] || PAGES.dashboard;
  return <PageComponent />;
}

function AppContent() {
  const { state } = useApp();
  if (!state.currentUser) {
    return <LoginPage />;
  }
  return (
    <AppShell>
      <PageRouter />
    </AppShell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
