---
name: "2026_08_16_importacion_cartolas_gmail"
description: "Importación manual y automática de movimientos desde cartolas mensuales recibidas en Gmail"
created_at: "2026-08-18T02:23:04Z"
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

- **Usuario:** vincula su cuenta Gmail, configura instituciones compatibles, inicia importaciones, administra la automatización y consulta sus resultados.
- **SmartSaver:** localiza cartolas elegibles, incorpora movimientos válidos nuevos, evita duplicados y comunica los resultados.

## Alcance

### Incluido

- Vinculación de una cuenta Gmail por usuario.
- Catálogo inicial cerrado de 15 bancos.
- Reconocimiento de los alias comerciales definidos para los bancos incluidos.
- Cartolas mensuales PDF de cuentas bancarias.
- Cartolas o estados de cuenta mensuales PDF de tarjetas de crédito.
- Configuración de una contraseña opcional por institución.
- Configuración de uno o varios remitentes autorizados por institución.
- Importación manual de todas las cartolas pendientes o de un mes y año específicos.
- Importación automática inmediata al activarla y una vez por cada día local posterior.
- Período comprendido entre el primer día del undécimo mes anterior y el día actual.
- Zona horaria seleccionada en el perfil del usuario.
- Importación de movimientos válidos sin revisión previa.
- Procesamiento de cartolas mediante OpenAI como servicio externo de inteligencia artificial administrado por SmartSaver.
- Consentimiento explícito del usuario para el procesamiento externo de sus cartolas.
- Procesamiento temporal de los PDF sin conservar una copia en SmartSaver después de cada ejecución.
- Prevención de cartolas y movimientos duplicados.
- Historial de ejecuciones manuales y automáticas durante 12 meses.
- Estado leído o no leído para cada aviso del historial.
- Push notifications para los resultados automáticos.
- Conservación de movimientos, configuración financiera y registro de cartolas procesadas al desvincular Gmail.

### Instituciones iniciales

1. Banco de Chile.
2. Banco Internacional.
3. Scotiabank Chile.
4. Banco de Crédito e Inversiones.
5. Banco BICE.
6. HSBC Bank (Chile).
7. Banco Santander-Chile.
8. Banco Itaú Chile.
9. Banco Falabella.
10. Banco Ripley.
11. Banco Consorcio.
12. Banco BTG Pactual Chile.
13. Tanner Banco Digital.
14. Tenpo Bank Chile.
15. Banco del Estado de Chile.

### Alias reconocidos

- Banco Edwards | Citi, Atlas y CrediChile como alias de Banco de Chile.
- BancoDesarrollo como alias de Scotiabank Chile.
- TBanc y Banco Nova como alias de Banco de Crédito e Inversiones.
- Banefe como alias de Banco Santander-Chile.

### Fuera del alcance

- Bancos ausentes de la lista inicial.
- JP Morgan Chase Bank, N. A.
- China Construction Bank, Agencia en Chile.
- Bank of China, Agencia en Chile.
- Instituciones financieras no bancarias.
- Proveedores de correo distintos de Gmail.
- Más de una cuenta Gmail vinculada simultáneamente.
- Creación de instituciones por parte del usuario.
- Adjuntos distintos de PDF.
- Documentos que no correspondan a una cartola mensual de cuenta bancaria o tarjeta de crédito.
- Cartolas anteriores al período permitido.
- Carga manual de cartolas desde el dispositivo.
- Revisión, edición o confirmación de movimientos antes de incorporarlos.
- Creación o selección de cuentas financieras de destino.
- Conservación de copias de los PDF procesados.
- Avisos de resultados enviados por correo.

## Glosario

- **Cartola:** cartola mensual PDF de una cuenta bancaria o cartola o estado de cuenta mensual PDF de una tarjeta de crédito.
- **Producto financiero:** cuenta bancaria o tarjeta de crédito identificada en una cartola.
- **Institución configurada:** banco seleccionado por el usuario, con al menos un remitente autorizado y una contraseña opcional.
- **Remitente autorizado:** dirección de correo registrada por el usuario para una institución configurada.
- **Cartola elegible:** cartola de una institución configurada, recibida desde un remitente autorizado, perteneciente al período permitido y con institución, producto y período identificables.
- **Cartola pendiente:** cartola elegible que no ha sido procesada previamente.
- **Movimiento válido:** movimiento cuya fecha de operación y monto pueden determinarse.
- **Movimiento inválido:** movimiento cuya fecha de operación o monto no puede determinarse.
- **Período permitido:** intervalo desde el primer día del undécimo mes anterior hasta el día actual.
- **Día local:** fecha calendario determinada por la zona horaria seleccionada en el perfil del usuario.
- **Ejecución:** búsqueda manual o automática y procesamiento de sus resultados.
- **Aviso:** resultado consultable de una ejecución dentro del historial.
- **Push notification:** aviso presentado fuera de SmartSaver cuando el usuario ha otorgado el permiso correspondiente.
- **Procesamiento externo de IA:** análisis temporal del contenido de una cartola mediante OpenAI, administrado por SmartSaver y sin exigir credenciales de inteligencia artificial al usuario.

