# NEXUS Control Tower — Compras y Logística

Simulador académico interactivo de compras y logística, con una interfaz de control tower corporativa.

## Incluye

- Portada ejecutiva con indicadores, seguimiento de embarques y estado del turno.
- Navegación lateral dentro del centro de control logístico.
- Paneles de tendencias de entrega, salud de proveedores y cola de excepciones.
- Tres sesiones y 24 desafíos (8 por sesión), con desbloqueo progresivo.
- Ejercicios numéricos sin incisos para costos de flete, costo total de adquisición, punto de reorden, OTD/OTIF y evaluación ponderada de proveedores.
- Opciones conceptuales aleatorizadas; después de dos errores se permite saltar el reto, que queda registrado como omitido y vale cero puntos.
- Nombre completo obligatorio y seguimiento local del progreso.
- Generación de expediente PDF con respuestas, intentos, errores y resultados de cada sesión.
- Rúbricas de evidencias académicas y manual de campo.

## Cómo abrir

Abre `index.html` en un navegador moderno. Para ver estilos, tipografías, imágenes y generar PDF, el dispositivo necesita conexión a internet porque el proyecto carga Tailwind CSS, Google Fonts, jsPDF y una fotografía de Unsplash desde sus CDN.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube `index.html` a la raíz del repositorio.
3. Ve a **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Selecciona la rama `main` y la carpeta `/ (root)`, y guarda.
6. Espera a que GitHub Pages publique el sitio y abre la URL que aparece en esa misma sección.

## Datos y privacidad

El progreso y los datos del participante se guardan en el navegador donde se usa el simulador. El HTML no envía respuestas a una base de datos central ni recoge resultados en secreto. El PDF descargado debe ser entregado por el alumno mediante el canal definido por el docente.

Los escenarios, mapas y cifras del centro de control son simulaciones didácticas, no datos de una operación real.
