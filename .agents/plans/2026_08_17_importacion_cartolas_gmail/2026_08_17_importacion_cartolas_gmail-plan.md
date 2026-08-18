---
name: "2026_08_17_importacion_cartolas_gmail"
description: "Implementar la importación manual y automática de cartolas mensuales desde Gmail"
created_at: "2026-08-18T02:54:56Z"

created_by:
  tool: "OpenCode"
  model:
    name: "gpt-5.6-sol"
    version: "openai/gpt-5.6-sol"
    reasoning_effort: "high"
---

## Objetivo

Permitir que cada usuario vincule Gmail, configure bancos autorizados e importe movimientos desde cartolas mensuales mediante OpenAI, tanto manualmente como una vez por día local. La solución debe validar y deduplicar cartolas y movimientos, mantener un historial durante 12 meses, enviar push notifications y conservar los datos definidos al desvincular o revincular Gmail.

## Contexto

- El comportamiento aprobado, las reglas de negocio y los criterios de aceptación están definidos en [2026_08_16_importacion_cartolas_gmail-requirement.md](../../requirements/2026_08_16_importacion_cartolas_gmail/2026_08_16_importacion_cartolas_gmail-requirement.md). Cada acción de este plan mantiene trazabilidad con sus identificadores `RF-*`, `RN-*` y `CA-*`.
- La organización por feature, las dependencias entre capas y la ubicación de modelos, repositorios, actions, componentes y tipos deben seguir [project-architecture.md](../../../docs/agents/project-architecture.md).
- El código TypeScript, los nombres de archivo, imports, tipos y componentes deben seguir [code-conventions.md](../../../docs/agents/code-conventions.md).
- Las Server Actions, resultados operacionales en español, autorización, acceso a datos e invalidación de caché deben seguir [application-patterns.md](../../../docs/agents/application-patterns.md).
- La estrategia de Playwright, locators, assertions y aislamiento debe seguir [testing-guide.md](../../../docs/agents/testing-guide.md).
- Los comandos autoritativos para dependencias, Drizzle, migraciones y verificación deben consultarse en [development-commands.md](../../../docs/agents/development-commands.md) y en los scripts vigentes de [package.json](../../../package.json).
- [app/(auth)/settings/page.tsx](../../../app/(auth)/settings/page.tsx) contiene las tabs actuales de moneda, categorías y OpenAI; se ampliará con una experiencia navegable de importación de cartolas.
- [app/core/user/model/user-model.ts](../../../app/core/user/model/user-model.ts) no guarda zona horaria; [app/core/user/actions/user-actions.ts](../../../app/core/user/actions/user-actions.ts) establece el patrón actual para leer y actualizar el perfil.
- [app/core/categories/model/categories-model.ts](../../../app/core/categories/model/categories-model.ts) no distingue categorías protegidas y no garantiza la existencia de `Others`.
- [app/core/movements/model/movement-model.ts](../../../app/core/movements/model/movement-model.ts) no guarda moneda por movimiento, origen ni fingerprint; [app/core/movements/repository/movements-repository.ts](../../../app/core/movements/repository/movements-repository.ts) cifra descripción y monto con valores no deterministas y no permite deduplicación directa.
- [app/core/movements/actions/movments-actions.ts](../../../app/core/movements/actions/movments-actions.ts) ya usa OpenAI para archivos locales, pero su carga manual, formatos amplios, previsualización y corrección de fechas no cumplen este requisito y deben mantenerse separados de la nueva feature.
- [lib/encryption.ts](../../../lib/encryption.ts) y [lib/encrypted_movements.ts](../../../lib/encrypted_movements.ts) son la base actual para datos protegidos; tokens Gmail, contraseñas de PDF y firmas deterministas requieren contratos separados y secretos no expuestos al cliente.
- [public/sw.js](../../../public/sw.js) contiene handlers incompletos de push y navegación hacia un dominio de ejemplo; se modificará para usar datos reales del aviso.
- [database/drizzle.config.ts](../../../database/drizzle.config.ts) y [database/migrations](../../../database/migrations) definen Drizzle sobre Turso/libSQL. Las restricciones de unicidad y las operaciones transaccionales serán la defensa principal frente a concurrencia y reintentos.
- [playwright.config.ts](../../../playwright.config.ts) y [e2e/homepage.spec.ts](../../../e2e/homepage.spec.ts) constituyen la cobertura actual. Se incorporará Vitest para reglas puras e integración sin reemplazar Playwright para comportamiento visible.
- Vercel Cron será el despachador diario aprobado. El procesamiento se dividirá en ejecuciones persistidas, reclamables e idempotentes; las funciones trabajarán en lotes acotados, una invocación interrumpida dejará trabajo recuperable y ninguna Server Action mantendrá una importación completa abierta.

