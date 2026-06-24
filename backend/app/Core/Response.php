<?php
declare(strict_types=1);

final class Response
{
    public static function json(mixed $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success(mixed $data = null, int $status = 200): never
    {
        self::json(['ok' => true, 'data' => $data], $status);
    }

    public static function error(string $message, int $status = 400, string $code = ''): never
    {
        $resp = ['error' => $message];
        if ($code) $resp['code'] = $code;
        self::json($resp, $status);
    }

    public static function notFound(string $message = 'Recurso no encontrado'): never
    {
        self::error($message, 404);
    }

    public static function unauthorized(string $message = 'No autorizado'): never
    {
        self::error($message, 401, 'AUTH_REQUIRED');
    }

    public static function forbidden(string $message = 'Acceso denegado'): never
    {
        self::error($message, 403, 'FORBIDDEN');
    }
}
