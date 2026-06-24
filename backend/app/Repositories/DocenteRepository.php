<?php
declare(strict_types=1);

final class DocenteRepository
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare('SELECT email, nombre, cedula, rol, password_hash FROM docente WHERE LOWER(email) = LOWER(:email)');
        $stmt->execute([':email' => $email]);
        $r = $stmt->fetch();
        return $r ?: null;
    }

    public function findAll(): array
    {
        return $this->pdo->query('SELECT email, nombre, cedula, rol FROM docente ORDER BY nombre')->fetchAll();
    }

    public function findAllExceptCoordinator(): array
    {
        return $this->pdo->query("SELECT email, nombre, cedula, rol FROM docente WHERE rol != 'coordinador' ORDER BY nombre")->fetchAll();
    }

    public function upsert(array $data): void
    {
        $email = strtolower($data['email'] ?? '');
        if ($email === '') return;

        $nombre = $data['nombre'] ?? $data['name'] ?? '';
        $cedula = $data['cedula'] ?? '';
        $rol = $data['rol'] ?? $data['role'] ?? 'docente';

        if (!empty($data['password'])) {
            $stmt = $this->pdo->prepare(
                'INSERT INTO docente(email,nombre,cedula,rol,password_hash) VALUES (:e,:n,:c,:r,:h)
                 ON CONFLICT (email) DO UPDATE SET nombre=:n, cedula=:c, rol=:r, password_hash=:h, updated_at=now()'
            );
            $stmt->execute([':e' => $email, ':n' => $nombre, ':c' => $cedula, ':r' => $rol, ':h' => Database::hashPassword($data['password'])]);
        } else {
            $stmt = $this->pdo->prepare(
                'INSERT INTO docente(email,nombre,cedula,rol,password_hash) VALUES (:e,:n,:c,:r,NULL)
                 ON CONFLICT (email) DO UPDATE SET nombre=:n, cedula=:c, rol=:r, updated_at=now()'
            );
            $stmt->execute([':e' => $email, ':n' => $nombre, ':c' => $cedula, ':r' => $rol]);
        }
    }

    public function updatePassword(string $email, string $password): void
    {
        $stmt = $this->pdo->prepare('UPDATE docente SET password_hash = :hash, updated_at = now() WHERE LOWER(email) = LOWER(:email)');
        $stmt->execute([':hash' => Database::hashPassword($password), ':email' => $email]);
    }
}
