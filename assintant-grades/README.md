# Auxiliar de Calificaciones — ESPOCH

Aplicación web (React + Vite) para que los docentes configuren resultados de
aprendizaje (RAC/RAAU), actividades de evaluación y registren calificaciones,
con un panel de coordinación. Integra los servicios SOAP de **OASIS** (Sistema
Académico Integrado de la ESPOCH) a través de un **BFF** (backend intermedio).

## Arquitectura

```
Navegador (React + Vite)  ──JSON──►  BFF (server/, Node sin dependencias)  ──SOAP──►  OASIS .asmx
```

- El frontend **nunca** habla SOAP ni conoce credenciales de servicio.
- El BFF (`server/`) es el único que arma los envelopes SOAP y guarda las
  credenciales (`OASIS_USER` / `OASIS_PASS`) en variables de entorno.

### Servicios consumidos (solo lo necesario)

| Servicio SOAP        | Operación                          | Uso en la app                                |
|----------------------|------------------------------------|----------------------------------------------|
| `Seguridad.asmx`     | `AutenticarUsuarioCarrera`         | Inicio de sesión (roles por carrera)         |
| `Seguridad.asmx`     | `GetUsuarioFacultad`               | Correo institucional / **WebMail**           |
| `InfoGeneral.asmx`   | `GetPeriodoActual`                 | Autocompletar período académico              |
| `InfoGeneral.asmx`   | `GetTodasCarreras`                 | Resolver carrera → código OASIS              |
| `InfoCarrera.asmx`   | `GetMallaCurricularPensumVigente…` | Resolver asignatura → código + nivel         |
| `InfoCarrera.asmx`   | `GetDictadosMateria`               | Paralelo, nivel y **docente** de la materia  |
| `InfoCarrera.asmx`   | `GetAlumnosMateria`                | Nómina real de estudiantes                   |
| `InfoCarrera.asmx`   | `GetHorariosDocente`               | Horario semanal de cada docente              |
| `InfoCarrera.asmx`   | `GetUltimasNotasEstudianteCarrera` | Últimas notas (endpoint disponible)          |

### Funciones automáticas

- **Importar nómina (un clic):** en *Estudiantes → Importar de OASIS*, la app toma
  la carrera + asignatura ya configuradas, resuelve sus códigos OASIS
  (carrera → malla → dictado → paralelo) y trae la nómina real automáticamente.
  Si no puede resolver o el BFF está caído, ofrece un ingreso manual de códigos.
- **Coordinación → Importar docentes (OASIS):** trae todos los docentes que
  dictan en una carrera con sus **cargas horarias** (materia · nivel · paralelo)
  y les crea un perfil de acceso.

> Nota: el `<credentials>` de servicio no es obligatorio para estas lecturas; el
> *login real* sí requiere `OASIS_USER`/`OASIS_PASS`.

## Puesta en marcha

### 1. Backend (BFF)

```bash
cp server/.env.example server/.env   # y completa OASIS_USER / OASIS_PASS
npm run server                        # http://localhost:3001
```

> Sin credenciales, las operaciones de solo lectura (período, facultades)
> funcionan igual; el inicio de sesión real requiere `OASIS_USER`/`OASIS_PASS`.

### 2. Frontend

```bash
npm install
npm run dev          # http://localhost:5173
```

Configura `VITE_API_BASE_URL` si el BFF no está en `http://localhost:3001`.

## Base de datos (PostgreSQL en la nube)

Los datos **propios de la app** (docentes, asignaciones, configuraciones,
estudiantes y notas) se guardan en PostgreSQL a través del BFF. Los datos
académicos (carreras, malla, horarios, nómina) se siguen consultando en vivo a
OASIS. Sin `DATABASE_URL`, la app usa `sessionStorage` como respaldo (no se
comparte entre PCs y se pierde al cerrar).

### Conectar Neon (gratis) en 4 pasos

1. Crea una cuenta en [neon.tech](https://neon.tech) y un proyecto (Postgres).
2. Copia el **connection string** (formato `postgresql://...sslmode=require`).
3. Pégalo en `server/.env` como `DATABASE_URL=...`.
4. `npm run server` → al arrancar crea las tablas e inserta al coordinador.
   En el log verás `PostgreSQL: conectado y esquema listo.`

> La contraseña del coordinador y de los docentes se guarda **hasheada**
> (scrypt). El login se verifica primero localmente, luego contra la BD
> (`/api/db-login`) y por último contra OASIS.

### Tablas

`docente`, `asignacion`, `configuracion`, `config_estudiantes`, `config_notas`
(claves consultables + `JSONB` para la estructura flexible de cada entidad).

## Acceso y roles

- **Coordinador (cuenta base):** `ppaguay@espoch.edu.ec` · `paguay2026`
  (PAUL PAGUAY, clave temporal de prueba — cámbiala desde *Perfil*).
- **Docentes:** el coordinador los **importa desde OASIS** (con sus cargas
  horarias) o los crea a mano, y les **asigna una contraseña**. El docente
  ingresa con su correo + esa contraseña, o con sus credenciales OASIS reales.
- El login intenta primero la cuenta local; si no existe, autentica contra OASIS.

### Reglas de negocio

- Cada **docente solo ve y configura sus propias asignaturas** (las que le
  asignó el coordinador). La nómina se importa con los códigos OASIS exactos
  de esa asignación.
- En **Actividades**, los puntos de cada componente deben sumar su peso
  (ACD 3.5 · APEX 3.5 · AAUT 3.0 = 10) para poder guardar.
- En **Calificaciones**, se navega con Enter/Tab y con las flechas ↑↓←→.
- Cada usuario tiene una **configuración de perfil** (datos + cambio de clave).

## Endpoints del BFF

| Método | Ruta                    | Descripción                          |
|--------|-------------------------|--------------------------------------|
| GET    | `/api/health`           | Estado del BFF y si hay credenciales |
| GET    | `/api/periodo-actual`   | Período académico actual             |
| GET    | `/api/facultades`       | Catálogo de facultades               |
| POST   | `/api/login`            | `{login, password}` → roles + perfil |
| GET    | `/api/carreras`         | Carreras abiertas (código + nombre)  |
| POST   | `/api/nomina`           | `{carrera, asignatura, facultad}` → resuelve y devuelve estudiantes |
| POST   | `/api/docentes-carrera` | `{carrera, facultad}` → docentes + cargas horarias |
| POST   | `/api/horario-docente`  | `{cedula, codCarrera|carrera, codPeriodo}` → horario semanal |
| POST   | `/api/materias-docente` | `{codCarrera, cedula, codPeriodo}`   |
| POST   | `/api/alumnos-materia`  | `{codCarrera, codNivel, codParalelo, codPeriodo, codMateria}` |
| POST   | `/api/notas`            | `{codCarrera, cedula}`               |