## Flujos funcionales

### F-001: Configurar la importación

- **Actor y resultado:** el usuario prepara SmartSaver para buscar cartolas.
- **Precondiciones:** el usuario ha accedido a SmartSaver y tiene una zona horaria seleccionada en su perfil.
- **Trigger:** el usuario inicia la vinculación de Gmail.
- **Flujo principal:**
  1. SmartSaver informa que las cartolas serán procesadas externamente mediante OpenAI y que no conservará copias de los PDF después de cada ejecución.
  2. El usuario acepta expresamente el procesamiento externo.
  3. El usuario vincula una cuenta Gmail.
  4. SmartSaver presenta las 15 instituciones iniciales y sus alias reconocidos.
  5. El usuario selecciona una o más instituciones.
  6. Para cada institución, registra uno o varios remitentes autorizados.
  7. El usuario puede registrar una contraseña o dejarla sin configurar.
  8. SmartSaver confirma que la configuración está disponible para importaciones manuales.
- **Alternativas y excepciones:**
  - Si el usuario no acepta el procesamiento externo, SmartSaver no vincula Gmail.
  - El usuario puede modificar o eliminar una contraseña.
  - El usuario puede agregar o eliminar remitentes, pero no puede eliminar el último.
  - Si no existe una zona horaria seleccionada, SmartSaver impide las búsquedas y solicita completar ese dato.
  - Una institución fuera del catálogo no puede configurarse.
  - La importación manual permanece disponible cuando la automática está desactivada.
- **Estado final observable:** Gmail queda vinculado y existe al menos una institución configurada.

### F-002: Importar cartolas manualmente

- **Actor y resultado:** el usuario incorpora movimientos sin esperar la revisión diaria.
- **Precondiciones:** Gmail está vinculado, existe una institución configurada y el perfil tiene zona horaria.
- **Trigger:** el usuario solicita todas las cartolas pendientes o selecciona un mes y año.
- **Flujo principal:**
  1. SmartSaver busca cartolas elegibles dentro del período permitido.
  2. Si se seleccionó un mes, restringe la búsqueda a ese período.
  3. SmartSaver omite las cartolas procesadas anteriormente.
  4. SmartSaver procesa temporalmente todas las cartolas pendientes encontradas mediante el servicio externo de inteligencia artificial.
  5. SmartSaver valida la institución, el producto, el período y los datos obligatorios de cada movimiento obtenidos del procesamiento externo.
  6. SmartSaver incorpora los movimientos válidos que no sean duplicados.
  7. SmartSaver deja de conservar cualquier copia temporal de los PDF.
  8. SmartSaver muestra el resumen.
  9. SmartSaver incorpora el resultado al historial con estado leído.
- **Alternativas y excepciones:**
  - Si el período solicitado no está permitido, no se inicia la ejecución.
  - Si no se encuentran cartolas, el resumen informa cantidades iguales a cero.
  - Si una cartola protegida no tiene una contraseña configurada o la contraseña es incorrecta, se omite, se informa la causa y puede reintentarse posteriormente.
  - Los movimientos inválidos se omiten y sus causas aparecen en el resumen.
  - Si el servicio externo de inteligencia artificial no está disponible, la ejecución termina con error, no incorpora movimientos y las cartolas permanecen disponibles para reintento.
- **Estado final observable:** los movimientos válidos nuevos quedan incorporados y el resultado permanece consultable.

### F-003: Importar cartolas automáticamente

- **Actor y resultado:** el usuario mantiene sus movimientos actualizados sin iniciar cada búsqueda.
- **Precondiciones:** Gmail está vinculado, existe una institución configurada, el perfil tiene zona horaria y la automatización está desactivada.
- **Trigger:** el usuario activa la importación automática.
- **Flujo principal:**
  1. SmartSaver solicita permiso para push notifications.
  2. SmartSaver realiza inmediatamente una primera ejecución, aunque el permiso sea rechazado.
  3. SmartSaver incorpora los movimientos válidos nuevos.
  4. SmartSaver agrega al historial un aviso no leído.
  5. Si las push notifications están habilitadas, SmartSaver presenta una notificación con el estado y la cantidad de movimientos importados.
  6. SmartSaver repite la búsqueda una vez en cada día local posterior.
