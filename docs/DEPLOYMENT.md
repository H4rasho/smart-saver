# Guía de Despliegue a Producción

La aplicación está organizada como un monorepo pnpm. Los comandos de esta guía
se ejecutan desde la raíz y delegan en `apps/web`. La API Node.js independiente se
encuentra en `apps/api` y no participa en las migraciones de base de datos.

## Migraciones de Base de Datos con Drizzle

### Scripts Disponibles

- `pnpm db:generate` - Genera nuevas migraciones basadas en cambios en tus modelos
- `pnpm db:migrate:prod` - Ejecuta las migraciones en producción
- `pnpm db:studio` - Abre Drizzle Studio para explorar la base de datos

### Proceso de Despliegue

#### 1. Desarrollo Local

Cuando hagas cambios en tus modelos de base de datos:

```bash
# Genera las migraciones
pnpm db:generate

# Revisa las migraciones generadas en apps/web/database/migrations/
# Asegúrate de que sean correctas antes de continuar
```

#### 2. Despliegue a Producción

**Opción A: Vercel (Recomendado)**

En tu configuración de Vercel:

1. Mantén la raíz del repositorio como directorio raíz del proyecto
2. Ve a tu proyecto → Settings → General → Build & Development Settings
3. En "Build Command", cambia de `next build` a:
   ```bash
   pnpm db:migrate:prod && pnpm build
   ```

O crea un script en `package.json`:

```json
{
  "scripts": {
    "build:prod": "pnpm db:migrate:prod && pnpm build"
  }
}
```

Y usa `pnpm build:prod` como comando de build en Vercel.

**Opción B: Ejecución Manual**

Si prefieres ejecutar las migraciones manualmente antes del despliegue:

```bash
# Asegúrate de tener las variables de entorno configuradas
export TURSO_DATABASE_URL="tu_url_de_produccion"
export TURSO_AUTH_TOKEN="tu_token_de_produccion"

# Ejecuta las migraciones
pnpm db:migrate:prod
```

**Opción C: GitHub Actions**

Crea un workflow en `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  migrate-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run migrations
        env:
          TURSO_DATABASE_URL: ${{ secrets.TURSO_DATABASE_URL }}
          TURSO_AUTH_TOKEN: ${{ secrets.TURSO_AUTH_TOKEN }}
        run: pnpm db:migrate:prod
      
      - name: Deploy to Vercel
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### Variables de Entorno Requeridas

Asegúrate de tener configuradas estas variables en tu entorno de producción:

```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
ENCRYPTION_KEY=your-encryption-key
API_URL=https://your-api-service.example.com
```

User registration sends an authenticated request from the web server to the
Node.js API. Deploy `apps/api` as a reachable service and set `API_URL` to its base
URL. Configure `CLERK_SECRET_KEY`, `TURSO_DATABASE_URL`, and `TURSO_AUTH_TOKEN`
on that service. If iOS Shortcuts are enabled, also configure
`SMARTSAVER_SHORTCUT_API_KEY` and
`SMARTSAVER_SHORTCUT_OWNER_CLERK_USER_ID` on the API service. Also set the
server-side `OPENAI_API_KEY` and `SMARTSAVER_SHORTCUT_TIME_ZONE` (defaults to
`America/Santiago`). `SMARTSAVER_SHORTCUT_OPENAI_MODEL` optionally overrides
the default `gpt-5.6-luna` model. The Shortcut API key is a dedicated SmartSaver
credential; never expose `CLERK_SECRET_KEY` or `OPENAI_API_KEY` to a shortcut.

For the separate API Vercel project, set Root Directory to `apps/api` and use
the Node.js runtime with the `Other` framework preset. Keep the root
`pnpm-lock.yaml` as the workspace lockfile; do not add a Bun lockfile or a
`bunVersion` override. The local API uses Node.js 22 and `pnpm dev:api`.

### Troubleshooting

#### Error: "Cannot find module"

Asegúrate de haber instalado las dependencias:
```bash
pnpm install
```

#### Error: "Migration failed"

1. Verifica que las variables de entorno estén correctamente configuradas
2. Comprueba que tienes conexión a la base de datos Turso
3. Revisa los logs para más detalles del error

#### Rollback de Migraciones

Si necesitas revertir una migración:

1. Elimina la migración problemática de `apps/web/database/migrations/`
2. Ejecuta `pnpm db:generate` para regenerar las migraciones
3. Despliega nuevamente

### Mejores Prácticas

1. **Siempre revisa las migraciones generadas** antes de aplicarlas en producción
2. **Haz backup de tu base de datos** antes de ejecutar migraciones importantes
3. **Prueba las migraciones en un ambiente de staging** primero
4. **Commitea las migraciones** en tu repositorio junto con los cambios de código
5. **Documenta migraciones complejas** con comentarios en el código

### Secuencia de Despliegue Completa

```bash
# 1. Desarrollo: Modifica tus modelos
# 2. Genera las migraciones
pnpm db:generate

# 3. Revisa y commitea las migraciones
git add apps/web/database/migrations/
git commit -m "feat: add new database migration"

# 4. Push a tu repositorio
git push origin main

# 5. Las migraciones se ejecutarán automáticamente durante el build
#    (si configuraste el Build Command correctamente)
```

### Monitoreo

Después del despliegue, verifica:

1. Los logs de build en tu plataforma de hosting
2. Que la aplicación funcione correctamente
3. Que no haya errores relacionados con la base de datos

Para monitorear tu base de datos Turso:
```bash
pnpm db:studio
```
