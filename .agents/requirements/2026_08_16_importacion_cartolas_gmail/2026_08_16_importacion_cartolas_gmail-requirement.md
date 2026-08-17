---
name: "2026_08_16_importacion_cartolas_gmail"
description: "Importación manual y automática de movimientos desde cartolas mensuales recibidas en Gmail"
created_at: "2026-08-17T02:29:52Z"
status: "approved"

created_by:
  tool: "OpenCode"
  model:
    name: "gpt-5.6-sol"
    version: "openai/gpt-5.6-sol"
    reasoning_effort: "high"
---

## Objetivo

Permitir que una persona incorpore automáticamente a SmartSaver los movimientos incluidos en sus cartolas mensuales recibidas en Gmail, reduciendo el registro manual y evitando duplicados. La funcionalidad debe admitir recuperación manual y seguimiento diario de cartolas de los últimos 12 meses.

## Actores

- **Usuario:** vincula su cuenta Gmail, selecciona instituciones compatibles, configura sus remitentes y contraseñas, inicia importaciones manuales, activa o desactiva la búsqueda automática y consulta sus resultados.
- **SmartSaver:** localiza cartolas elegibles, incorpora sus movimientos válidos, evita duplicados y comunica los resultados.

## Alcance

### Incluido

- Vinculación de una cuenta Gmail por usuario.
- Cartolas mensuales de cuentas bancarias y tarjetas de crédito.
- Selección por usuario de una o más instituciones desde el catálogo de instituciones compatibles de SmartSaver.
- Configuración de uno o varios remitentes autorizados para cada institución seleccionada.
- Modificación posterior de los remitentes autorizados, manteniendo al menos uno por institución.
- Eliminación de una institución configurada sin eliminar sus movimientos ya incorporados.
- Todas las instituciones del catálogo están sujetas a las mismas reglas funcionales.
- Contraseña configurable por institución para cartolas protegidas.
- Importación manual de todas las cartolas pendientes o de un mes y año específicos.
- Importación automática inmediata al activarla y una vez por cada día local posterior.
- Cartolas comprendidas entre el primer día del undécimo mes anterior y el día actual.
- Compras, cargos, pagos, abonos, devoluciones, transferencias, retiros, comisiones, intereses e impuestos.
- Clasificación automática y asignación de la categoría `Others` cuando no pueda determinarse otra.
- Importaciones parciales de cartolas que contienen movimientos válidos e inválidos.
- Prevención de cartolas y movimientos duplicados.
- Avisos dentro de SmartSaver con el resultado de cada ejecución.

### Fuera del alcance

- Proveedores de correo distintos de Gmail.
- Más de una cuenta Gmail por usuario.
- Instituciones que no estén disponibles en el catálogo de instituciones compatibles.
- Cartolas recibidas desde remitentes que el usuario no haya autorizado para la institución correspondiente.
- Creación de nuevas instituciones por parte del usuario.
- Solicitud de incorporación de una institución ausente mediante esta funcionalidad.
- Adjuntos distintos de PDF.
- Cartolas anteriores al primer día del undécimo mes anterior.
- Carga manual de cartolas desde el dispositivo del usuario.
- Revisión, edición o confirmación de movimientos antes de incorporarlos.
- Creación o selección de cuentas financieras de destino.
- Avisos de resultado enviados por correo.

## Glosario

- **Cartola:** documento mensual emitido por una institución financiera que informa los movimientos de un producto financiero.
- **Producto financiero:** cuenta bancaria o tarjeta de crédito identificada en una cartola.
- **Catálogo de instituciones compatibles:** conjunto de instituciones financieras que SmartSaver presenta como seleccionables y cuyas cartolas puede interpretar.
- **Institución configurada:** institución seleccionada por el usuario desde el catálogo, con una contraseña y al menos un remitente autorizado.
- **Remitente autorizado:** dirección de correo registrada por el usuario para reconocer los mensajes de una institución configurada.
- **Cartola elegible:** cartola mensual PDF de una institución configurada, recibida desde uno de sus remitentes autorizados, perteneciente al período permitido y con institución, producto y período identificables.
- **Cartola pendiente:** cartola elegible que no ha sido procesada previamente.
- **Movimiento válido:** movimiento cuyo monto y fecha de operación pueden determinarse.
- **Movimiento inválido:** movimiento cuyo monto o fecha de operación no puede determinarse.
- **Período permitido:** intervalo desde el primer día del undécimo mes anterior hasta el día actual, según la fecha local del usuario.
- **Día local:** fecha calendario determinada por la zona horaria del usuario.
- **Ejecución:** una búsqueda manual o automática de cartolas y el procesamiento de sus resultados.

