const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export async function getNotasEstudiante({ codCarrera, cedula }) {
  const response = await fetch(`${API_BASE_URL}/api/notas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codCarrera, cedula }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Error consultando servicio de notas");
  }

  const data = await response.json();
  return normalizarNotas(data);
}

function normalizarNotas(payload) {
  const notas = payload?.GetUltimasNotasEstudianteCarreraResult?.Notas;

  if (!notas) return [];

  const lista = Array.isArray(notas) ? notas : [notas];

  return lista.map((nota) => ({
    asignatura: nota?.Materia || "N/D",
    actividad: nota?.Actividad || "N/D",
    nota: Number(nota?.Nota || 0),
  }));
}
