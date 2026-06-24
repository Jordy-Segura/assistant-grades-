<?php
declare(strict_types=1);

final class CatalogoController
{
    private CatalogoService $catalogo;

    public function __construct(CatalogoService $catalogo)
    {
        $this->catalogo = $catalogo;
    }

    public function carreras(array $input, array $params): array
    {
        return $this->catalogo->getCarreras();
    }

    public function asignaturas(array $input, array $params): array
    {
        $carreraId = $input['carrera_id'] ?? $params['carrera_id'] ?? null;
        $pao = $input['pao'] ?? null;
        return $this->catalogo->getAsignaturas($carreraId, $pao);
    }

    public function rac(array $input, array $params): array
    {
        $carreraId = $params['carrera_id'] ?? $input['carrera_id'] ?? '';
        if (!$carreraId) Response::error('carrera_id es requerido');
        return $this->catalogo->getRACs($carreraId);
    }

    public function raau(array $input, array $params): array
    {
        $asignaturaId = $params['asignatura_id'] ?? $input['asignatura_id'] ?? '';
        if (!$asignaturaId) Response::error('asignatura_id es requerido');
        return $this->catalogo->getRAAUs($asignaturaId);
    }

    public function componentes(array $input, array $params): array
    {
        return $this->catalogo->getComponentes();
    }

    public function procedimientos(array $input, array $params): array
    {
        $componenteId = $input['componente_id'] ?? null;
        return $this->catalogo->getProcedimientos($componenteId);
    }

    public function paos(array $input, array $params): array
    {
        $carreraId = $params['carrera_id'] ?? $input['carrera_id'] ?? '';
        if (!$carreraId) Response::error('carrera_id es requerido');
        return $this->catalogo->getPaosPorCarrera($carreraId);
    }

    public function health(array $input, array $params): array
    {
        return [
            'available' => $this->catalogo->isAvailable(),
            'message' => $this->catalogo->isAvailable()
                ? 'Catálogo académico disponible'
                : 'Base de datos no disponible — los datos académicos no pueden cargarse',
        ];
    }
}
