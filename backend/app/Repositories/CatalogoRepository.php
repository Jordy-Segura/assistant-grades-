<?php
declare(strict_types=1);

final class CatalogoRepository
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getCarreras(bool $activas = true): array
    {
        $sql = 'SELECT id, codigo_oasis, nombre, sede, max_pao, estado FROM carrera';
        if ($activas) $sql .= ' WHERE estado = TRUE';
        $sql .= ' ORDER BY nombre';
        return $this->pdo->query($sql)->fetchAll();
    }

    public function getCarreraById(string $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT id, codigo_oasis, nombre, sede, max_pao, estado FROM carrera WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $r = $stmt->fetch();
        return $r ?: null;
    }

    public function getCarreraByNombre(string $nombre): ?array
    {
        $stmt = $this->pdo->prepare('SELECT id, codigo_oasis, nombre, sede, max_pao, estado FROM carrera WHERE LOWER(nombre) = LOWER(:nombre)');
        $stmt->execute([':nombre' => $nombre]);
        $r = $stmt->fetch();
        return $r ?: null;
    }

    public function getAsignaturas(?string $carreraId = null, ?string $pao = null): array
    {
        $sql = 'SELECT a.id, a.carrera_id, c.nombre AS carrera, a.codigo_oasis, a.nombre, a.pao, a.nivel
                FROM asignatura a JOIN carrera c ON c.id = a.carrera_id
                WHERE a.estado = TRUE';
        $params = [];
        if ($carreraId) {
            $sql .= ' AND a.carrera_id = :carrera_id';
            $params[':carrera_id'] = $carreraId;
        }
        if ($pao !== null) {
            $sql .= ' AND a.pao = :pao';
            $params[':pao'] = $pao;
        }
        $sql .= ' ORDER BY a.pao, a.nombre';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getRACs(string $carreraId): array
    {
        $stmt = $this->pdo->prepare('SELECT id, carrera_id, codigo, descripcion, orden FROM rac WHERE carrera_id = :cid AND estado = TRUE ORDER BY orden');
        $stmt->execute([':cid' => $carreraId]);
        return $stmt->fetchAll();
    }

    public function getRAAUs(string $asignaturaId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT r.id, r.asignatura_id, r.rac_id, r.codigo, r.descripcion, r.orden,
                    rac.codigo AS rac_codigo
             FROM raau r
             LEFT JOIN rac ON rac.id = r.rac_id
             WHERE r.asignatura_id = :aid AND r.estado = TRUE
             ORDER BY r.orden'
        );
        $stmt->execute([':aid' => $asignaturaId]);
        return $stmt->fetchAll();
    }

    public function getComponentes(): array
    {
        return $this->pdo->query('SELECT id, codigo, nombre, peso, descripcion, orden FROM componente_evaluacion WHERE estado = TRUE ORDER BY orden')->fetchAll();
    }

    public function getProcedimientos(?string $componenteId = null): array
    {
        $sql = 'SELECT p.id, p.componente_id, p.nombre, p.orden, c.codigo AS componente_codigo
                FROM procedimiento_evaluacion p
                JOIN componente_evaluacion c ON c.id = p.componente_id
                WHERE p.estado = TRUE';
        $params = [];
        if ($componenteId) {
            $sql .= ' AND p.componente_id = :cid';
            $params[':cid'] = $componenteId;
        }
        $sql .= ' ORDER BY c.orden, p.orden';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getPaosPorCarrera(string $carreraId): array
    {
        $stmt = $this->pdo->prepare('SELECT DISTINCT pao FROM asignatura WHERE carrera_id = :cid AND estado = TRUE AND pao IS NOT NULL ORDER BY pao');
        $stmt->execute([':cid' => $carreraId]);
        return array_column($stmt->fetchAll(), 'pao');
    }

    public function getAsignaturaByNombreYCarrera(string $nombre, string $carreraId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT id, carrera_id, codigo_oasis, nombre, pao, nivel FROM asignatura WHERE LOWER(nombre) = LOWER(:nombre) AND carrera_id = :cid AND estado = TRUE');
        $stmt->execute([':nombre' => $nombre, ':cid' => $carreraId]);
        $r = $stmt->fetch();
        return $r ?: null;
    }
}