## Flujos funcionales

### F-001: Configurar la importación desde Gmail

- **Actor y resultado:** el usuario prepara SmartSaver para buscar sus cartolas.
- **Precondiciones:** el usuario ha accedido a SmartSaver.
- **Trigger:** el usuario inicia la vinculación de Gmail.
- **Flujo principal:**
  1. El usuario vincula una cuenta Gmail.
  2. SmartSaver presenta el catálogo de instituciones compatibles.
  3. El usuario selecciona una o más instituciones.
  4. Para cada institución seleccionada, el usuario registra una contraseña y uno o varios remitentes autorizados.
  5. SmartSaver confirma que la configuración quedó disponible para importaciones manuales.
  6. El usuario puede activar la importación automática.
- **Alternativas y excepciones:**
  - El usuario puede actualizar posteriormente la contraseña de una institución.
  - El usuario puede agregar o eliminar remitentes, pero no puede eliminar el último remitente de una institución configurada.
  - Si una institución no aparece en el catálogo, el usuario no puede configurarla ni continuar con ella.
  - Si Gmail no queda vinculado o ninguna institución queda configurada, no se habilitan búsquedas.
  - La importación manual permanece disponible aunque la automática esté desactivada.
- **Estado final observable:** existe una cuenta Gmail vinculada y al menos una institución configurada, o el usuario conserva la funcionalidad sin activar.

### F-002: Importar cartolas manualmente

- **Actor y resultado:** el usuario incorpora movimientos históricos sin esperar la revisión diaria.
- **Precondiciones:** Gmail está vinculado y existe al menos una institución configurada.
- **Trigger:** el usuario elige importar todas las cartolas pendientes o un mes y año específicos.
- **Flujo principal:**
  1. SmartSaver busca cartolas elegibles dentro del período permitido.
  2. Si se eligió un mes y año, restringe la búsqueda a ese período.
  3. SmartSaver omite las cartolas ya procesadas.
  4. SmartSaver procesa todas las cartolas pendientes encontradas.
  5. SmartSaver incorpora directamente los movimientos válidos nuevos.
  6. SmartSaver muestra el resumen de la ejecución.
- **Alternativas y excepciones:**
  - Si el mes solicitado queda fuera del período permitido, no se inicia la importación y se informa el límite.
  - Si no se encuentran cartolas, se muestra un resumen con cantidades iguales a cero.
  - Las cartolas o movimientos no procesables se omiten según las reglas de negocio y aparecen en el resumen.
- **Estado final observable:** los movimientos válidos nuevos quedan incorporados y el usuario conoce el resultado completo.

### F-003: Importar cartolas automáticamente

- **Actor y resultado:** el usuario mantiene sus movimientos mensuales actualizados sin iniciar cada búsqueda.
- **Precondiciones:** Gmail está vinculado, existe al menos una institución configurada y la importación automática está desactivada.
- **Trigger:** el usuario activa la importación automática.
- **Flujo principal:**
  1. SmartSaver realiza inmediatamente una primera ejecución.
  2. SmartSaver procesa todas las cartolas pendientes del período permitido.
  3. SmartSaver incorpora directamente los movimientos válidos nuevos.
  4. SmartSaver presenta un aviso dentro del producto con el resumen.
  5. SmartSaver repite la búsqueda una vez en cada día local posterior mientras la modalidad permanezca activa.
