<?php
/**
 * TABLERO DE OPERACIONES Y BITÁCORA DE RUTAS (PHP PURO)
 * Compatible con cualquier servidor PHP (Apache, XAMPP, WAMP, Laragon, IIS)
 * NO REQUIERE NODE.JS NI COMPILADORES - COPIA Y PEGA DIRECTAMENTE
 * 
 * Soporta modo por CEDIS individual y vista gerencial de todas las plazas
 */

// Permite preconfigurar el CEDIS desde subcarpetas (obregon, hermosillo, etc.)
if (!isset($CEDIS_PRESET)) {
    $CEDIS_PRESET = isset($_GET['cedis']) ? strtolower(trim($_GET['cedis'])) : 'all';
}

// Mapeo de CEDIS reconocidos
$CEDIS_CONFIG = [
    'all' => ['name' => 'Todos los CEDIS (Gerencial)', 'short' => 'Todos', 'prefix' => null, 'code' => 'ALL'],
    'obregon' => ['name' => 'CEDIS Cd. Obregón', 'short' => 'Obregón', 'prefix' => '1', 'code' => '001', 'db' => 'Obregon'],
    'hermosillo' => ['name' => 'CEDIS Hermosillo', 'short' => 'Hermosillo', 'prefix' => '2', 'code' => '002', 'db' => 'Hermosillo'],
    'navojoa' => ['name' => 'CEDIS Navojoa', 'short' => 'Navojoa', 'prefix' => '3', 'code' => '003', 'db' => 'Navojoa'],
    'nogales' => ['name' => 'CEDIS Nogales', 'short' => 'Nogales', 'prefix' => '4', 'code' => '004', 'db' => 'Nogales'],
    'caborca' => ['name' => 'CEDIS Caborca', 'short' => 'Caborca', 'prefix' => '5', 'code' => '005', 'db' => 'Caborca'],
    'guaymas' => ['name' => 'CEDIS Guaymas', 'short' => 'Guaymas', 'prefix' => '6', 'code' => '006', 'db' => 'Guaymas'],
];

if (!isset($CEDIS_CONFIG[$CEDIS_PRESET])) {
    $CEDIS_PRESET = 'all';
}
$currentCedis = $CEDIS_CONFIG[$CEDIS_PRESET];

// Detección automática del logotipo real
// Busca logo.png, logo.svg, o el fallback vectorial
$baseDir = __DIR__;
if (!file_exists($baseDir . '/conexion.php') && file_exists(dirname($baseDir) . '/conexion.php')) {
    $baseDir = dirname($baseDir);
}

$logoCandidates = [
    'logo.png',
    'logo.jpg',
    'logo.svg',
    'logo-yaqui.png',
    'logo-yaqui.svg'
];

$logoFile = 'logo-yaqui.svg';
foreach ($logoCandidates as $cand) {
    if (file_exists($baseDir . '/' . $cand)) {
        $logoFile = $cand;
        break;
    }
}

