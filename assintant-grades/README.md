# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Consumo mínimo de SOAP para Auxiliar de Calificaciones

Este frontend **no consume SOAP directamente**. Solo llama a tu backend intermedio (BFF) con JSON.

1. Configura variable de entorno:
   - `VITE_API_BASE_URL=http://localhost:3001`
2. El frontend enviará solo:
   - `codCarrera`
   - `cedula`
3. Endpoint esperado del backend:
   - `POST /api/notas`
4. Respuesta esperada:
   - estructura SOAP transformada a JSON (se normaliza a `asignatura`, `actividad`, `nota`).

> Importante: usuario/clave SOAP deben quedarse en el backend, nunca en React.
