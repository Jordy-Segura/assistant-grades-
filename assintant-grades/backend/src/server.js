import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getPool, sql } from './db.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origen no permitido por CORS: ${origin}`));
  }
}));
app.use(express.json({ limit: '5mb' }));

function normalizeText(value, fallback = '') {
  return String(value ?? fallback).trim();
}

function dbString(value, fallback = null) {
  const text = normalizeText(value, '');
  return text === '' ? fallback : text;
}

async function findUsuarioId(transaction, email) {
  if (!email) return null;
  const result = await new sql.Request(transaction)
    .input('Correo', sql.NVarChar(160), email)
    .query('SELECT TOP 1 IdUsuario FROM aux.UsuariosSistema WHERE Correo = @Correo AND Estado = 1;');
  return result.recordset[0]?.IdUsuario ?? null;
}

async function getOrCreateRAC(transaction, rac, courseConfig) {
  const codigoCarrera = dbString(courseConfig.codigoCarreraExterno || courseConfig.carrera, 'SIN-CARRERA');
  const carreraNombre = dbString(courseConfig.carrera, 'Sin carrera');
  const codigo = dbString(rac.code || rac.codigo, 'RAC');
  const descripcion = dbString(rac.description || rac.descripcion, codigo);

  const result = await new sql.Request(transaction)
    .input('CodigoCarreraExterno', sql.NVarChar(50), codigoCarrera)
    .input('CarreraNombre', sql.NVarChar(250), carreraNombre)
    .input('Codigo', sql.NVarChar(30), codigo)
    .input('Descripcion', sql.NVarChar(1000), descripcion)
    .query(`
      MERGE aux.RAC AS target
      USING (SELECT @CodigoCarreraExterno AS CodigoCarreraExterno, @Codigo AS Codigo) AS source
      ON target.CodigoCarreraExterno = source.CodigoCarreraExterno AND target.Codigo = source.Codigo
      WHEN MATCHED THEN
        UPDATE SET CarreraNombre = @CarreraNombre, Descripcion = @Descripcion, Estado = 1
      WHEN NOT MATCHED THEN
        INSERT (CodigoCarreraExterno, CarreraNombre, Codigo, Descripcion, Estado)
        VALUES (@CodigoCarreraExterno, @CarreraNombre, @Codigo, @Descripcion, 1)
      OUTPUT inserted.IdRAC;
    `);

  return result.recordset[0].IdRAC;
}

async function getOrCreateRAAU(transaction, raau, courseConfig, idRAC) {
  const codigoAsignatura = dbString(courseConfig.codigoAsignaturaExterno || courseConfig.asignatura, null);
  const asignaturaNombre = dbString(courseConfig.asignatura, 'Sin asignatura');
  const codigo = dbString(raau.code || raau.codigo, 'RAAU');
  const descripcion = dbString(raau.description || raau.descripcion, codigo);

  const result = await new sql.Request(transaction)
    .input('IdRAC', sql.Int, idRAC)
    .input('CodigoAsignaturaExterno', sql.NVarChar(50), codigoAsignatura)
    .input('AsignaturaNombre', sql.NVarChar(250), asignaturaNombre)
    .input('Codigo', sql.NVarChar(30), codigo)
    .input('Descripcion', sql.NVarChar(1000), descripcion)
    .query(`
      MERGE aux.RAAU AS target
      USING (SELECT @AsignaturaNombre AS AsignaturaNombre, @Codigo AS Codigo) AS source
      ON target.AsignaturaNombre = source.AsignaturaNombre AND target.Codigo = source.Codigo
      WHEN MATCHED THEN
        UPDATE SET IdRAC = @IdRAC, CodigoAsignaturaExterno = @CodigoAsignaturaExterno, Descripcion = @Descripcion, Estado = 1
      WHEN NOT MATCHED THEN
        INSERT (IdRAC, CodigoAsignaturaExterno, AsignaturaNombre, Codigo, Descripcion, Estado)
        VALUES (@IdRAC, @CodigoAsignaturaExterno, @AsignaturaNombre, @Codigo, @Descripcion, 1)
      OUTPUT inserted.IdRAAU;
    `);

  return result.recordset[0].IdRAAU;
}