// Si estamos en una subcarpeta (ej. /obregon/), la ruta relativa al logo es ../logo.png
$relPath = (isset($IS_SUBCARPETAS) && $IS_SUBCARPETAS) ? '../' : './';
?>
<!DOCTYPE html>
<html lang="es" class="h-full w-full">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?= htmlspecialchars($currentCedis['name']) ?> • Tablero de Rutas</title>
  
  <!-- Favicon dinámico basado en tu logo real -->
  <link rel="icon" type="image/png" href="<?= $relPath . htmlspecialchars($logoFile) ?>" />
  
  <!-- Tailwind CSS CDN para renderizado instantáneo sin compilación -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: '#0284c7'
          }
        }
      }
    }
  </script>
  <style>
    @keyframes screenProgress {
      0% { width: 0%; }
      100% { width: 100%; }
    }
    @keyframes marquee {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
    .animate-marquee {
      animation: marquee 35s linear infinite;
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  </style>
</head>
<body class="h-full w-full bg-slate-100 font-sans text-slate-800 overflow-hidden flex flex-col select-none">

  <!-- Top Screen Progress Bar -->
  <div class="w-full h-1 bg-slate-200 shrink-0 relative z-50">
    <div id="topProgressBar" class="h-full bg-red-600 transition-all ease-linear shadow-sm" style="width: 0%;"></div>
  </div>

  <!-- Header Light Theme with Brand, Tabs and TV Controls -->
  <header class="bg-white border-b border-slate-200 px-4 py-2 flex flex-col md:flex-row md:items-center justify-between text-slate-800 shrink-0 shadow-sm gap-2">
    <!-- Brand & Real Logo -->
    <div class="flex items-center gap-3">
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-sm flex items-center justify-center h-11 w-auto min-w-[64px]">
        <img 
          src="<?= $relPath . htmlspecialchars($logoFile) ?>" 
          alt="Logotipo" 
          class="h-9 w-auto max-w-[130px] object-contain"
          onerror="this.src='<?= $relPath ?>logo-yaqui.svg'; this.onerror=null;"
        />
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-base md:text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
            <span>Tablero de Operaciones</span>
            <span class="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full tracking-wider animate-pulse shadow-sm">
              EN VIVO
            </span>
          </h1>
        </div>
        <p class="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
          <span class="text-blue-700 font-bold"><?= htmlspecialchars($currentCedis['name']) ?></span>
          <span>•</span>
          <span>PHP Puro (Sin Node)</span>
        </p>
      </div>
    </div>

    <!-- Screen Tabs -->
    <div class="hidden xl:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
      <button onclick="goToScreen(0)" id="tab-0" class="tab-btn px-2.5 py-1 rounded-lg text-xs font-bold transition-all bg-blue-600 text-white shadow-sm">
        1. Bitácora de Rutas
      </button>
      <button onclick="goToScreen(1)" id="tab-1" class="tab-btn px-2.5 py-1 rounded-lg text-xs font-bold transition-all text-slate-600 hover:text-slate-900 hover:bg-white">
        2. Visitas y Rendimiento
      </button>
      <button onclick="goToScreen(2)" id="tab-2" class="tab-btn px-2.5 py-1 rounded-lg text-xs font-bold transition-all text-slate-600 hover:text-slate-900 hover:bg-white">
        3. Proyección Litros
      </button>
      <button onclick="goToScreen(3)" id="tab-3" class="tab-btn px-2.5 py-1 rounded-lg text-xs font-bold transition-all text-slate-600 hover:text-slate-900 hover:bg-white">
        4. Litros Vendidos
      </button>
      <button onclick="goToScreen(4)" id="tab-4" class="tab-btn px-2.5 py-1 rounded-lg text-xs font-bold transition-all text-slate-600 hover:text-slate-900 hover:bg-white">
        5. Cancelaciones
      </button>
    </div>

    <!-- Right Controls: CEDIS Selector, TV Zoom, Fullscreen, Pause & Clock -->
    <div class="flex items-center gap-2 flex-wrap">
      
      <!-- CEDIS Selector -->
      <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
        <span class="text-blue-600 pl-1">📍</span>
        <select 
          id="cedisSelect" 
          onchange="changeCedis(this.value)"
          class="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer pr-1 py-0.5 text-xs"
        >
          <?php foreach ($CEDIS_CONFIG as $k => $c): ?>
            <option value="<?= $k ?>" <?= $k === $CEDIS_PRESET ? 'selected' : '' ?>>
              <?= htmlspecialchars($c['short']) ?> <?= $c['prefix'] ? "(Rutas {$c['prefix']}xx)" : '• Gerencial' ?>
            </option>
          <?php endforeach; ?>
        </select>
      </div>

      <!-- TV Zoom Buttons -->
      <div class="hidden sm:flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-xs">
        <span class="text-[10px] text-slate-500 font-semibold">Zoom:</span>
        <button onclick="setTvZoom(1)" id="btn-zoom-1" class="zoom-btn px-1.5 py-0.5 rounded text-[11px] font-bold bg-blue-600 text-white shadow-sm">100%</button>
        <button onclick="setTvZoom(1.15)" id="btn-zoom-115" class="zoom-btn px-1.5 py-0.5 rounded text-[11px] font-bold text-slate-600 hover:text-slate-900">115%</button>
        <button onclick="setTvZoom(1.3)" id="btn-zoom-130" class="zoom-btn px-1.5 py-0.5 rounded text-[11px] font-bold text-slate-600 hover:text-slate-900">130%</button>
      </div>

      <!-- TV Fullscreen Button -->
      <button 
        onclick="toggleFullscreen()" 
        class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
        title="Modo Pantalla Completa para TV (F11)"
      >
        <span id="fsIcon">⛶</span>
      </button>

      <!-- Rotation Pause Button -->
      <button 
        onclick="togglePause()" 
        id="pauseBtn"
        class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 font-bold text-xs"
        title="Pausar o reanudar rotación automática"
      >
        ⏸
      </button>

      <!-- Clock -->
      <div class="text-right pl-2 border-l border-slate-200">
        <div id="liveClock" class="text-lg md:text-xl font-black text-slate-900 tabular-nums tracking-tight font-mono leading-none">
          --:--:--
        </div>
        <div id="liveDate" class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          -- ---
        </div>
      </div>
    </div>
  </header>

  <?php if ($CEDIS_PRESET !== 'all'): ?>
    <!-- Banner de modo TV por CEDIS -->
    <div class="bg-blue-600 text-white px-4 py-1 flex items-center justify-between text-xs font-bold shadow-sm shrink-0">
      <div class="flex items-center gap-2">
        <span class="bg-white text-blue-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
          MODO TV CEDIS
        </span>
        <span>Estás visualizando exclusivamente las rutas y datos de: <strong><?= htmlspecialchars($currentCedis['name']) ?></strong></span>
      </div>
      <a href="<?= $relPath ?>index.php" class="text-white hover:text-blue-100 underline text-xs font-semibold">
        Ver Todos los CEDIS (Vista Gerente)
      </a>
    </div>
  <?php endif; ?>

  <!-- Main Viewport -->
  <main id="appViewport" class="flex-1 min-h-0 relative overflow-hidden bg-slate-100">
    
    <!-- Screen 0: Bitácora de Rutas -->
    <section id="screen-0" class="screen-panel absolute inset-0 flex flex-col p-4 overflow-hidden">
      <!-- KPI Cards Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 shrink-0">
        <div class="bg-white rounded-xl border border-slate-200 p-3.5 border-l-4 border-l-blue-500 shadow-sm">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Rutas en Operación</span>
          <span id="kpiTotalRutas" class="text-2xl lg:text-3xl font-black text-slate-900 font-mono">--</span>
          <span class="text-[11px] text-slate-500 font-medium block mt-0.5">En monitoreo hoy</span>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-3.5 border-l-4 border-l-rose-500 shadow-sm">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Sin Licencia</span>
          <span id="kpiSinLicencia" class="text-2xl lg:text-3xl font-black text-rose-600 font-mono">--</span>
          <span class="text-[11px] text-slate-500 font-medium block mt-0.5">Alertas de operador</span>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-3.5 border-l-4 border-l-emerald-500 shadow-sm">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Liquidadas</span>
          <span id="kpiLiquidadas" class="text-2xl lg:text-3xl font-black text-emerald-600 font-mono">--</span>
          <span class="text-[11px] text-slate-500 font-medium block mt-0.5">Completadas hoy</span>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-3.5 border-l-4 border-l-amber-500 shadow-sm">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Recorrido Promedio</span>
          <span id="kpiPromKm" class="text-2xl lg:text-3xl font-black text-slate-900 font-mono">-- km</span>
          <span class="text-[11px] text-slate-500 font-medium block mt-0.5">Kilometraje por unidad</span>
        </div>
      </div>

      <!-- Controls sub-bar -->
      <div class="flex justify-between items-center py-1.5 px-3 mb-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 shrink-0">
        <div class="flex items-center gap-2">
          <span id="bitacoraSubtitle" class="font-bold text-slate-800">Cargando rutas...</span>
          <span>•</span>
          <span id="scrollStatusBadge" class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-bold border border-blue-200">
            Iniciando
          </span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-slate-500">Velocidad:</span>
          <div class="flex gap-1">
            <button onclick="setScrollSpeed(50)" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">Normal</button>
            <button onclick="setScrollSpeed(75)" class="px-2 py-0.5 rounded bg-blue-600 text-white font-bold">Rápido</button>
            <button onclick="setScrollSpeed(110)" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">Muy Rápido</button>
          </div>
          <span id="scrollPctLabel" class="font-mono font-bold text-slate-700">0%</span>
        </div>
      </div>

      <!-- Auto-scrollable Routes Container -->
      <div id="bitacoraContainer" class="flex-1 overflow-y-auto pr-1 pb-16 no-scrollbar">
        <div id="routesGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          <!-- Se llena dinámicamente con las rutas -->
        </div>
      </div>

      <!-- Live Broadcast Marquee -->
      <div class="absolute bottom-2 left-4 right-4 h-9 bg-white rounded-xl text-slate-800 flex items-center overflow-hidden shadow-md border border-slate-200 z-40">
        <div class="bg-red-600 px-3 h-full flex items-center font-black text-xs uppercase tracking-wider text-white shrink-0">
          Avisos
        </div>
        <div id="marqueeContent" class="whitespace-nowrap animate-marquee flex gap-12 text-xs font-semibold px-4 tracking-wide text-slate-700">
          <span>🚚 Conexión activa con el sistema central de bitácora y monitoreo satelital en tiempo real.</span>
        </div>
      </div>
    </section>

    <!-- Screen 1: Visitas y Rendimiento -->
    <section id="screen-1" class="screen-panel absolute inset-0 hidden flex-col p-4 overflow-hidden">
      <div class="mb-2">
        <h2 class="text-xl font-black text-slate-900 tracking-tight uppercase">Rendimiento de Ruta y Visitas</h2>
        <p class="text-xs text-slate-500 font-semibold">Efectividad de ventas y cobertura de clientes programados</p>
      </div>
      <div id="visitasGrid" class="flex-1 min-h-0 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <!-- Relleno dinámico -->
      </div>
    </section>

    <!-- Screen 2: Proyección de Litros -->
    <section id="screen-2" class="screen-panel absolute inset-0 hidden flex-col p-4 overflow-hidden">
      <div class="mb-2">
        <h2 class="text-xl font-black text-slate-900 tracking-tight uppercase">Proyección de Litros por Familia</h2>
        <p class="text-xs text-slate-500 font-semibold">Volumen de entrega proyectado para la jornada</p>
      </div>
      <div id="litrosGrid" class="flex-1 min-h-0 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <!-- Relleno dinámico -->
      </div>
    </section>

    <!-- Screen 3: Litros Vendidos -->
    <section id="screen-3" class="screen-panel absolute inset-0 hidden flex-col p-4 overflow-hidden">
      <div class="mb-2">
        <h2 class="text-xl font-black text-slate-900 tracking-tight uppercase">Volumen Vendido Efectivo (Hoy)</h2>
        <p class="text-xs text-slate-500 font-semibold">Litros facturados y entregados en ruta</p>
      </div>
      <div id="vendidosGrid" class="flex-1 min-h-0 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <!-- Relleno dinámico -->
      </div>
    </section>

    <!-- Screen 4: Cancelaciones -->
    <section id="screen-4" class="screen-panel absolute inset-0 hidden flex-col p-4 overflow-hidden">
      <div class="mb-2">
        <h2 class="text-xl font-black text-slate-900 tracking-tight uppercase">Cancelaciones e Incidencias por Tipo</h2>
        <p class="text-xs text-slate-500 font-semibold">Control de movimientos y rutas con cancelaciones</p>
      </div>
      <div id="cancelacionesGrid" class="flex-1 min-h-0 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <!-- Relleno dinámico -->
      </div>
    </section>

  </main>

  <script>
    // Configuración global inyectada desde PHP
    const SELECTED_CEDIS = <?= json_encode($CEDIS_PRESET) ?>;
    const CEDIS_PREFIX = <?= json_encode($currentCedis['prefix']) ?>;
    const API_BASE = <?= json_encode($relPath) ?>;
    const REAL_CITIES = ['Obregon', 'Hermosillo', 'Navojoa', 'Nogales', 'Caborca', 'Guaymas'];

    let currentScreen = 0;
    let isPaused = false;
    let tvZoom = 1;
    let scrollSpeed = 75; // px/segundo
    let screenTimer = null;
    let scrollAnimationId = null;

    // Reloj en tiempo real
    function updateClock() {
      const now = new Date();
      document.getElementById('liveClock').textContent = now.toLocaleTimeString('es-MX', { hour12: false });
      document.getElementById('liveDate').textContent = now.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Pantalla completa para TV
    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        document.getElementById('fsIcon').textContent = '🗗';
      } else {
        document.exitFullscreen().catch(() => {});
        document.getElementById('fsIcon').textContent = '⛶';
      }
    }

    // Zoom para TV
    function setTvZoom(scale) {
      tvZoom = scale;
      document.getElementById('appViewport').style.zoom = scale;
      document.querySelectorAll('.zoom-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white', 'shadow-sm');
        btn.classList.add('text-slate-600');
      });
      if (scale === 1) document.getElementById('btn-zoom-1').classList.add('bg-blue-600', 'text-white', 'shadow-sm');
      if (scale === 1.15) document.getElementById('btn-zoom-115').classList.add('bg-blue-600', 'text-white', 'shadow-sm');
      if (scale === 1.3) document.getElementById('btn-zoom-130').classList.add('bg-blue-600', 'text-white', 'shadow-sm');
    }

    // Cambiar de CEDIS
    function changeCedis(newCedis) {
      if (newCedis === 'all') {
        window.location.href = API_BASE + 'index.php';
      } else {
        window.location.href = API_BASE + newCedis + '/index.php';
      }
    }

    // Pausar / Reanudar
    function togglePause() {
      isPaused = !isPaused;
      const btn = document.getElementById('pauseBtn');
      if (isPaused) {
        btn.textContent = '▶';
        btn.classList.add('bg-amber-100', 'text-amber-800', 'border-amber-300');
      } else {
        btn.textContent = '⏸';
        btn.classList.remove('bg-amber-100', 'text-amber-800', 'border-amber-300');
      }
    }

    // Navegar entre pantallas
    function goToScreen(index) {
      if (scrollAnimationId) cancelAnimationFrame(scrollAnimationId);
      if (screenTimer) clearTimeout(screenTimer);

      document.querySelectorAll('.screen-panel').forEach((el, idx) => {
        if (idx === index) el.classList.remove('hidden');
        else el.classList.add('hidden');
      });

      document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
        if (idx === index) {
          btn.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
          btn.classList.remove('text-slate-600', 'hover:bg-white');
        } else {
          btn.classList.remove('bg-blue-600', 'text-white', 'shadow-sm');
          btn.classList.add('text-slate-600', 'hover:bg-white');
        }
      });

      currentScreen = index;
      resetProgressBar();

      if (index === 0) {
        runBitacoraScroll();
      } else {
        startStandardScreenTimer(15000);
      }
    }

    function resetProgressBar() {
      const bar = document.getElementById('topProgressBar');
      bar.style.transition = 'none';
      bar.style.width = '0%';
    }

    function startStandardScreenTimer(durationMs) {
      const bar = document.getElementById('topProgressBar');
      setTimeout(() => {
        bar.style.transition = `width ${durationMs}ms linear`;
        bar.style.width = '100%';
      }, 50);

      screenTimer = setTimeout(() => {
        if (!isPaused) {
          goToScreen((currentScreen + 1) % 5);
        } else {
          startStandardScreenTimer(durationMs);
        }
      }, durationMs);
    }

    // Lógica de auto-scroll en pantalla 0 (Bitácora)
    function runBitacoraScroll() {
      const container = document.getElementById('bitacoraContainer');
      const badge = document.getElementById('scrollStatusBadge');
      const pctLabel = document.getElementById('scrollPctLabel');
      const topBar = document.getElementById('topProgressBar');

      container.scrollTop = 0;
      pctLabel.textContent = '0%';
      topBar.style.transition = 'none';
      topBar.style.width = '0%';
      badge.textContent = 'Inicio (Pausa 2s)';

      setTimeout(() => {
        if (currentScreen !== 0) return;
        badge.textContent = 'Desplazando abajo';
        let lastTime = performance.now();

        function step(now) {
          if (currentScreen !== 0) return;
          const dt = (now - lastTime) / 1000;
          lastTime = now;

          if (!isPaused) {
            const maxScroll = container.scrollHeight - container.clientHeight;
            if (maxScroll <= 10) {
              badge.textContent = 'Todas visibles';
              pctLabel.textContent = '100%';
              topBar.style.width = '100%';
              screenTimer = setTimeout(() => goToScreen(1), 10000);
              return;
            }

            if (container.scrollTop >= maxScroll - 4) {
              container.scrollTop = maxScroll;
              pctLabel.textContent = '100%';
              topBar.style.width = '100%';
              badge.textContent = 'Fin de lista (4s)';
              screenTimer = setTimeout(() => {
                goToScreen(1);
              }, 4000);
              return;
            } else {
              container.scrollTop += scrollSpeed * dt;
              const currentMax = container.scrollHeight - container.clientHeight;
              const pct = Math.min(99, Math.round((container.scrollTop / currentMax) * 100));
              pctLabel.textContent = pct + '%';
              topBar.style.width = pct + '%';
            }
          }

          scrollAnimationId = requestAnimationFrame(step);
        }

        scrollAnimationId = requestAnimationFrame(step);
      }, 2000);
    }

    function setScrollSpeed(speed) {
      scrollSpeed = speed;
    }

    // Carga de datos AJAX
    async function loadAllData() {
      try {
        const [bitacora, visitas, litros, vendidos, canc] = await Promise.all([
          fetch(API_BASE + 'api_bitacora.php').then(r => r.json()).catch(() => null),
          fetch(API_BASE + 'api_visitas.php').then(r => r.json()).catch(() => null),
          fetch(API_BASE + 'api_litros.php').then(r => r.json()).catch(() => null),
          fetch(API_BASE + 'api_litros_vendidos.php').then(r => r.json()).catch(() => null),
          fetch(API_BASE + 'api_cancelaciones.php').then(r => r.json()).catch(() => null)
        ]);

        if (bitacora) renderBitacora(bitacora);
        if (visitas) renderVisitas(visitas);
        if (litros) renderLitros(litros);
        if (vendidos) renderVendidos(vendidos);
        if (canc) renderCancelaciones(canc);
      } catch (e) {
        console.error('Error cargando datos', e);
      }
    }

    function renderBitacora(data) {
      let rows = data?.data || [];
      
      // Filtrar por prefijo de CEDIS si aplica
      if (CEDIS_PREFIX) {
        rows = rows.filter(r => String(r.ruta || '').startsWith(CEDIS_PREFIX));
      }

      document.getElementById('kpiTotalRutas').textContent = rows.length;
      document.getElementById('bitacoraSubtitle').textContent = `Mostrando ${rows.length} unidades`;

      const sinLic = rows.filter(r => r.tieneLic === 'Sin Licencia').length;
      document.getElementById('kpiSinLicencia').textContent = sinLic;

      const liq = rows.filter(r => !!r.horaLiquidacion).length;
      document.getElementById('kpiLiquidadas').textContent = `${liq} / ${rows.length}`;

      const totalKm = rows.reduce((acc, r) => acc + (parseFloat(r.kmRecorrido) || 0), 0);
      const avgKm = rows.length > 0 ? Math.round(totalKm / rows.length) : 0;
      document.getElementById('kpiPromKm').textContent = `${avgKm} km`;

      const grid = document.getElementById('routesGrid');
      grid.innerHTML = '';

      if (rows.length === 0) {
        grid.innerHTML = '<div class="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 font-bold">No hay rutas registradas actualmente para este CEDIS.</div>';
        return;
      }

      rows.forEach(r => {
        const isSinLic = r.tieneLic === 'Sin Licencia';
        const isLiq = !!r.horaLiquidacion;
        const formatTime = (t) => t ? (t.includes(' ') ? t.split(' ')[1].substring(0, 5) : t.substring(0, 5)) : '--:--';

        const card = document.createElement('div');
        card.className = `rounded-xl border p-3 flex flex-col justify-between shadow-sm transition-all ${
          isSinLic 
            ? 'bg-rose-50 border-rose-300' 
            : isLiq 
              ? 'bg-emerald-50/70 border-emerald-300' 
              : 'bg-white border-slate-200'
        }`;

        card.innerHTML = `
          <div class="flex justify-between items-center pb-2 border-b border-slate-200">
            <span class="text-base font-black text-slate-900 font-mono">Ruta ${r.ruta}</span>
            ${isSinLic ? 
              '<span class="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full">Sin Lic.</span>' :
              (isLiq ? 
                '<span class="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">Liquidada</span>' : 
                '<span class="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">En Ruta</span>'
              )
            }
          </div>
          <div class="py-2 space-y-1 text-xs font-mono">
            <div class="flex justify-between"><span class="text-slate-500 font-sans">Salida:</span><span class="font-bold text-slate-800">${formatTime(r.horaSalida)}</span></div>
            <div class="flex justify-between"><span class="text-slate-500 font-sans">Almacén:</span><span class="font-bold ${r.enAlmacen ? 'text-amber-700' : 'text-slate-400'}">${formatTime(r.enAlmacen)}</span></div>
            <div class="flex justify-between"><span class="text-slate-500 font-sans">Liquidación:</span><span class="font-bold px-1.5 py-0.5 rounded text-[11px] ${isLiq ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}">${isLiq ? formatTime(r.horaLiquidacion) : 'Pendiente'}</span></div>
          </div>
          <div class="pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-bold font-mono">
            <span class="text-emerald-700">${r.kmRecorrido ? Math.round(r.kmRecorrido) + ' km' : '-- km'}</span>
            <span class="text-amber-700">${r.temSalida ? parseFloat(r.temSalida).toFixed(1) + '°C' : '--'}</span>
          </div>
        `;
        grid.appendChild(card);
      });
    }

    function renderVisitas(data) {
      const container = document.getElementById('visitasGrid');
      container.innerHTML = '';
      const ciudades = Object.keys(data).length > 0 ? Object.keys(data) : REAL_CITIES;

      ciudades.forEach(c => {
        const stats = data[c] || {};
        const col = document.createElement('div');
        col.className = 'bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-sm';
        col.innerHTML = `
          <div class="flex justify-between items-center pb-2 mb-2 border-b border-slate-200">
            <h3 class="font-black text-slate-900 uppercase text-base">${c}</h3>
            <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Sucursal</span>
          </div>
          <div class="space-y-2">
            <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span class="text-[10px] font-bold uppercase text-slate-500 block">Efectividad</span>
              <span class="text-2xl font-black text-emerald-600 font-mono">${stats.efectividadVentas || 0}%</span>
              <span class="text-[10px] text-slate-500 block mt-0.5">${stats.ventas || 0} ventas</span>
            </div>
            <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span class="text-[10px] font-bold uppercase text-slate-500 block">Cobertura</span>
              <span class="text-2xl font-black text-blue-600 font-mono">${stats.coberturaVisitas || 0}%</span>
              <span class="text-[10px] text-slate-500 block mt-0.5">${stats.visitas || 0} clientes</span>
            </div>
            <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center text-xs font-mono">
              <div><span class="text-[10px] text-slate-500 block">Día:</span><span class="font-bold text-slate-900">${stats.clientesDelDia || '--'}</span></div>
              <div class="text-right"><span class="text-[10px] text-slate-500 block">Padrón:</span><span class="font-bold text-slate-500">${stats.clientesTotales || '--'}</span></div>
            </div>
          </div>
        `;
        container.appendChild(col);
      });
    }

    function renderLitros(data) {
      const container = document.getElementById('litrosGrid');
      container.innerHTML = '';
      const ciudades = Object.keys(data?.data || {}).length > 0 ? Object.keys(data.data) : REAL_CITIES;

      ciudades.forEach(c => {
        const items = data?.data?.[c] || [];
        const total = items.reduce((acc, it) => acc + (parseFloat(it.litros) || 0), 0);

        const col = document.createElement('div');
        col.className = 'bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-sm';
        col.innerHTML = `
          <div class="flex justify-between items-center pb-2 mb-2 border-b border-slate-200">
            <h3 class="font-black text-slate-900 uppercase text-base">${c}</h3>
            <span class="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Litros</span>
          </div>
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-center mb-2">
            <span class="text-[10px] font-bold uppercase text-blue-800 block">Total Proyectado</span>
            <span class="text-2xl font-black text-blue-900 font-mono">${Math.round(total).toLocaleString()} L</span>
          </div>
          <div class="space-y-1.5 flex-1 flex flex-col justify-around">
            ${items.slice(0, 4).map(it => `
              <div class="bg-slate-50 p-2 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                <span class="font-semibold text-slate-700 truncate max-w-[60%]">${it.nombre}</span>
                <span class="font-black text-slate-900 font-mono">${Math.round(it.litros).toLocaleString()} L</span>
              </div>
            `).join('')}
          </div>
        `;
        container.appendChild(col);
      });
    }

    function renderVendidos(data) {
      const container = document.getElementById('vendidosGrid');
      container.innerHTML = '';
      const ciudades = Object.keys(data?.data || {}).length > 0 ? Object.keys(data.data) : REAL_CITIES;

      ciudades.forEach(c => {
        const items = data?.data?.[c] || [];
        const total = items.reduce((acc, it) => acc + (parseFloat(it.litros) || 0), 0);

        const col = document.createElement('div');
        col.className = 'bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-sm';
        col.innerHTML = `
          <div class="flex justify-between items-center pb-2 mb-2 border-b border-slate-200">
            <h3 class="font-black text-slate-900 uppercase text-base">${c}</h3>
            <span class="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">Ventas</span>
          </div>
          <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center mb-2">
            <span class="text-[10px] font-bold uppercase text-emerald-800 block">Total Vendido</span>
            <span class="text-2xl font-black text-emerald-700 font-mono">${Math.round(total).toLocaleString()} L</span>
          </div>
          <div class="space-y-1.5 flex-1 flex flex-col justify-around">
            ${items.slice(0, 4).map(it => `
              <div class="bg-slate-50 p-2 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                <span class="font-semibold text-slate-700 truncate max-w-[60%]">${it.nombre}</span>
                <span class="font-black text-emerald-600 font-mono">${Math.round(it.litros).toLocaleString()} L</span>
              </div>
            `).join('')}
          </div>
        `;
        container.appendChild(col);
      });
    }

    function renderCancelaciones(data) {
      const container = document.getElementById('cancelacionesGrid');
      container.innerHTML = '';
      const ciudades = Object.keys(data?.data?.ciudades || {}).length > 0 ? Object.keys(data.data.ciudades) : REAL_CITIES;
      const tipos = ['6', '8', 'C', 'V'];

      ciudades.forEach(c => {
        const ciudadTipos = data?.data?.ciudades?.[c] || {};
        const col = document.createElement('div');
        col.className = 'bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-sm';
        col.innerHTML = `
          <div class="flex justify-between items-center pb-2 mb-2 border-b border-slate-200">
            <h3 class="font-black text-slate-900 uppercase text-base">${c}</h3>
            <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Incidencias</span>
          </div>
          <div class="grid grid-cols-2 gap-2 mb-2">
            ${tipos.map(t => {
              const stat = ciudadTipos[t] || { cancelados: 0, activos: 0 };
              const has = stat.cancelados > 0;
              return `
                <div class="rounded-xl p-2 border text-center ${has ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'}">
                  <span class="text-[10px] font-black text-slate-500 uppercase block">TIPO ${t}</span>
                  <span class="text-xl font-black font-mono ${has ? 'text-rose-600' : 'text-slate-400'}">${stat.cancelados}</span>
                </div>
              `;
            }).join('')}
          </div>
        `;
        container.appendChild(col);
      });
    }

    // Inicializar
    loadAllData();
    setInterval(loadAllData, 60000); // Refresca cada 60s
    goToScreen(0);
  </script>
</body>
</html>
