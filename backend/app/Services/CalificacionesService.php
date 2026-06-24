<?php
declare(strict_types=1);

final class CalificacionesService
{
    private ?CalificacionesRepository $repo;
    private bool $dbEnabled;

    public function __construct(?CalificacionesRepository $repo, bool $dbEnabled)
    {
        $this->repo = $repo;
        $this->dbEnabled = $dbEnabled;
    }

    public function guardar(string $configId, array $payload, string $userEmail): array
    {
        if (!$this->dbEnabled || !$this->repo) {
            return ['error' => 'Base de datos no disponible', 'code' => 'DB_UNAVAILABLE'];
        }

        $config = $this->repo->getConfiguracion($configId);
        $oldData = $config ? ['grades' => $this->repo->getCalificaciones($configId)] : null;

        // Guardar configuración
        $this->repo->upsertConfiguracion([
            'id' => $configId,
            'owner_email' => $userEmail,
            'periodo' => $payload['periodo'] ?? '',
            'pao' => $payload['pao'] ?? '',
            'aporte' => $payload['aporte'] ?? 'FIN DE CICLO',
            'estado' => 'activo',
            'locked' => true,
            'metadata' => $payload['metadata'] ?? [],
        ]);

        // Guardar actividades
        if (isset($payload['activities'])) {
            $this->repo->upsertActividades($configId, $payload['activities']);
        }

        // Guardar estudiantes y calificaciones
        if (isset($payload['students'])) {
            $this->repo->upsertEstudiantes($configId, $payload['students']);
        }
        if (isset($payload['grades'])) {
            $this->repo->setCalificaciones($configId, $payload['grades']);
        }

        // Auditoría
        $this->repo->auditLog($userEmail, 'UPSERT', 'configuracion_pao', $configId, $oldData, [
            'grades_count' => count($payload['grades'] ?? []),
            'students_count' => count($payload['students'] ?? []),
        ]);

        return ['ok' => true, 'id' => $configId];
    }

    public function cargar(string $configId): array
    {
        if (!$this->dbEnabled || !$this->repo) {
            return ['error' => 'Base de datos no disponible', 'code' => 'DB_UNAVAILABLE'];
        }
        $config = $this->repo->getConfiguracion($configId);
        if (!$config) return ['error' => 'Configuración no encontrada', 'code' => 'NOT_FOUND'];

        return [
            'config' => $config,
            'students' => $this->repo->getEstudiantesDeConfig($configId),
            'grades' => $this->repo->getCalificaciones($configId),
            'activities' => $this->repo->getActividadesDeConfig($configId),
        ];
    }

    public function listarPorUsuario(string $email): array
    {
        if (!$this->dbEnabled || !$this->repo) return [];
        return $this->repo->getConfiguracionesPorUsuario($email);
    }
}