## Fases

### Fase 1: Configuración local visible y fundamentos financieros

#### Descripción

Entregar una primera experiencia navegable en Settings para seleccionar la zona horaria y preparar la categoría protegida `Others`, sin depender todavía de Gmail. Esta fase establece las reglas locales de fecha, categoría y verificación que usarán todas las importaciones posteriores.

#### Acciones pendientes

- [ ] Crear la feature `app/core/statement-imports/` con sus carpetas solo cuando contengan contratos usados en esta fase, siguiendo la arquitectura del proyecto.
- [ ] Modificar el esquema `users` para persistir una zona horaria IANA opcional y actualizar sus schemas y tipos públicos, conservando el bloqueo de búsquedas mientras no exista una zona válida (`RF-006`, `RN-008` a `RN-011`, `CA-004`, `CA-005`, `CA-015`).
- [ ] Modificar el esquema `categories` para identificar categorías protegidas y garantizar una categoría `Others` visible y utilizable por usuario, reutilizando una equivalente y conservando duplicadas sin cambios (`RF-019`, `RF-049`, `RF-050`, `RN-018`, `RN-054` a `RN-057`, `CA-033`, `CA-034`).
- [ ] Crear el contrato compartido `ActionResult<T> = { success: true; data: T } | { success: false; message: string }` para las nuevas operaciones de importación.
- [ ] Crear `getStatementImportSettings(): Promise<StatementImportSettings>` con estado inicial de zona horaria, disponibilidad de importaciones y categoría protegida.
- [ ] Crear `updateUserTimeZone(input: UpdateUserTimeZoneInput): Promise<ActionResult<UserTimeZone>>`, validando una zona IANA y sin provocar una ejecución inmediata (`RF-027`, `RN-010`, `CA-015`).
- [ ] Crear las funciones puras para calcular el período permitido, la fecha local de ejecución y la expiración anual de avisos, con reloj explícito y sin depender de la zona del servidor (`RN-007` a `RN-011`, `RN-036`, `RN-037`).
- [ ] Incorporar una tab visible de importación en Settings con selector de zona horaria, estado no vinculado de Gmail y acciones de búsqueda deshabilitadas con explicación cuando falta la zona (`RF-006`, `CA-004`).
- [ ] Crear las claves de copy `statementImports.timeZone`, `statementImports.connection` y los estados iniciales de `statementImports.errors` en `messages/es.json` y `messages/en.json`.
- [ ] Incorporar Vitest y crear la suite `statement_import_period` con casos para extremos del período de 12 meses, zonas IANA, cambio de zona sin ejecución, fechas locales repetidas y expiración en fechas inexistentes del año siguiente (`CA-004`, `CA-005`, `CA-015`, `CA-019`).
- [ ] Crear casos de integración para creación, reutilización, protección y duplicados preexistentes de `Others`, incluyendo el rechazo de renombrado y eliminación (`CA-033`, `CA-034`).
- [ ] Crear cobertura Playwright responsive para la tab, selección de zona, persistencia y bloqueo visible sin zona horaria.
- [ ] Generar y aplicar la migración Drizzle de la fase mediante los comandos documentados; verificar restricciones y compatibilidad con usuarios y categorías existentes.
- [ ] Verificar los cambios mediante typechecking, linting y tests con el comando de verificación del proyecto (consultarlo en AGENTS.md o en la configuración del proyecto). Corregir cualquier problema encontrado.
- [ ] DETENERSE. Presentar los cambios al usuario para su revisión y sugerir mensajes de commit (o títulos de pull request cuando las fases se implementen mediante pull requests). No continuar con la siguiente fase hasta que el usuario lo solicite explícitamente.