async function getComponenteId(transaction, codigo) {
  const result = await new sql.Request(transaction)
    .input('Codigo', sql.NVarChar(10), codigo)
    .query('SELECT TOP 1 IdComponente FROM aux.ComponentesEvaluacion WHERE Codigo = @Codigo AND Estado = 1;');
  if (!result.recordset[0]) throw new Error(`No existe el componente ${codigo}`);
  return result.recordset[0].IdComponente;
}

async function getOrCreateProcedimiento(transaction, idComponente, procedimientoCodigo, procedimientoNombre) {
  const codigo = dbString(procedimientoCodigo, 'PROC').toUpperCase();
  const nombre = dbString(procedimientoNombre, codigo);

  const result = await new sql.Request(transaction)
    .input('IdComponente', sql.Int, idComponente)
    .input('Codigo', sql.NVarChar(30), codigo)
    .input('Nombre', sql.NVarChar(180), nombre)
    .query(`
      MERGE aux.ProcedimientosEvaluativos AS target
      USING (SELECT @IdComponente AS IdComponente, @Codigo AS Codigo) AS source
      ON target.IdComponente = source.IdComponente AND target.Codigo = source.Codigo
      WHEN MATCHED THEN
        UPDATE SET Nombre = @Nombre, Estado = 1
      WHEN NOT MATCHED THEN
        INSERT (IdComponente, Codigo, Nombre, Estado)
        VALUES (@IdComponente, @Codigo, @Nombre, 1)
      OUTPUT inserted.IdProcedimiento;
    `);
  return result.recordset[0].IdProcedimiento;
}

async function insertAuditoria(transaction, idUsuario, entidad, idEntidad, accion, detalle) {
  await new sql.Request(transaction)
    .input('IdUsuario', sql.Int, idUsuario)
    .input('Entidad', sql.NVarChar(100), entidad)
    .input('IdEntidad', sql.NVarChar(80), String(idEntidad ?? ''))
    .input('Accion', sql.NVarChar(50), accion)
    .input('Detalle', sql.NVarChar(sql.MAX), JSON.stringify(detalle ?? {}))
    .query(`
      INSERT INTO aux.Auditoria (IdUsuario, Entidad, IdEntidad, Accion, Detalle)
      VALUES (@IdUsuario, @Entidad, @IdEntidad, @Accion, @Detalle);
    `);
}

app.get('/api/health', async (_req, res) => {
  const pool = await getPool();
  const result = await pool.request().query('SELECT 1 AS ok, DB_NAME() AS databaseName, SYSDATETIME() AS serverTime;');
  res.json({ ok: true, sql: result.recordset[0] });
});

app.get('/api/componentes', async (_req, res) => {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT IdComponente, Codigo, Nombre, PuntajeMaximo, Descripcion
    FROM aux.ComponentesEvaluacion
    WHERE Estado = 1
    ORDER BY CASE Codigo WHEN 'ACD' THEN 1 WHEN 'APEX' THEN 2 WHEN 'AAUT' THEN 3 ELSE 4 END;
  `);
  res.json(result.recordset);
});

app.get('/api/procedimientos', async (_req, res) => {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT p.IdProcedimiento, c.Codigo AS Componente, p.Codigo, p.Nombre
    FROM aux.ProcedimientosEvaluativos p
    INNER JOIN aux.ComponentesEvaluacion c ON c.IdComponente = p.IdComponente
    WHERE p.Estado = 1
    ORDER BY c.Codigo, p.Nombre;
  `);
  res.json(result.recordset);
});

