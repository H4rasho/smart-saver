---
name: "2026_10_10-dashboard-analytics"
description: "Dashboard con filtros y tres gráficos usando TanStack Charts, aprobado en tres fases."
created_at: "2026-10-10T21:55:48Z"
created_by:
  tool: "Codex"
  model:
    name: "OpenAI GPT"
    version: "No disponible en el contexto del runtime"
    reasoning_effort: "No disponible en el contexto del runtime"
implemented_by:
  tool: "Codex"
  model:
    name: "OpenAI GPT"
    version: "No disponible en el contexto del runtime"
    reasoning_effort: "No disponible en el contexto del runtime"
last_implementation_at: "2026-10-10T22:05:47Z"
has_completed_all_phases: false
---

# Dashboard financiero con TanStack Charts

## Objetivo

Ampliar el dashboard con filtros de período y tres gráficos para analizar ingresos, gastos y evolución mensual. Usar TanStack Charts con diseño responsive, modo oscuro, accesibilidad y traducciones español/inglés.

Estado: aprobado por el usuario el 2026-10-10 en tres fases. Fase 1 implementada; validación E2E autenticada y revisión visual pendientes. No hacer commit ni despliegue sin solicitud explícita; detenerse después de cada fase.

## Contexto

- [Dashboard real](/Users/thomassepulveda/my/save-ai/apps/web/app/(auth)/home/page.tsx): tarjetas y últimos movimientos. Usa `getTotalsByTypeAction`, `getBalanceAction`, `getMovmentsAction` y `getUserCurrency`.
- [Alias dashboard](/Users/thomassepulveda/my/save-ai/apps/web/app/(auth)/dashboard/page.tsx): redirige a `/home`.
- [Repositorio](/Users/thomassepulveda/my/save-ai/apps/web/app/core/movements/repository/movements-repository.ts): los totales actuales cubren el mes actual; la agrupación por categoría existente cubre el histórico y ordena por cantidad, no por monto.
- [Tipos](/Users/thomassepulveda/my/save-ai/apps/web/app/core/movements/types/movement-type.ts): fecha y categoría pueden faltar.
- [Moneda](/Users/thomassepulveda/my/save-ai/apps/web/app/core/user/lib/user-lib.ts): reutilizar `formatCurrencyAmount`.
- [Textos ES](/Users/thomassepulveda/my/save-ai/apps/web/messages/es.json) y [EN](/Users/thomassepulveda/my/save-ai/apps/web/messages/en.json): conservar claves equivalentes.
- [Unit tests](/Users/thomassepulveda/my/save-ai/apps/web/test) y [E2E](/Users/thomassepulveda/my/save-ai/apps/web/e2e): preparar autenticación y fixtures aislados para el dashboard; no se encontró cobertura autenticada específica existente.

### Guías a seguir

- [Development commands](/Users/thomassepulveda/my/save-ai/docs/agents/development-commands.md).
- [Code conventions](/Users/thomassepulveda/my/save-ai/docs/agents/code-conventions.md).
- [Project architecture](/Users/thomassepulveda/my/save-ai/docs/agents/project-architecture.md).
- [Application patterns](/Users/thomassepulveda/my/save-ai/docs/agents/application-patterns.md).
- [Testing guide](/Users/thomassepulveda/my/save-ai/docs/agents/testing-guide.md).

Consultar scripts vigentes antes de ejecutar. La configuración prevalece sobre documentación; corregir la guía afectada en el mismo cambio si hay contradicciones.

### Reglas aprobadas