- **Alternativas y excepciones:**
  - Un resultado sin cartolas o movimientos nuevos también genera aviso y push notification.
  - Una ejecución fallida genera aviso y push notification con estado de error.
  - Rechazar, desactivar o revocar las push notifications no detiene la automatización.
  - El usuario puede activar o desactivar las push notifications independientemente de la automatización.
- **Estado final observable:** cada ejecución automática queda registrada y cada fecha local tiene como máximo una ejecución automática.

### F-004: Consultar avisos

- **Actor y resultado:** el usuario revisa los resultados de ejecuciones anteriores.
- **Precondiciones:** existe al menos una ejecución conservada.
- **Trigger:** el usuario consulta el historial o abre una push notification.
- **Flujo principal:**
  1. SmartSaver muestra las ejecuciones conservadas y su estado de lectura.
  2. SmartSaver muestra la cantidad de avisos no leídos.
  3. El usuario abre un aviso.
  4. SmartSaver muestra el resumen y las causas de las omisiones.
  5. SmartSaver marca el aviso como leído.
- **Alternativas y excepciones:**
  - Abrir una push notification muestra directamente el detalle y marca el aviso como leído.
  - Los avisos dejan de estar disponibles al completar su período de conservación.
- **Estado final observable:** el usuario conoce el resultado y el aviso queda leído.

### F-005: Desactivar o desvincular

- **Actor y resultado:** el usuario detiene nuevas búsquedas sin perder la información definida como conservable.
- **Precondiciones:** Gmail está vinculado.
- **Trigger:** el usuario desactiva la automatización o desvincula Gmail.
- **Flujo principal:**
  1. Desactivar la automatización detiene futuras búsquedas automáticas.
  2. Desvincular Gmail detiene todas las búsquedas y desactiva la automatización.
  3. SmartSaver conserva los movimientos importados.
  4. SmartSaver conserva las instituciones, remitentes y contraseñas configurados.
  5. SmartSaver conserva el registro de cartolas procesadas.
  6. SmartSaver conserva los avisos que todavía se encuentren dentro de su período de 12 meses.
- **Alternativas y excepciones:**
  - Eliminar una institución elimina sus remitentes y contraseña, pero conserva sus movimientos y el registro de cartolas procesadas.
- **Estado final observable:** Gmail deja de estar vinculado y no se realizan nuevas búsquedas.

### F-006: Revincular Gmail

- **Actor y resultado:** el usuario vuelve a habilitar las importaciones utilizando o descartando la configuración conservada.
- **Precondiciones:** Gmail fue desvinculado y existen datos conservados.
- **Trigger:** el usuario vincula nuevamente Gmail.
- **Flujo principal:**
  1. Si se trata de la misma cuenta Gmail, SmartSaver reutiliza la configuración y el registro conservados.
  2. Si se trata de una cuenta distinta, SmartSaver solicita confirmar si se reutilizará la configuración.
  3. Si el usuario reutiliza la configuración, se mantienen instituciones, remitentes y contraseñas.
  4. Si el usuario no la reutiliza, se eliminan instituciones, remitentes y contraseñas.
  5. En ambos casos se conserva el registro de cartolas procesadas.
- **Estado final observable:** la nueva vinculación queda disponible con la configuración elegida y sin perder la prevención de reprocesamientos.

## Reglas de negocio