### Fase 2: Vinculación de Gmail e instituciones autorizadas

#### Descripción

Permitir que el usuario acepte el procesamiento por OpenAI, vincule una única cuenta Gmail y configure bancos, remitentes y contraseña opcional. El slice termina con una configuración utilizable y desvinculable, aunque la importación de cartolas todavía permanezca deshabilitada.

#### Acciones pendientes

- [ ] Agregar las dependencias de Google OAuth/Gmail necesarias y declarar configuración para cliente Google, callback público, secretos y cifrado sin exponer credenciales al navegador.
- [ ] Crear `gmail_connections` con unicidad por usuario, identidad estable de Google, correo protegido, consentimiento, tokens protegidos, vencimiento, estado de conexión, automatización desactivada y fechas de vínculo o desvínculo (`RF-001`, `RN-001`, `RN-049` a `RN-051`, `CA-029`, `CA-030`).
- [ ] Crear `statement_import_institutions` con institución canónica única por usuario y contraseña opcional protegida, y `statement_import_senders` con remitentes normalizados y unicidad por institución (`RF-002` a `RF-005`, `RN-002` a `RN-005`, `CA-001` a `CA-003`).
- [ ] Crear el catálogo cerrado de 15 instituciones y sus alias con códigos estables; impedir que alias o bancos fuera del catálogo se configuren como instituciones independientes (`RF-002`, `RN-002`, `RN-003`, `CA-001`).
- [ ] Crear `startGmailConnection(): Promise<ActionResult<GmailAuthorization>>` para iniciar Google OAuth con permisos mínimos de identidad y lectura de Gmail solo después del consentimiento (`RF-001`, `RF-043`, `RF-044`, `RN-049`, `CA-029`).
- [ ] Crear `GET /api/gmail/oauth/callback` y `completeGmailConnection(input: CompleteGmailConnectionInput): Promise<ActionResult<GmailConnectionOutcome>>`, validando estado, identidad y unicidad antes de guardar credenciales protegidas.
- [ ] Crear `disconnectGmail(): Promise<ActionResult<void>>` para revocar o retirar credenciales activas, detener búsquedas y conservar la configuración creada en esta fase (`RF-038`, `RN-043`, `CA-024`).
- [ ] Crear `createImportInstitution(input: CreateImportInstitutionInput): Promise<ActionResult<ConfiguredInstitution>>` exigiendo al menos un remitente y sin exigir contraseña (`RF-003`, `CA-002`).
- [ ] Crear `updateImportInstitution(input: UpdateImportInstitutionInput): Promise<ActionResult<ConfiguredInstitution>>` para actualizar atómicamente la lista completa de remitentes y la contraseña opcional, impidiendo eliminar el último remitente (`RF-004`, `RF-005`, `RN-004`, `RN-005`, `CA-003`).
- [ ] Crear `deleteImportInstitution(input: DeleteImportInstitutionInput): Promise<ActionResult<void>>` para retirar institución, remitentes y contraseña sin afectar otros datos del usuario (`RF-039`, `RN-044`, `CA-025`).
- [ ] Ampliar `getStatementImportSettings()` con estado de conexión, identidad enmascarada, catálogo, instituciones configuradas y disponibilidad calculada de importaciones.
- [ ] Implementar en Settings el consentimiento que identifica a OpenAI, vínculo OAuth, catálogo con alias informativos, formulario responsive de remitentes y contraseña, edición, eliminación y confirmación de desvínculo (`F-001`).
- [ ] Crear las claves de copy `statementImports.consent`, `statementImports.institutions`, `statementImports.reconnection` y errores de OAuth, remitentes y contraseña en ambos idiomas.
- [ ] Crear casos de integración para cifrado, una cuenta Gmail por usuario, catálogo cerrado, alias, unicidad de remitentes, actualización transaccional y protección del último remitente.
- [ ] Crear la suite `gmail_connection_e2e` para rechazo y aceptación del consentimiento, vínculo correcto, error OAuth, configuración sin contraseña, bloqueo del último remitente, edición y desvínculo (`CA-001` a `CA-003`, `CA-024`, `CA-029`, `CA-030`).
- [ ] Generar y aplicar la migración Drizzle de la fase y documentar las nuevas variables de entorno y el callback requerido en la guía de despliegue afectada.
- [ ] Verificar los cambios mediante typechecking, linting y tests con el comando de verificación del proyecto (consultarlo en AGENTS.md o en la configuración del proyecto). Corregir cualquier problema encontrado.
- [ ] DETENERSE. Presentar los cambios al usuario para su revisión y sugerir mensajes de commit (o títulos de pull request cuando las fases se implementen mediante pull requests). No continuar con la siguiente fase hasta que el usuario lo solicite explícitamente.

