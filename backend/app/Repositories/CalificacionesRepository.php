<?php
declare(strict_types=1);

final class CalificacionesRepository
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function upsertConfiguracion(array $data): string
    {
        $sql = 'INSERT INTO configuracion_pao (id, owner_email, carrera_id, asignatura_id, periodo, pao, aporte, estado, locked, metadata)
                VALUES (:id, :owner_email, :carrera_id, :asignatura_id, :periodo, :pao, :aporte, :estado, :locked, :metadata::jsonb)
                ON CONFLICT (id) DO UPDATE SET
                    periodo = EXCLUDED.periodo, pao = EXCLUDED.pao, aporte = EXCLUDED.aporte,
                    locked = EXCLUDED.locked, metadata = EXCLUDED.metadata,
                    updated_at = now()';
        $id = $data['id'] ?? self::uuid();
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':id' => $id,
            ':owner_email' => $data['owner_email'] ?? '',
            ':carrera_id' => $data['carrera_id'] ?? null,
            ':asignatura_id' => $data['asignatura_id'] ?? null,
            ':periodo' => $data['periodo'] ?? '',
            ':pao' => $data['pao'] ?? '',
            ':aporte' => $data['aporte'] ?? 'FIN DE CICLO',
            ':estado' => $data['estado'] ?? 'borrador',
            ':locked' => $data['locked'] ?? false,
            ':metadata' => json_encode($data['metadata'] ?? []),
        ]);
        return $id;
    }

    public function getConfiguracion(string $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM configuracion_pao WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $r = $stmt->fetch();
        return $r ?: null;
    }

    public function getConfiguracionesPorUsuario(string $email): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM configuracion_pao WHERE owner_email = :email ORDER BY updated_at DESC');
        $stmt->execute([':email' => $email]);
        return $stmt->fetchAll();
    }

    public function upsertEstudiantes(string $configId, array $students): void
    {
        $this->pdo->prepare('DELETE FROM configuracion_estudiante WHERE configuracion_id = :cid')->execute([':cid' => $configId]);
        if (empty($students)) return;
        $sql = 'INSERT INTO configuracion_estudiante (configuracion_id, estudiante_id, estado) VALUES (:cid, :eid, :est)';
        $stmt = $this->pdo->prepare($sql);
        foreach ($students as $s) {
            $estId = $this->upsertEstudiante($s);
            $stmt->execute([':cid' => $configId, ':eid' => $estId, ':est' => 'activo']);
        }
    }

    public function getEstudiantesDeConfig(string $configId): array
    {
        $sql = 'SELECT e.id, e.cedula, e.codigo, e.nombres, e.apellidos, e.email
                FROM configuracion_estudiante ce
                JOIN estudiante e ON e.id = ce.estudiante_id
                WHERE ce.configuracion_id = :cid AND ce.estado = \'activo\'';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':cid' => $configId]);
        return $stmt->fetchAll();
    }

    public function upsertEstudiante(array $data): string
    {
        $cedula = $data['cedula'] ?? '';
        if ($cedula) {
            $existing = $this->pdo->prepare('SELECT id FROM estudiante WHERE cedula = :c');
            $existing->execute([':c' => $cedula]);
            $r = $existing->fetch();
            if ($r) {
                $upd = $this->pdo->prepare('UPDATE estudiante SET nombres = :noms, apellidos = :apes, codigo = :cod, updated_at = now() WHERE id = :id');
                $upd->execute([':noms' => $data['nombres'] ?? '', ':apes' => $data['apellidos'] ?? '', ':cod' => $data['codigo'] ?? '', ':id' => $r['id']]);
                return $r['id'];
            }
        }
        $id = self::uuid();
        $ins = $this->pdo->prepare('INSERT INTO estudiante (id, cedula, codigo, nombres, apellidos, email) VALUES (:id, :c, :cod, :n, :a, :e)');
        $ins->execute([':id' => $id, ':c' => $cedula, ':cod' => $data['codigo'] ?? '', ':n' => $data['nombres'] ?? '', ':a' => $data['apellidos'] ?? '', ':e' => $data['email'] ?? '']);
        return $id;
    }

    public function setCalificaciones(string $configId, array $grades): void
    {
        // Eliminar calificaciones existentes para esta config
        $del = $this->pdo->prepare('DELETE FROM calificacion WHERE configuracion_id = :cid');
        $del->execute([':cid' => $configId]);
        if (empty($grades)) return;
        $sql = 'INSERT INTO calificacion (configuracion_id, estudiante_id, actividad_id, nota, observacion, updated_by)
                VALUES (:cid, :eid, :aid, :nota, :obs, :uby)';
        $stmt = $this->pdo->prepare($sql);
        foreach ($grades as $g) {
            $stmt->execute([
                ':cid' => $configId,
                ':eid' => $g['studentId'] ?? '',
                ':aid' => $g['activityId'] ?? '',
                ':nota' => isset($g['score']) ? (float)$g['score'] : null,
                ':obs' => $g['observacion'] ?? '',
                ':uby' => $g['updatedBy'] ?? '',
            ]);
        }
    }

    public function getCalificaciones(string $configId): array
    {
        $stmt = $this->pdo->prepare('SELECT id, configuracion_id, estudiante_id, actividad_id, nota, observacion, updated_by, updated_at
                                     FROM calificacion WHERE configuracion_id = :cid');
        $stmt->execute([':cid' => $configId]);
        return $stmt->fetchAll();
    }

    public function getActividadesDeConfig(string $configId): array
    {
        $stmt = $this->pdo->prepare('SELECT id, configuracion_id, componente_id, nombre, puntaje_maximo, raau_id, orden
                                      FROM actividad_evaluacion WHERE configuracion_id = :cid ORDER BY orden');
        $stmt->execute([':cid' => $configId]);
        return $stmt->fetchAll();
    }

    public function upsertActividades(string $configId, array $activities): void
    {
        $del = $this->pdo->prepare('DELETE FROM actividad_evaluacion WHERE configuracion_id = :cid');
        $del->execute([':cid' => $configId]);
        if (empty($activities)) return;
        $sql = 'INSERT INTO actividad_evaluacion (id, configuracion_id, componente_id, nombre, puntaje_maximo, raau_id, orden)
                VALUES (:id, :cid, :comp, :nom, :max, :raau, :ord)';
        $stmt = $this->pdo->prepare($sql);
        foreach ($activities as $i => $a) {
            $componenteId = $this->getComponenteIdPorCodigo($a['component'] ?? '');
            $stmt->execute([
                ':id' => $a['id'] ?? self::uuid(),
                ':cid' => $configId,
                ':comp' => $componenteId,
                ':nom' => $a['name'] ?? '',
                ':max' => $a['maxScore'] ?? 0,
                ':raau' => $a['raauId'] ?? null,
                ':ord' => $i + 1,
            ]);
        }
    }

    public function getRAAUsSeleccionados(string $configId): array
    {
        $stmt = $this->pdo->prepare('SELECT id, codigo, descripcion, rac_id FROM raau WHERE id IN (
            SELECT DISTINCT raau_id FROM actividad_evaluacion WHERE configuracion_id = :cid AND raau_id IS NOT NULL
        )');
        $stmt->execute([':cid' => $configId]);
        return $stmt->fetchAll();
    }

    public function auditLog(string $userEmail, string $action, string $entity, ?string $entityId = null, ?array $oldData = null, ?array $newData = null): void
    {
        $stmt = $this->pdo->prepare('INSERT INTO audit_log (user_email, action, entity, entity_id, old_data, new_data, ip_address)
            VALUES (:u, :a, :e, :eid, :old, :new, :ip)');
        $stmt->execute([
            ':u' => $userEmail,
            ':a' => $action,
            ':e' => $entity,
            ':eid' => $entityId,
            ':old' => $oldData ? json_encode($oldData) : null,
            ':new' => $newData ? json_encode($newData) : null,
            ':ip' => $_SERVER['REMOTE_ADDR'] ?? '',
        ]);
    }

    private function getComponenteIdPorCodigo(string $codigo): ?string
    {
        $stmt = $this->pdo->prepare('SELECT id FROM componente_evaluacion WHERE codigo = :c');
        $stmt->execute([':c' => $codigo]);
        $r = $stmt->fetch();
        return $r ? $r['id'] : null;
    }

    private static function uuid(): string
    {
        try {
            return (\Ramsey\Uuid\Uuid::uuid4())->toString();
        } catch (\Throwable) {
            return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );
        }
    }
}
