import { AppProvider, useApp } from "./store/AppContext";
import LoginPage from "./pages/LoginPage";
import AppShell from "./components/layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import ConfiguracionPage from "./pages/ConfiguracionPage";
import EstudiantesPage from "./pages/EstudiantesPage";
import CalificacionesPage from "./pages/CalificacionesPage";
import ReportePage from "./pages/ReportePage";
import { CoordinacionDashboard, CoordAsignaturas, CoordRAC, CoordRAAU, CoordDocentes } from "./pages/CoordinacionPages";
import { ConsultaSede, ConsultaInfo, ConsultaEstudiante } from "./pages/ConsultaPages";
import "./App.css";

function PageRouter() {
  const { state } = useApp();
  const { page } = state;

  const PAGES = {
    dashboard: DashboardPage,
    configuracion: ConfiguracionPage,
    estudiantes: EstudiantesPage,
    calificaciones: CalificacionesPage,
    reporte: ReportePage,
    coordinacion: CoordinacionDashboard,
    "coord-asignaturas": CoordAsignaturas,
    "coord-rac": CoordRAC,
    "coord-raau": CoordRAAU,
    "coord-docentes": CoordDocentes,
    "consulta-sede": ConsultaSede,
    "consulta-informacion": ConsultaInfo,
    "consulta-estudiante": ConsultaEstudiante,
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