- **RN-001:** Cada usuario puede mantener vinculada como máximo una cuenta Gmail.
- **RN-002:** El catálogo inicial contiene únicamente las 15 instituciones enumeradas en el alcance.
- **RN-003:** Los alias definidos en el alcance representan a su banco principal y no constituyen instituciones independientes.
- **RN-004:** Cada institución configurada debe mantener al menos un remitente autorizado.
- **RN-005:** La contraseña es opcional y se configura independientemente para cada institución.
- **RN-006:** Solo son elegibles las cartolas mensuales PDF de cuentas bancarias y tarjetas de crédito.
- **RN-007:** El período permitido comienza el primer día del undécimo mes anterior y termina en el día actual.
- **RN-008:** El período permitido y el día de ejecución automática se determinan con la zona horaria del perfil del usuario.
- **RN-009:** Sin una zona horaria definida no pueden iniciarse búsquedas.
- **RN-010:** Cambiar la zona horaria no provoca una ejecución inmediata.
- **RN-011:** Después de cambiar la zona horaria, la siguiente ejecución utiliza la nueva zona y no repite una ejecución ya realizada para esa fecha local.
- **RN-012:** Una cartola se identifica por la combinación normalizada de institución, producto y período mensual.
- **RN-013:** Una cartola procesada no vuelve a procesarse aunque haya contenido movimientos inválidos.
- **RN-014:** Una cartola que no pudo abrirse o identificarse no se considera procesada.
- **RN-015:** Un movimiento es válido cuando pueden determinarse su fecha de operación y su monto.
- **RN-016:** La ausencia de descripción no invalida un movimiento.
- **RN-017:** Si un movimiento no informa moneda, se utiliza la moneda principal del usuario.
- **RN-018:** Cada movimiento válido recibe una categoría y utiliza `Others` cuando no puede determinarse otra.
- **RN-019:** La dirección del monto debe representar su naturaleza financiera.
- **RN-020:** Producto y descripción se normalizan eliminando espacios exteriores, reduciendo espacios consecutivos e ignorando diferencias de mayúsculas y tildes.
- **RN-021:** La normalización de producto y descripción conserva números y signos.
- **RN-022:** Dos descripciones ausentes coinciden; una descripción ausente no coincide con una presente.
- **RN-023:** Una descripción que queda vacía después de normalizarse se considera ausente.
- **RN-024:** El monto se normaliza interpretando sus separadores y comparando su valor absoluto junto con su dirección financiera.
- **RN-025:** La comparación de montos no convierte monedas ni aplica un redondeo adicional.
- **RN-026:** Las denominaciones y símbolos inequívocos de una misma moneda se consideran equivalentes.
- **RN-027:** Un símbolo monetario ambiguo se interpreta según la moneda declarada por la cartola o, si esta falta, según la moneda principal del usuario.
- **RN-028:** Un movimiento es duplicado cuando coinciden institución, producto normalizado, fecha de operación, descripción normalizada, monto normalizado y moneda normalizada.
- **RN-029:** Los movimientos duplicados no se incorporan nuevamente.
- **RN-030:** Una cartola con movimientos válidos e inválidos incorpora los válidos y omite definitivamente los inválidos.
- **RN-031:** Cada resumen informa cartolas encontradas, cartolas importadas, movimientos importados, duplicados omitidos e inválidos omitidos.
- **RN-032:** Cada omisión debe mostrar una causa comprensible.
- **RN-033:** Todas las ejecuciones manuales y automáticas se incorporan al historial.
- **RN-034:** Los resultados manuales ingresan al historial como leídos.
- **RN-035:** Los resultados automáticos ingresan al historial como no leídos.
- **RN-036:** Cada aviso se conserva hasta finalizar el mismo día local del mismo mes del año siguiente.
- **RN-037:** Para un aviso creado un día inexistente en el año siguiente, la conservación termina al finalizar el último día de ese mes.
- **RN-038:** Cada ejecución automática genera una push notification si el permiso está habilitado.
- **RN-039:** La push notification informa si la ejecución terminó con importaciones, sin novedades o con error, e indica la cantidad de movimientos importados.
- **RN-040:** Abrir el detalle de un aviso lo marca como leído.
- **RN-041:** Rechazar o desactivar push notifications no afecta las ejecuciones ni el historial.
- **RN-042:** Desactivar la modalidad automática no impide importaciones manuales.
- **RN-043:** Desvincular Gmail conserva movimientos, instituciones, remitentes, contraseñas, registro de cartolas procesadas y avisos vigentes.
- **RN-044:** Eliminar una institución elimina sus remitentes y contraseña, pero conserva sus movimientos y el registro de sus cartolas procesadas.
- **RN-045:** El registro de cartolas procesadas se conserva mientras permanezca la cuenta SmartSaver del usuario.
- **RN-046:** Al vincular una cuenta Gmail distinta, el usuario debe confirmar si reutiliza la configuración conservada.
- **RN-047:** Descartar la configuración al revincular elimina instituciones, remitentes y contraseñas, pero conserva los movimientos, avisos vigentes y registro de cartolas procesadas.
- **RN-048:** Solo son elegibles los correos enviados desde un remitente autorizado para la institución correspondiente.
- **RN-049:** SmartSaver solo puede procesar cartolas mediante OpenAI después de que el usuario haya aceptado expresamente ese procesamiento externo.
- **RN-050:** El procesamiento externo de inteligencia artificial no exige que el usuario proporcione credenciales propias para ese servicio.
- **RN-051:** SmartSaver no conserva una copia del PDF después de finalizar una ejecución, tanto si termina correctamente como si termina con error.
- **RN-052:** La información obtenida del procesamiento externo debe cumplir las reglas de identificación de cartolas y validez de movimientos antes de incorporarse.
- **RN-053:** Si el servicio externo de inteligencia artificial no está disponible, la ejecución termina con error, no incorpora movimientos y no considera procesada ninguna cartola de esa ejecución.
- **RN-054:** Cada usuario debe mantener una categoría `Others` visible, utilizable y protegida contra modificación de nombre y eliminación.
- **RN-055:** Para reconocer una categoría existente como `Others`, SmartSaver elimina espacios exteriores, reduce espacios consecutivos e ignora diferencias de mayúsculas y tildes en su nombre.
- **RN-056:** Si existe una categoría equivalente a `Others`, SmartSaver reutiliza y protege una de ellas en lugar de crear otra.
- **RN-057:** Si existen varias categorías equivalentes a `Others`, SmartSaver protege una y conserva las demás sin modificarlas.
- **RN-058:** El monto de cada movimiento se registra por su valor absoluto y su dirección financiera se representa como ingreso o gasto.
- **RN-059:** En una cuenta bancaria, un movimiento que aumenta el saldo disponible se clasifica como ingreso y uno que lo disminuye se clasifica como gasto.
- **RN-060:** En una tarjeta de crédito, un movimiento que aumenta la deuda se clasifica como gasto y uno que la disminuye se clasifica como ingreso.