- **Alternativas y excepciones:**
  - Si una ejecución no encuentra cartolas pendientes, el aviso informa cantidades iguales a cero.
  - Si Gmail no está disponible, no se incorporan movimientos y el usuario recibe un aviso.
  - Una cartola omitida por contraseña incorrecta puede procesarse en una ejecución posterior después de corregir la contraseña.
- **Estado final observable:** cada día local tiene como máximo una revisión automática y su resultado queda informado al usuario.

### F-004: Desactivar o desvincular

- **Actor y resultado:** el usuario detiene nuevas búsquedas sin perder movimientos importados.
- **Precondiciones:** Gmail está vinculado.
- **Trigger:** el usuario desactiva la modalidad automática o desvincula Gmail.
- **Flujo principal:**
  1. Si desactiva la modalidad automática, SmartSaver detiene futuras búsquedas automáticas y mantiene disponible la importación manual.
  2. Si desvincula Gmail, SmartSaver detiene toda nueva búsqueda y desactiva la modalidad automática.
  3. SmartSaver conserva todos los movimientos ya incorporados.
- **Alternativas y excepciones:**
  - Si el usuario elimina una institución configurada, SmartSaver deja de buscar sus cartolas y conserva todos los movimientos incorporados anteriormente desde esa institución.
- **Estado final observable:** no se realizan búsquedas no autorizadas y los datos importados permanecen disponibles.

## Reglas de negocio

- **RN-001:** Cada usuario puede mantener vinculada como máximo una cuenta Gmail.
- **RN-002:** Solo pueden configurarse instituciones disponibles en el catálogo de instituciones compatibles.
- **RN-003:** Cada institución configurada utiliza su propia contraseña cuando una cartola la requiere.
- **RN-004:** Solo son elegibles las cartolas mensuales PDF de cuentas bancarias o tarjetas de crédito.
- **RN-005:** El período permitido comienza el primer día del undécimo mes anterior y termina en el día actual, según la fecha local del usuario.
- **RN-006:** Una cartola se identifica por la combinación de institución, producto financiero y período mensual.
- **RN-007:** Una cartola procesada, aunque haya contenido movimientos inválidos, no vuelve a procesarse.
- **RN-008:** Una cartola que no pudo abrirse o cuya institución, producto o período no pudo identificarse no se considera procesada.
- **RN-009:** Un movimiento es válido cuando pueden determinarse su fecha de operación y su monto.
- **RN-010:** La ausencia de descripción no invalida un movimiento; la descripción se conserva cuando está disponible.
- **RN-011:** Si un movimiento no informa moneda, se utiliza la moneda principal del usuario.
- **RN-012:** Cada movimiento válido recibe una categoría; cuando no pueda determinarse otra categoría, recibe `Others`.
- **RN-013:** La categoría `Others` debe estar disponible para todos los usuarios.
- **RN-014:** La dirección de cada monto debe representar su naturaleza financiera: cargo, pago, abono, devolución, transferencia o retiro.
- **RN-015:** Un movimiento es duplicado si coincide en institución, producto financiero, fecha de operación, descripción, monto y moneda con uno ya incorporado.
- **RN-016:** Los movimientos duplicados no se incorporan nuevamente.
- **RN-017:** Una cartola con movimientos válidos e inválidos se procesa una sola vez: incorpora los válidos y omite definitivamente los inválidos.
- **RN-018:** Cada resumen informa cantidades de cartolas encontradas, cartolas importadas, movimientos importados, duplicados omitidos e inválidos omitidos.
- **RN-019:** Cada cartola o movimiento omitido debe presentar una causa comprensible para el usuario.
- **RN-020:** Desactivar la modalidad automática no impide importaciones manuales.
- **RN-021:** Desvincular Gmail conserva los movimientos ya incorporados y desactiva la modalidad automática.
- **RN-022:** Cada institución configurada debe mantener al menos un remitente autorizado.
- **RN-023:** Solo son elegibles los correos enviados desde un remitente autorizado para la institución correspondiente.
- **RN-024:** Eliminar una institución configurada detiene futuras búsquedas de sus cartolas y conserva sus movimientos ya incorporados.
- **RN-025:** Todas las instituciones disponibles en el catálogo están sujetas a las mismas reglas funcionales.

