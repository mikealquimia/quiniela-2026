# 🐲 Pitaya Buddy — Asistente Mascota

Mascota animada para Pitaya Mundialista 2026. Funciona en vanilla JS, sin dependencias, lista para subir directo a tu repo de GitHub / Vercel.

## Archivos

| Archivo | Qué hace |
|---|---|
| `mascota.css` | Estilos y animaciones |
| `mascota-img.js` | Tu imagen de la pitaya, ya recortada (sin fondo) y codificada — no necesitas subir un PNG aparte |
| `mascota-face.js` | Genera las caritas (guiño, feliz, sorpresa, tímida, festejo) como overlay SVG sobre la imagen |
| `mascota.js` | El motor: caminar, seguir el cursor, drag en móvil, globo de diálogo |

## Instalación (3 pasos)

### 1. Sube los 4 archivos a tu repo
Junto a tus archivos actuales (`index.html`, `style.css`, `app.js`).

### 2. En `index.html`, agrega el CSS dentro de `<head>`

Busca esta línea:
```html
<link rel="stylesheet" href="style.css">
```

Y justo debajo agrega:
```html
<link rel="stylesheet" href="mascota.css">
```

### 3. Agrega los scripts justo antes de `</body>`

Busca esta línea (al final del archivo):
```html
<script src="app.js"></script>
```

Y agrega estas 3 líneas **antes** de ella (el orden importa):
```html
<script src="mascota-img.js"></script>
<script src="mascota-face.js"></script>
<script src="mascota.js"></script>
<script src="app.js"></script>
```

Eso es todo. Sube los cambios a GitHub y Vercel los publica solo.

---

## Qué hace la mascota

**En computadora (desktop):**
- Vive flotando sobre la página, tamaño dinámico = 20% del alto de la ventana (se ajusta si achicas/agrandas el navegador)
- Cada rato (4–9 seg de quietud) camina sola a otro punto de la pantalla
- Cuando está quieta, gira levemente el cuerpo y la mirada siguiendo tu cursor
- Click en ella → gesto al azar (guiño, sonrisa, sorpresa, tímida, festejo con confeti) + a veces un mensajito

**En celular:**
- Aparece en miniatura (64px) en una esquina, sin estorbar la barra de navegación inferior
- Tap → gesto + mensajito
- Mantener y arrastrar → la mueves a donde quieras; al soltar se pega al borde más cercano (izquierda o derecha) con una animación de rebote
- Recuerda dónde la dejaste la próxima vez que entres (usa el almacenamiento del navegador)

**Mensajes:**
- Cada 25–50 segundos, sin que la toques, puede aparecer con un tip corto sobre la quiniela
- Frases distintas para festejo vs. tips generales

---

## Personalizar

Todo lo ajustable está al inicio de `mascota-face.js`, en el objeto `CONFIG`:

```js
var CONFIG = {
  heightVhDesktop: 0.20,   // 20% del alto de pantalla en desktop — cámbialo a 0.15 o 0.25 si lo quieres más chico/grande
  minWidthPx: 90,          // tamaño mínimo en desktop (pantallas muy bajas)
  maxWidthPx: 220,         // tamaño máximo en desktop (pantallas muy altas)
  mobileWidthPx: 64,       // tamaño en celular
  breakpoint: 820,         // px de ancho debajo del cual se considera "celular"
  idleMinMs: 4000,         // cada cuánto empieza a caminar sola (mínimo)
  idleMaxMs: 9000,         // cada cuánto empieza a caminar sola (máximo)
  bubbleMinMs: 25000,      // cada cuánto puede hablar sola (mínimo)
  bubbleMaxMs: 50000,      // cada cuánto puede hablar sola (máximo)
};
```

Las frases que dice están justo debajo, en `PHRASES` y `CELEBRATE_PHRASES` — agrega, quita o edita las que quieras, son texto plano.

## Notas técnicas

- El fondo original de tu imagen (un patrón oscuro decorativo) fue removido automáticamente para que la mascota flote limpia sobre cualquier fondo, claro u oscuro.
- La carita es un overlay SVG dibujado a mano sobre las coordenadas de los ojos/boca de tu imagen — no es una imagen nueva generada por IA. Si más adelante generas variantes de cara reales (con otra herramienta de imagen), puedo integrarlas como reemplazo de este sistema.
- z-index: la mascota vive en `60`, por debajo de tus modales (`100`), así que nunca tapa un diálogo abierto.
- Respeta `prefers-reduced-motion` (si el usuario tiene animaciones reducidas en su sistema, la mascota deja de moverse sola).
