<?php
declare(strict_types=1);

final class Database
{
    private ?PDO $pdo = null;
    private bool $enabled = false;

    public function __construct()
    {
        $url = Config::get('DATABASE_URL', '');
        if ($url !== null && $url !== '') {
            $this->connect($url);
        }
    }

    public function enabled(): bool
    {
        return $this->enabled;
    }

    private function connect(string $url): void
    {
        $p = parse_url($url);
        if ($p === false || empty($p['host'])) {
            Logger::error('DATABASE_URL inválida: no se pudo interpretar.');
            return;
        }
        $host = $p['host'];
        $port = $p['port'] ?? 5432;
        // If host only resolves to IPv6 (no A record), skip PDO — our network doesn't route IPv6
        $ipv4 = gethostbyname($host);
        if ($ipv4 === $host) {
            Logger::warning("DB host '$host' no tiene resolución IPv4 — se usará REST API fallback.");
            return;
        }
        $dbname = isset($p['path']) ? ltrim($p['path'], '/') : 'postgres';
        $user = isset($p['user']) ? urldecode($p['user']) : '';
        $pass = isset($p['pass']) ? urldecode($p['pass']) : '';
        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=require;connect_timeout=3";
        try {
            $this->pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => true,
                PDO::ATTR_TIMEOUT => 3,
            ]);
            $this->enabled = true;
        } catch (Throwable $e) {
            Logger::error('No se pudo conectar a PostgreSQL: ' . $e->getMessage());
            $this->enabled = false;
        }
    }

    public static function hashPassword(string $plain): string
    {
        return password_hash($plain, PASSWORD_BCRYPT, ['cost' => 10]);
    }

    public static function verifyPassword(string $plain, ?string $hash): bool
    {
        return $hash !== null && $hash !== '' && password_verify($plain, $hash);
    }

    public function ensureSchema(): void
    {
        if (!$this->pdo) {
            return;
        }

        $this->execSafe(<<<'SQL'
            CREATE TABLE IF NOT EXISTS docente (
                email TEXT PRIMARY KEY, nombre TEXT, cedula TEXT,
                rol TEXT DEFAULT 'docente', password_hash TEXT,
                created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
            );
        SQL, 'Crear tabla docente');

        $this->execSafe(<<<'SQL'
            CREATE TABLE IF NOT EXISTS asignacion (
                id TEXT PRIMARY KEY, docente_email TEXT,
                carrera TEXT, asignatura TEXT, pao TEXT, paralelo TEXT,
                cod_carrera TEXT, cod_materia TEXT, cod_nivel TEXT, cod_periodo TEXT,
                data JSONB NOT NULL DEFAULT '{}',
                created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
            );
        SQL, 'Crear tabla asignacion');

        $this->execSafe(<<<'SQL'
            CREATE TABLE IF NOT EXISTS configuracion (
                id TEXT PRIMARY KEY, owner_email TEXT,
                carrera TEXT, asignatura TEXT, pao TEXT, paralelo TEXT,
                rac JSONB DEFAULT '[]', raau JSONB DEFAULT '[]', actividades JSONB DEFAULT '[]',
                data JSONB NOT NULL DEFAULT '{}', saved_at TEXT,
                created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
            );
        SQL, 'Crear tabla configuracion');

        $this->execSafe(<<<'SQL'
            CREATE TABLE IF NOT EXISTS config_estudiantes (
                config_id TEXT PRIMARY KEY REFERENCES configuracion(id) ON DELETE CASCADE,
                data JSONB NOT NULL DEFAULT '[]',
                created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
            );
        SQL, 'Crear tabla config_estudiantes');

        $this->execSafe(<<<'SQL'
            CREATE TABLE IF NOT EXISTS config_notas (
                config_id TEXT PRIMARY KEY REFERENCES configuracion(id) ON DELETE CASCADE,
                data JSONB NOT NULL DEFAULT '[]',
                created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
            );
        SQL, 'Crear tabla config_notas');

        $this->execSafe('CREATE INDEX IF NOT EXISTS idx_asignacion_docente ON asignacion(docente_email)', 'Índice asignacion');
        $this->execSafe('CREATE INDEX IF NOT EXISTS idx_config_owner ON configuracion(owner_email)', 'Índice config owner');
        $this->execSafe('CREATE INDEX IF NOT EXISTS idx_config_carrera ON configuracion(carrera)', 'Índice config carrera');

        $this->execSafe("ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS paralelo TEXT DEFAULT ''", 'Columna paralelo');
        $this->execSafe("ALTER TABLE config_estudiantes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()", 'Columna updated_at estudiantes');
        $this->execSafe("ALTER TABLE config_notas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()", 'Columna updated_at notas');

        $coordEmail = Config::get('COORDINATOR_EMAIL', 'ppaguay@espoch.edu.ec') ?? 'ppaguay@espoch.edu.ec';
        $coordPass = Config::get('COORDINATOR_PASSWORD', '') ?? '';
        $coordName = Config::get('COORDINATOR_NAME', 'PAUL PAGUAY') ?? 'PAUL PAGUAY';

        if ($coordPass === '') {
            Logger::warning('COORDINATOR_PASSWORD no configurada — el coordinador existente mantiene su contraseña');
            return;
        }

        $stmt = $this->pdo->prepare('SELECT 1 FROM docente WHERE email = :email');
        $stmt->execute([':email' => $coordEmail]);
        if ($stmt->fetchColumn() === false) {
            $ins = $this->pdo->prepare(
                'INSERT INTO docente(email,nombre,cedula,rol,password_hash) VALUES (:email,:nombre,:cedula,:rol,:hash)'
            );
            $ins->execute([
                ':email' => $coordEmail,
                ':nombre' => $coordName,
                ':cedula' => '',
                ':rol' => 'coordinador',
                ':hash' => self::hashPassword($coordPass),
            ]);
            Logger::info('Coordinador sembrado en la BD.');
        }
    }

    private function execSafe(string $sql, string $label): void
    {
        try {
            $this->pdo->exec($sql);
        } catch (Throwable $e) {
            Logger::warning("$label: {$e->getMessage()}");
        }
    }

    public function health(): array
    {
        if (!$this->pdo) {
            return ['enabled' => false];
        }
        $this->pdo->query('SELECT 1');
        return ['enabled' => true];
    }

    // ------------------------------------------------------------------
    //  getStore — Lee datos del usuario autenticado
    // ------------------------------------------------------------------
    public function getStore(string $email, string $role): array
    {
        // Docentes: todos menos el coordinador (visible para coordinación)
        $docentes = $this->pdo->query("SELECT email,nombre,cedula,rol FROM docente ORDER BY nombre")->fetchAll();
        $docentes = array_values(array_filter($docentes, fn($d) => $d['rol'] !== 'coordinador'));

        // Asignaciones: según rol
        if ($role === 'coordinador') {
            $asigRows = $this->pdo->query("SELECT data FROM asignacion")->fetchAll();
        } else {
            $stmt = $this->pdo->prepare("SELECT data FROM asignacion WHERE docente_email = :email");
            $stmt->execute([':email' => $email]);
            $asigRows = $stmt->fetchAll();
        }
        $teacherAssignments = array_map(fn($r) => json_decode($r['data'], true), $asigRows);

        // Configuraciones
        if ($role === 'coordinador') {
            $cfgRows = $this->pdo->query("SELECT data FROM configuracion ORDER BY updated_at DESC")->fetchAll();
        } else {
            $stmt = $this->pdo->prepare("SELECT data FROM configuracion WHERE owner_email = :email ORDER BY updated_at DESC");
            $stmt->execute([':email' => $email]);
            $cfgRows = $stmt->fetchAll();
        }
        $savedConfigs = array_map(fn($r) => json_decode($r['data'], true), $cfgRows);

        // Estudiantes y notas
        $ids = array_values(array_filter(array_map(fn($c) => $c['id'] ?? null, $savedConfigs)));
        $studentsByConfig = [];
        $gradesByConfig = [];
        if ($ids) {
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $est = $this->pdo->prepare("SELECT config_id,data FROM config_estudiantes WHERE config_id IN ($placeholders)");
            $est->execute($ids);
            foreach ($est->fetchAll() as $r) {
                $studentsByConfig[$r['config_id']] = json_decode($r['data'], true);
            }
            $not = $this->pdo->prepare("SELECT config_id,data FROM config_notas WHERE config_id IN ($placeholders)");
            $not->execute($ids);
            foreach ($not->fetchAll() as $r) {
                $gradesByConfig[$r['config_id']] = json_decode($r['data'], true);
            }
        }

        return [
            'docentes' => $docentes,
            'teacherAssignments' => $teacherAssignments,
            'savedConfigs' => $savedConfigs,
            'studentsByConfig' => (object) $studentsByConfig,
            'gradesByConfig' => (object) $gradesByConfig,
        ];
    }

    // ------------------------------------------------------------------
    //  putStore — Guarda datos del usuario autenticado
    //  Cambio clave: UPSERT en vez de DELETE+INSERT para no perder data.
    //  Para estudiantes: merge (no borra). Para notas: merge (no borra).
    // ------------------------------------------------------------------
    public function putStore(array $payload): array
    {
        $email = $payload['email'] ?? '';
        $role = $payload['role'] ?? '';
        $this->pdo->beginTransaction();
        try {
            // 1) Docentes (solo coordinador)
            if ($role === 'coordinador' && isset($payload['docentes']) && is_array($payload['docentes'])) {
                foreach ($payload['docentes'] as $d) {
                    $de = strtolower($d['email'] ?? '');
                    if ($de === '') continue;
                    $nombre = $d['nombre'] ?? $d['name'] ?? '';
                    $cedula = $d['cedula'] ?? '';
                    $rol = $d['rol'] ?? $d['role'] ?? 'docente';
                    if (!empty($d['password'])) {
                        $stmt = $this->pdo->prepare(
                            'INSERT INTO docente(email,nombre,cedula,rol,password_hash) VALUES (:e,:n,:c,:r,:h)
                             ON CONFLICT (email) DO UPDATE SET nombre=:n,cedula=:c,rol=:r,password_hash=:h,updated_at=now()'
                        );
                        $stmt->execute([':e' => $de, ':n' => $nombre, ':c' => $cedula, ':r' => $rol, ':h' => self::hashPassword($d['password'])]);
                    } else {
                        $stmt = $this->pdo->prepare(
                            'INSERT INTO docente(email,nombre,cedula,rol,password_hash) VALUES (:e,:n,:c,:r,NULL)
                             ON CONFLICT (email) DO UPDATE SET nombre=:n,cedula=:c,rol=:r,updated_at=now()'
                        );
                        $stmt->execute([':e' => $de, ':n' => $nombre, ':c' => $cedula, ':r' => $rol]);
                    }
                }
            }

            // 2) Asignaciones (solo coordinador) — UPSERT, no DELETE
            if ($role === 'coordinador' && isset($payload['teacherAssignments']) && is_array($payload['teacherAssignments'])) {
                $stmt = $this->pdo->prepare(
                    'INSERT INTO asignacion(id,docente_email,carrera,asignatura,pao,paralelo,data)
                     VALUES (:id,:de,:ca,:asg,:pao,:par,:data::jsonb)
                     ON CONFLICT (id) DO UPDATE SET
                       docente_email=:de, carrera=:ca, asignatura=:asg,
                       pao=:pao, paralelo=:par, data=:data::jsonb, updated_at=now()'
                );
                foreach ($payload['teacherAssignments'] as $a) {
                    if (empty($a['id'])) continue;
                    $stmt->execute([
                        ':id' => $a['id'],
                        ':de' => $a['docenteEmail'] ?? '',
                        ':ca' => $a['carrera'] ?? '',
                        ':asg' => $a['asignatura'] ?? '',
                        ':pao' => (string) ($a['pao'] ?? ''),
                        ':par' => (string) ($a['paralelo'] ?? ''),
                        ':data' => json_encode($a, JSON_UNESCAPED_UNICODE),
                    ]);
                }
            }

            // 3) Configuraciones — UPSERT, no DELETE (cada usuario solo sus propias)
            if (isset($payload['savedConfigs']) && is_array($payload['savedConfigs'])) {
                $stmt = $this->pdo->prepare(
                    'INSERT INTO configuracion(id,owner_email,carrera,asignatura,pao,paralelo,data,saved_at)
                     VALUES (:id,:owner,:ca,:asg,:pao,:par,:data::jsonb,:saved)
                     ON CONFLICT (id) DO UPDATE SET
                       owner_email=:owner, carrera=:ca, asignatura=:asg, pao=:pao, paralelo=:par,
                       data=:data::jsonb, saved_at=:saved, updated_at=now()'
                );
                foreach ($payload['savedConfigs'] as $c) {
                    if (empty($c['id'])) continue;
                    $cc = $c['courseConfig'] ?? [];
                    $stmt->execute([
                        ':id' => $c['id'],
                        ':owner' => $c['ownerEmail'] ?? $email,
                        ':ca' => $cc['carrera'] ?? '',
                        ':asg' => $cc['asignatura'] ?? '',
                        ':pao' => (string) ($cc['pao'] ?? ''),
                        ':par' => (string) ($cc['paralelo'] ?? ''),
                        ':data' => json_encode($c, JSON_UNESCAPED_UNICODE),
                        ':saved' => $c['savedAt'] ?? '',
                    ]);
                }
            }

            // 4) Estudiantes — MERGE: conserva los existentes, agrega nuevos, no borra
            if (isset($payload['studentsByConfig']) && is_array($payload['studentsByConfig'])) {
                foreach ($payload['studentsByConfig'] as $configId => $newStudents) {
                    $this->mergeStudents($configId, $newStudents ?? []);
                }
            }

            // 5) Notas — MERGE: conserva todas las existentes, actualiza por coincidencia studentId+activityId
            if (isset($payload['gradesByConfig']) && is_array($payload['gradesByConfig'])) {
                foreach ($payload['gradesByConfig'] as $configId => $newGrades) {
                    $this->mergeGrades($configId, $newGrades ?? []);
                }
            }

            $this->pdo->commit();
            return ['ok' => true];
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            Logger::error('putStore falló', ['email' => $email, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    // ------------------------------------------------------------------
    //  mergeStudents — Agrega nuevos estudiantes, conserva existentes,
    //  marca como inactivos los que ya no aparecen en OASIS (no borra).
    // ------------------------------------------------------------------
    private function mergeStudents(string $configId, array $newStudents): void
    {
        // Leer existentes
        $existing = [];
        $stmt = $this->pdo->prepare("SELECT data FROM config_estudiantes WHERE config_id = :id");
        $stmt->execute([':id' => $configId]);
        $row = $stmt->fetch();
        if ($row) {
            $existing = json_decode($row['data'], true) ?? [];
        }

        // Indexar existentes por cédula
        $byCedula = [];
        foreach ($existing as $s) {
            $ced = $s['cedula'] ?? '';
            if ($ced !== '') $byCedula[$ced] = $s;
        }

        // Indexar nuevos por cédula
        $newByCedula = [];
        foreach ($newStudents as $s) {
            $ced = $s['cedula'] ?? '';
            if ($ced !== '') $newByCedula[$ced] = true;
        }

        // Construir merged: existentes + nuevos
        $merged = [];
        $seen = [];

        // Primero los existentes: marcar inactivos si ya no están en OASIS
        foreach ($existing as $s) {
            $ced = $s['cedula'] ?? '';
            $key = $ced !== '' ? $ced : ($s['id'] ?? uniqid());
            if ($ced !== '' && !isset($newByCedula[$ced])) {
                // Estudiante ya no aparece en OASIS — marcar inactivo pero conservar
                $s['estado'] = 'inactivo';
            } else {
                $s['estado'] = 'activo';
            }
            $merged[] = $s;
            $seen[$key] = true;
        }

        // Luego los nuevos (solo los que no existían)
        foreach ($newStudents as $s) {
            $ced = $s['cedula'] ?? '';
            $key = $ced !== '' ? $ced : ($s['id'] ?? uniqid());
            if (!isset($seen[$key])) {
                $s['estado'] = 'activo';
                $merged[] = $s;
                $seen[$key] = true;
            }
        }

        // Guardar merged
        $upsert = $this->pdo->prepare(
            'INSERT INTO config_estudiantes(config_id,data) VALUES (:id,:data::jsonb)
             ON CONFLICT (config_id) DO UPDATE SET data=:data::jsonb, updated_at=now()'
        );
        $upsert->execute([':id' => $configId, ':data' => json_encode($merged, JSON_UNESCAPED_UNICODE)]);
    }

    // ------------------------------------------------------------------
    //  mergeGrades — Conserva todas las notas existentes.
    //  Actualiza solo las que vienen en el payload (por studentId+activityId).
    //  NUNCA borra notas aunque el estudiante ya no esté en la nómina.
    // ------------------------------------------------------------------
    private function mergeGrades(string $configId, array $newGrades): void
    {
        // Leer existentes
        $existing = [];
        $stmt = $this->pdo->prepare("SELECT data FROM config_notas WHERE config_id = :id");
        $stmt->execute([':id' => $configId]);
        $row = $stmt->fetch();
        if ($row) {
            $existing = json_decode($row['data'], true) ?? [];
        }

        // Indexar existentes por studentId+activityId
        $byKey = [];
        foreach ($existing as $g) {
            $key = ($g['studentId'] ?? '') . '|' . ($g['activityId'] ?? '');
            $byKey[$key] = $g;
        }

        // Actualizar/agregar desde nuevos
        foreach ($newGrades as $g) {
            $key = ($g['studentId'] ?? '') . '|' . ($g['activityId'] ?? '');
            if ($key !== '|') {
                $byKey[$key] = $g; // sobrescribe o agrega
            }
        }

        $merged = array_values($byKey);

        // Guardar merged
        $upsert = $this->pdo->prepare(
            'INSERT INTO config_notas(config_id,data) VALUES (:id,:data::jsonb)
             ON CONFLICT (config_id) DO UPDATE SET data=:data::jsonb, updated_at=now()'
        );
        $upsert->execute([':id' => $configId, ':data' => json_encode($merged, JSON_UNESCAPED_UNICODE)]);
    }

    public function login(string $email, string $password): ?array
    {
        if ($this->pdo) {
            $stmt = $this->pdo->prepare('SELECT email,nombre,cedula,rol,password_hash FROM docente WHERE email = :email');
            $stmt->execute([':email' => strtolower($email)]);
            $u = $stmt->fetch();
            if ($u && self::verifyPassword($password, $u['password_hash'])) {
                return ['email' => $u['email'], 'name' => $u['nombre'], 'cedula' => $u['cedula'] ?? '', 'role' => $u['rol'], 'source' => 'db'];
            }
        }
        return $this->restLogin($email, $password);
    }

    private function restLogin(string $email, string $password): ?array
    {
        $supabaseUrl = Config::get('SUPABASE_URL', '');
        $serviceKey = Config::get('SUPABASE_SERVICE_ROLE_KEY', '');
        if ($supabaseUrl === '' || $serviceKey === '') {
            return null;
        }
        $url = rtrim($supabaseUrl, '/') . '/rest/v1/docente';
        $query = http_build_query([
            'select' => 'email,nombre,cedula,rol,password_hash',
            'email' => 'eq.' . strtolower($email),
            'limit' => '1',
        ]);
        $ch = curl_init($url . '?' . $query);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'apikey: ' . $serviceKey,
                'Authorization: Bearer ' . $serviceKey,
                'Accept: application/json',
            ],
            CURLOPT_TIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => false,
        ]);
        $resp = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($httpCode !== 200 || $resp === false || $resp === '') {
            return null;
        }
        $rows = json_decode($resp, true);
        if (empty($rows) || !is_array($rows)) {
            return null;
        }
        $u = $rows[0];
        if (!self::verifyPassword($password, $u['password_hash'] ?? null)) {
            return null;
        }
        return [
            'email' => $u['email'],
            'name' => $u['nombre'],
            'cedula' => $u['cedula'] ?? '',
            'role' => $u['rol'],
            'source' => 'db',
        ];
    }
}
