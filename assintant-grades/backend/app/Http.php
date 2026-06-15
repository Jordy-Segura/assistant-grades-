<?php
// CAPA TRANSVERSAL — Utilidades HTTP (respuestas JSON, CORS, validación de entrada).
declare(strict_types=1);

final class Http
{
    public static function cors(): void
    {
        header('Access-Control-Allow-Origin: ' . (Config::get('CORS_ORIGIN', '*') ?? '*'));
        header('Access-Control-Allow-Methods: GET,POST,PUT,OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
    }

    public static function json($data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /** Cuerpo JSON de la petición como arreglo asociativo. */
    public static function body(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || $raw === '') {
            return [];
        }
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    public static function query(): array
    {
        return $_GET;
    }

    /** Validación: corta con 400 si falta algún campo obligatorio. */
    public static function require(array $data, array $keys): void
    {
        foreach ($keys as $k) {
            if (!isset($data[$k]) || $data[$k] === '') {
                self::json(['error' => "Falta el campo obligatorio: $k"], 400);
            }
        }
    }
}