- Período inicial: este mes. Filtros: este mes, mes anterior, últimos 3/6/12 meses y rango personalizado. Persistir en URL; fechas `YYYY-MM-DD` inclusivas.
- Tarjetas y gráficos comparten el período. Últimos movimientos conservan comportamiento actual.
- Usar `transaction_date`, no `created_at`; fechas nulas no se incluyen en análisis por período ni se inventan.
- Ingresos: `INCOME`; gastos: `EXPENSE` y `FIXED_EXPENSE`.
- Renombrar saldo como “Resultado neto del período”: ingresos menos gastos, no saldo bancario.
- Tasa de ahorro: neto/ingresos × 100. Sin ingresos mostrar “No disponible”; conservar tasas negativas.
- Categorías faltantes bajo “Sin categoría”; agrupar por identificador y ordenar por monto descendente.
- Acumulado: comparar el último mes incluido en el filtro con el anterior. Si es el mes actual, hasta hoy; si está cerrado, hasta el último día equivalente. Mostrar ambos meses y cortes explícitamente. El contexto es mensual, incluso si excede el rango personalizado.
- No inventar días ni proyectar importes para meses más cortos; identificar límites de cada serie.
- Los importes están cifrados: filtrar por usuario/fechas, descifrar y sumar en servidor. No usar `SUM` sobre importes cifrados ni enviar nombres o movimientos completos al navegador.
- Obtener usuario autenticado en servidor; nunca aceptar propietario del cliente. Respetar moneda configurada sin añadir conversiones.
- Validar fechas reales y orden del rango. Operar con días calendario y la referencia temporal de la aplicación, evitando desplazamientos UTC.
- Distinguir carga, error y vacío; no mostrar datos ficticios ni tratar un fallo como cero movimientos.
- Fuera de alcance: presupuestos, predicciones, metas de ahorro, migraciones de base de datos, migración a la API y despliegue.

### Organización y contratos comunes

Crear solo capas necesarias bajo `/Users/thomassepulveda/my/save-ai/apps/web/app/core/dashboard/`: `actions`, `repository`, `lib`, `types`, `components`. Archivos nuevos snake_case; identificadores en inglés. Agregaciones puras separadas de consulta y descifrado.