## Requisitos funcionales

- **RF-001:** El producto debe permitir que el usuario vincule una cuenta Gmail, conforme a RN-001.
- **RF-002:** El producto debe permitir que el usuario seleccione una o más instituciones del catálogo y configure para cada una una contraseña y al menos un remitente autorizado.
- **RF-003:** El producto debe permitir que el usuario actualice la contraseña de una institución configurada.
- **RF-004:** El producto debe permitir una importación manual de todas las cartolas pendientes del período permitido.
- **RF-005:** El producto debe permitir una importación manual correspondiente a un mes y año del período permitido.
- **RF-006:** Si el usuario solicita un mes fuera del período permitido, el producto debe impedir la importación e informar el período admitido.
- **RF-007:** El producto debe permitir que el usuario active y desactive la importación automática.
- **RF-008:** Cuando el usuario activa la importación automática, el producto debe realizar inmediatamente una ejecución.
- **RF-009:** Mientras la importación automática esté activa, el producto debe realizar una ejecución en cada día local posterior sin superar una ejecución automática en esa fecha.
- **RF-010:** En cada ejecución automática, el producto debe procesar todas las cartolas pendientes del período permitido.
- **RF-011:** El producto debe considerar elegibles únicamente las cartolas de instituciones configuradas, recibidas desde uno de sus remitentes autorizados y conformes con RN-004 y RN-005.
- **RF-012:** Si una cartola requiere contraseña, el producto debe intentar abrirla con la contraseña configurada para su institución.
- **RF-013:** Si una cartola no puede abrirse, el producto debe omitirla, informar la causa y permitir un intento futuro.
- **RF-014:** Si no puede identificarse la institución, el producto o el período de una cartola, el producto debe omitirla, informar la causa y permitir un intento futuro.
- **RF-015:** Cuando una cartola elegible pendiente contiene movimientos válidos, el producto debe incorporarlos sin solicitar revisión ni confirmación previa.
- **RF-016:** El producto debe incorporar compras, cargos, pagos, abonos, devoluciones, transferencias, retiros, comisiones, intereses e impuestos.
- **RF-017:** Para cada movimiento válido, el producto debe registrar fecha de operación, descripción cuando esté disponible, monto, moneda y categoría.
- **RF-018:** Si un movimiento no informa moneda, el producto debe asignar la moneda principal del usuario.
- **RF-019:** Si no puede determinarse una categoría, el producto debe asignar `Others`.
- **RF-020:** El producto debe representar el efecto financiero de cada movimiento conforme a su naturaleza.
- **RF-021:** Si un movimiento carece de fecha de operación o monto, el producto debe omitirlo e informar la causa.
- **RF-022:** Cuando una cartola contiene movimientos válidos e inválidos, el producto debe incorporar los válidos y omitir los inválidos.
- **RF-023:** Si una cartola ya fue procesada, el producto debe omitirla conforme a RN-006 y RN-007.
- **RF-024:** Si un movimiento coincide con uno ya incorporado conforme a RN-015, el producto debe omitirlo.
- **RF-025:** Al finalizar una ejecución manual, el producto debe mostrar el resumen definido por RN-018 y RN-019.
- **RF-026:** Al finalizar una ejecución automática, el producto debe mostrar dentro de SmartSaver el resumen definido por RN-018 y RN-019.
- **RF-027:** Si Gmail deja de estar disponible o su acceso es revocado, el producto debe detener la ejecución, no incorporar movimientos e informar la causa.
- **RF-028:** Mientras la modalidad automática esté desactivada y Gmail permanezca vinculado, el producto debe mantener disponibles las importaciones manuales.
- **RF-029:** Cuando el usuario desvincula Gmail, el producto debe detener nuevas búsquedas, desactivar la modalidad automática y conservar los movimientos incorporados.
- **RF-030:** El producto debe mantener disponible la categoría `Others` para todos los usuarios.
- **RF-031:** El producto debe permitir que el usuario agregue o elimine remitentes autorizados de una institución configurada.
- **RF-032:** Si el usuario intenta eliminar el último remitente autorizado de una institución, el producto debe impedirlo e informar que se requiere al menos uno.
- **RF-033:** El producto debe permitir que el usuario elimine una institución configurada.
- **RF-034:** Cuando el usuario elimina una institución configurada, el producto debe detener futuras búsquedas de sus cartolas y conservar los movimientos incorporados anteriormente.
- **RF-035:** Si una institución no está disponible en el catálogo, el producto debe impedir su configuración.
- **RF-036:** Si un correo procede de un remitente no autorizado para la institución correspondiente, el producto debe excluirlo de la búsqueda de cartolas.

