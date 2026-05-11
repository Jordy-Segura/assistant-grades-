import React, { useMemo, useState } from "react";
import { getNotasEstudiante } from "../services/oasisApi";

export default function Calificaciones() {
  const [form, setForm] = useState({ codCarrera: "", cedula: "" });
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(
    () => notas.reduce((sum, item) => sum + Number(item.nota || 0), 0),
    [notas]
  );

  async function consultarNotas(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await getNotasEstudiante(form);
      setNotas(data);
    } catch (err) {
      setError(err.message || "No se pudieron consultar las calificaciones.");
      setNotas([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>Calificaciones</h1>
      <p>
        Consulta únicamente las últimas notas del estudiante (sin descargar
        datos extra del servicio SOAP).
      </p>

      <form onSubmit={consultarNotas}>
        <label htmlFor="codCarrera">Código de carrera</label>
        <input
          id="codCarrera"
          value={form.codCarrera}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, codCarrera: e.target.value.trim() }))
          }
          required
        />

        <label htmlFor="cedula">Cédula</label>
        <input
          id="cedula"
          value={form.cedula}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, cedula: e.target.value.trim() }))
          }
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Consultando..." : "Consultar notas"}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      {notas.length > 0 && (
        <>
          <h2>Resultados</h2>
          <table>
            <thead>
              <tr>
                <th>Asignatura</th>
                <th>Actividad</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {notas.map((item, index) => (
                <tr key={`${item.asignatura}-${item.actividad}-${index}`}>
                  <td>{item.asignatura}</td>
                  <td>{item.actividad}</td>
                  <td>{item.nota}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            <strong>Total:</strong> {Number(total).toFixed(2)}
          </p>
        </>
      )}
    </section>
  );
}
