import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sql from "mssql";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
  }),
);

app.use(express.json());

const dbConfig = {
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "sql123",
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_DATABASE || "AuxiliarCalificacionesESPOCH",
  port: Number(process.env.DB_PORT || 1433),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool;

async function getPool() {
  if (pool) return pool;
  pool = await sql.connect(dbConfig);
  return pool;
}

app.get("/api", (req, res) => {
  res.json({
    ok: true,
    message: "API Auxiliar de Calificaciones funcionando",
    endpoints: [
      "GET /api/health",
      "GET /api/configuraciones",
      "POST /api/configuraciones",
      "POST /api/configuraciones/:id/estudiantes",
      "POST /api/configuraciones/:id/calificaciones",
    ],
  });
});
app.get("/api", (_req, res) => {
  res.json({
    ok: true,
    message: "API Auxiliar de Calificaciones funcionando correctamente",
    endpoints: [
      "GET /api/health",
      "GET /api/componentes",
      "GET /api/procedimientos",
      "GET /api/configuraciones",
      "POST /api/configuraciones",
      "POST /api/configuraciones/:idConfiguracion/estudiantes",
      "POST /api/configuraciones/:idConfiguracion/calificaciones",
    ],
  });
});
app.get("/api/health", async (req, res) => {
  try {
    const connection = await getPool();

    const result = await connection.request().query(`
      SELECT
        1 AS ok,
        DB_NAME() AS databaseName,
        @@SERVERNAME AS serverName,
        GETDATE() AS serverTime
    `);

    res.json({
      ok: true,
      message: "Conexión con SQL Server correcta",
      sql: result.recordset[0],
    });
  } catch (error) {
    console.error("Error en /api/health:", error);
    res.status(500).json({
      ok: false,
      message: "No se pudo conectar con SQL Server",
      error: error.message,
    });
  }
});

app.get("/api/configuraciones", async (req, res) => {
  try {
    const connection = await getPool();

    const result = await connection.request().query(`
      SELECT TOP 50 *
      FROM aux.ConfiguracionesEvaluacion
      ORDER BY IdConfiguracion DESC
    `);

    res.json({
      ok: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error("Error listando configuraciones:", error);
    res.status(500).json({
      ok: false,
      message: "Error listando configuraciones",
      error: error.message,
    });
  }
});

app.post("/api/configuraciones", async (req, res) => {
  try {
    const payload = req.body || {};
    const config = payload.courseConfig || payload.config || payload;

    const periodoAcademico = config.periodoAcademico || "";
    const facultad = config.facultad || "";
    const carrera = config.carrera || "";
    const asignatura = config.asignatura || "";
    const docente = config.docente || "";
    const pao = config.pao ? Number(config.pao) : null;
    const aporte = config.aporte || "";
    const frontendConfigId = payload.id || payload.frontendConfigId || "";

    const connection = await getPool();

    const result = await connection
      .request()
      .input("FrontendConfigId", sql.NVarChar(100), frontendConfigId)
      .input("PeriodoAcademico", sql.NVarChar(100), periodoAcademico)
      .input("Facultad", sql.NVarChar(200), facultad)
      .input("Carrera", sql.NVarChar(200), carrera)
      .input("Asignatura", sql.NVarChar(200), asignatura)
      .input("Docente", sql.NVarChar(200), docente)
      .input("PAO", sql.Int, pao)
      .input("Aporte", sql.NVarChar(100), aporte).query(`
        INSERT INTO aux.ConfiguracionesEvaluacion
        (
          FrontendConfigId,
          PeriodoAcademico,
          Facultad,
          Carrera,
          Asignatura,
          Docente,
          PAO,
          Aporte,
          Estado,
          FechaCreacion
        )
        OUTPUT INSERTED.IdConfiguracion
        VALUES
        (
          @FrontendConfigId,
          @PeriodoAcademico,
          @Facultad,
          @Carrera,
          @Asignatura,
          @Docente,
          @PAO,
          @Aporte,
          1,
          GETDATE()
        )
      `);

    const idConfiguracion = result.recordset[0].IdConfiguracion;

    res.json({
      ok: true,
      message: "Configuración guardada correctamente",
      idConfiguracion,
    });
  } catch (error) {
    console.error("Error guardando configuración:", error);
    res.status(500).json({
      ok: false,
      message: "Error guardando configuración",
      error: error.message,
    });
  }
});

app.post("/api/configuraciones/:id/estudiantes", async (req, res) => {
  try {
    const idConfiguracion = Number(req.params.id);
    const students = req.body.students || [];

    const connection = await getPool();

    for (const student of students) {
      await connection
        .request()
        .input("IdConfiguracion", sql.Int, idConfiguracion)
        .input("Cedula", sql.NVarChar(20), student.cedula || student.id || "")
        .input("Apellidos", sql.NVarChar(200), student.apellidos || "")
        .input(
          "Nombres",
          sql.NVarChar(200),
          student.nombres || student.nombre || "",
        ).query(`
          INSERT INTO aux.EstudiantesAuxiliares
          (
            IdConfiguracion,
            Cedula,
            Apellidos,
            Nombres,
            Estado,
            FechaRegistro
          )
          VALUES
          (
            @IdConfiguracion,
            @Cedula,
            @Apellidos,
            @Nombres,
            1,
            GETDATE()
          )
        `);
    }

    res.json({
      ok: true,
      message: "Estudiantes guardados correctamente",
      total: students.length,
    });
  } catch (error) {
    console.error("Error guardando estudiantes:", error);
    res.status(500).json({
      ok: false,
      message: "Error guardando estudiantes",
      error: error.message,
    });
  }
});

app.post("/api/configuraciones/:id/calificaciones", async (req, res) => {
  try {
    const idConfiguracion = Number(req.params.id);
    const grades = req.body.grades || [];

    const connection = await getPool();

    for (const grade of grades) {
      await connection
        .request()
        .input("IdConfiguracion", sql.Int, idConfiguracion)
        .input(
          "Cedula",
          sql.NVarChar(20),
          grade.cedula || grade.studentId || "",
        )
        .input("ActividadId", sql.NVarChar(100), grade.activityId || "")
        .input(
          "Nota",
          sql.Decimal(5, 2),
          Number(grade.nota || grade.value || 0),
        ).query(`
          INSERT INTO aux.CalificacionesAuxiliares
          (
            IdConfiguracion,
            Cedula,
            FrontendActivityId,
            Nota,
            FechaRegistro
          )
          VALUES
          (
            @IdConfiguracion,
            @Cedula,
            @ActividadId,
            @Nota,
            GETDATE()
          )
        `);
    }

    res.json({
      ok: true,
      message: "Calificaciones guardadas correctamente",
      total: grades.length,
    });
  } catch (error) {
    console.error("Error guardando calificaciones:", error);
    res.status(500).json({
      ok: false,
      message: "Error guardando calificaciones",
      error: error.message,
    });
  }
});

const PORT = Number(process.env.PORT || 4000);

app.listen(PORT, () => {
  console.log(`Backend ejecutándose en http://localhost:${PORT}`);
});
