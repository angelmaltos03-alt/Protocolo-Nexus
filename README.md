# PROTOCOLO NEXUS — Control Tower de Compras y Logística

Aplicación académica HTML5 de una sola página para GitHub Pages. Mantiene las tres sesiones y evidencias del programa, con una historia de operaciones de la empresa ficticia Cadena Cobalto y un dashboard corporativo de compras, transporte y proveedores.

## Lo que incluye esta versión
- **Dashboard logístico:** órdenes activas, unidades en ruta, alertas, seguimiento visual de camión, cola de excepciones y órdenes de compra ficticias.
- **Historia por episodios:** cada reto abre una incidencia narrativa distinta dentro del turno operativo.
- **Nombre completo obligatorio:** nombre(s), apellido paterno y apellido materno.
- **Incisos aleatorios:** las opciones de selección múltiple se mezclan en cada carga y cambian obligatoriamente después de una respuesta incorrecta. La respuesta correcta continúa ligada al texto correcto y cada intento almacena el texto seleccionado y la letra que se mostró.
- **Cálculo sin incisos:** el alumno debe escribir sus valores para el caso de costos de flete, OTD/OTIF y evaluación ponderada de proveedor.
- **Regla de dos errores:** después de dos errores, se ofrece reintentar o saltar el reto. Si se salta, se registra como omitido y vale cero puntos.
- **Avance secuencial de las tres fases**, puntuación formativa, retroalimentación, rachas y celebración al superar retos.
- **Reportes PDF** que incluyen identidad, textos de respuesta enviados, intentos, errores, cálculos capturados, retos omitidos y puntajes por sesión.
- El progreso del estudiante se conserva en el navegador local. No se envía información a un servidor ni se centraliza automáticamente.

## Casos de cálculo
- Costos extraordinarios: 2 embarques × $12,000 MXN y $8,000 MXN de reproceso. El alumno captura el subtotal de fletes y el costo total del incidente.
- KPI del proveedor: 20 entregas programadas, 18 a tiempo y 16 a tiempo y completas. El alumno calcula OTD y OTIF por separado.
- Scorecard ponderado: calidad 40%, entrega 30%, costo 20%, servicio 10%; el alumno calcula la calificación final usando 90, 80, 100 y 70, respectivamente.

## Ejecutar localmente
Abre `index.html` en un navegador moderno. Tailwind CSS se carga desde CDN, así que se necesita conexión a internet para los estilos completos.

## Publicar en GitHub Pages
1. Crea un repositorio público nuevo, por ejemplo `protocolo-nexus`.
2. Sube `index.html` a la raíz del repositorio.
3. Abre **Settings → Pages**.
4. En **Build and deployment**, elige **Deploy from a branch**, rama `main`, carpeta `/(root)` y guarda.
5. Si el usuario/repositorio conserva ese nombre, la URL esperada será `https://angelmaltos03-alt.github.io/protocolo-nexus/`.

## Límites importantes
La aplicación es una simulación formativa cliente, no un examen de alta seguridad: las preguntas y las reglas de validación viven en el navegador y pueden inspeccionarse con herramientas de desarrollo. Para evitar suplantación y concentrar notas de todo el grupo en un solo panel, necesitaría un backend o plataforma de evaluación con autenticación y almacenamiento centralizado.


## Actualización del simulador
- 24 desafíos: 8 por cada una de las 3 sesiones.
- Dashboards operativos de fletes, OTD/OTIF y evaluación ponderada de proveedores.
- Cálculos escritos por el alumno y retos conceptuales de mayor complejidad.
- Reporte descargable en PDF con respuestas, intentos, fallos, omisiones y resultados por sesión.
- Botón rápido para generar PDF junto al registro del participante. Se eliminó el reinicio de candidato de la interfaz.
- La página usa jsPDF desde CDN; el navegador necesita conexión para cargar esa biblioteca y descargar el PDF.
