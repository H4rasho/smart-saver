---
name: "2026_09_02-migrate_to_monorepo"
description: "Migrar la aplicación Next.js actual a un monorepo pnpm y añadir un backend mínimo con Bun y TypeScript."
created_at: "2026-09-03T00:13:30Z"

created_by:
  tool: "OpenCode"
  model:
    name: "OpenAI GPT"
    version: "5.6-sol"
    reasoning_effort: "high"

implemented_by:
  tool: "OpenCode"
  model:
    name: "OpenAI GPT"
    version: "5.6-sol"
    reasoning_effort: "high"

last_implementation_at: "2026-09-03T00:57:55Z"
has_completed_all_phases: "true"
---

# Migrar el proyecto a un monorepo

## Objetivo

Convertir el repositorio actual en un monorepo pnpm con `apps/web` y `apps/api`, manteniendo intacto el comportamiento observable de Next.js. Añadir un backend Bun con TypeScript mínimo, ejecutable junto con la web desde el comando raíz de desarrollo.

## Contexto

- [`package.json`](../../../package.json) contiene actualmente todos los scripts y dependencias de Next.js, Playwright y Drizzle; pasará a coordinar los workspaces y delegar los comandos públicos.
- [`pnpm-workspace.yaml`](../../../pnpm-workspace.yaml) ya existe, pero todavía no declara paquetes; debe incorporar `apps/*` sin introducir un gestor de paquetes adicional.
- [`app/`](../../../app), [`components/`](../../../components), [`actions/`](../../../actions), [`config/`](../../../config), [`database/`](../../../database), [`i18n/`](../../../i18n), [`lib/`](../../../lib), [`messages/`](../../../messages), [`public/`](../../../public), [`schemas/`](../../../schemas), [`scripts/`](../../../scripts) y [`types/`](../../../types) forman una única aplicación y deben trasladarse juntas a `apps/web` para evitar una extracción prematura de dominio o infraestructura.
- [`tsconfig.json`](../../../tsconfig.json), [`next.config.ts`](../../../next.config.ts), [`components.json`](../../../components.json), [`postcss.config.mjs`](../../../postcss.config.mjs), [`eslint.config.mjs`](../../../eslint.config.mjs), [`playwright.config.ts`](../../../playwright.config.ts) y [`database/drizzle.config.ts`](../../../database/drizzle.config.ts) contienen aliases o rutas relativas que deben resolverse desde `apps/web` después del traslado.
- [`e2e/`](../../../e2e) y [`.github/workflows/playwright.yml`](../../../.github/workflows/playwright.yml) preservan el contrato observable de la aplicación web en `http://localhost:3000` y deben adaptarse a la nueva ubicación sin cambiar los escenarios existentes.
- [`proxy.ts`](../../../proxy.ts) mantiene autenticación, redirecciones e internacionalización. `POST /api`, `POST /api/user`, `GET|POST /mcp` y las rutas OAuth `/.well-known/*` continuarán perteneciendo a Next.js en esta migración.
- [`docs/agents/development-commands.md`](../../../docs/agents/development-commands.md), [`docs/agents/code-conventions.md`](../../../docs/agents/code-conventions.md), [`docs/agents/project-architecture.md`](../../../docs/agents/project-architecture.md), [`docs/agents/application-patterns.md`](../../../docs/agents/application-patterns.md) y [`docs/agents/testing-guide.md`](../../../docs/agents/testing-guide.md) definen los comandos, convenciones, arquitectura, patrones y criterios de pruebas aplicables. Deben actualizarse cuando sus rutas o instrucciones dejen de coincidir con la configuración ejecutable.
- La base de datos, las migraciones, los modelos Drizzle, el cifrado, Clerk, los Server Actions y la caché de Next.js permanecerán dentro de `apps/web`. No se crearán todavía paquetes compartidos ni comunicación entre la web y el backend.

## Fases

### Fase 1: Monorepo funcional con web y API

#### Descripción

Realizar la migración estructural completa en un único cambio verificable: convertir la raíz en coordinador del workspace, trasladar Next.js sin cambios funcionales y añadir un servicio Bun aislado con un health check. Al finalizar, ambas aplicaciones podrán ejecutarse conjuntamente, mientras todos los contratos web y de base de datos existentes seguirán perteneciendo a `apps/web`.

