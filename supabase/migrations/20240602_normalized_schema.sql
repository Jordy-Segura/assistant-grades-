-- ================================================================
-- ESQUEMA NORMALIZADO — ASISTENTE DE CALIFICACIONES ESPOCH
-- ================================================================
-- Migración desde modelo JSONB hacia tablas relacionales
-- Ejecutar en orden después del esquema inicial (20240601_initial_schema.sql)
-- ================================================================

-- 1. TABLAS DEL CATÁLOGO ACADÉMICO

CREATE TABLE IF NOT EXISTS carrera (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_oasis TEXT UNIQUE,
    nombre TEXT NOT NULL UNIQUE,
    sede TEXT DEFAULT 'SEDE ORELLANA',
    max_pao INTEGER DEFAULT 8,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS periodo_academico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_oasis TEXT UNIQUE NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS asignatura (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrera_id UUID REFERENCES carrera(id) ON DELETE CASCADE,
    codigo_oasis TEXT,
    nombre TEXT NOT NULL,
    nivel TEXT,
    pao TEXT,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(carrera_id, nombre)
);

CREATE TABLE IF NOT EXISTS rac (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrera_id UUID REFERENCES carrera(id) ON DELETE CASCADE,
    codigo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    orden INTEGER DEFAULT 0,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(carrera_id, codigo)
);

CREATE TABLE IF NOT EXISTS raau (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asignatura_id UUID REFERENCES asignatura(id) ON DELETE CASCADE,
    rac_id UUID REFERENCES rac(id) ON DELETE SET NULL,
    codigo TEXT,
    descripcion TEXT NOT NULL,
    orden INTEGER DEFAULT 0,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS componente_evaluacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    peso NUMERIC(4,2) NOT NULL,
    descripcion TEXT,
    orden INTEGER DEFAULT 0,
    estado BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS procedimiento_evaluacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    componente_id UUID REFERENCES componente_evaluacion(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    orden INTEGER DEFAULT 0,
    estado BOOLEAN DEFAULT TRUE
);

-- 2. TABLAS DE NEGOCIO (reemplazan las JSONB)

CREATE TABLE IF NOT EXISTS configuracion_pao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_email TEXT NOT NULL,
    carrera_id UUID REFERENCES carrera(id),
    asignatura_id UUID REFERENCES asignatura(id),
    periodo TEXT NOT NULL,
    pao TEXT,
    aporte TEXT DEFAULT 'FIN DE CICLO',
    estado TEXT DEFAULT 'borrador',
    locked BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS configuracion_pao_rac (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    configuracion_id UUID REFERENCES configuracion_pao(id) ON DELETE CASCADE,
    rac_id UUID REFERENCES rac(id) ON DELETE CASCADE,
    UNIQUE(configuracion_id, rac_id)
);

CREATE TABLE IF NOT EXISTS configuracion_pao_raau (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    configuracion_id UUID REFERENCES configuracion_pao(id) ON DELETE CASCADE,
    raau_id UUID REFERENCES raau(id) ON DELETE CASCADE,
    codigo TEXT,
    descripcion TEXT,
    UNIQUE(configuracion_id, raau_id)
);

CREATE TABLE IF NOT EXISTS actividad_evaluacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    configuracion_id UUID REFERENCES configuracion_pao(id) ON DELETE CASCADE,
    componente_id UUID REFERENCES componente_evaluacion(id),
    nombre TEXT NOT NULL,
    puntaje_maximo NUMERIC(5,2) NOT NULL,
    raau_id UUID REFERENCES raau(id),
    procedimiento_id UUID REFERENCES procedimiento_evaluacion(id),
    orden INTEGER DEFAULT 0,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS estudiante (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cedula TEXT UNIQUE NOT NULL,
    codigo TEXT,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    email TEXT,
    telefono TEXT,
    estado BOOLEAN DEFAULT TRUE,
    fuente TEXT DEFAULT 'OASIS',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS configuracion_estudiante (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    configuracion_id UUID REFERENCES configuracion_pao(id) ON DELETE CASCADE,
    estudiante_id UUID REFERENCES estudiante(id) ON DELETE CASCADE,
    estado TEXT DEFAULT 'activo',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(configuracion_id, estudiante_id)
);

CREATE TABLE IF NOT EXISTS calificacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    configuracion_id UUID REFERENCES configuracion_pao(id) ON DELETE CASCADE,
    estudiante_id UUID REFERENCES estudiante(id) ON DELETE CASCADE,
    actividad_id UUID REFERENCES actividad_evaluacion(id) ON DELETE CASCADE,
    nota NUMERIC(5,2),
    observacion TEXT,
    updated_by TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(configuracion_id, estudiante_id, actividad_id)
);

-- 3. AUDITORÍA

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. COLAS DE SINCRONIZACIÓN

CREATE TABLE IF NOT EXISTS sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity TEXT NOT NULL,
    entity_id TEXT,
    operation TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    payload JSONB,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);

-- ================================================================
-- ÍNDICES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_asignatura_carrera ON asignatura(carrera_id);
CREATE INDEX IF NOT EXISTS idx_rac_carrera ON rac(carrera_id);
CREATE INDEX IF NOT EXISTS idx_raau_asignatura ON raau(asignatura_id);
CREATE INDEX IF NOT EXISTS idx_raau_rac ON raau(rac_id);
CREATE INDEX IF NOT EXISTS idx_procedimiento_componente ON procedimiento_evaluacion(componente_id);
CREATE INDEX IF NOT EXISTS idx_config_pao_owner ON configuracion_pao(owner_email);
CREATE INDEX IF NOT EXISTS idx_config_pao_carrera ON configuracion_pao(carrera_id);
CREATE INDEX IF NOT EXISTS idx_actividad_config ON actividad_evaluacion(configuracion_id);
CREATE INDEX IF NOT EXISTS idx_actividad_componente ON actividad_evaluacion(componente_id);
CREATE INDEX IF NOT EXISTS idx_config_estudiante_config ON configuracion_estudiante(configuracion_id);
CREATE INDEX IF NOT EXISTS idx_config_estudiante_estudiante ON configuracion_estudiante(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_calificacion_config ON calificacion(configuracion_id);
CREATE INDEX IF NOT EXISTS idx_calificacion_estudiante ON calificacion(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_calificacion_actividad ON calificacion(actividad_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_sync_status ON sync_queue(status);

-- ================================================================
-- SEED: COMPONENTES DE EVALUACIÓN
-- ================================================================

INSERT INTO componente_evaluacion (codigo, nombre, peso, descripcion, orden) VALUES
    ('ACD', 'Aprendizaje en Contacto con el Docente', 3.5, 'Actividades realizadas en contacto directo con el docente', 1),
    ('APEX', 'Aprendizaje Práctico Experimental', 3.5, 'Actividades prácticas y experimentales', 2),
    ('AAUT', 'Aprendizaje Autónomo', 3.0, 'Actividades realizadas de forma autónoma por el estudiante', 3)
ON CONFLICT (codigo) DO NOTHING;

-- ================================================================
-- SEED: PROCEDIMIENTOS DE EVALUACIÓN
-- ================================================================

DO $$
DECLARE
    acd_id UUID;
    apex_id UUID;
    aaut_id UUID;
BEGIN
    SELECT id INTO acd_id FROM componente_evaluacion WHERE codigo = 'ACD';
    SELECT id INTO apex_id FROM componente_evaluacion WHERE codigo = 'APEX';
    SELECT id INTO aaut_id FROM componente_evaluacion WHERE codigo = 'AAUT';

    INSERT INTO procedimiento_evaluacion (componente_id, nombre, orden) VALUES
        (acd_id, 'Participación en clase', 1),
        (acd_id, 'Investigación Formativa', 2),
        (acd_id, 'Resúmenes', 3),
        (acd_id, 'Lectura crítica de textos', 4),
        (acd_id, 'Exposiciones', 5),
        (acd_id, 'Proyecto o planes en el aula', 6),
        (acd_id, 'Comunicación oral y escrita', 7),
        (acd_id, 'Debates', 8),
        (acd_id, 'Cuestionarios', 9),
        (acd_id, 'Ensayos', 10),
        (acd_id, 'Panel de discusión', 11),
        (apex_id, 'Aplicación de contenidos', 1),
        (apex_id, 'Talleres en equipo', 2),
        (apex_id, 'Resolución de problemas', 3),
        (apex_id, 'Comprobación', 4),
        (apex_id, 'Experimentación', 5),
        (apex_id, 'Replicación de casos', 6),
        (apex_id, 'Práctica de laboratorio', 7),
        (apex_id, 'Simulación', 8),
        (apex_id, 'Talleres individuales', 9),
        (aaut_id, 'Escritura académica', 1),
        (aaut_id, 'Elaboración de informes', 2),
        (aaut_id, 'Preparación para lecciones', 3),
        (aaut_id, 'Preparación de exámenes', 4),
        (aaut_id, 'Lecturas complementarias', 5),
        (aaut_id, 'Resolución de ejercicios', 6)
    ON CONFLICT DO NOTHING;
END $$;

-- ================================================================
-- SEED: CARRERAS
-- ================================================================

INSERT INTO carrera (codigo_oasis, nombre, sede, max_pao) VALUES
    ('ITIO', 'TECNOLOGÍAS DE LA INFORMACIÓN', 'SEDE ORELLANA', 8),
    ('AMBI', 'AMBIENTAL', 'SEDE ORELLANA', 8),
    ('AGRO', 'AGRONOMÍA', 'SEDE ORELLANA', 9),
    ('ZOOT', 'ZOOTECNIA', 'SEDE ORELLANA', 8),
    ('TURI', 'TURISMO', 'SEDE ORELLANA', 8),
    ('DER', 'DERECHO', 'SEDE ORELLANA', 8)
ON CONFLICT (nombre) DO NOTHING;

-- ================================================================
-- SEED: RAC (TECNOLOGÍAS DE LA INFORMACIÓN)
-- ================================================================

DO $$
DECLARE
    ti_id UUID;
BEGIN
    SELECT id INTO ti_id FROM carrera WHERE nombre = 'TECNOLOGÍAS DE LA INFORMACIÓN';

    INSERT INTO rac (carrera_id, codigo, descripcion, orden) VALUES
        (ti_id, 'RAC1', 'Comunica efectivamente en español e inglés en diversos contextos profesionales.', 1),
        (ti_id, 'RAC2', 'Aplica métodos y técnicas eficientes en el gobierno, auditoría y gestión de proyectos de Tecnologías de la Información (TI) para la administración de tecnologías informáticas fiables que protejan la información de los usuarios o corporaciones.', 2),
        (ti_id, 'RAC3', 'Implementa soluciones basadas en tecnologías web y móvil para el cumplimiento de los requerimientos y estándares corporativos.', 3),
        (ti_id, 'RAC4', 'Aplica las competencias adquiridas con liderazgo en actividades inherentes a la profesión para la construcción de soluciones innovadoras con sostenibilidad ambiental basados en TIC y TIP.', 4),
        (ti_id, 'RAC5', 'Desarrolla diferentes tecnologías de redes para la optimización de la administración y gestión de grandes volúmenes de datos en sistemas distribuidos.', 5)
    ON CONFLICT (carrera_id, codigo) DO NOTHING;
END $$;

-- ================================================================
-- SEED: ASIGNATURAS (TECNOLOGÍAS DE LA INFORMACIÓN)
-- ================================================================

DO $$
DECLARE
    ti_id UUID;
    asignatura_data RECORD;
BEGIN
    SELECT id INTO ti_id FROM carrera WHERE nombre = 'TECNOLOGÍAS DE LA INFORMACIÓN';

    -- PAO 1 (NIVELACIÓN)
    INSERT INTO asignatura (carrera_id, nombre, pao) VALUES
        (ti_id, 'Introducción a las TIC', 'NIVELACIÓN'),
        (ti_id, 'Matemáticas Básicas', 'NIVELACIÓN');

    -- PAO 1
    INSERT INTO asignatura (carrera_id, nombre, pao) VALUES
        (ti_id, 'INGLÉS I', '1'),
        (ti_id, 'FUNDAMENTOS DE PROGRAMACIÓN', '1'),
        (ti_id, 'EDUCACIÓN FÍSICA', '1'),
        (ti_id, 'SOSTENIBILIDAD AMBIENTAL', '1'),
        (ti_id, 'COMUNICACIÓN ORAL Y ESCRITA', '1'),
        (ti_id, 'QUÍMICA', '1'),
        (ti_id, 'ÁLGEBRA LINEAL', '1');

    -- PAO 2
    INSERT INTO asignatura (carrera_id, nombre, pao) VALUES
        (ti_id, 'FÍSICA MECÁNICA', '2'),
        (ti_id, 'INGLÉS II', '2'),
        (ti_id, 'METODOLOGÍA DE LA INVESTIGACIÓN', '2'),
        (ti_id, 'CÁLCULO DE UNA VARIABLE', '2'),
        (ti_id, 'ADMINISTRACIÓN DE SISTEMAS OPERATIVOS', '2'),
        (ti_id, 'PROGRAMACIÓN', '2');

    -- PAO 3
    INSERT INTO asignatura (carrera_id, nombre, pao) VALUES
        (ti_id, 'INGLÉS III', '3'),
        (ti_id, 'SISTEMAS DE COMUNICACIÓN', '3'),
        (ti_id, 'FUNDAMENTOS DE BASE DE DATOS', '3'),
        (ti_id, 'ECUACIONES DIFERENCIALES', '3'),
        (ti_id, 'CÁLCULO DE VARIAS VARIABLES', '3'),
        (ti_id, 'GESTIÓN DE PROYECTOS TI', '3'),
        (ti_id, 'REALIDAD SOCIOECONÓMICA E INTERCULTURALIDAD', '3');

    -- PAO 4
    INSERT INTO asignatura (carrera_id, nombre, pao) VALUES
        (ti_id, 'INGLÉS IV', '4'),
        (ti_id, 'MATEMÁTICA AVANZADA', '4'),
        (ti_id, 'FUNDAMENTOS DE REDES', '4'),
        (ti_id, 'DISEÑO DE EXPERIENCIA DE USUARIO', '4'),
        (ti_id, 'ADMINISTRACIÓN DE BASE DE DATOS', '4'),
        (ti_id, 'MÉTODOS NUMÉRICOS', '4'),
        (ti_id, 'GESTIÓN ADMINISTRATIVA', '4');

    -- PAO 5
    INSERT INTO asignatura (carrera_id, nombre, pao) VALUES
        (ti_id, 'CONMUTACIÓN Y ENRUTAMIENTO', '5'),
        (ti_id, 'ESTADÍSTICA Y PROBABILIDAD', '5'),
        (ti_id, 'TECNOLOGÍA WEB', '5'),
        (ti_id, 'BIG DATA', '5'),
        (ti_id, 'TECNOLOGÍA Y DISEÑO MULTIMEDIA', '5'),
        (ti_id, 'INFRAESTRUCTURA TI', '5'),
        (ti_id, 'ÉTICA Y RELACIONES HUMANAS', '5');

    -- PAO 6
    INSERT INTO asignatura (carrera_id, nombre, pao) VALUES
        (ti_id, 'ESCALABILIDAD DE REDES', '6'),
        (ti_id, 'COMPUTACIÓN MÓVIL', '6'),
        (ti_id, 'MACHINE LEARNING', '6'),
        (ti_id, 'PRÁCTICAS DE SERVICIOS COMUNITARIO', '6'),
        (ti_id, 'INTEROPERABILIDAD DE PLATAFORMAS', '6'),
        (ti_id, 'EMPRENDIMIENTO', '6');

    -- PAO 7
    INSERT INTO asignatura (carrera_id, nombre, pao) VALUES
        (ti_id, 'ITINERARIO 1: Ethical Hacking', '7'),
        (ti_id, 'ITINERARIO 1: Criptografía', '7'),
        (ti_id, 'BUSINESS INTELLIGENCE', '7'),
        (ti_id, 'SEGURIDAD TI', '7'),
        (ti_id, 'APLICACIONES IoT', '7'),
        (ti_id, 'PRÁCTICAS LABORALES', '7'),
        (ti_id, 'FORMULACIÓN DE TRABAJO DE TITULACIÓN', '7');

    -- PAO 8
    INSERT INTO asignatura (carrera_id, nombre, pao) VALUES
        (ti_id, 'CLOUD COMPUTING', '8'),
        (ti_id, 'AUDITORÍA TI', '8'),
        (ti_id, 'GOBIERNO TI', '8'),
        (ti_id, 'SISTEMAS DE INFORMACIÓN GEOGRÁFICA', '8'),
        (ti_id, 'ITINERARIO 2: Deep Learning 2', '8'),
        (ti_id, 'ITINERARIO 2: Deep Learning 1', '8'),
        (ti_id, 'TRABAJO DE TITULACIÓN', '8');
END $$;

-- ================================================================
-- SEED: RAAU (TECNOLOGÍAS DE LA INFORMACIÓN)
-- ================================================================

DO $$
DECLARE
    ti_id UUID;
    rac1_id UUID;
    rac2_id UUID;
    rac3_id UUID;
    rac4_id UUID;
    rac5_id UUID;
    asig_id UUID;
BEGIN
    SELECT id INTO ti_id FROM carrera WHERE nombre = 'TECNOLOGÍAS DE LA INFORMACIÓN';
    SELECT id INTO rac1_id FROM rac WHERE carrera_id = ti_id AND codigo = 'RAC1';
    SELECT id INTO rac2_id FROM rac WHERE carrera_id = ti_id AND codigo = 'RAC2';
    SELECT id INTO rac3_id FROM rac WHERE carrera_id = ti_id AND codigo = 'RAC3';
    SELECT id INTO rac4_id FROM rac WHERE carrera_id = ti_id AND codigo = 'RAC4';
    SELECT id INTO rac5_id FROM rac WHERE carrera_id = ti_id AND codigo = 'RAC5';

    -- INGLÉS I → RAC1
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'INGLÉS I';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac1_id, 'RAAU1', 'Utiliza expresiones de uso común para comunicar ideas sencillas sobre actividades cotidianas, descripciones familiares y opiniones básicas.', 1);

    -- FUNDAMENTOS DE PROGRAMACIÓN → RAC3
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'FUNDAMENTOS DE PROGRAMACIÓN';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac3_id, 'RAAU1', 'Implementa algoritmos estructurados para computadoras eficientes para la resolución de problemas planteados.', 1);

    -- SOSTENIBILIDAD AMBIENTAL → RAC4
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'SOSTENIBILIDAD AMBIENTAL';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac4_id, 'RAAU1', 'Aplica los principios y normas ambientales para la adopción de alternativas de evaluación, control y mitigación de impactos ambientales.', 1);

    -- COMUNICACIÓN ORAL Y ESCRITA → RAC1
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'COMUNICACIÓN ORAL Y ESCRITA';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac1_id, 'RAAU1', 'Aplica los conceptos de la comunicación oral y escrita en diversos contextos sociales y profesionales.', 1);

    -- GESTIÓN DE PROYECTOS TI → RAC2 (2 RAAU)
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'GESTIÓN DE PROYECTOS TI';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Diseña planes de proyecto que garanticen la implementación de soluciones tecnológicas.', 1),
        (asig_id, rac2_id, 'RAAU2', 'Utiliza herramientas tecnológicas para el seguimiento y control de proyectos TI.', 2);

    -- FUNDAMENTOS DE REDES → RAC5
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'FUNDAMENTOS DE REDES';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac5_id, 'RAAU1', 'Diseña redes de computadoras basados en modelos OSI, TCP/IP para entornos locales.', 1);

    -- GOBIERNO TI → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'GOBIERNO TI';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Identifica marcos de referencia, estándares y mejores prácticas relacionadas al gobierno TI.', 1);

    -- AUDITORÍA TI → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'AUDITORÍA TI';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Aplica normas de auditoría TI en los sistemas de información.', 1);

    -- CLOUD COMPUTING → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'CLOUD COMPUTING';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Aplica arquitecturas en la nube para la optimización de recursos y la escalabilidad de servicios de TI.', 1);

    -- PROGRAMACIÓN → RAC3
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'PROGRAMACIÓN';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac3_id, 'RAAU1', 'Implementa aplicaciones de escritorio para ambientes colaborativos en desarrollo de soluciones informáticas.', 1);

    -- ADMINISTRACIÓN DE SISTEMAS OPERATIVOS → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'ADMINISTRACIÓN DE SISTEMAS OPERATIVOS';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Configura sistemas operativos para la solución de problemas tecnológicos en diferentes plataformas.', 1);

    -- INGLÉS II → RAC1
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'INGLÉS II';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac1_id, 'RAAU1', 'Utiliza vocabulario y frases simples sobre temas de interés personal comunicando ideas básicas.', 1);

    -- INGLÉS III → RAC1
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'INGLÉS III';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac1_id, 'RAAU1', 'Habla en diversos contextos sobre situaciones reales, verdades científicas y hechos describiendo eventos.', 1);

    -- INGLÉS IV → RAC1
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'INGLÉS IV';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac1_id, 'RAAU1', 'Construye ideas coherentes con un lenguaje claro y preciso desarrollando el pensamiento crítico.', 1);

    -- SISTEMAS DE COMUNICACIÓN → RAC5
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'SISTEMAS DE COMUNICACIÓN';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac5_id, 'RAAU1', 'Interpreta las técnicas de transmisión, modulación y multiplexación para la transmisión de señales.', 1);

    -- FUNDAMENTOS DE BASE DE DATOS → RAC5
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'FUNDAMENTOS DE BASE DE DATOS';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac5_id, 'RAAU1', 'Diseña modelos bases de datos relacionales para la manipulación de los datos.', 1);

    -- MACHINE LEARNING → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'MACHINE LEARNING';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Analiza patrones de comportamiento de datos en la implementación de modelos predictivos.', 1);

    -- SEGURIDAD TI → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'SEGURIDAD TI';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Implementa medidas de seguridad efectivas que salvaguarden recursos y procesos críticos.', 1);

    -- COMPUTACIÓN MÓVIL → RAC3
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'COMPUTACIÓN MÓVIL';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac3_id, 'RAAU1', 'Desarrolla aplicaciones móviles adaptables para diferentes plataformas móviles.', 1);

    -- ADMINISTRACIÓN DE BASE DE DATOS → RAC5
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'ADMINISTRACIÓN DE BASE DE DATOS';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac5_id, 'RAAU1', 'Diseña base de datos avanzadas SQL y no SQL para soluciones tecnológicas.', 1);

    -- CONMUTACIÓN Y ENRUTAMIENTO → RAC5
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'CONMUTACIÓN Y ENRUTAMIENTO';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac5_id, 'RAAU1', 'Diseña topologías de redes de datos para la conmutación y enrutamiento de paquetes.', 1);

    -- DISEÑO DE EXPERIENCIA DE USUARIO → RAC3
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'DISEÑO DE EXPERIENCIA DE USUARIO';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac3_id, 'RAAU1', 'Aplica los principios de usabilidad, accesibilidad y diseño centrado en el usuario.', 1);

    -- INFRAESTRUCTURA TI → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'INFRAESTRUCTURA TI';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Implementa infraestructura TI para soluciones escalables que atiendan necesidades empresariales.', 1);

    -- ESCALABILIDAD DE REDES → RAC5
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'ESCALABILIDAD DE REDES';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac5_id, 'RAAU1', 'Implementa redes escalables con alta disponibilidad y redundancia para pequeñas y medianas empresas.', 1);

    -- TECNOLOGÍA WEB → RAC3
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'TECNOLOGÍA WEB';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac3_id, 'RAAU1', 'Implementa aplicaciones web para la solución de problemas tecnológicos en el entorno.', 1);

    -- BIG DATA → RAC5
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'BIG DATA';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac5_id, 'RAAU1', 'Utiliza aplicaciones del ecosistema de Big Data para la implementación de soluciones escalables.', 1);

    -- MÉTODOS NUMÉRICOS → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'MÉTODOS NUMÉRICOS';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Aplica los métodos numéricos para resolución de problemas de un paso y multipaso aplicados en TI.', 1);

    -- TECNOLOGÍA Y DISEÑO MULTIMEDIA → RAC3
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'TECNOLOGÍA Y DISEÑO MULTIMEDIA';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac3_id, 'RAAU1', 'Utiliza software y herramientas multimedia para creación y edición de contenido multimedia e inmersivo.', 1);

    -- GESTIÓN ADMINISTRATIVA → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'GESTIÓN ADMINISTRATIVA';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Identifica riesgos y procesos de control estratégico con la aplicación de medidas preventivas.', 1);

    -- ÉTICA Y RELACIONES HUMANAS → RAC4
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'ÉTICA Y RELACIONES HUMANAS';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac4_id, 'RAAU1', 'Aplica los principios éticos universales en los diferentes ambientes sociales y laborales.', 1);

    -- CÁLCULO DE UNA VARIABLE → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'CÁLCULO DE UNA VARIABLE';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Aplica los conocimientos del cálculo para la resolución de problemas matemáticos con aplicaciones tecnológicas.', 1);

    -- ESTADÍSTICA Y PROBABILIDAD → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'ESTADÍSTICA Y PROBABILIDAD';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Aplica conceptos estadísticos y probabilísticos para el tratamiento de datos en eventos aleatorios.', 1);

    -- ECUACIONES DIFERENCIALES → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'ECUACIONES DIFERENCIALES';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Aplica métodos de ecuaciones diferenciales en la resolución de problemas reales en el área de TI.', 1);

    -- CÁLCULO DE VARIAS VARIABLES → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'CÁLCULO DE VARIAS VARIABLES';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Aplica los conceptos del cálculo diferencial e integral en problemas reales con múltiples variables.', 1);

    -- MATEMÁTICA AVANZADA → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'MATEMÁTICA AVANZADA';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Integra modelos de matemática avanzada en la resolución de problemas complejos de ingeniería en TI.', 1);

    -- ÁLGEBRA LINEAL → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'ÁLGEBRA LINEAL';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Comprende las representaciones algebraicas y geométricas de vectores en varias dimensiones.', 1);

    -- FÍSICA MECÁNICA → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'FÍSICA MECÁNICA';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Aplica los principios fundamentales de la física mecánica en la resolución de problemas.', 1);

    -- QUÍMICA → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'QUÍMICA';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Evalúa las reacciones químicas inorgánicas en el laboratorio caracterizando las funciones químicas.', 1);

    -- METODOLOGÍA DE LA INVESTIGACIÓN → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'METODOLOGÍA DE LA INVESTIGACIÓN';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Aplica las metodologías de investigación en las propuestas de proyectos tecnológicos.', 1);

    -- REALIDAD SOCIOECONÓMICA E INTERCULTURALIDAD → RAC4
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'REALIDAD SOCIOECONÓMICA E INTERCULTURALIDAD';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac4_id, 'RAAU1', 'Relaciona los conceptos entre la estructura de la economía, cultura y el proceso social en el contexto ecuatoriano.', 1);

    -- BUSINESS INTELLIGENCE → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'BUSINESS INTELLIGENCE';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Implementa entornos de visualización y análisis de negocios para la toma de decisiones estratégicas.', 1);

    -- EDUCACIÓN FÍSICA → RAC4
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'EDUCACIÓN FÍSICA';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac4_id, 'RAAU1', 'Aplica métodos teóricos y prácticos para facilitar la comprensión de las diferentes técnicas de los deportes.', 1);

    -- APLICACIONES IoT → RAC3
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'APLICACIONES IoT';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac3_id, 'RAAU1', 'Implementa soluciones tecnológicas innovadoras basadas en IoT para sectores industrial, empresarial y social.', 1);

    -- ITINERARIO 1: Ethical Hacking → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'ITINERARIO 1: Ethical Hacking';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Aplica técnicas de hacking ético en la identificación de vulnerabilidades de sistemas informáticos y redes.', 1);

    -- ITINERARIO 1: Criptografía → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'ITINERARIO 1: Criptografía';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Aplica criptosistemas y protocolos de criptografía para el aseguramiento de infraestructuras tecnológicas.', 1);

    -- FORMULACIÓN DE TRABAJO DE TITULACIÓN → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'FORMULACIÓN DE TRABAJO DE TITULACIÓN';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Desarrolla la propuesta de trabajo de titulación acorde a la normativa vigente.', 1);

    -- ITINERARIO 2: Deep Learning 2 → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'ITINERARIO 2: Deep Learning 2';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Implementa modelos de inteligencia artificial con datos multimodales para automatización de procesos.', 1);

    -- ITINERARIO 2: Deep Learning 1 → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'ITINERARIO 2: Deep Learning 1';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Implementa modelos de inteligencia artificial para automatización de procesos con datos 2D y 3D.', 1);

    -- TRABAJO DE TITULACIÓN → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'TRABAJO DE TITULACIÓN';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Desarrolla el trabajo de titulación de acuerdo a la modalidad seleccionada.', 1);

    -- Introducción a las TIC → RAC1
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'Introducción a las TIC';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac1_id, 'RAAU1', 'Identifica conceptos básicos de tecnologías de la información y comunicación.', 1);

    -- Matemáticas Básicas → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'Matemáticas Básicas';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Aplica conceptos matemáticos básicos para la resolución de problemas.', 1);

    -- INTEROPERABILIDAD DE PLATAFORMAS → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'INTEROPERABILIDAD DE PLATAFORMAS';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Analiza las arquitecturas orientadas a servicios (SOA) y los servicios de integración SOAP y REST.', 1);

    -- EMPRENDIMIENTO → RAC4
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'EMPRENDIMIENTO';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac4_id, 'RAAU1', 'Diseña planes de negocios tecnológicos, innovadores y sostenibles para diferentes grupos humanos.', 1);

    -- SISTEMAS DE INFORMACIÓN GEOGRÁFICA → RAC3
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'SISTEMAS DE INFORMACIÓN GEOGRÁFICA';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac3_id, 'RAAU1', 'Desarrolla soluciones tecnológicas integrales basadas en SIG para análisis avanzado geoespacial.', 1);

    -- PRÁCTICAS DE SERVICIOS COMUNITARIO → RAC4
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'PRÁCTICAS DE SERVICIOS COMUNITARIO';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac4_id, 'RAAU1', 'Aplica los conocimientos adquiridos en beneficio de la comunidad mediante servicios comunitarios.', 1);

    -- PRÁCTICAS LABORALES → RAC2
    SELECT id INTO asig_id FROM asignatura WHERE carrera_id = ti_id AND nombre = 'PRÁCTICAS LABORALES';
    INSERT INTO raau (asignatura_id, rac_id, codigo, descripcion, orden) VALUES
        (asig_id, rac2_id, 'RAAU1', 'Aplica las competencias profesionales en entornos laborales reales.', 1);
END $$;