### Fase 3: Importación manual completa con OpenAI e historial

#### Descripción

Entregar el flujo manual de extremo a extremo: buscar PDFs elegibles en Gmail, abrirlos temporalmente, extraer y validar cartolas mediante OpenAI, incorporar movimientos nuevos sin revisión y mostrar un aviso leído con resumen y omisiones.

#### Acciones pendientes

- [ ] Agregar las dependencias de lectura y apertura temporal de PDF protegidos, reutilizar el AI SDK existente con la credencial administrada por SmartSaver y fijar límites de tamaño, cantidad de adjuntos y tiempo por unidad de trabajo.
- [ ] Modificar `movements` para guardar moneda, origen de importación, referencia de cartola y fingerprint determinista opcional; preservar el comportamiento de movimientos manuales y revisar los contratos MCP afectados (`RF-017`, `RF-018`, `RN-017`, `RN-024` a `RN-029`).
- [ ] Crear `processed_statements` con unicidad por usuario, institución canónica, producto normalizado y período mensual; solo registrar cartolas abiertas e identificadas, incluso si contienen movimientos inválidos (`RF-023`, `RN-012` a `RN-014`, `RN-030`, `CA-013`).
- [ ] Crear `statement_import_executions` con tipo manual o automático, estado pendiente, en proceso, completado o fallido, zona utilizada, fecha local, período solicitado, lectura, expiración y contadores de RN-031.
- [ ] Crear `statement_import_omissions` con ámbito cartola o movimiento, código estable y causa comprensible, sin almacenar PDF, credenciales ni contenido financiero innecesario (`RF-028`, `RN-031`, `RN-032`, `CA-016`).
- [ ] Crear `GmailStatementSource.findPendingStatements(input: GmailStatementSearchInput): Promise<GmailStatementCandidate[]>` con paginación, filtro por período, remitente autorizado y adjuntos PDF, excluyendo otros formatos y remitentes (`RF-007` a `RF-011`, `RN-006`, `RN-007`, `RN-048`, `CA-005` a `CA-007`).
- [ ] Crear `StatementExtractor.extract(input: StatementExtractionInput): Promise<ExtractedStatement>` para OpenAI, con salida estructurada de institución, producto, período, moneda y movimientos; validar la salida antes de considerarla identificada (`RF-010`, `RF-014`, `RF-016` a `RF-020`, `RF-046`, `RN-015` a `RN-019`, `RN-052`, `CA-006`, `CA-010`, `CA-031`).
- [ ] Implementar apertura con contraseña por institución y distinguir contraseña ausente, incorrecta, documento ilegible, documento no identificable y servicio OpenAI no disponible, dejando reintentables las cartolas correspondientes (`RF-012` a `RF-014`, `RF-048`, `RN-014`, `RN-053`, `CA-008`, `CA-009`, `CA-032`).
- [ ] Crear normalizadores puros de producto, descripción, monto, moneda y dirección; generar una firma determinista protegida por un secreto independiente para imponer deduplicación concurrente (`RF-021`, `RF-022`, `RN-020` a `RN-029`, `CA-011`, `CA-012`).
- [ ] Aplicar la dirección financiera con monto absoluto: aumento o disminución de saldo en cuentas y aumento o disminución de deuda en tarjetas (`RF-051`, `RF-052`, `RN-058` a `RN-060`, `CA-035`, `CA-036`).
- [ ] Crear `executeStatementImport(command: ExecuteStatementImportCommand): Promise<StatementImportExecutionSummary>` para reclamar una ejecución, procesar cartolas en unidades transaccionales, insertar movimientos no duplicados, registrar cartolas y omisiones, liberar cualquier PDF temporal y cerrar el resumen.
- [ ] Garantizar que una indisponibilidad de OpenAI cierre toda la ejecución con error sin incorporar movimientos ni registrar cartolas como procesadas, limpiando copias temporales tanto en éxito como en error (`RF-047`, `RF-048`, `RN-051`, `RN-053`, `CA-030`, `CA-032`).
- [ ] Crear `requestManualStatementImport(input: ManualStatementImportInput): Promise<ActionResult<{ executionId: string }>>`, validando zona y período, persistiendo primero la ejecución y solicitando procesamiento inmediato fuera de la respuesta interactiva (`RF-006` a `RF-009`, `CA-004`, `CA-005`).
- [ ] Crear `POST /api/internal/statement-imports/[executionId]/process` como contrato interno autenticado que acepte una ejecución persistida, responda `202` después de reclamarla y continúe un lote acotado dentro de los límites de Vercel Functions; una interrupción debe dejarla reclamable nuevamente.
- [ ] Crear `listStatementImportExecutions(): Promise<StatementImportExecutionListItem[]>`, `getStatementImportExecution(input: GetStatementImportExecutionInput): Promise<StatementImportExecutionDetail>` y `markStatementImportExecutionRead(input: MarkStatementImportExecutionReadInput): Promise<ActionResult<void>>` con autorización por usuario (`RF-029` a `RF-031`, `RN-033`, `RN-034`, `RN-040`, `CA-017`, `CA-018`).
- [ ] Implementar UI responsive para importar todas las pendientes o un mes permitido, seguir el estado, mostrar el resumen obligatorio, listar historial y abrir el detalle; las ejecuciones manuales deben aparecer leídas (`F-002`, `F-004`).
- [ ] Crear las claves de copy `statementImports.manual`, `statementImports.summary`, `statementImports.notifications` y causas de `statementImports.errors` en ambos idiomas.
- [ ] Crear la suite `statement_normalization` con todos los casos de RN-020 a RN-029, incluyendo tildes, espacios, signos, números, descripción ausente, símbolos monetarios y dirección.
- [ ] Crear las suites `statement_direction`, `statement_extraction` y `statement_import_repository` con PDFs y respuestas Gmail sintéticos o anonimizados para cuenta, tarjeta, protección, errores, atomicidad, concurrencia, reintento y limpieza temporal (`CA-006` a `CA-013`, `CA-031`, `CA-032`, `CA-035`, `CA-036`).
- [ ] Crear `manual_statement_import_e2e` con período completo y específico, rango inválido, cero resultados, resultados mixtos, duplicados, aviso leído y detalle de omisiones (`CA-005` a `CA-013`, `CA-016` a `CA-018`).
- [ ] Generar y aplicar la migración Drizzle de la fase, documentar el secreto de fingerprint y verificar que los movimientos históricos y contratos MCP continúen funcionando.
- [ ] Verificar los cambios mediante typechecking, linting y tests con el comando de verificación del proyecto (consultarlo en AGENTS.md o en la configuración del proyecto). Corregir cualquier problema encontrado.
- [ ] DETENERSE. Presentar los cambios al usuario para su revisión y sugerir mensajes de commit (o títulos de pull request cuando las fases se implementen mediante pull requests). No continuar con la siguiente fase hasta que el usuario lo solicite explícitamente.

