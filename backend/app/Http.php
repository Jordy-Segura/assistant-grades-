<?php
declare(strict_types=1);

final class Http
{
    private const MAX_BODY_SIZE = 5 * 1024 * 1024;
    private const ALLOWED_ORIGINS_DEFAULT = 'http://localhost:5173,http://localhost:5500,http://127.0.0.1:5173,http://127.0.0.1:5500';

    public static function cors(): void
    {
        $allowedOrigins = explode(',', Config::get('CORS_ORIGIN', self::ALLOWED_ORIGINS_DEFAULT) ?? self::ALLOWED_ORIGINS_DEFAULT);
        $allowedOrigins = array_map('trim', $allowedOrigins);
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        if (in_array('*', $allowedOrigins, true)) {
            header('Access-Control-Allow-Origin: *');
        } elseif (in_array($origin, $allowedOrigins, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
        } else {
            header('Access-Control-Allow-Origin: ' . $allowedOrigins[0]);
        }
        header('Access-Control-Allow-Methods: GET,POST,PUT,OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Max-Age: 86400');
        self::securityHeaders();
    }

    public static function securityHeaders(): void
    {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        $csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'";
        header("Content-Security-Policy: $csp");
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
        header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
    }

    public static function json($data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function body(): array
    {
        $raw = file_get_contents('php://input', false, null, 0, self::MAX_BODY_SIZE);
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

    public static function require(array $data, array $keys): void
    {
        foreach ($keys as $k) {
            if (!isset($data[$k]) || (is_string($data[$k]) && trim($data[$k]) === '')) {
                self::json(['error' => "Falta el campo obligatorio: $k"], 400);
            }
        }
    }

    public static function sanitize(array $data, array $fields): array
    {
        foreach ($fields as $f) {
            if (isset($data[$f]) && is_string($data[$f])) {
                $data[$f] = strip_tags(trim($data[$f]));
            }
        }
        return $data;
    }

    public static function sanitizeHtml(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
}
