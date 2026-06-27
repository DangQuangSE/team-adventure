# Team Adventure Frontend

Vite frontend for the virtual office. It uses Phaser for the 2D office and React only for the self-hosted Excalidraw board component.

## Run

```bash
npm.cmd run dev
```

The app will be available at:

```text
http://localhost:5173
```

## Notes

- No TypeScript is used.
- Vite is used because Excalidraw is consumed as an npm package.
- Phaser is loaded from CDN in `index.html`.
- Excalidraw is imported from `@excalidraw/excalidraw`.
- Runtime WebSocket URL is configured in `src/config/runtime.js`.

## Build

```bash
npm.cmd run build
```
