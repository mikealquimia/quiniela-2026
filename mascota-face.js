/* ============================================================
   PITAYA BUDDY — asistente mascota animado para Pitaya Mundialista
   Vanilla JS, sin dependencias. Funciona en desktop (camina, sigue
   el cursor) y mobile (mini, reubicable, reacciona al tap).
   ============================================================ */
(function () {
  "use strict";

  // ----------------------------------------------------------
  // CONFIG
  // ----------------------------------------------------------
  var CONFIG = {
    // % del alto de viewport que ocupa la mascota en desktop
    heightVhDesktop: 0.20,
    minWidthPx: 90,
    maxWidthPx: 220,
    // mobile: tamaño fijo "miniatura"
    mobileWidthPx: 64,
    breakpoint: 820, // px, debajo de esto se considera "mobile"
    walkSpeed: 1.1, // px por frame aprox a 60fps
    idleMinMs: 4000,
    idleMaxMs: 9000,
    bubbleMinMs: 25000,
    bubbleMaxMs: 50000,
    bubbleDurationMs: 4200,
    storageKey: "pitayaBuddyPos"
  };

  // Coordenadas faciales relativas (0-1) sobre el sprite recortado (142x231),
  // medidas a mano sobre la imagen de la mascota.
  var FACE = {
    eyeR: { x: 0.3077, y: 0.3017 }, // ojo visualmente izquierdo
    eyeL: { x: 0.5775, y: 0.3061 }, // ojo visualmente derecho
    mouth: { x: 0.4486, y: 0.4100 },
    eyeRadius: 0.0951,
    mouthWidth: 0.3239,
    browOffsetY: 0.08
  };
  var SPRITE_ASPECT = 231 / 142; // alto/ancho del sprite recortado

  var PHRASES = [
    "¿Ya pusiste tus resultados de hoy? \u26BD",
    "Recuerda: puedes editar hasta 1 hora antes del partido",
    "¡Vamos por esos puntos extra! \uD83C\uDFC6",
    "Psst... revisa la tabla, alguien te va alcanzando \uD83D\uDC40",
    "Un marcador exacto vale más que un ganador a secas \uD83D\uDE0F",
    "¿Ya viste cómo van tus compañeros en Comparar?",
    "¡Hoy es buen día para acertar un resultado! \uD83C\uDF35",
    "No olvides actualizar tu quiniela antes del primer silbatazo",
    "La racha se construye partido a partido \uD83D\uDD25",
    "Tip: los marcadores de fase de grupos suelen sorprender"
  ];

  var CELEBRATE_PHRASES = [
    "¡Eso, así se juega! \uD83C\uDF89",
    "¡Wiiii! \u26BD\uD83C\uDF89",
    "¡Vamos con todo!",
    "\uD83C\uDFC6 ¡Campeones!"
  ];

  // ----------------------------------------------------------
  // SVG de la carita (overlay) — genera el gesto solicitado
  // ----------------------------------------------------------
  var VB_W = 100, VB_H = 100 * SPRITE_ASPECT;

  function faceSVG(gesture) {
    var ex = FACE.eyeR.x * VB_W, ey = FACE.eyeR.y * VB_H;
    var fx = FACE.eyeL.x * VB_W, fy = FACE.eyeL.y * VB_H;
    var mx = FACE.mouth.x * VB_W, my = FACE.mouth.y * VB_H;
    var r = FACE.eyeRadius * VB_W;
    var mw = FACE.mouthWidth * VB_W;

    var eyesHTML = "";
    var mouthHTML = "";
    var extrasHTML = "";

    function normalEye(cx, cy) {
      return (
        '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + (r * 0.42) + '" ry="' + (r * 0.5) + '" fill="#1a1a1a"/>' +
        '<circle cx="' + (cx + r * 0.14) + '" cy="' + (cy - r * 0.18) + '" r="' + (r * 0.12) + '" fill="#fff" opacity="0.9"/>'
      );
    }
    function winkEye(cx, cy) {
      // parpado cerrado + pestañas, bien marcado y con contorno claro para que destaque sobre la piel rosa
      return (
        '<path d="M ' + (cx - r * 0.62) + ' ' + (cy + r * 0.05) + ' Q ' + cx + ' ' + (cy + r * 0.75) + ' ' + (cx + r * 0.62) + ' ' + (cy + r * 0.05) + '" stroke="#0d0d0d" stroke-width="' + (r * 0.32) + '" fill="none" stroke-linecap="round"/>' +
        '<path d="M ' + (cx + r * 0.45) + ' ' + (cy - r * 0.05) + ' l ' + (r * 0.22) + ' ' + (-r * 0.22) + '" stroke="#0d0d0d" stroke-width="' + (r * 0.16) + '" stroke-linecap="round"/>'
      );
    }
    function happyEye(cx, cy) {
      return '<path d="M ' + (cx - r * 0.48) + ' ' + (cy + r * 0.15) + ' Q ' + cx + ' ' + (cy - r * 0.55) + ' ' + (cx + r * 0.48) + ' ' + (cy + r * 0.15) + '" stroke="#1a1a1a" stroke-width="' + (r * 0.24) + '" fill="none" stroke-linecap="round"/>';
    }
    function surpriseEye(cx, cy) {
      return (
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.62) + '" fill="#1a1a1a"/>' +
        '<circle cx="' + (cx + r * 0.16) + '" cy="' + (cy - r * 0.2) + '" r="' + (r * 0.16) + '" fill="#fff"/>'
      );
    }

    switch (gesture) {
      case "wink":
        eyesHTML = winkEye(ex, ey) + normalEye(fx, fy);
        mouthHTML = '<path d="M ' + (mx - mw * 0.32) + ' ' + (my - mw * 0.02) + ' Q ' + mx + ' ' + (my + mw * 0.32) + ' ' + (mx + mw * 0.32) + ' ' + (my - mw * 0.02) + '" stroke="#1a1a1a" stroke-width="' + (mw * 0.07) + '" fill="#3a0d0d" stroke-linejoin="round"/>';
        break;
      case "happy":
        eyesHTML = happyEye(ex, ey) + happyEye(fx, fy);
        mouthHTML = '<path d="M ' + (mx - mw * 0.55) + ' ' + (my - mw * 0.05) + ' Q ' + mx + ' ' + (my + mw * 0.7) + ' ' + (mx + mw * 0.55) + ' ' + (my - mw * 0.05) + ' Z" fill="#3a0d0d" stroke="#1a1a1a" stroke-width="2"/>' +
          '<path d="M ' + (mx - mw * 0.32) + ' ' + (my + mw * 0.12) + ' Q ' + mx + ' ' + (my + mw * 0.3) + ' ' + (mx + mw * 0.32) + ' ' + (my + mw * 0.12) + '" fill="#fff" opacity="0.85"/>';
        break;
      case "surprise":
        eyesHTML = surpriseEye(ex, ey) + surpriseEye(fx, fy);
        mouthHTML = '<ellipse cx="' + mx + '" cy="' + (my + mw * 0.02) + '" rx="' + (mw * 0.22) + '" ry="' + (mw * 0.3) + '" fill="#3a0d0d" stroke="#1a1a1a" stroke-width="2"/>';
        // cejas levantadas para reforzar la sorpresa
        extrasHTML =
          '<path d="M ' + (ex - r * 0.6) + ' ' + (ey - r * 1.3) + ' Q ' + ex + ' ' + (ey - r * 1.9) + ' ' + (ex + r * 0.6) + ' ' + (ey - r * 1.3) + '" stroke="#1a1a1a" stroke-width="' + (r * 0.2) + '" fill="none" stroke-linecap="round"/>' +
          '<path d="M ' + (fx - r * 0.6) + ' ' + (fy - r * 1.3) + ' Q ' + fx + ' ' + (fy - r * 1.9) + ' ' + (fx + r * 0.6) + ' ' + (fy - r * 1.3) + '" stroke="#1a1a1a" stroke-width="' + (r * 0.2) + '" fill="none" stroke-linecap="round"/>';
        break;
      case "celebrate":
        eyesHTML = happyEye(ex, ey) + happyEye(fx, fy);
        mouthHTML = '<path d="M ' + (mx - mw * 0.55) + ' ' + (my - mw * 0.05) + ' Q ' + mx + ' ' + (my + mw * 0.75) + ' ' + (mx + mw * 0.55) + ' ' + (my - mw * 0.05) + ' Z" fill="#3a0d0d" stroke="#1a1a1a" stroke-width="2"/>';
        extrasHTML =
          '<g class="pb-confetti">' +
          star(ex - r * 2.4, ey - r * 1.6, 4.5, "#ffd23f") +
          star(fx + r * 2.5, fy - r * 1.8, 4, "#5ec26a") +
          star(mx, ey - r * 3.2, 3.8, "#4a93dd") +
          star(ex - r * 0.4, ey - r * 2.6, 3, "#e91e83") +
          star(fx + r * 1.0, fy - r * 2.7, 3, "#ffd23f") +
          "</g>";
        break;
      case "shy":
        eyesHTML = winkEye(ex, ey) + winkEye(fx, fy);
        mouthHTML = '<path d="M ' + (mx - mw * 0.22) + ' ' + my + ' Q ' + mx + ' ' + (my + mw * 0.14) + ' ' + (mx + mw * 0.22) + ' ' + my + '" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/>';
        extrasHTML =
          '<circle cx="' + (ex - r * 0.3) + '" cy="' + (ey + r * 1.15) + '" r="' + (r * 0.55) + '" fill="#ff5fa0" opacity="0.65"/>' +
          '<circle cx="' + (fx + r * 0.3) + '" cy="' + (fy + r * 1.15) + '" r="' + (r * 0.55) + '" fill="#ff5fa0" opacity="0.65"/>';
        break;
      case "talk":
        eyesHTML = normalEye(ex, ey) + normalEye(fx, fy);
        // boca abierta tipo "hablando", mas ancha y ovalada horizontal, distinta a la sorpresa (redonda)
        mouthHTML = '<ellipse cx="' + mx + '" cy="' + my + '" rx="' + (mw * 0.34) + '" ry="' + (mw * 0.18) + '" fill="#3a0d0d" stroke="#1a1a1a" stroke-width="2"/>' +
          '<rect x="' + (mx - mw * 0.3) + '" y="' + (my - mw * 0.16) + '" width="' + (mw * 0.6) + '" height="' + (mw * 0.1) + '" rx="' + (mw * 0.04) + '" fill="#fff" opacity="0.9"/>';
        break;
      case "normal":
      default:
        eyesHTML = normalEye(ex, ey) + normalEye(fx, fy);
        mouthHTML = "";
        break;
    }

    return (
      '<svg viewBox="0 0 ' + VB_W + ' ' + VB_H.toFixed(2) + '" xmlns="http://www.w3.org/2000/svg">' +
      eyesHTML + mouthHTML + extrasHTML +
      "</svg>"
    );
  }

  function star(cx, cy, size, color) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var ang = (Math.PI / 5) * i - Math.PI / 2;
      var rad = i % 2 === 0 ? size : size * 0.45;
      pts.push((cx + Math.cos(ang) * rad).toFixed(1) + "," + (cy + Math.sin(ang) * rad).toFixed(1));
    }
    return '<polygon points="' + pts.join(" ") + '" fill="' + color + '"/>';
  }

  window.__pitayaFaceSVG = faceSVG;
  window.__pitayaConfig = CONFIG;
  window.__pitayaPhrases = PHRASES;
  window.__pitayaCelebratePhrases = CELEBRATE_PHRASES;
  window.__pitayaAspect = SPRITE_ASPECT;
})();