app.get('/api/configuraciones', async (_req, res) => {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT TOP 50
      c.IdConfiguracion,
      c.FrontendConfigId,
      c.PeriodoDescripcion,
      c.CarreraNombre,
      c.AsignaturaNombre,
      c.PAO,
      c.Aporte,
      c.DocenteNombre,
      c.Estado,
      c.Bloqueada,
      c.FechaCreacion
    FROM aux.ConfiguracionesEvaluacion c
    ORDER BY c.IdConfiguracion DESC;
  `);
  res.json(result.recordset);
});

app.post('/api/configuraciones', async (req, res) => {
  const payload = req.body || {};
  const courseConfig = payload.courseConfig || {};
  const selectedRACs = payload.selectedRACs || [];
  const raauEntries = payload.raauEntries || [];
  const activities = payload.activities || [];
  const frontendConfigId = dbString(payload.frontendConfigId, null);
  const currentUser = payload.currentUser || {};

  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    const usuarioId = await findUsuarioId(transaction, currentUser.email);

    const configResult = await new sql.Request(transaction)
      .input('FrontendConfigId', sql.NVarChar(80), frontendConfigId)
      .input('CodigoPeriodoExterno', sql.NVarChar(50), dbString(courseConfig.codigoPeriodoExterno || courseConfig.periodoAcademico, 'SIN-PERIODO'))
      .input('PeriodoDescripcion', sql.NVarChar(180), dbString(courseConfig.periodoAcademico, null))
      .input('CodigoFacultadExterno', sql.NVarChar(50), dbString(courseConfig.codigoFacultadExterno || courseConfig.facultad, null))
      .input('FacultadNombre', sql.NVarChar(250), dbString(courseConfig.facultad, null))
      .input('CodigoCarreraExterno', sql.NVarChar(50), dbString(courseConfig.codigoCarreraExterno || courseConfig.carrera, null))
      .input('CarreraNombre', sql.NVarChar(250), dbString(courseConfig.carrera, null))
      .input('CodigoAsignaturaExterno', sql.NVarChar(50), dbString(courseConfig.codigoAsignaturaExterno || courseConfig.asignatura, null))
      .input('AsignaturaNombre', sql.NVarChar(250), dbString(courseConfig.asignatura, 'Sin asignatura'))
      .input('PAO', sql.NVarChar(20), dbString(courseConfig.pao, null))
      .input('Aporte', sql.NVarChar(50), dbString(courseConfig.aporte, 'FIN DE CICLO'))
      .input('CodigoDocenteExterno', sql.NVarChar(80), dbString(courseConfig.codigoDocenteExterno || courseConfig.docente, null))
      .input('DocenteNombre', sql.NVarChar(250), dbString(courseConfig.docente, null))
      .input('CreadoPorUsuarioId', sql.Int, usuarioId)
      .query(`
        INSERT INTO aux.ConfiguracionesEvaluacion
        (FrontendConfigId, CodigoPeriodoExterno, PeriodoDescripcion, CodigoFacultadExterno, FacultadNombre,
         CodigoCarreraExterno, CarreraNombre, CodigoAsignaturaExterno, AsignaturaNombre, PAO, Aporte,
         CodigoDocenteExterno, DocenteNombre, CreadoPorUsuarioId, Estado, Bloqueada)
        OUTPUT INSERTED.IdConfiguracion
        VALUES
        (@FrontendConfigId, @CodigoPeriodoExterno, @PeriodoDescripcion, @CodigoFacultadExterno, @FacultadNombre,
         @CodigoCarreraExterno, @CarreraNombre, @CodigoAsignaturaExterno, @AsignaturaNombre, @PAO, @Aporte,
         @CodigoDocenteExterno, @DocenteNombre, @CreadoPorUsuarioId, 'ACTIVA', 1);
      `);

    const idConfiguracion = configResult.recordset[0].IdConfiguracion;
    const racIdMap = new Map();
    const raauIdMap = new Map();

    for (const rac of selectedRACs) {
      const idRAC = await getOrCreateRAC(transaction, rac, courseConfig);
      racIdMap.set(rac.id, idRAC);
      await new sql.Request(transaction)
        .input('IdConfiguracion', sql.Int, idConfiguracion)
        .input('IdRAC', sql.Int, idRAC)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM aux.ConfiguracionRAC WHERE IdConfiguracion = @IdConfiguracion AND IdRAC = @IdRAC)
          INSERT INTO aux.ConfiguracionRAC (IdConfiguracion, IdRAC) VALUES (@IdConfiguracion, @IdRAC);
        `);
    }

    for (const raau of raauEntries) {
      const idRAC = racIdMap.get(raau.racId) || [...racIdMap.values()][0];
      if (!idRAC) throw new Error(`RAAU ${raau.code || raau.codigo} no tiene RAC asociado.`);
      const idRAAU = await getOrCreateRAAU(transaction, raau, courseConfig, idRAC);
      raauIdMap.set(raau.id, idRAAU);
      await new sql.Request(transaction)
        .input('IdConfiguracion', sql.Int, idConfiguracion)
        .input('IdRAAU', sql.Int, idRAAU)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM aux.ConfiguracionRAAU WHERE IdConfiguracion = @IdConfiguracion AND IdRAAU = @IdRAAU)
          INSERT INTO aux.ConfiguracionRAAU (IdConfiguracion, IdRAAU) VALUES (@IdConfiguracion, @IdRAAU);
        `);
    }

    let order = 1;
    for (const activity of activities) {
      const componentCode = dbString(activity.component, 'ACD');
      const idComponente = await getComponenteId(transaction, componentCode);
      const idProcedimiento = await getOrCreateProcedimiento(
        transaction,
        idComponente,
        activity.procedureId || activity.procedureCode || activity.name,
        activity.procedureName || activity.name
      );
      const idRAAU = raauIdMap.get(activity.raauId) || [...raauIdMap.values()][0];
      if (!idRAAU) throw new Error(`Actividad ${activity.name} no tiene RAAU asociado.`);

      await new sql.Request(transaction)
        .input('IdConfiguracion', sql.Int, idConfiguracion)
        .input('IdComponente', sql.Int, idComponente)
        .input('IdProcedimiento', sql.Int, idProcedimiento)
        .input('IdRAAU', sql.Int, idRAAU)
        .input('FrontendActivityId', sql.NVarChar(80), dbString(activity.id, null))
        .input('Nombre', sql.NVarChar(180), dbString(activity.name, 'Actividad'))
        .input('PuntajeMaximo', sql.Decimal(5, 2), Number(activity.maxScore || 0))
        .input('Orden', sql.Int, order++)
        .query(`
          INSERT INTO aux.ActividadesEvaluacion
          (IdConfiguracion, IdComponente, IdProcedimiento, IdRAAU, FrontendActivityId, Nombre, PuntajeMaximo, Orden, Estado)
          VALUES
          (@IdConfiguracion, @IdComponente, @IdProcedimiento, @IdRAAU, @FrontendActivityId, @Nombre, @PuntajeMaximo, @Orden, 1);
        `);
    }

    await insertAuditoria(transaction, usuarioId, 'ConfiguracionesEvaluacion', idConfiguracion, 'CREAR', payload);
    await transaction.commit();

    res.status(201).json({ ok: true, idConfiguracion, frontendConfigId });
  } catch (error) {
    try { await transaction.rollback(); } catch (_) {}
    console.error('[POST /api/configuraciones]', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.post('/api/configuraciones/:idConfiguracion/estudiantes', async (req, res) => {
  const idConfiguracion = Number(req.params.idConfiguracion);
  const students = Array.isArray(req.body?.students) ? req.body.students : [];
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    for (const student of students) {
      await new sql.Request(transaction)
        .input('IdConfiguracion', sql.Int, idConfiguracion)
        .input('CodigoEstudianteExterno', sql.NVarChar(80), dbString(student.id || student.cedula, 'SIN-CODIGO'))
        .input('Cedula', sql.NVarChar(20), dbString(student.cedula || student.id, null))
        .input('Apellidos', sql.NVarChar(150), dbString(student.apellidos, ''))
        .input('Nombres', sql.NVarChar(150), dbString(student.nombres, ''))
        .query(`
          MERGE aux.EstudiantesAuxiliares AS target
          USING (SELECT @IdConfiguracion AS IdConfiguracion, @CodigoEstudianteExterno AS CodigoEstudianteExterno) AS source
          ON target.IdConfiguracion = source.IdConfiguracion AND target.CodigoEstudianteExterno = source.CodigoEstudianteExterno
          WHEN MATCHED THEN
            UPDATE SET Cedula = @Cedula, Apellidos = @Apellidos, Nombres = @Nombres, Estado = 1, FechaActualizacion = SYSDATETIME()
          WHEN NOT MATCHED THEN
            INSERT (IdConfiguracion, CodigoEstudianteExterno, Cedula, Apellidos, Nombres, Estado)
            VALUES (@IdConfiguracion, @CodigoEstudianteExterno, @Cedula, @Apellidos, @Nombres, 1);
        `);
    }
    await transaction.commit();
    res.json({ ok: true, total: students.length });
  } catch (error) {
    try { await transaction.rollback(); } catch (_) {}
    console.error('[POST /api/configuraciones/:idConfiguracion/estudiantes]', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.post('/api/configuraciones/:idConfiguracion/calificaciones', async (req, res) => {
  const idConfiguracion = Number(req.params.idConfiguracion);
  const grades = Array.isArray(req.body?.grades) ? req.body.grades : [];
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    for (const grade of grades) {
      if (grade.score === null || grade.score === undefined || grade.score === '') continue;

      const activityResult = await new sql.Request(transaction)
        .input('IdConfiguracion', sql.Int, idConfiguracion)
        .input('FrontendActivityId', sql.NVarChar(80), dbString(grade.activityId, ''))
        .query(`
          SELECT TOP 1 IdActividad
          FROM aux.ActividadesEvaluacion
          WHERE IdConfiguracion = @IdConfiguracion AND FrontendActivityId = @FrontendActivityId AND Estado = 1;
        `);
      const idActividad = activityResult.recordset[0]?.IdActividad;
      if (!idActividad) continue;

      await new sql.Request(transaction)
        .input('IdConfiguracion', sql.Int, idConfiguracion)
        .input('IdActividad', sql.Int, idActividad)
        .input('CodigoEstudianteExterno', sql.NVarChar(80), dbString(grade.studentId, 'SIN-CODIGO'))
        .input('Nota', sql.Decimal(5, 2), Number(grade.score))
        .query(`
          MERGE aux.CalificacionesAuxiliares AS target
          USING (SELECT @IdActividad AS IdActividad, @CodigoEstudianteExterno AS CodigoEstudianteExterno) AS source
          ON target.IdActividad = source.IdActividad AND target.CodigoEstudianteExterno = source.CodigoEstudianteExterno
          WHEN MATCHED THEN
            UPDATE SET Nota = @Nota, EstadoSincronizacion = 'VALIDADA', FechaActualizacion = SYSDATETIME()
          WHEN NOT MATCHED THEN
            INSERT (IdConfiguracion, IdActividad, CodigoEstudianteExterno, Nota, EstadoSincronizacion)
            VALUES (@IdConfiguracion, @IdActividad, @CodigoEstudianteExterno, @Nota, 'VALIDADA');
        `);
    }
    await transaction.commit();
    res.json({ ok: true, total: grades.length });
  } catch (error) {
    try { await transaction.rollback(); } catch (_) {}
    console.error('[POST /api/configuraciones/:idConfiguracion/calificaciones]', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.use((err, _req, res, _next) => {
  console.error('[API Error]', err);
  res.status(500).json({ ok: false, message: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`API Auxiliar de Calificaciones ejecutándose en http://localhost:${PORT}/api`);
});
