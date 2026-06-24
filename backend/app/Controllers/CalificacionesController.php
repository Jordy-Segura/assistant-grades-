<?php
declare(strict_types=1);

final class CalificacionesController
{
    private CalificacionesService $service;

    public function __construct(CalificacionesService $service)
    {
        $this->service = $service;
    }

    public function guardar(Request $req): array
    {
        $configId = $req->param('configuracion_id');
        $user = $req->getAuthUser();
        if (!$user) return ['error' => 'Autenticación requerida', 'code' => 'AUTH_REQUIRED'];
        return $this->service->guardar($configId, $req->body(), $user['email'] ?? '');
    }

    public function cargar(Request $req): array
    {
        $configId = $req->param('configuracion_id');
        return $this->service->cargar($configId);
    }

    public function listar(Request $req): array
    {
        $user = $req->getAuthUser();
        if (!$user) return ['error' => 'Autenticación requerida', 'code' => 'AUTH_REQUIRED'];
        return $this->service->listarPorUsuario($user['email'] ?? '');
    }

    public function health(Request $req): array
    {
        return ['available' => true, 'version' => 'v1'];
    }
}
