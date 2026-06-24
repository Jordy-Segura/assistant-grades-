<?php
declare(strict_types=1);

final class CatalogoService
{
    private CatalogoRepository $repo;
    private bool $dbEnabled;

    public function __construct(CatalogoRepository $repo, bool $dbEnabled)
    {
        $this->repo = $repo;
        $this->dbEnabled = $dbEnabled;
    }

    public function isAvailable(): bool
    {
        return $this->dbEnabled;
    }

    public function getCarreras(): array
    {
        if (!$this->dbEnabled) {
            return [];
        }
        return $this->repo->getCarreras();
    }

    public function getAsignaturas(?string $carreraId = null, ?string $pao = null): array
    {
        if (!$this->dbEnabled) return [];
        return $this->repo->getAsignaturas($carreraId, $pao);
    }

    public function getRACs(string $carreraId): array
    {
        if (!$this->dbEnabled) return [];
        return $this->repo->getRACs($carreraId);
    }

    public function getRAAUs(string $asignaturaId): array
    {
        if (!$this->dbEnabled) return [];
        return $this->repo->getRAAUs($asignaturaId);
    }

    public function getComponentes(): array
    {
        if (!$this->dbEnabled) return [];
        return $this->repo->getComponentes();
    }

    public function getProcedimientos(?string $componenteId = null): array
    {
        if (!$this->dbEnabled) return [];
        return $this->repo->getProcedimientos($componenteId);
    }

    public function getPaosPorCarrera(string $carreraId): array
    {
        if (!$this->dbEnabled) return [];
        return $this->repo->getPaosPorCarrera($carreraId);
    }
}