## Requisitos funcionales

- **RF-001:** El producto debe permitir que el usuario vincule una cuenta Gmail.
- **RF-002:** El producto debe presentar las 15 instituciones y los alias incluidos en el alcance.
- **RF-003:** El producto debe permitir configurar una institución con al menos un remitente autorizado y sin exigir contraseña.
- **RF-004:** El producto debe permitir agregar, actualizar y eliminar la contraseña de una institución.
- **RF-005:** El producto debe impedir la eliminación del último remitente autorizado.
- **RF-006:** El producto debe impedir búsquedas mientras el perfil no tenga una zona horaria seleccionada.
- **RF-007:** El producto debe permitir importar todas las cartolas pendientes del período permitido.
- **RF-008:** El producto debe permitir importar las cartolas de un mes y año permitidos.
- **RF-009:** Si el mes solicitado queda fuera del período permitido, el producto debe impedir la ejecución e informar el intervalo admitido.
- **RF-010:** El producto debe excluir adjuntos que no correspondan a uno de los dos formatos incluidos.
- **RF-011:** El producto debe excluir correos procedentes de remitentes no autorizados.
- **RF-012:** Si una cartola protegida no tiene contraseña configurada, el producto debe omitirla, informar la causa y permitir un intento posterior.
- **RF-013:** Si la contraseña es incorrecta, el producto debe omitir la cartola, informar la causa y permitir un intento posterior.
- **RF-014:** Si una cartola no puede identificarse, el producto debe omitirla, informar la causa y permitir un intento posterior.
- **RF-015:** El producto debe incorporar directamente los movimientos válidos nuevos.
- **RF-016:** El producto debe incorporar compras, cargos, pagos, abonos, devoluciones, transferencias, retiros, comisiones, intereses e impuestos.
- **RF-017:** El producto debe registrar fecha, descripción disponible, monto, moneda y categoría para cada movimiento válido.
- **RF-018:** Si falta la moneda, el producto debe asignar la moneda principal del usuario.
- **RF-019:** Si no puede determinarse una categoría, el producto debe asignar `Others`.
- **RF-020:** Si falta la fecha o el monto, el producto debe omitir el movimiento e informar la causa.
- **RF-021:** El producto debe comparar movimientos aplicando RN-020 a RN-028.
- **RF-022:** Si un movimiento es duplicado, el producto debe omitirlo.
- **RF-023:** Si una cartola ya fue procesada, el producto debe omitirla.
- **RF-024:** El producto debe permitir activar y desactivar la importación automática.
- **RF-025:** Cuando se activa la importación automática, el producto debe realizar una ejecución inmediata.
- **RF-026:** Mientras la automatización esté activa, el producto debe realizar como máximo una ejecución en cada fecha local.
- **RF-027:** Cuando cambia la zona horaria, el producto debe aplicar RN-010 y RN-011.
- **RF-028:** Al finalizar una ejecución, el producto debe generar el resumen definido por RN-031 y RN-032.
- **RF-029:** Al finalizar una ejecución, el producto debe incorporarla al historial.
- **RF-030:** El producto debe mostrar los avisos leídos y no leídos y la cantidad de avisos pendientes.
- **RF-031:** Cuando el usuario abre un aviso, el producto debe mostrar su resumen y marcarlo como leído.
- **RF-032:** El producto debe retirar del historial los avisos cuyo período de conservación haya terminado.
- **RF-033:** Al activar la automatización, el producto debe solicitar permiso para push notifications.
- **RF-034:** Después de cada ejecución automática, el producto debe presentar una push notification si el permiso está habilitado.
- **RF-035:** Cuando el usuario abre una push notification, el producto debe mostrar el detalle y marcar el aviso como leído.
- **RF-036:** El producto debe permitir desactivar push notifications sin desactivar la automatización.
- **RF-037:** Si Gmail deja de estar disponible, el producto debe detener la ejecución, no incorporar movimientos e informar la causa.
- **RF-038:** Cuando el usuario desvincula Gmail, el producto debe detener las búsquedas y aplicar RN-043.
- **RF-039:** Cuando el usuario elimina una institución, el producto debe aplicar RN-044.
- **RF-040:** Cuando el usuario revincula la misma cuenta Gmail, el producto debe reutilizar la configuración conservada.
- **RF-041:** Cuando el usuario vincula una cuenta Gmail distinta, el producto debe solicitar la decisión definida por RN-046.
- **RF-042:** Si el usuario descarta la configuración conservada, el producto debe aplicar RN-047.
- **RF-043:** Antes de vincular Gmail, el producto debe informar que OpenAI realizará el procesamiento externo de inteligencia artificial, informar la ausencia de conservación de copias de los PDF y solicitar la aceptación expresa del usuario.
- **RF-044:** Si el usuario no acepta el procesamiento externo de inteligencia artificial, el producto no debe vincular Gmail.
- **RF-045:** El producto debe permitir las importaciones sin exigir al usuario credenciales propias para el servicio externo de inteligencia artificial.
- **RF-046:** Antes de incorporar información obtenida del procesamiento externo, el producto debe validarla aplicando RN-012, RN-015 y RN-052.
- **RF-047:** Al finalizar una ejecución, el producto debe dejar de conservar cualquier copia temporal de los PDF procesados.
- **RF-048:** Si el servicio externo de inteligencia artificial no está disponible, el producto debe aplicar RN-053 e informar la causa.
- **RF-049:** Cuando un usuario no tenga una categoría equivalente a `Others`, el producto debe crear una categoría visible y protegida con ese nombre.
- **RF-050:** Cuando un usuario tenga una o más categorías equivalentes a `Others`, el producto debe aplicar RN-055 a RN-057.
- **RF-051:** Cuando incorpore un movimiento de una cuenta bancaria, el producto debe clasificar su dirección aplicando RN-058 y RN-059.
- **RF-052:** Cuando incorpore un movimiento de una tarjeta de crédito, el producto debe clasificar su dirección aplicando RN-058 y RN-060.

