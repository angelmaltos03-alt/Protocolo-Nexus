# NEXUS Control Tower · v2

Centro de control académico para compras, abastecimiento y logística. El dashboard integra KPI, seguimiento de embarques, incidencias, órdenes, indicadores, evaluación de proveedores y un simulador de costo total de flete.

## Módulos
- Centro de control, rutas y cola de incidencias.
- Órdenes de compra, logística, inventario, indicadores y scorecard de proveedores.
- Simulador de flete con subtotal, combustible, peajes, reproceso y total en vivo.
- 24 retos distribuidos en 3 sesiones secuenciales.
- Reporte PDF y detalle CSV.
- Diseño responsive para escritorio, tablet y celular.

## Publicación
El flujo `.github/workflows/pages.yml` despliega `main` a GitHub Pages. En **Settings → Pages → Build and deployment**, selecciona **GitHub Actions** como fuente para habilitar la publicación.

## Límites y privacidad
Las rutas, proveedores, órdenes, tiempos y KPI son simulados; no hay conexión real a ERP, TMS ni GPS. El progreso académico se guarda en el navegador de cada estudiante y no se envía automáticamente a un servidor.

La versión publicada usa fotografías por URL de Unsplash. El paquete de proyecto para ejecución local conserva los recursos gráficos dentro de la carpeta `assets/`. HTML5, CSS y JavaScript; no requiere proceso de compilación.
