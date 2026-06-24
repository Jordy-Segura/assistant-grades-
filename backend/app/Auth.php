<?php
declare(strict_types=1);

final class Auth
{
    private const TOKEN_TTL = 28800; // 8 horas

    public static function generateToken(string $email, string $role): string
    {
        $secret = Config::get('AUTH_SECRET', '') ?? '';
        if ($secret === '') {
            $secret = 'espoch_default_secret_change_me_' . uniqid();
        }
        $payload = $email . '|' . $role . '|' . (time() + self::TOKEN_TTL);
        $sig = hash_hmac('sha256', $payload, $secret);
        return base64_encode($payload) . '.' . $sig;
    }

    public static function verifyToken(string $token): ?array
    {
        $secret = Config::get('AUTH_SECRET', '') ?? '';
        if ($secret === '') {
            return null;
        }
        $parts = explode('.', $token, 2);
        if (count($parts) !== 2) {
            return null;
        }
        $payload = base64_decode($parts[0], true);
        if ($payload === false) {
            return null;
        }
        $expectedSig = hash_hmac('sha256', $payload, $secret);
        if (!hash_equals($expectedSig, $parts[1])) {
            return null;
        }
        $data = explode('|', $payload, 3);
        if (count($data) !== 3) {
            return null;
        }
        $expiry = (int) $data[2];
        if ($expiry < time()) {
            return null;
        }
        return ['email' => $data[0], 'role' => $data[1]];
    }

    public static function getTokenFromHeaders(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/^Bearer\s+(.+)$/i', $header, $m)) {
            return $m[1];
        }
        return null;
    }
}
