<?php
declare(strict_types=1);

final class Controllers
{
    private OasisService $oasis;
    private Database $db;
    private array $warnings;
    private ?array $authUser;

    public function __construct(OasisService $oasis, Database $db, array $warnings = [], ?array $authUser = null)
    {
        $this->oasis = $oasis;
        $this->db = $db;
        $this->warnings = $warnings;
        $this->authUser = $authUser;
    }

    // ---- OASIS ----
    public function health(array $in = []): array
    {
        $c = $this->oasis->config();
        return [
            'ok' => true,
            'base' => $c['base'],
            'hasCredentials' => $c['hasCredentials'],
            'dbEnabled' => $this->db->enabled(),
            'warnings' => $this->warnings,
        ];
    }

    public function periodoActual(array $in = []): array
    {
        return $this->oasis->getPeriodoActual();
    }

    public function facultades(array $in = []): array
    {
        return $this->oasis->getFacultades();
    }

    public function carreras(array $in = []): array
    {
        return array_values(array_filter($this->oasis->getCarreras(), fn($c) => ($c['estado'] ?? '') === 'ABI'));
    }

    public function nomina(array $in): array
    {
        Http::require($in, ['asignatura']);
        return $this->oasis->resolverNomina($in);
    }

    public function docentesCarrera(array $in): array
    {
        return $this->oasis->getDocentesCarrera($in);
    }

    public function horarioDocente(array $in): array
    {
        Http::require($in, ['cedula']);
        return $this->oasis->getHorarioDocente($in);
    }

    public function materiasDocente(array $in): array
    {
        return $this->oasis->getMateriasDocente($in['codCarrera'] ?? '', $in['cedula'] ?? '', $in['codPeriodo'] ?? '');
    }

    public function alumnosMateria(array $in): array
    {
        return $this->oasis->getAlumnosMateria($in);
    }

    public function notas(array $in): array
    {
        return $this->oasis->getNotas($in['codCarrera'] ?? '', $in['cedula'] ?? '');
    }

    public function estudiante(array $in): array
    {
        Http::require($in, ['cedula']);
        return $this->oasis->getDatosEstudiante($in['cedula']);
    }

    public function materiasEstudiante(array $in): array
    {
        Http::require($in, ['cedula']);
        return $this->oasis->getMateriasEstudiante(
            $in['codCarrera'] ?? '',
            $in['cedula'],
            $in['codPeriodo'] ?? ''
        );
    }

    public function estudianteFull(array $in): array
    {
        Http::require($in, ['cedula']);
        return $this->oasis->getEstudianteFull($in['cedula']);
    }

    public function login(array $in): array
    {
        Http::require($in, ['login', 'password']);
        $result = $this->oasis->login($in['login'], $in['password']);
        // Generar token de sesión
        $email = $result['perfil']['email'] ?? $in['login'];
        $roles = $result['roles'] ?? [];
        $roleNames = array_map(fn($r) => strtoupper($r['nombreRol'] ?? ''), $roles);
        $role = 'docente';
        if (in_array('COORDINADOR', $roleNames, true)) $role = 'coordinador';
        elseif (in_array('ADMIN', $roleNames, true)) $role = 'admin';
        $token = Auth::generateToken($email, $role);
        $result['token'] = $token;
        return $result;
    }

    // ---- Base de datos (protegidas por auth) ----
    public function dbHealth(array $in = []): array
    {
        return $this->db->health();
    }

    public function getStore(array $in)
    {
        if (!$this->db->enabled()) {
            return ['disabled' => true];
        }
        // Usar email del token autenticado, no del query param
        $email = $this->authUser['email'] ?? $in['email'] ?? '';
        $role = $this->authUser['role'] ?? $in['role'] ?? '';
        if ($email === '') {
            // Fallback para compatibilidad: si no hay token pero hay email en query
            $email = $in['email'] ?? '';
            $role = $in['role'] ?? '';
        }
        return $this->db->getStore($email, $role);
    }

    public function putStore(array $in): array
    {
        if (!$this->db->enabled()) {
            return ['disabled' => true];
        }
        // Forzar email desde autenticación para evitar IDOR
        $authEmail = $this->authUser['email'] ?? null;
        if ($authEmail !== null) {
            $in['email'] = $authEmail;
            $in['role'] = $this->authUser['role'] ?? $in['role'] ?? 'docente';
        }
        return $this->db->putStore($in);
    }

    public function dbLogin(array $in): array
    {
        Http::require($in, ['login', 'password']);
        $u = $this->db->login($in['login'], $in['password']);
        if (!$u) {
            throw new SoapFaultException('Usuario o contraseña incorrectos.');
        }
        $token = Auth::generateToken($u['email'], $u['role']);
        $u['token'] = $token;
        return $u;
    }
}