#### Contratos públicos

- Crear el paquete `apps/web` para alojar la aplicación Next.js actual, preservando sus URLs, redirecciones, localización, puerto `3000` y endpoints existentes.
- Crear el paquete `apps/api` con Bun y TypeScript, ejecutado en el puerto `3001`.
- Crear `GET /health` en `apps/api` con respuesta HTTP `200`, encabezado `Content-Type: application/json` y cuerpo exacto `{"status":"ok"}`.
- Crear una suite de pruebas Bun para comprobar método, ruta, estado, encabezado y cuerpo de `GET /health`.
- Modificar `pnpm dev` para iniciar simultáneamente `apps/web` en el puerto `3000` y `apps/api` en el puerto `3001`.
- Crear los comandos raíz `pnpm dev:web`, `pnpm dev:api`, `pnpm typecheck` y `pnpm test:api`.
- Preservar desde la raíz `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm test`, `pnpm boneyard:build`, `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:migrate:prod` y `pnpm db:studio`, delegándolos al workspace correspondiente.
- Preservar sin cambios funcionales `POST /api`, `POST /api/user`, `GET|POST /mcp` y las rutas OAuth `/.well-known/*` dentro de `apps/web`.
- No crear, modificar ni eliminar esquemas, tablas o migraciones de base de datos.
- No crear contratos compartidos ni llamadas entre `apps/web` y `apps/api`.

#### Acciones pendientes

- [x] Declarar `apps/*` en `pnpm-workspace.yaml`, mantener un único `pnpm-lock.yaml` y definir los manifiestos independientes de `apps/web` y `apps/api`.
- [x] Convertir el `package.json` raíz en coordinador del monorepo, preservando los comandos públicos acordados y añadiendo los comandos explícitos para cada aplicación.
- [x] Mover íntegramente la aplicación actual a `apps/web`, incluyendo código, assets, configuración, base de datos, migraciones, scripts y pruebas E2E, sin refactorizar su lógica funcional.
- [x] Ajustar los aliases y rutas relativas de TypeScript, Next.js, next-intl, shadcn, PostCSS, ESLint, Drizzle, migraciones, Boneyard y Playwright para que se resuelvan desde `apps/web`.
- [x] Preservar la carga de variables de entorno y el directorio de ejecución esperado por Next.js, Drizzle y el script de migración, evitando cambiar nombres o semántica de las variables existentes.
- [x] Crear `apps/api` con configuración TypeScript independiente de Next.js y un servidor Bun que escuche en el puerto `3001` y exponga únicamente el contrato `GET /health` acordado.
- [x] Añadir la suite de pruebas Bun de `GET /health`, incluyendo casos para la respuesta exitosa y para una ruta o método no soportado según el comportamiento explícito del servidor.
- [x] Actualizar `.gitignore`, Biome, Lefthook y ESLint solo donde sea necesario para cubrir los dos workspaces y sus artefactos sin debilitar las comprobaciones existentes.
- [x] Actualizar el workflow de Playwright para instalar y fijar los runtimes necesarios, ejecutar los comandos desde los workspaces correctos y conservar los artefactos de pruebas.
- [x] Actualizar `README.md`, `docs/DEPLOYMENT.md` y la documentación aplicable bajo `docs/agents/` para reflejar el layout, los comandos y la ejecución independiente o conjunta de ambas aplicaciones.
- [x] Confirmar que Next.js conserva sus rutas públicas, redirecciones, traducciones, cabeceras, endpoints HTTP/MCP, acceso a Drizzle y comportamiento E2E después del traslado.
- [x] Verificar los cambios mediante typechecking, linting y tests con el comando de verificación del proyecto (consultarlo en AGENTS.md o en la configuración del proyecto). Corregir cualquier problema encontrado.
- [x] DETENERSE. Presentar los cambios al usuario para su revisión y sugerir mensajes de commit (o títulos de pull request cuando las fases se implementen mediante pull requests). No continuar con la siguiente fase hasta que el usuario lo solicite explícitamente.

## Próximo paso

Revisar la implementación de la Fase 1. Todas las fases del plan están completadas.