## Criterios de aceptación

- **CA-001** (`RF-002`, `RN-002`, `RN-003`): Dado el catálogo inicial, cuando el usuario lo consulta, entonces ve las 15 instituciones enumeradas y los alias asociados a su banco principal.
- **CA-002** (`RF-003`, `RF-004`, `RN-005`): Dado un banco seleccionado, cuando el usuario configura un remitente sin registrar contraseña, entonces la institución queda disponible para importar cartolas no protegidas.
- **CA-003** (`RF-005`, `RN-004`): Dada una institución con un solo remitente, cuando el usuario intenta eliminarlo, entonces SmartSaver impide la acción e informa que debe conservar uno.
- **CA-004** (`RF-006`, `RN-008`, `RN-009`): Dado un usuario sin zona horaria en su perfil, cuando intenta iniciar una búsqueda, entonces SmartSaver la impide y solicita seleccionar una zona.
- **CA-005** (`RF-007`, `RF-008`, `RF-009`, `RN-007`): Dado un usuario con zona horaria, cuando solicita una importación, entonces el período admitido se calcula según su fecha local.
- **CA-006** (`RF-010`, `RN-006`): Dado un PDF que no es una cartola mensual de cuenta bancaria ni tarjeta de crédito, cuando se realiza una búsqueda, entonces el documento se excluye.
- **CA-007** (`RF-011`, `RN-048`): Dado un PDF enviado por un remitente no autorizado, cuando se realiza una búsqueda, entonces no se considera elegible.
- **CA-008** (`RF-012`, `RN-005`, `RN-014`): Dada una cartola protegida sin contraseña configurada, cuando se procesa, entonces se omite, se informa la causa y permanece disponible para reintento.
- **CA-009** (`RF-013`, `RN-014`): Dada una contraseña incorrecta, cuando se procesa la cartola, entonces se omite y puede reintentarse después de corregir la contraseña.
- **CA-010** (`RF-015` a `RF-020`, `RN-015` a `RN-019`): Dada una cartola con movimientos válidos e inválidos, cuando se procesa, entonces se incorporan los válidos y se omiten los que carecen de fecha o monto.
- **CA-011** (`RF-021`, `RF-022`, `RN-020` a `RN-029`): Dados dos movimientos que solo difieren en mayúsculas, tildes, espacios repetidos y presentación de monto o moneda, cuando coinciden en los demás componentes, entonces el segundo se omite como duplicado.
- **CA-012** (`RF-021`, `RN-021`, `RN-022`): Dados dos movimientos cuyos productos o descripciones difieren en números o signos, entonces no se consideran duplicados; dos descripciones ausentes sí pueden coincidir.
- **CA-013** (`RF-023`, `RN-012`, `RN-013`): Dada una cartola procesada, cuando vuelve a encontrarse, entonces se omite aunque la ejecución anterior haya omitido movimientos inválidos.
- **CA-014** (`RF-025`, `RF-026`): Dada la automatización desactivada, cuando el usuario la activa, entonces ocurre una ejecución inmediata y posteriormente no más de una por fecha local.
- **CA-015** (`RF-027`, `RN-010`, `RN-011`): Dada una ejecución ya realizada y un cambio de zona horaria, cuando se guarda la nueva zona, entonces no se inicia otra ejecución y la siguiente utiliza la nueva fecha local.
- **CA-016** (`RF-028`, `RN-031`, `RN-032`): Dada una ejecución con resultados mixtos, cuando finaliza, entonces el resumen informa todas las cantidades y causas definidas.
- **CA-017** (`RF-029`, `RN-033` a `RN-035`): Dadas una ejecución manual y una automática, cuando finalizan, entonces ambas aparecen en el historial; la manual aparece leída y la automática no leída.
- **CA-018** (`RF-030`, `RF-031`): Dado un aviso automático no leído, cuando el usuario abre su detalle, entonces ve el resumen, el aviso queda leído y disminuye la cantidad pendiente.
- **CA-019** (`RF-032`, `RN-036`, `RN-037`): Dado un aviso que completa 12 meses calendario, cuando termina su último día de conservación, entonces deja de estar disponible.
- **CA-020** (`RF-033`, `RF-034`, `RN-038`, `RN-039`): Dada una ejecución automática con permiso habilitado, cuando finaliza con importaciones, sin novedades o con error, entonces presenta una push notification con el estado y la cantidad importada.
- **CA-021** (`RF-035`, `RN-040`): Dada una push notification asociada a un aviso no leído, cuando el usuario la abre, entonces ve el detalle y el aviso queda leído.
- **CA-022** (`RF-036`, `RN-041`): Dada la automatización activa, cuando el usuario rechaza o desactiva las push notifications, entonces las ejecuciones y el historial continúan.
- **CA-023** (`RF-037`): Dado que Gmail no está disponible, cuando comienza una ejecución, entonces no se incorporan movimientos y se informa la causa.
- **CA-024** (`RF-038`, `RN-043`): Dado Gmail vinculado con información previa, cuando el usuario lo desvincula, entonces cesan las búsquedas y se conservan movimientos, configuración, cartolas procesadas y avisos vigentes.
- **CA-025** (`RF-039`, `RN-044`): Dada una institución configurada, cuando el usuario la elimina, entonces se eliminan sus remitentes y contraseña, pero se conservan sus movimientos y cartolas procesadas.
- **CA-026** (`RF-040`): Dada una cuenta Gmail desvinculada, cuando el usuario vincula nuevamente la misma cuenta, entonces se reutiliza la configuración conservada.
- **CA-027** (`RF-041`, `RN-046`): Dada una cuenta Gmail distinta, cuando el usuario la vincula, entonces SmartSaver solicita confirmar si reutilizará la configuración.
- **CA-028** (`RF-042`, `RN-047`): Dada una cuenta Gmail distinta, cuando el usuario descarta la configuración, entonces se eliminan instituciones, remitentes y contraseñas, pero permanecen movimientos, avisos vigentes y cartolas procesadas.
- **CA-029** (`RF-043`, `RF-044`, `RN-049`): Dado un usuario que inicia la vinculación de Gmail, cuando no acepta el procesamiento externo informado por SmartSaver, entonces Gmail no queda vinculado.
- **CA-030** (`RF-043`, `RF-045`, `RF-047`, `RN-050`, `RN-051`): Dado un usuario que acepta el procesamiento externo, cuando completa una ejecución, entonces no se le exigen credenciales propias para ese servicio y SmartSaver no conserva una copia del PDF procesado.
- **CA-031** (`RF-046`, `RN-012`, `RN-015`, `RN-052`): Dada información obtenida mediante procesamiento externo, cuando no permite identificar la institución, el producto o el período de la cartola, entonces la cartola se omite y queda disponible para reintento; cuando un movimiento carece de fecha o monto, entonces ese movimiento se omite como inválido.
- **CA-032** (`RF-048`, `RN-053`): Dado que el servicio externo de inteligencia artificial no está disponible, cuando se ejecuta una importación, entonces la ejecución termina con error, no incorpora movimientos y ninguna de sus cartolas se considera procesada.
- **CA-033** (`RF-019`, `RF-049`, `RN-018`, `RN-054`): Dado un usuario sin una categoría equivalente a `Others`, cuando un movimiento válido no puede asignarse a otra categoría, entonces SmartSaver crea y asigna `Others`, la muestra entre las categorías y no permite renombrarla ni eliminarla.
- **CA-034** (`RF-050`, `RN-055` a `RN-057`): Dado un usuario con varias categorías equivalentes a `Others`, cuando SmartSaver requiere la categoría protegida, entonces reutiliza y protege una y conserva las demás sin cambios.
- **CA-035** (`RF-051`, `RN-058`, `RN-059`): Dada una cartola de cuenta bancaria, cuando un movimiento aumenta el saldo disponible, entonces se incorpora como ingreso por su valor absoluto; cuando lo disminuye, se incorpora como gasto por su valor absoluto.
- **CA-036** (`RF-052`, `RN-058`, `RN-060`): Dada una cartola de tarjeta de crédito, cuando una compra, cargo, comisión, interés o impuesto aumenta la deuda, entonces se incorpora como gasto por su valor absoluto; cuando un pago, abono o devolución disminuye la deuda, se incorpora como ingreso por su valor absoluto.

