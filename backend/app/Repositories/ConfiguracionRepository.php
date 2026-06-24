<?php
declare(strict_types=1);

final class ConfiguracionRepository
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function findById(string $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM configuracion_pao WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $r = $stmt->fetch();
        return $r ?: null;
    }

    public function findByOwner(string $email): array
    {
        $stmt = $this->pdo->prepare('SELECT cp.*, c.nombre AS carrera_nombre, a.nombre AS asignatura_nombre
            FROM configuracion_pao cp
            LEFT JOIN carrera c ON c.id = cp.carrera_id
            LEFT JOIN asignatura a ON a.id = cp.asignatura_id
            WHERE cp.owner_email = :email
            ORDER BY cp.updated_at DESC');
        $stmt->execute([':email' => $email]);
        return $stmt->fetchAll();
    }

    public function findAll(): array
    {
        return $this->pdo->query('SELECT cp.*, c.nombre AS carrera_nombre, a.nombre AS asignatura_nombre
            FROM configuracion_pao cp
            LEFT JOIN carrera c ON c.id = cp.carrera_id
            LEFT JOIN asignatura a ON a.id = cp.asignatura_id
            ORDER BY cp.updated_at DESC')->fetchAll();
    }

    public function create(array $data): string
    {
        $id = $data['id'] ?? (string) \Ramsey\Uuid\Uuid::uuid4();
        $stmt = $this->pdo->prepare(
            'INSERT INTO configuracion_pao(id, owner_email, carrera_id, asignatura_id, periodo, pao, aporte, estado, metadata)
             VALUES (:id, :owner, :carrera_id, :asignatura_id, :periodo, :pao, :aporte, :estado, :metadata::jsonb)'
        );
        $stmt->execute([
            ':id' => $id,
            ':owner' => $data['owner_email'],
            ':carrera_id' => $data['carrera_id'] ?? null,
            ':asignatura_id' => $data['asignatura_id'] ?? null,
            ':periodo' => $data['periodo'] ?? '',
            ':pao' => $data['pao'] ?? '',
            ':aporte' => $data['aporte'] ?? 'FIN DE CICLO',
            ':estado' => $data['estado'] ?? 'borrador',
            ':metadata' => json_encode($data['metadata'] ?? []),
        ]);
        return $id;
    }

    public function update(string $id, array $data): void
    {
        $fields = [];
        $params = [':id' => $id];
        foreach (['owner_email', 'carrera_id', 'asignatura_id', 'periodo', 'pao', 'aporte', 'estado', 'locked'] as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "$f = :$f";
                $params[":$f"] = $data[$f];
            }
        }
        if ($fields) {
            $fields[] = 'updated_at = now()';
            $sql = 'UPDATE configuracion_pao SET ' . implode(', ', $fields) . ' WHERE id = :id';
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
        }
    }

    public function saveRACs(string $configId, array $racIds): void
    {
        $this->pdo->prepare('DELETE FROM configuracion_pao_rac WHERE configuracion_id = :id')->execute([':id' => $configId]);
        $stmt = $this->pdo->prepare('INSERT INTO configuracion_pao_rac(configuracion_id, rac_id) VALUES (:cid, :rid)');
        foreach ($racIds as $rid) {
            $stmt->execute([':cid' => $configId, ':rid' => $rid]);
        }
    }

    public function getRACs(string $configId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT rac.id, rac.codigo, rac.descripcion
             FROM configuracion_pao_roc cpr
             JOIN rac ON rac.id = cpr.rac_id
             WHERE cpr.configuracion_id = :id'
        );
        $stmt->execute([':id' => $configId]);
        return $stmt->fetchAll();
    }
}