### Fase 4: Automatización diaria con Vercel Cron

#### Descripción

Activar una primera ejecución inmediata y despachar como máximo una ejecución automática por fecha local mediante Vercel Cron. El slice incorpora locking, lotes, recuperación de ejecuciones interrumpidas y avisos automáticos no leídos sin depender del navegador.

#### Acciones pendientes

- [ ] Agregar `vercel.json` con un cron global diario y configurar `CRON_SECRET`; documentar que Vercel Hobby ofrece precisión horaria y que el requisito depende de fecha local, no de una hora exacta.
- [ ] Crear una restricción de unicidad para ejecución automática por usuario y fecha local, además de datos de reclamación, lease, intentos y último error necesarios para recuperar trabajo interrumpido (`RF-026`, `RN-011`, `CA-014`, `CA-015`).
- [ ] Crear `setAutomaticImportEnabled(input: SetAutomaticImportEnabledInput): Promise<ActionResult<{ executionId?: string }>>`; al activar debe crear una ejecución inmediata idempotente y al desactivar debe impedir futuras ejecuciones sin bloquear las manuales (`RF-024`, `RF-025`, `RN-042`, `CA-014`).
- [ ] Crear `dispatchDailyStatementImports(input: DispatchDailyStatementImportsInput): Promise<DispatchDailyStatementImportsResult>` para seleccionar usuarios habilitados, calcular su fecha local, crear únicamente ejecuciones faltantes y reencolar ejecuciones pendientes o con lease vencido.
- [ ] Crear `GET /api/cron/statement-imports` protegido por `CRON_SECRET`, con límite explícito de usuarios por lote, despacho concurrente acotado hacia el procesador interno y respuesta observable para métricas de creadas, omitidas, recuperadas y fallidas.
- [ ] Reutilizar `executeStatementImport()` para ejecuciones automáticas y garantizar que Gmail no disponible o credenciales revocadas produzcan error sin movimientos, aviso no leído y causa segura (`RF-037`, `RN-032`, `RN-035`, `CA-023`).
- [ ] Actualizar `statement_import_executions` y el historial para que resultados automáticos con importaciones, sin novedades o con error siempre creen avisos no leídos (`RF-029`, `RN-033`, `RN-035`, `CA-017`).
- [ ] Implementar en Settings los controles independientes de automatización y el estado de la última ejecución, solicitando permiso de push al activar pero sin condicionar la ejecución al resultado del permiso (`RF-024`, `RF-025`, `RF-033`, `RN-041`, `CA-014`, `CA-022`).
- [ ] Crear copy de `statementImports.automation` y estados de pendiente, en proceso, completado, sin novedades, error y recuperación en ambos idiomas.
- [ ] Crear pruebas con reloj controlado para activación inmediata, dos despachos concurrentes, mismo día local, cambio de zona, lease vencido, lote parcial, cron repetido y Gmail no disponible (`CA-014`, `CA-015`, `CA-017`, `CA-023`).
- [ ] Crear `automatic_statement_import_e2e` para activación, aviso no leído, contador pendiente, resultado sin novedades, error y continuidad de importación manual al desactivar (`CA-014`, `CA-017`, `CA-018`, `CA-022`, `CA-023`).
- [ ] Verificar en un entorno Vercel de preview o equivalente la autenticación del cron, el despacho, la reclamación y la recuperación sin registrar secretos ni contenido de cartolas.
- [ ] Verificar los cambios mediante typechecking, linting y tests con el comando de verificación del proyecto (consultarlo en AGENTS.md o en la configuración del proyecto). Corregir cualquier problema encontrado.
- [ ] DETENERSE. Presentar los cambios al usuario para su revisión y sugerir mensajes de commit (o títulos de pull request cuando las fases se implementen mediante pull requests). No continuar con la siguiente fase hasta que el usuario lo solicite explícitamente.