## Trazabilidad

| Requisitos | Flujos | Reglas | Criterios |
|---|---|---|---|
| RF-001 a RF-006 | F-001 | RN-001 a RN-005, RN-008, RN-009 | CA-001 a CA-004 |
| RF-007 a RF-014 | F-002 | RN-006, RN-007, RN-014, RN-048 | CA-005 a CA-009 |
| RF-015 a RF-020 | F-002, F-003 | RN-015 a RN-019, RN-030 | CA-010 |
| RF-021 a RF-023 | F-002, F-003 | RN-012, RN-013, RN-020 a RN-029 | CA-011 a CA-013 |
| RF-024 a RF-027 | F-003 | RN-008, RN-010, RN-011, RN-042 | CA-014, CA-015 |
| RF-028 a RF-032 | F-002, F-003, F-004 | RN-031 a RN-037, RN-040 | CA-016 a CA-019 |
| RF-033 a RF-036 | F-003, F-004 | RN-038 a RN-041 | CA-020 a CA-022 |
| RF-037 | F-002, F-003 | RN-032 | CA-023 |
| RF-038, RF-039 | F-005 | RN-043 a RN-045 | CA-024, CA-025 |
| RF-040 a RF-042 | F-006 | RN-045 a RN-047 | CA-026 a CA-028 |
| RF-043 a RF-045 | F-001 | RN-049 a RN-051 | CA-029, CA-030 |
| RF-046 a RF-048 | F-002, F-003 | RN-012, RN-014, RN-015, RN-051 a RN-053 | CA-030 a CA-032 |
| RF-049, RF-050 | F-002, F-003 | RN-018, RN-054 a RN-057 | CA-033, CA-034 |
| RF-051, RF-052 | F-002, F-003 | RN-019, RN-058 a RN-060 | CA-035, CA-036 |