## Criterios de aceptación

- **CA-001** (`RF-001`, `RF-002`, `RF-003`, `RF-031`, `RN-001`, `RN-002`, `RN-003`, `RN-022`): Dado un usuario sin Gmail vinculado, cuando vincula una cuenta, selecciona una institución del catálogo y registra una contraseña y dos remitentes, entonces SmartSaver confirma la configuración, permite modificar posteriormente la contraseña y los remitentes, y no permite vincular una segunda cuenta Gmail.
- **CA-002** (`RF-004`, `RF-011`, `RN-004`, `RN-005`): Dado que el período permitido comprende el mes actual y los once meses anteriores, cuando el usuario solicita todas las cartolas pendientes, entonces SmartSaver procesa todas las cartolas PDF elegibles de ese intervalo y ninguna anterior.
- **CA-003** (`RF-005`, `RF-006`, `RN-005`): Dado un Gmail vinculado, cuando el usuario elige un mes y año admitidos, entonces SmartSaver busca solo ese período; cuando elige un mes anterior al límite, impide la ejecución e informa el intervalo permitido.
- **CA-004** (`RF-007`, `RF-008`, `RF-009`, `RF-010`): Dada una configuración válida con varias cartolas pendientes, cuando el usuario activa la modalidad automática, entonces SmartSaver ejecuta una búsqueda inmediata, procesa todas las pendientes y realiza como máximo una nueva ejecución en cada día local posterior.
- **CA-005** (`RF-012`, `RF-013`, `RF-003`, `RN-008`): Dada una cartola protegida y una contraseña incorrecta, cuando se ejecuta la importación, entonces SmartSaver omite la cartola e informa la causa; cuando el usuario corrige la contraseña, la cartola puede volver a intentarse manualmente o en la siguiente ejecución automática.
- **CA-006** (`RF-014`, `RN-006`, `RN-008`): Dada una cartola cuyo producto o período no puede identificarse, cuando se procesa, entonces SmartSaver no incorpora sus movimientos, informa la causa y no la marca como procesada.
- **CA-007** (`RF-015`, `RF-016`, `RF-017`, `RF-020`, `RN-009`, `RN-010`, `RN-014`): Dada una cartola pendiente con compras, pagos, devoluciones, transferencias y retiros válidos, cuando se procesa, entonces todos quedan incorporados sin confirmación previa, con fecha de operación, monto, moneda, categoría, descripción disponible y efecto financiero correcto.
- **CA-008** (`RF-018`, `RF-019`, `RF-030`, `RN-011`, `RN-012`, `RN-013`): Dado un movimiento válido sin moneda informada y sin categoría determinable, cuando se incorpora, entonces utiliza la moneda principal del usuario y la categoría `Others`.
- **CA-009** (`RF-021`, `RF-022`, `RN-009`, `RN-017`): Dada una cartola con tres movimientos válidos, uno sin fecha y otro sin monto, cuando se procesa, entonces se incorporan los tres válidos, se omiten los dos inválidos y la cartola queda procesada sin reintentar posteriormente los inválidos.
- **CA-010** (`RF-023`, `RN-006`, `RN-007`): Dada una cartola procesada de una institución, producto y período, cuando la misma cartola vuelve a encontrarse, entonces se omite; una cartola de otro producto de la misma institución y período sigue siendo elegible.
- **CA-011** (`RF-024`, `RN-015`, `RN-016`): Dado un movimiento ya incorporado, cuando otra cartola contiene un movimiento con la misma institución, producto, fecha de operación, descripción, monto y moneda, entonces SmartSaver lo omite como duplicado.
- **CA-012** (`RF-025`, `RF-026`, `RN-018`, `RN-019`): Dada una ejecución manual o automática con resultados mixtos, cuando finaliza, entonces el usuario ve dentro de SmartSaver las cantidades de cartolas encontradas e importadas, movimientos incorporados, duplicados omitidos e inválidos omitidos, junto con las causas de las omisiones.
- **CA-013** (`RF-027`): Dada una cuenta Gmail no disponible o cuyo acceso fue revocado, cuando comienza una ejecución, entonces no se incorporan movimientos, se informa la causa y se conservan los movimientos anteriores.
- **CA-014** (`RF-007`, `RF-028`, `RN-020`): Dada la modalidad automática activa, cuando el usuario la desactiva, entonces cesan las búsquedas automáticas y las importaciones manuales permanecen disponibles.
- **CA-015** (`RF-029`, `RN-021`): Dado un Gmail vinculado y movimientos previamente incorporados, cuando el usuario desvincula Gmail, entonces cesan todas las nuevas búsquedas, la modalidad automática queda desactivada y los movimientos permanecen disponibles.
- **CA-016** (`RF-011`, `RF-036`, `RN-004`, `RN-023`): Dado un PDF recibido desde un remitente no autorizado o asociado a una institución no configurada, cuando se realiza una búsqueda, entonces el adjunto no se considera una cartola elegible.
- **CA-017** (`RF-032`, `RN-022`): Dada una institución con un único remitente autorizado, cuando el usuario intenta eliminarlo, entonces SmartSaver impide la acción e informa que debe conservar al menos uno.
- **CA-018** (`RF-033`, `RF-034`, `RN-024`): Dada una institución configurada con movimientos previamente incorporados, cuando el usuario la elimina, entonces SmartSaver deja de buscar nuevas cartolas de esa institución y conserva los movimientos existentes.
- **CA-019** (`RF-035`, `RN-002`): Dada una institución ausente del catálogo, cuando el usuario intenta configurarla, entonces SmartSaver impide la acción.
- **CA-020** (`RF-002`, `RN-025`): Dadas dos instituciones disponibles en el catálogo, cuando el usuario configura cualquiera de ellas, entonces ambas quedan sujetas a las mismas reglas de configuración e importación.
- **CA-021** (`RF-011`, `RN-004`): Dado un adjunto con formato distinto de PDF enviado por un remitente autorizado de una institución configurada, cuando se realiza una búsqueda, entonces el adjunto no se considera una cartola elegible.