### Fase 5: Push notifications y acceso directo al aviso

#### Descripción

Permitir que cada dispositivo habilite o deshabilite Web Push de forma independiente de la automatización. Cada ejecución automática debe notificar su estado y abrir el detalle correcto, marcándolo como leído.

#### Acciones pendientes

- [ ] Agregar la dependencia de Web Push y configurar claves VAPID públicas y privadas sin exponer secretos del servidor.
- [ ] Crear `push_subscriptions` con usuario, endpoint único, claves, estado y fechas, permitiendo varias suscripciones por usuario y retirando endpoints inválidos.
- [ ] Crear `subscribeToImportNotifications(input: PushSubscriptionInput): Promise<ActionResult<void>>` y `unsubscribeFromImportNotifications(input: PushUnsubscriptionInput): Promise<ActionResult<void>>` con autorización y validación del payload (`RF-036`, `RN-041`, `CA-022`).
- [ ] Registrar el service worker desde una interacción del usuario, solicitar permiso al activar automatización y mantener el estado de push separado del estado automático (`RF-033`, `RF-036`, `RN-041`, `CA-022`).
- [ ] Modificar `public/sw.js` para mostrar estado, cantidad importada y datos del aviso; reemplazar la URL de ejemplo por un deep link autenticado al detalle y enfocar una ventana existente cuando corresponda (`RF-034`, `RF-035`, `RN-038` a `RN-040`, `CA-020`, `CA-021`).
- [ ] Enviar una push notification después de cada ejecución automática con importaciones, sin novedades o con error, sin incluir datos financieros sensibles (`RF-034`, `RN-038`, `RN-039`, `CA-020`).
- [ ] Hacer que el deep link cargue `getStatementImportExecution()` y ejecute `markStatementImportExecutionRead()`, actualizando el contador pendiente (`RF-030`, `RF-031`, `RF-035`, `RN-040`, `CA-018`, `CA-021`).
- [ ] Implementar controles y estados no compatibles, denegados, habilitados y revocados en Settings sin detener automatización ni historial.
- [ ] Crear las claves `statementImports.push` y sus mensajes de permiso, incompatibilidad, suscripción y error en ambos idiomas.
- [ ] Crear pruebas de servidor para payloads de los tres estados, endpoints expirados, varias suscripciones, revocación y ausencia de datos sensibles.
- [ ] Crear `statement_import_notifications_e2e` para permiso aceptado, rechazado y revocado, independencia de la automatización, deep link, detalle y cambio a leído (`CA-018`, `CA-020` a `CA-022`).
- [ ] Verificar manualmente Web Push en los navegadores soportados bajo HTTPS y documentar las limitaciones visibles de plataformas que no ofrecen Push API.
- [ ] Generar y aplicar la migración Drizzle de la fase y documentar las variables VAPID requeridas.
- [ ] Verificar los cambios mediante typechecking, linting y tests con el comando de verificación del proyecto (consultarlo en AGENTS.md o en la configuración del proyecto). Corregir cualquier problema encontrado.
- [ ] DETENERSE. Presentar los cambios al usuario para su revisión y sugerir mensajes de commit (o títulos de pull request cuando las fases se implementen mediante pull requests). No continuar con la siguiente fase hasta que el usuario lo solicite explícitamente.

