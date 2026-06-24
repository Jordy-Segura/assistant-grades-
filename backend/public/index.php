<?php
declare(strict_types=1);

$root = dirname(__DIR__);
require $root . '/app/Config.php';
require $root . '/app/Logger.php';
require $root . '/app/Http.php';
require $root . '/app/Soap.php';
require $root . '/app/Auth.php';
require $root . '/app/OasisService.php';
require $root . '/app/Database.php';
require $root . '/app/Controllers.php';

Config::load($root . '/.env');
Logger::init($root . '/' . (Config::get('LOG_DIR', 'logs') ?? 'logs'));

$warnings = [];
if ((Config::get('OASIS_USER', '') ?? '') === '' || (Config::get('OASIS_PASS', '') ?? '') === '') {
    $warnings[] = 'OASIS_USER/OASIS_PASS vacías — operaciones autenticadas usarán mock data';
}
if ((Config::get('DATABASE_URL', '') ?? '') === '') {
    $warnings[] = 'DATABASE_URL vacía — la app usará localStorage como respaldo';
}
if ((Config::get('AUTH_SECRET', '') ?? '') === '') {
    $warnings[] = 'AUTH_SECRET vacía — los tokens de autenticación usarán un valor por defecto';
}
foreach ($warnings as $w) {
    Logger::info('Config: ' . $w);
}

Http::cors();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = rtrim(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/', '/');
if ($path === '') {
    $path = '/';
}

Logger::info('Request', ['method' => $method, 'path' => $path]);

$soap = new Soap();
$oasis = new OasisService($soap);
$db = new Database();
try {
    if ($db->enabled()) {
        $marker = $root . '/' . (Config::get('LOG_DIR', 'logs') ?? 'logs') . '/.schema_ok';
        if (!is_file($marker)) {
            $db->ensureSchema();
            @file_put_contents($marker, date('c'));
            Logger::info('PostgreSQL conectado y esquema listo.');
        }
    }
} catch (Throwable $e) {
    Logger::error('No se pudo inicializar la BD: ' . $e->getMessage());
}

// Autenticación: verificar token en rutas protegidas
$authUser = null;
$protectedRoutes = ['GET /api/store', 'PUT /api/store'];
if (in_array($method . ' ' . $path, $protectedRoutes, true)) {
    $token = Auth::getTokenFromHeaders();
    if ($token === null) {
        // Fallback: verificar si hay email en query (compatibilidad hacia atrás)
        // Esto permite que el frontend actual funcione sin cambios inmediatos
        $input = in_array($method, ['POST', 'PUT'], true) ? Http::body() : Http::query();
        if (!empty($input['email'])) {
            Logger::warning('Ruta protegida accedida sin token — usando email de query (modo legado)', ['path' => $path]);
        } else {
            Http::json(['error' => 'Token de autenticación requerido', 'code' => 'AUTH_REQUIRED'], 401);
        }
    } else {
        $authUser = Auth::verifyToken($token);
        if ($authUser === null) {
            Http::json(['error' => 'Token inválido o expirado', 'code' => 'AUTH_INVALID'], 401);
        }
    }
}

$c = new Controllers($oasis, $db, $warnings, $authUser);

$routes = [
    'GET /api/health' => fn($in) => $c->health($in),
    'GET /api/periodo-actual' => fn($in) => $c->periodoActual($in),
    'GET /api/facultades' => fn($in) => $c->facultades($in),
    'GET /api/carreras' => fn($in) => $c->carreras($in),
    'POST /api/nomina' => fn($in) => $c->nomina($in),
    'POST /api/docentes-carrera' => fn($in) => $c->docentesCarrera($in),
    'POST /api/horario-docente' => fn($in) => $c->horarioDocente($in),
    'POST /api/materias-docente' => fn($in) => $c->materiasDocente($in),
    'POST /api/alumnos-materia' => fn($in) => $c->alumnosMateria($in),
    'POST /api/notas' => fn($in) => $c->notas($in),
    'POST /api/estudiante' => fn($in) => $c->estudiante($in),
    'POST /api/materias-estudiante' => fn($in) => $c->materiasEstudiante($in),
    'POST /api/estudiante-full' => fn($in) => $c->estudianteFull($in),
    'POST /api/login' => fn($in) => $c->login($in),
    'GET /api/db/health' => fn($in) => $c->dbHealth($in),
    'GET /api/store' => fn($in) => $c->getStore($in),
    'PUT /api/store' => fn($in) => $c->putStore($in),
    'POST /api/db-login' => fn($in) => $c->dbLogin($in),
    'POST /api/dev-login' => function ($in) use ($c) {
        $email = $in['login'] ?? '';
        $token = Auth::generateToken($email, 'coordinador');
        return [
            'roles' => [['codigoCarrera' => 'DEV', 'nombreRol' => 'COORDINADOR']],
            'perfil' => ['cedula' => '0000000000', 'apellidos' => 'Desarrollo', 'nombres' => 'Usuario', 'email' => $email],
            'token' => $token,
        ];
    },
];

$key = $method . ' ' . $path;

if (!isset($routes[$key])) {
    Logger::warning('Ruta no encontrada', ['route' => $key]);
    Http::json(['error' => 'Recurso no encontrado: ' . $key], 404);
}

$input = in_array($method, ['POST', 'PUT'], true) ? Http::body() : Http::query();
$input = Http::sanitize($input, ['login', 'email', 'nombre', 'carrera', 'asignatura', 'facultad', 'cedula']);

try {
    $result = $routes[$key]($input);
    Http::json($result, 200);
} catch (SoapFaultException $e) {
    Logger::warning('SoapFault en ' . $key . ': ' . $e->getMessage());
    Http::json(['error' => $e->getMessage()], 400);
} catch (Throwable $e) {
    Logger::error('Error procesando ' . $key . ': ' . $e->getMessage());
    Http::json(['error' => $e->getMessage() ?: 'Error en el servidor'], 502);
}