## Trazabilidad

| Requisitos | Flujo | Reglas | Criterios |
|---|---|---|---|
| RF-001 a RF-003 | F-001 | RN-001 a RN-003, RN-022, RN-025 | CA-001, CA-005, CA-020 |
| RF-004 a RF-006 | F-002 | RN-004, RN-005 | CA-002, CA-003 |
| RF-007 a RF-010 | F-003, F-004 | RN-005, RN-020 | CA-004, CA-014 |
| RF-011 a RF-014 | F-002, F-003 | RN-002 a RN-008, RN-023 | CA-002, CA-005, CA-006, CA-016, CA-021 |
| RF-015 a RF-022 | F-002, F-003 | RN-009 a RN-014, RN-017 | CA-007 a CA-009 |
| RF-023, RF-024 | F-002, F-003 | RN-006, RN-007, RN-015, RN-016 | CA-010, CA-011 |
| RF-025, RF-026 | F-002, F-003 | RN-018, RN-019 | CA-012 |
| RF-027 | F-003 | RN-019 | CA-013 |
| RF-028, RF-029 | F-004 | RN-020, RN-021 | CA-014, CA-015 |
| RF-030 | F-001, F-002, F-003 | RN-012, RN-013 | CA-008 |
| RF-031, RF-032 | F-001 | RN-022 | CA-001, CA-017 |
| RF-033, RF-034 | F-004 | RN-024 | CA-018 |
| RF-035 | F-001 | RN-002 | CA-019 |
| RF-036 | F-002, F-003 | RN-023 | CA-016 |
