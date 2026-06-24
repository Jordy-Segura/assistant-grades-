<?php
declare(strict_types=1);

final class Request
{
    private const MAX_BODY_SIZE = 5 * 1024 * 1024;

    public readonly string $method;
    public readonly string $path;
    public readonly array $query;
    public readonly array $body;
    public readonly array $headers;
    public readonly string $ip;

    public function __construct()
    {
        $this->method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $this->path = rtrim(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/', '/') ?: '/';
        $this->query = $_GET;
        $this->body = $this->parseBody();
        $this->headers = $this->parseHeaders();
        $this->ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    }

    private function parseBody(): array
    {
        $raw = file_get_contents('php://input', false, null, 0, self::MAX_BODY_SIZE);
        if ($raw === false || $raw === '') return [];
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    private function parseHeaders(): array
    {
        $headers = [];
        foreach ($_SERVER as $k => $v) {
            if (str_starts_with($k, 'HTTP_')) {
                $name = strtolower(str_replace('_', '-', substr($k, 5)));
                $headers[$name] = $v;
            }
        }
        if (!empty($_SERVER['CONTENT_TYPE'])) $headers['content-type'] = $_SERVER['CONTENT_TYPE'];
        if (!empty($_SERVER['CONTENT_LENGTH'])) $headers['content-length'] = $_SERVER['CONTENT_LENGTH'];
        return $headers;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $this->query[$key] ?? $default;
    }

    public function require(string ...$keys): void
    {
        foreach ($keys as $key) {
            $value = $this->get($key);
            if ($value === null || (is_string($value) && trim($value) === '')) {
                Response::json(['error' => "Falta el campo obligatorio: $key"], 400);
            }
        }
    }

    public function requireKeys(array $data, string ...$keys): void
    {
        foreach ($keys as $key) {
            if (!isset($data[$key]) || (is_string($data[$key]) && trim($data[$key]) === '')) {
                Response::json(['error' => "Falta el campo obligatorio: $key"], 400);
            }
        }
    }

    public function sanitize(array $fields): array
    {
        $data = array_merge($this->query, $this->body);
        foreach ($fields as $f) {
            if (isset($data[$f]) && is_string($data[$f])) {
                $data[$f] = strip_tags(trim($data[$f]));
            }
        }
        return $data;
    }
}
