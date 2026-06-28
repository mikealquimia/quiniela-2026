// mascota.js — Pitaya Mundialista
// Video único con fondo blanco/gris neutro eliminado en tiempo real con Canvas
(function () {
  const VIDEO = 'mascota.mp4'; // renombra el archivo a esto al subirlo

  let animId = null;
  let frameN = 0;
  let bgR = 255, bgG = 255, bgB = 255; // color del fondo muestreado del borde

  // ── Crear elementos ──
  const wrap = document.createElement('div');
  wrap.className = 'mascota-wrap';

  const canvas = document.createElement('canvas');
  const video  = document.createElement('video');
  video.muted       = true;
  video.playsInline = true;
  video.crossOrigin = 'anonymous';
  video.loop        = true;
  video.style.display = 'none';

  wrap.appendChild(canvas);
  wrap.appendChild(video);
  document.body.appendChild(wrap);

  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // ── Muestrear borde completo del frame para obtener el color del fondo ──
  function sampleBorder(data, w, h) {
    let tr = 0, tg = 0, tb = 0, n = 0;
    const step = 6;
    for (let x = 0; x < w; x += step) {
      let i = x * 4;
      tr += data[i]; tg += data[i+1]; tb += data[i+2]; n++;
      i = ((h-1)*w + x) * 4;
      tr += data[i]; tg += data[i+1]; tb += data[i+2]; n++;
    }
    for (let y = 10; y < h-10; y += step) {
      let i = y * w * 4;
      tr += data[i]; tg += data[i+1]; tb += data[i+2]; n++;
      i = (y * w + w-1) * 4;
      tr += data[i]; tg += data[i+1]; tb += data[i+2]; n++;
    }
    bgR = tr/n; bgG = tg/n; bgB = tb/n;
  }

  // ── Eliminar fondo: neutro (R≈G≈B) y cercano al color del borde ──
  function removeBackground(data) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];

      // Chroma: qué tan "coloreado" es el pixel (0 = gris puro, alto = saturado)
      const mx = Math.max(r, g, b);
      const mn = Math.min(r, g, b);
      const chroma = mx - mn;

      // Distancia euclidiana al color del borde
      const dr = r - bgR, dg = g - bgG, db = b - bgB;
      const dist = Math.sqrt(dr*dr + dg*dg + db*db);

      // Es fondo si: está cerca del color del borde Y es poco saturado (neutro/gris)
      if (dist < 55 && chroma < 35) {
        const tDist   = Math.max(0, Math.min(1, (55 - dist) / 30));
        const tChroma = Math.max(0, Math.min(1, (35 - chroma) / 20));
        data[i+3] = Math.round((1 - tDist * tChroma) * 255);
      }
    }
  }

  // ── Loop de render ──
  function tick() {
    if (video.paused || video.ended) return;
    if (video.readyState < 2) { animId = requestAnimationFrame(tick); return; }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Muestrear borde frame 0 y luego cada 10 frames (el fondo varía suavemente)
    if (frameN === 0 || frameN % 10 === 0) {
      sampleBorder(frame.data, canvas.width, canvas.height);
    }
    frameN++;

    removeBackground(frame.data);
    ctx.putImageData(frame, 0, 0);
    animId = requestAnimationFrame(tick);
  }

  video.addEventListener('loadedmetadata', () => {
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
  });

  // Pre-muestrear el fondo del primer frame antes de arrancar
  video.addEventListener('canplay', () => {
    if (frameN > 0) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    sampleBorder(frame.data, canvas.width, canvas.height);
  });

  video.addEventListener('play', () => {
    if (animId) cancelAnimationFrame(animId);
    tick();
  });

  video.src = VIDEO;
  video.load();
  video.play().catch(() => {
    document.addEventListener('click', () => video.play(), { once: true });
  });
})();
