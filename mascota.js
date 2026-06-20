/* ============================================================
   PITAYA BUDDY — motor principal
   Requiere que mascota-face.js se cargue antes (define window.__pitaya*)
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = window.__pitayaConfig;
  var faceSVG = window.__pitayaFaceSVG;
  var PHRASES = window.__pitayaPhrases;
  var CELEBRATE_PHRASES = window.__pitayaCelebratePhrases;

  if (!CONFIG || !faceSVG) {
    console.warn("[PitayaBuddy] mascota-face.js no se cargó antes de mascota.js");
    return;
  }

  // ----------------------------------------------------------
  // Estado
  // ----------------------------------------------------------
  var state = {
    isMobile: window.innerWidth <= CONFIG.breakpoint,
    x: 0, // posición left en px (desktop) — esquina del contenedor
    y: 0,
    dir: "right",
    walking: false,
    targetX: null,
    mouseX: null,
    mouseY: null,
    lastInteraction: Date.now(),
    dragging: false,
    animBusy: false,
    raf: null
  };

  var el = {}; // referencias DOM

  // ----------------------------------------------------------
  // Construcción del DOM
  // ----------------------------------------------------------
  function buildDOM() {
    var root = document.createElement("div");
    root.id = "pitaya-buddy";
    root.setAttribute("role", "button");
    root.setAttribute("aria-label", "Asistente Pitaya, toca para interactuar");
    root.setAttribute("tabindex", "0");

    root.innerHTML =
      '<div class="pb-shadow"></div>' +
      '<div class="pb-stage">' +
      '  <div class="pb-relocate-hint">' +
      '    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
      '      <path d="M5 9l-3 3 3 3"/><path d="M9 5l3-3 3 3"/><path d="M15 19l3 3 3-3"/><path d="M19 9l3 3-3 3"/>' +
      '      <line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>' +
      "    </svg>" +
      "  </div>" +
      '  <div class="pb-bubble" id="pb-bubble"></div>' +
      '  <div class="pb-body-wrap">' +
      '    <img class="pb-sprite" src="' + PITAYA_IMG_SRC + '" draggable="false" alt="Pitaya, mascota de la quiniela">' +
      '    <div class="pb-face" id="pb-face"></div>' +
      "  </div>" +
      "</div>";

    document.body.appendChild(root);

    el.root = root;
    el.stage = root.querySelector(".pb-stage");
    el.bodyWrap = root.querySelector(".pb-body-wrap");
    el.face = root.querySelector("#pb-face");
    el.bubble = root.querySelector("#pb-bubble");
    el.shadow = root.querySelector(".pb-shadow");

    setFace("normal");
    root.classList.add("pb-state-idle", "pb-interactive");

    return root;
  }

  function setFace(gesture) {
    el.face.innerHTML = faceSVG(gesture);
  }

  // ----------------------------------------------------------
  // Tamaño dinámico
  // ----------------------------------------------------------
  function applySize() {
    var aspect = window.__pitayaAspect || 1.627;
    var size;
    if (state.isMobile) {
      size = CONFIG.mobileWidthPx;
    } else {
      var raw = window.innerHeight * CONFIG.heightVhDesktop / aspect; // altura objetivo -> ancho
      size = Math.max(CONFIG.minWidthPx, Math.min(CONFIG.maxWidthPx, raw));
    }
    el.root.style.setProperty("--pb-size", size + "px");
    el.root.style.setProperty("--pb-aspect", aspect);
    state.size = size;
    state.h = size * aspect;
  }

  // ----------------------------------------------------------
  // DESKTOP: caminar + seguir cursor con inclinación
  // ----------------------------------------------------------
  function initDesktop() {
    state.y = window.innerHeight - state.h - 14;
    state.x = window.innerWidth * 0.75;
    positionEl();

    window.addEventListener("mousemove", function (e) {
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;
      state.lastInteraction = Date.now();
    }, { passive: true });

    el.stage.addEventListener("click", onClick);
    el.root.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); }
    });

    window.addEventListener("resize", onResize);

    scheduleNextWalk();
    requestAnimationFrame(loopDesktop);
    scheduleBubble();
  }

  function positionEl() {
    el.root.style.transform = "translate(" + state.x + "px," + state.y + "px)";
  }

  function scheduleNextWalk() {
    var delay = rand(CONFIG.idleMinMs, CONFIG.idleMaxMs);
    setTimeout(function () {
      if (!state.dragging && !state.animBusy) startWalk();
      scheduleNextWalk();
    }, delay);
  }

  function startWalk() {
    var margin = 20;
    var maxX = window.innerWidth - state.size - margin;
    state.targetX = rand(margin, Math.max(margin, maxX));
    state.walking = true;
    el.root.classList.remove("pb-state-idle");
    el.root.classList.add("pb-state-walking");
  }

  function loopDesktop() {
    if (!state.dragging) {
      // Caminar hacia targetX
      if (state.walking && state.targetX !== null) {
        var dx = state.targetX - state.x;
        if (Math.abs(dx) < 2) {
          state.walking = false;
          el.root.classList.remove("pb-state-walking");
          el.root.classList.add("pb-state-idle");
        } else {
          var dir = dx > 0 ? 1 : -1;
          state.dir = dir > 0 ? "right" : "left";
          el.root.setAttribute("data-dir", state.dir);
          state.x += dir * CONFIG.walkSpeed;
          positionEl();
        }
      }

      // Inclinar cuerpo hacia el cursor (sutil) cuando está quieto
      if (!state.walking && !state.animBusy && state.mouseX !== null) {
        var cx = state.x + state.size / 2;
        var cy = state.y + state.h * 0.35;
        var angle = Math.atan2(state.mouseY - cy, state.mouseX - cx);
        var deg = clamp(angle * (180 / Math.PI) * 0.12, -12, 12);
        el.bodyWrap.style.transform = "rotate(" + deg.toFixed(2) + "deg)";

        // mirar levemente con la cara hacia el cursor (translate sutil del overlay)
        var lookX = clamp((state.mouseX - cx) / 40, -3, 3);
        var lookY = clamp((state.mouseY - cy) / 60, -2, 2);
        el.face.style.transform = "translate(" + lookX.toFixed(1) + "px," + lookY.toFixed(1) + "px)";
      } else if (!state.animBusy) {
        el.bodyWrap.style.transform = "";
        el.face.style.transform = "";
      }
    }
    state.raf = requestAnimationFrame(loopDesktop);
  }

  function onResize() {
    var wasMobile = state.isMobile;
    state.isMobile = window.innerWidth <= CONFIG.breakpoint;
    applySize();
    if (state.isMobile !== wasMobile) {
      // cambio de modo: reiniciar limpio
      teardown();
      init();
      return;
    }
    if (!state.isMobile) {
      state.y = Math.min(state.y, window.innerHeight - state.h - 14);
      state.x = Math.min(state.x, window.innerWidth - state.size - 10);
      positionEl();
    }
  }

  // ----------------------------------------------------------
  // MOBILE: posición fija (esquina), drag para reubicar, tap = gesto
  // ----------------------------------------------------------
  function initMobile() {
    var saved = loadMobilePos();
    var bottomReserved = getBottomReservedSpace();
    if (saved) {
      state.x = saved.x; state.y = saved.y;
    } else {
      state.x = window.innerWidth - state.size - 14;
      state.y = window.innerHeight - state.h - bottomReserved - 18;
    }
    clampToViewport();
    positionEl();

    var dragData = null;
    var moved = false;

    el.root.addEventListener("pointerdown", function (e) {
      dragData = { startX: e.clientX, startY: e.clientY, origX: state.x, origY: state.y };
      moved = false;
      el.root.setPointerCapture(e.pointerId);
    });

    el.root.addEventListener("pointermove", function (e) {
      if (!dragData) return;
      var dx = e.clientX - dragData.startX;
      var dy = e.clientY - dragData.startY;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        moved = true;
        if (!state.dragging) {
          state.dragging = true;
          el.root.classList.add("pb-dragging");
        }
        state.x = dragData.origX + dx;
        state.y = dragData.origY + dy;
        clampToViewport();
        positionEl();
      }
    });

    el.root.addEventListener("pointerup", function (e) {
      if (state.dragging) {
        state.dragging = false;
        el.root.classList.remove("pb-dragging");
        snapToNearestEdge();
        saveMobilePos();
      } else if (!moved) {
        onClick();
      }
      dragData = null;
    });

    // Mostrar un hint sutil de que se puede arrastrar, la primera vez
    if (!localStorage.getItem("pitayaBuddyHintShown")) {
      setTimeout(function () {
        el.root.classList.add("pb-show-hint");
        setTimeout(function () { el.root.classList.remove("pb-show-hint"); }, 3000);
        localStorage.setItem("pitayaBuddyHintShown", "1");
      }, 1800);
    }

    window.addEventListener("resize", function () {
      applySize();
      clampToViewport();
      positionEl();
    });

    el.root.classList.add("pb-state-idle");
    scheduleBubble();
  }

  function getBottomReservedSpace() {
    // Detecta una barra de navegacion fija al fondo (comun en apps mobile)
    // para que la mascota nunca quede encima de ella.
    var candidates = document.querySelectorAll(".tabs, nav, footer, [class*='tabbar'], [class*='tab-bar'], [class*='bottom-nav']");
    var maxBottom = 0;
    for (var i = 0; i < candidates.length; i++) {
      var elx = candidates[i];
      var cs = window.getComputedStyle(elx);
      if (cs.position === "fixed") {
        var rect = elx.getBoundingClientRect();
        // solo cuenta si esta efectivamente pegado al fondo del viewport
        if (rect.bottom >= window.innerHeight - 4 && rect.height > 0) {
          maxBottom = Math.max(maxBottom, rect.height);
        }
      }
    }
    return maxBottom;
  }

  function clampToViewport() {
    var margin = 6;
    var bottomReserved = state.isMobile ? getBottomReservedSpace() : 0;
    state.x = clamp(state.x, margin, window.innerWidth - state.size - margin);
    state.y = clamp(state.y, margin, window.innerHeight - state.h - margin - bottomReserved);
  }

  function snapToNearestEdge() {
    var goLeft = (state.x + state.size / 2) < window.innerWidth / 2;
    state.x = goLeft ? 10 : window.innerWidth - state.size - 10;
    positionEl();
    el.root.style.transition = "transform 0.35s cubic-bezier(.34,1.56,.64,1)";
    setTimeout(function () { el.root.style.transition = ""; }, 380);
  }

  function loadMobilePos() {
    try {
      var raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return null;
      var p = JSON.parse(raw);
      if (typeof p.x === "number" && typeof p.y === "number") return p;
    } catch (e) {}
    return null;
  }
  function saveMobilePos() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify({ x: state.x, y: state.y }));
    } catch (e) {}
  }

  // ----------------------------------------------------------
  // Interacción: click / tap -> gesto random + a veces frase
  // ----------------------------------------------------------
  var GESTURES = [
    { face: "wink", anim: "pb-anim-wave" },
    { face: "happy", anim: "pb-anim-celebrate" },
    { face: "surprise", anim: "pb-anim-spin" },
    { face: "shy", anim: "pb-anim-shy" },
    { face: "celebrate", anim: "pb-anim-celebrate" }
  ];

  function onClick() {
    if (state.animBusy) return;
    state.animBusy = true;
    var g = GESTURES[Math.floor(Math.random() * GESTURES.length)];
    setFace(g.face);
    el.root.classList.add(g.anim);

    var showPhrase = Math.random() < 0.55;
    if (showPhrase) {
      var pool = g.face === "celebrate" ? CELEBRATE_PHRASES : PHRASES;
      showBubble(pool[Math.floor(Math.random() * pool.length)], 2600);
    }

    setTimeout(function () {
      el.root.classList.remove(g.anim);
      setFace("normal");
      state.animBusy = false;
    }, 900);
  }

  // ----------------------------------------------------------
  // Globo de diálogo periódico
  // ----------------------------------------------------------
  var bubbleTimer = null;
  function scheduleBubble() {
    var delay = rand(CONFIG.bubbleMinMs, CONFIG.bubbleMaxMs);
    bubbleTimer = setTimeout(function () {
      if (!state.dragging && !state.animBusy) {
        var phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
        setFace("talk");
        showBubble(phrase, CONFIG.bubbleDurationMs);
        setTimeout(function () { if (!state.animBusy) setFace("normal"); }, CONFIG.bubbleDurationMs);
      }
      scheduleBubble();
    }, delay);
  }

  function showBubble(text, duration) {
    el.bubble.textContent = text;
    el.bubble.style.setProperty("--bubble-shift", "0px");
    el.bubble.classList.add("pb-bubble-visible");

    // Evitar que el globo se corte en los bordes del viewport
    requestAnimationFrame(function () {
      var rect = el.bubble.getBoundingClientRect();
      var margin = 8;
      var shift = 0;
      if (rect.left < margin) {
        shift = margin - rect.left;
      } else if (rect.right > window.innerWidth - margin) {
        shift = (window.innerWidth - margin) - rect.right;
      }
      if (shift !== 0) {
        el.bubble.style.setProperty("--bubble-shift", shift.toFixed(0) + "px");
      }
    });

    clearTimeout(el._bubbleHideTimer);
    el._bubbleHideTimer = setTimeout(function () {
      el.bubble.classList.remove("pb-bubble-visible");
    }, duration);
  }

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // ----------------------------------------------------------
  // Init / teardown (para manejar cambio desktop<->mobile en resize)
  // ----------------------------------------------------------
  function init() {
    buildDOM();
    applySize();
    if (state.isMobile) {
      initMobile();
    } else {
      initDesktop();
    }
  }

  function teardown() {
    if (state.raf) cancelAnimationFrame(state.raf);
    clearTimeout(bubbleTimer);
    if (el.root) el.root.remove();
    el = {};
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
