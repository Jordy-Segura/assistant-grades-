-- Migración inicial: esquema del Asistente de Calificaciones ESPOCH
-- Ejecutar con: supabase migration up

-- 1. Docentes
CREATE TABLE IF NOT EXISTS docente (
    email TEXT PRIMARY KEY,
    nombre TEXT,
    cedula TEXT,
    rol TEXT DEFAULT 'docente',
    password_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Asignaciones (docente ↔ materia)
CREATE TABLE IF NOT EXISTS asignacion (
    id TEXT PRIMARY KEY,
    docente_email TEXT,
    carrera TEXT,
    asignatura TEXT,
    pao TEXT,
    paralelo TEXT,
    cod_carrera TEXT,
    cod_materia TEXT,
    cod_nivel TEXT,
    cod_periodo TEXT,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Configuraciones (RAC, RAAU, actividades en data JSONB)
CREATE TABLE IF NOT EXISTS configuracion (
    id TEXT PRIMARY KEY,
    owner_email TEXT,
    carrera TEXT,
    asignatura TEXT,
    pao TEXT,
    paralelo TEXT,
    data JSONB NOT NULL DEFAULT '{}',
    saved_at TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Estudiantes por configuración (nómina mínima)
CREATE TABLE IF NOT EXISTS config_estudiantes (
    config_id TEXT PRIMARY KEY REFERENCES configuracion(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Notas por configuración
CREATE TABLE IF NOT EXISTS config_notas (
    config_id TEXT PRIMARY KEY REFERENCES configuracion(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_asignacion_docente ON asignacion(docente_email);
CREATE INDEX IF NOT EXISTS idx_config_owner ON configuracion(owner_email);
CREATE INDEX IF NOT EXISTS idx_config_carrera ON configuracion(carrera);

-- ================================================================
-- Row Level Security (RLS)
-- ================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE docente ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_notas ENABLE ROW LEVEL SECURITY;

-- Políticas: coordinador puede hacer todo
CREATE POLICY "coordinador_todo_docente" ON docente
    FOR ALL USING (auth.email() IN (SELECT email FROM docente WHERE rol = 'coordinador'));

CREATE POLICY "coordinador_todo_asignacion" ON asignacion
    FOR ALL USING (auth.email() IN (SELECT email FROM docente WHERE rol = 'coordinador'));

CREATE POLICY "coordinador_todo_configuracion" ON configuracion
    FOR ALL USING (auth.email() IN (SELECT email FROM docente WHERE rol = 'coordinador'));

CREATE POLICY "coordinador_todo_estudiantes" ON config_estudiantes
    FOR ALL USING (true);

CREATE POLICY "coordinador_todo_notas" ON config_notas
    FOR ALL USING (true);

-- Políticas: docente solo ve/edita lo suyo
CREATE POLICY "docente_ver_asignacion" ON asignacion
    FOR SELECT USING (docente_email = auth.email());

CREATE POLICY "docente_gestion_config" ON configuracion
    FOR ALL USING (owner_email = auth.email());

-- NOTA: El acceso directo desde frontend a estas tablas requiere
-- que el usuario haya iniciado sesión en Supabase Auth.
-- La ruta recomendada es a través del BFF (backend PHP), no directa.
-- Estas políticas son una capa adicional de seguridad, no la principal.
