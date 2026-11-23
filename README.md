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

## Diseño responsive (RWD)

El componente `Home` (`src/pages/Home.tsx`) se adapta con los breakpoints de Tailwind:

| Vista | Ancho | KPIs | Buscador + filtro | Incidencias |
|---|---|---|---|---|
| Móvil | < 768px | 2 columnas | uno debajo del otro | 1 columna |
| Tablet (`md`) | ≥ 768px | 4 columnas | uno debajo del otro | 2 columnas |
| Escritorio (`lg`/`xl`) | ≥ 1024px | 4 columnas | en la misma fila | 3 columnas |

## Despliegue en Vercel

Vercel detecta Vite automáticamente (Build: `npm run build`, Output: `dist`).
El archivo `vercel.json` redirige todas las rutas a `index.html` para que funcione la ruta `/home` al recargar.
