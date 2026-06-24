<?php
declare(strict_types=1);

final class Router
{
    private array $routes = [];
    private array $groupMiddleware = [];

    public function group(array $middleware, callable $callback): void
    {
        $previous = $this->groupMiddleware;
        $this->groupMiddleware = array_merge($this->groupMiddleware, $middleware);
        $callback($this);
        $this->groupMiddleware = $previous;
    }

    public function get(string $path, callable $handler, array $middleware = []): void
    {
        $this->addRoute('GET', $path, $handler, $middleware);
    }

    public function post(string $path, callable $handler, array $middleware = []): void
    {
        $this->addRoute('POST', $path, $handler, $middleware);
    }

    public function put(string $path, callable $handler, array $middleware = []): void
    {
        $this->addRoute('PUT', $path, $handler, $middleware);
    }

    public function delete(string $path, callable $handler, array $middleware = []): void
    {
        $this->addRoute('DELETE', $path, $handler, $middleware);
    }

    private function addRoute(string $method, string $path, callable $handler, array $middleware): void
    {
        $this->routes[] = [
            'method' => $method,
            'pattern' => $this->pathToPattern($path),
            'original' => $path,
            'handler' => $handler,
            'middleware' => array_merge($this->groupMiddleware, $middleware),
            'params' => [],
        ];
    }

    private function pathToPattern(string $path): string
    {
        $pattern = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $path);
        return '/^' . str_replace('/', '\/', $pattern) . '$/';
    }

    public function dispatch(string $method, string $path, array $input): mixed
    {
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) continue;
            if (!preg_match($route['pattern'], $path, $matches)) continue;

            $params = array_filter($matches, fn($k) => is_string($k), ARRAY_FILTER_USE_KEY);
            $route['params'] = $params;

            foreach ($route['middleware'] as $mw) {
                $result = $mw($input, $route);
                if ($result !== null) return $result;
            }

            return ($route['handler'])($input, $route['params']);
        }
        return null;
    }
}
