# SmartLab Monitor — Ionic React + TypeScript + Tailwind CSS

Proyecto base para el módulo **Desarrollo de Interfaces (Código 0488)** — 2.º CFGS DAM (Comunidad de Madrid).

## Estructura del Proyecto

- `src/pages/Home.tsx`: Vista principal con cabecera reactiva, Pull-to-Refresh, KPIs en Tailwind Grid, búsqueda y filtrado segmentado, lista con gestos laterales (`IonItemSliding`), modal de alta (`IonModal`), botón flotante (`IonFab`) y notificaciones (`IonToast`).
- `src/types/incident.ts`: Definición estricta de interfaces y tipos de dominio en TypeScript.
- `src/theme/variables.css`: Directivas `@tailwind` y variables CSS de personalización para Shadow DOM de Ionic.
- `Dockerfile` y `nginx.conf`: Empaquetado multietapa listo para despliegue en contenedor.

## Puesta en Marcha Local (Node.js >= 20 LTS)

```bash
npm install
npm run dev
```

## Compilación de Producción

```bash
npm run build
```

## Despliegue en Contenedor Docker

```bash
docker build -t smartlab-ionic-tw:1.0 .
docker run -d -p 8080:80 --name smartlab-container smartlab-ionic-tw:1.0
```

## Diseño brutalista

- Bordes negros gruesos (`border-4`), sin esquinas redondeadas.
- Sombras duras sin desenfoque (`shadow-brutal`: `6px 6px 0 #000`).
- Colores planos y saturados (amarillo ácido, rojo, cian, verde) con texto negro (contraste WCAG AA).
- Tipografía pesada en mayúsculas (Space Grotesk / Space Mono) y cinta marquesina con datos en vivo.
- Los componentes de Ionic se personalizan con sus variables CSS (`--background`, `--border-radius`, `--box-shadow`), ya que Tailwind no entra en su Shadow DOM.

## Interacciones

- Botones y tarjetas que "se hunden" sobre su sombra al pasar el ratón o pulsar (`hover:` / `active:`).
- Las tarjetas KPI son botones que filtran el listado.
- Búsqueda en tiempo real, filtros por estado, acciones deslizables (`IonItemSliding`), Pull-to-Refresh, modal de alta con validación y notificaciones (`IonToast`).
- Foco visible con contorno grueso para la navegación por teclado.

## Layout con `vh`

| Elemento | Altura |
|---|---|
| Hero | `min-h-[40vh]` móvil · `min-h-[35vh]` tablet · `min-h-[45vh]` escritorio |
| Tarjetas KPI | `min-h-[15vh]` |
| Listado (escritorio) | `max-h-[70vh]` con scroll propio |
| Modal | `90vh` móvil · `85vh` escritorio |

## Diseño responsive (RWD)

| Vista | Ancho | Distribución |
|---|---|---|
| Móvil | < 768px | 1 columna, KPIs en 2×2 |
| Tablet (`md`) | ≥ 768px | 1 columna, 4 KPIs en fila |
| Escritorio (`lg`) | ≥ 1024px | 2 columnas: hero + KPIs fijos a la izquierda, listado a la derecha |

## Despliegue en Vercel

Vercel detecta Vite automáticamente (Build: `npm run build`, Output: `dist`).
El archivo `vercel.json` redirige todas las rutas a `index.html` para que funcione la ruta `/home` al recargar.

Producción: https://smartlab-ionic-tw-pi.vercel.app