Consultar [TanStack Charts](https://tanstack.com/charts/latest) para comprobar versión, instalación y exports React antes de integrar; no agregar otra biblioteca de gráficos.

```ts
type DashboardPeriod = { from: string; to: string };
```

Las firmas de acciones siguientes describen los payloads aprobados. Al implementar, encapsular fallos operacionales en objetos resultado según la guía y documentar el envoltorio concreto; nunca exponer excepciones internas o sustituir errores por datos vacíos.

## Fases

### Fase 1. Períodos e ingresos vs. gastos

**Descripción:** primera entrega navegable con filtro global, tarjetas consistentes y barras mensuales de ingresos/gastos.

#### Contratos

```ts
interface DashboardOverview {
  period: DashboardPeriod;
  currency: string;
  totals: {
    income: number;
    expenses: number;
    net: number;
    savingsRate: number | null;
  };
  monthlySeries: Array<{ month: string; income: number; expenses: number }>;
}
getDashboardOverviewAction(period: DashboardPeriod): Promise<DashboardOverview>
```

Componentes: `DashboardPeriodFilter`, `IncomeExpensesChart`; modificar tarjetas de `/home`. Textos ES/EN: filtros, resultado neto, tasa no disponible, leyendas, tooltips, carga, error y vacío.

Suites nuevas propuestas: `/Users/thomassepulveda/my/save-ai/apps/web/test/dashboard_period.test.ts`, `/Users/thomassepulveda/my/save-ai/apps/web/test/dashboard_overview.test.ts`, `/Users/thomassepulveda/my/save-ai/apps/web/e2e/dashboard.spec.ts`.

#### Acciones pendientes

- [x] Integrar TanStack Charts como tarea separada, comprobando compatibilidad React/Next.js y exports oficiales; actualizar dependencia y lockfile con pnpm.
- [x] Crear validación del período y presets; persistir selección en URL manteniendo navegación localizada.
- [x] Implementar repositorio acotado al usuario y fechas; reutilizar descifrado en servidor, retornar únicamente agregados.
- [x] Calcular totales, neto, tasa y serie mensual; rellenar meses vacíos dentro del intervalo con ceros y distinguir período completamente vacío.
- [x] Conectar filtros y tarjetas con barras agrupadas, evitando mostrar cifras anteriores como pertenecientes al nuevo período.
- [x] Incorporar moneda, leyendas, tooltips accesibles, modo oscuro, responsive y estados de carga/error/vacío en ambos idiomas.
- [x] Añadir unit tests: límites inclusivos, fechas inválidas/nulas, cambio de año, gastos fijos, meses vacíos, tasa sin ingresos y neto negativo.
- [x] Preparar autenticación y fixtures aislados sin datos reales; probar aislamiento de usuarios y acceso no autenticado en el nivel apropiado.
- [ ] Añadir E2E: filtros cambian URL y cifras, selección persiste en navegación, ausencia de datos, idioma inglés y móvil sin overflow.
- [x] Verificar los cambios mediante typechecking, linting y tests con el comando de verificación del proyecto (consultarlo en AGENTS.md o en la configuración del proyecto). Corregir cualquier problema encontrado.
- [x] DETENERSE. Presentar los cambios al usuario para su revisión y sugerir mensajes de commit (o títulos de pull request cuando las fases se implementen mediante pull requests). No continuar con la siguiente fase hasta que el usuario lo solicite explícitamente.

### Fase 2. Gastos por categoría

**Descripción:** barras horizontales para explicar dónde se concentra el gasto del período.

#### Contratos

```ts
interface CategoryExpenseSummary {
  categoryId: number | null;
  categoryName: string;
  amount: number;
  share: number; // Porcentaje de gastos del período, 0 a 100.
}
getDashboardCategoryExpensesAction(
  period: DashboardPeriod,
): Promise<CategoryExpenseSummary[]>
```

Componente: `CategoryExpensesChart`. Textos ES/EN: gastos por categoría, porcentaje del total, Sin categoría y ausencia de gastos. No traducir nombres personalizados.

Suite nueva propuesta: `/Users/thomassepulveda/my/save-ai/apps/web/test/dashboard_category_expenses.test.ts`; ampliar `/Users/thomassepulveda/my/save-ai/apps/web/e2e/dashboard.spec.ts`.

#### Acciones pendientes

- [ ] Consultar y agregar gastos por categoría usando usuario autenticado, período y descifrado server-side.
- [ ] Agrupar por identificador, conservar categorías homónimas distintas y agrupar categoría nula; incluir gastos fijos, excluir ingresos.
- [ ] Calcular monto y porcentaje, evitar división por cero y ordenar por monto descendente.
- [ ] Integrar barras horizontales y tooltips, labels legibles y nombres largos en móvil.
- [ ] Conectar filtro global; añadir traducciones y estados de carga/error/sin gastos.
- [ ] Añadir unit tests para gastos fijos, ingresos excluidos, categorías nulas/homónimas, orden, porcentajes y vacío.
- [ ] Ampliar E2E para categorías, actualización por filtro, inglés y móvil.
- [ ] Verificar los cambios mediante typechecking, linting y tests con el comando de verificación del proyecto (consultarlo en AGENTS.md o en la configuración del proyecto). Corregir cualquier problema encontrado.
- [ ] DETENERSE. Presentar los cambios al usuario para su revisión y sugerir mensajes de commit (o títulos de pull request cuando las fases se implementen mediante pull requests). No continuar con la siguiente fase hasta que el usuario lo solicite explícitamente.

### Fase 3. Gasto acumulado comparativo

**Descripción:** comparar líneas acumuladas diarias del mes de referencia y el anterior, con cortes temporales claros y sin proyecciones.

#### Contratos

```ts
interface CumulativeExpenseComparison {
  referenceMonth: string; // YYYY-MM
  previousMonth: string; // YYYY-MM
  referenceCutoff: string; // YYYY-MM-DD
  previousCutoff: string; // YYYY-MM-DD
  points: Array<{
    day: number;
    current: number | null;
    previous: number | null;
  }>;
}
getDashboardCumulativeExpensesAction(
  period: DashboardPeriod,
): Promise<CumulativeExpenseComparison>
```

`null` representa día inexistente o fuera del corte, no cero gastos. Componente: `CumulativeExpensesChart`. Textos ES/EN: meses comparados, cortes, acumulado, diferencia y explicación del contexto mensual.

Suite nueva propuesta: `/Users/thomassepulveda/my/save-ai/apps/web/test/dashboard_cumulative_expenses.test.ts`; ampliar `/Users/thomassepulveda/my/save-ai/apps/web/e2e/dashboard.spec.ts`.

#### Acciones pendientes

- [ ] Resolver meses y cortes desde el filtro aplicando la regla aprobada.
- [ ] Consultar movimientos del usuario solo para ambos períodos necesarios y agregar gastos tras descifrar en servidor.
- [ ] Construir acumulados diarios manteniendo el importe en días válidos sin movimientos, sin fabricar fechas ni datos después del corte.
- [ ] Mostrar líneas, meses y cortes explícitos, tooltips y diferencia calculada sobre días comparables.
- [ ] Integrar filtro global, traducciones y carga/error/vacío; distinguir una serie disponible de falta de datos.
- [ ] Añadir unit tests para febrero/bisiestos, meses de 30/31 días, cambio de año, día equivalente, días sin movimientos y rangos personalizados.
- [ ] Completar E2E con reloj y datos deterministas para mes actual/cerrado y filtros; revisar visualmente móvil, escritorio, oscuro e idiomas.
- [ ] Verificar los cambios mediante typechecking, linting y tests con el comando de verificación del proyecto (consultarlo en AGENTS.md o en la configuración del proyecto). Corregir cualquier problema encontrado.
- [ ] DETENERSE. Presentar los cambios al usuario para su revisión y sugerir mensajes de commit (o títulos de pull request cuando las fases se implementen mediante pull requests). No continuar con la siguiente fase hasta que el usuario lo solicite explícitamente.

## Verificación por fase

Desde `/Users/thomassepulveda/my/save-ai`, confirmar scripts y ejecutar:

```sh
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm --filter @smart-saver/web exec playwright test e2e/dashboard.spec.ts --project=chromium
```

Preparar autenticación y fixtures E2E previamente. Si faltan credenciales o entorno, informar la limitación sin declarar tests exitosos. Verificar build al integrar la dependencia para detectar problemas SSR/bundling. Cada fase debe mantenerse funcional y verificable por separado.

## Próximo paso

Completar E2E autenticados y revisión visual de fase 1 con un usuario Clerk de prueba y storage state. Tras revisión y aprobación explícita, implementar únicamente fase 2. No avanzar automáticamente.

## Resultado de implementación de fase 1

- TanStack Charts 1.1.0 con exports oficiales `@tanstack/charts/react`, compatible con React 19; build Next.js verificado.
- Acción encapsulada en `DashboardResult`: `{ success: true, data: DashboardOverview }` o `{ success: false, error: "invalidPeriod" | "unauthenticated" | "unavailable" }`. `hasMovements` distingue vacío de importes cero.
- Presets con meses completos, referencia `America/Santiago` como importación web. URL localizada; análisis anterior oculto durante transiciones, Suspense identificado por período.
- Consulta mínima por usuario/fechas, descifrado server-side y agregación pura. Prueba de consulta real en SQLite aislado con dos propietarios e importes cifrados; nunca enviar nombres al gráfico.
- Leyendas, tooltip monetario, tabla accesible, responsive y tokens de tema; ES/EN equivalentes.
- Verificaciones: typecheck y build exitosos; lint exitoso con warning preexistente de TanStack Table en `home/data-table.tsx`; 18 unit tests exitosos.
- Chromium: 1 prueba de acceso no autenticado exitosa; 3 pruebas autenticadas omitidas explícitamente por falta de sesión Clerk de pruebas. El pendiente E2E sigue sin marcar. Revisión visual autenticada no verificada.
- Seed sintético verificado en SQLite temporal; instrucciones de autenticación y configuración aislada en `docs/agents/testing-guide.md`.
- Sin commit, push, despliegue ni cambios de fases 2/3.