### Fase 6: Revinculación, conservación, retención y endurecimiento

#### Descripción

Completar el ciclo de vida de la integración: distinguir la misma cuenta Gmail de una distinta, reutilizar o descartar configuración, conservar movimientos y cartolas procesadas, retirar avisos vencidos y endurecer seguridad, recuperación y observabilidad.

#### Acciones pendientes

- [ ] Modificar `completeGmailConnection()` para devolver `GmailConnectionOutcome` con cuenta nueva, misma cuenta revinculada o cuenta distinta pendiente de decisión, comparando una identidad estable del proveedor (`RF-040`, `RF-041`, `RN-046`, `CA-026`, `CA-027`).
- [ ] Crear `resolveGmailReconnection(input: ResolveGmailReconnectionInput): Promise<ActionResult<void>>` para reutilizar o descartar instituciones, remitentes y contraseñas sin eliminar movimientos, avisos vigentes ni cartolas procesadas (`RF-041`, `RF-042`, `RN-046`, `RN-047`, `CA-027`, `CA-028`).
- [ ] Completar `disconnectGmail()` para desactivar automatización, impedir nuevas búsquedas, retirar credenciales activas y conservar movimientos, configuración, cartolas procesadas y avisos vigentes (`RF-038`, `RN-043`, `CA-024`).
- [ ] Completar `deleteImportInstitution()` para borrar únicamente su configuración, remitentes y contraseña, conservando movimientos y registros de cartolas procesadas (`RF-039`, `RN-044`, `CA-025`).
- [ ] Incorporar en el cron la retirada de avisos y omisiones cuyo vencimiento local haya terminado, aplicando el último día del mes cuando la fecha equivalente no exista (`RF-032`, `RN-036`, `RN-037`, `CA-019`).
- [ ] Mantener `processed_statements` durante toda la vida de la cuenta SmartSaver y excluirlo de la limpieza de Gmail, instituciones e historial (`RN-045`, `CA-024` a `CA-028`).
- [ ] Implementar UI de revinculación con decisión explícita para cuenta distinta y confirmaciones que enumeren con precisión qué datos se conservan o eliminan (`F-005`, `F-006`).
- [ ] Completar copy de `statementImports.reconnection` y `statementImports.errors` para desvínculo, misma cuenta, cuenta distinta, reutilización, descarte, Gmail revocado y recuperación de ejecución.
- [ ] Aplicar límites y redacción de logs para tokens, contraseñas, correos, PDFs, resultados de IA y fingerprints; verificar ownership por `clerk_id` en toda lectura y mutación de la feature.
- [ ] Añadir métricas estructuradas para cron y ejecuciones con identificadores no sensibles, duración, intentos, lotes, resultados y causas, además de alertas documentadas para backlog y leases vencidos.
- [ ] Crear pruebas de integración para desvínculo, misma cuenta, cuenta distinta con reutilización o descarte, eliminación de institución, conservación permanente de cartolas, expiración de avisos, ejecución interrumpida y reclamación segura (`CA-019`, `CA-024` a `CA-028`).
- [ ] Completar `gmail_connection_e2e` con todos los flujos de desvinculación y revinculación, verificando configuración, movimientos, cartolas e historial conservado o descartado según cada decisión.
- [ ] Ejecutar una revisión final de trazabilidad para confirmar cobertura de `RF-001` a `RF-052`, `RN-001` a `RN-060` y `CA-001` a `CA-036`, sin ampliar el alcance aprobado.
- [ ] Actualizar las guías de desarrollo, despliegue y testing cuando la configuración ejecutable incorporada en las fases anteriores haya cambiado sus comandos o requisitos.
- [ ] Verificar los cambios mediante typechecking, linting y tests con el comando de verificación del proyecto (consultarlo en AGENTS.md o en la configuración del proyecto). Corregir cualquier problema encontrado.
- [ ] DETENERSE. Presentar los cambios al usuario para su revisión y sugerir mensajes de commit (o títulos de pull request cuando las fases se implementen mediante pull requests). No continuar con la siguiente fase hasta que el usuario lo solicite explícitamente.

## Próximo paso

Implementar la Fase 1 para entregar la configuración visible de zona horaria y la categoría protegida `Others` con sus migraciones y pruebas.
