import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  CheckCircle, 
  Clock, 
  Pause, 
  Play, 
  Eye, 
  Download, 
  FolderArchive, 
  HelpCircle, 
  X, 
  Maximize, 
  Minimize, 
  ZoomIn, 
  Truck, 
  Check, 
  ChevronRight,
  Flame,
  Thermometer,
  Gauge,
  Building2,
  MapPin,
  Layers,
  Filter
} from 'lucide-react';
import YaquiLogo from './YaquiLogo';

const API_ENDPOINTS = {
  litros: '/api_litros.php',
  visitas: '/api_visitas.php',
  vendidos: '/api_litros_vendidos.php',
  cancelaciones: '/api_cancelaciones.php',
  bitacora: '/api_bitacora.php'
};

const SCREEN_NAMES = [
  '1. Bitácora de Rutas',
  '2. Rendimiento y Visitas',
  '3. Proyección de Litros',
  '4. Litros Vendidos',
  '5. Cancelaciones'
];

export const CEDIS_LIST = [
  { id: 'all', name: 'Todos los CEDIS (Gerencial)', short: 'Todos', prefix: null, code: 'ALL' },
  { id: 'obregon', name: 'CEDIS Cd. Obregón', short: 'Obregón', prefix: '1', code: '001', dbName: 'Obregon' },
  { id: 'hermosillo', name: 'CEDIS Hermosillo', short: 'Hermosillo', prefix: '2', code: '002', dbName: 'Hermosillo' },
  { id: 'navojoa', name: 'CEDIS Navojoa', short: 'Navojoa', prefix: '3', code: '003', dbName: 'Navojoa' },
  { id: 'nogales', name: 'CEDIS Nogales', short: 'Nogales', prefix: '4', code: '004', dbName: 'Nogales' },
  { id: 'caborca', name: 'CEDIS Caborca', short: 'Caborca', prefix: '5', code: '005', dbName: 'Caborca' },
  { id: 'guaymas', name: 'CEDIS Guaymas', short: 'Guaymas', prefix: '6', code: '006', dbName: 'Guaymas' }
];

const REAL_CITIES = ['Obregon', 'Hermosillo', 'Navojoa', 'Nogales', 'Caborca', 'Guaymas'];

// Header Component with Light Theme & Full TV Controls
const Header = ({ 
  title, 
  time, 
  currentScreen, 
  onSelectScreen, 
  isPaused, 
  onTogglePause,
  onOpenPhpModal,
  isFullscreen,
  onToggleFullscreen,
  tvScale,
  onChangeTvScale,
  customLogo,
  selectedCedis,
  onSelectCedis
}) => {
  const currentCedisObj = CEDIS_LIST.find(c => c.id === selectedCedis) || CEDIS_LIST[0];

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-2 flex flex-col md:flex-row md:items-center justify-between text-slate-800 shrink-0 shadow-sm select-none z-50 gap-2">
      {/* Brand & Dynamic Real Logo */}
      <div className="flex items-center gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-sm flex items-center justify-center h-11 md:h-12 w-auto min-w-[64px]">
          <YaquiLogo className="h-9 md:h-10 w-auto" customLogoSrc={customLogo} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-black text-slate-900 tracking-tight uppercase">
              {title}
            </h1>
            <span className="text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full tracking-wider animate-pulse shadow-sm">
              EN VIVO
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1 font-semibold text-blue-700">
              <MapPin className="w-3 h-3 text-blue-600" />
              {currentCedisObj.name}
            </span>
            <span>•</span>
            <span>Tablero Operativo</span>
          </div>
        </div>
      </div>

      {/* Screen Tabs / Quick Navigation */}
      <div className="hidden xl:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
        {SCREEN_NAMES.map((name, idx) => {
          const isActive = currentScreen === idx;
          return (
            <button
              key={idx}
              onClick={() => onSelectScreen(idx)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <span>{name}</span>
            </button>
          );
        })}
      </div>

      {/* CEDIS Selector + Right Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* CEDIS Dropdown / Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <Building2 className="w-3.5 h-3.5 text-blue-600 ml-1" />
          <select
            value={selectedCedis}
            onChange={(e) => onSelectCedis(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer pr-1 py-0.5"
            title="Seleccionar CEDIS o Ver Todos (Gerencial)"
          >
            {CEDIS_LIST.map((c) => (
              <option key={c.id} value={c.id} className="bg-white text-slate-800">
                {c.short} {c.prefix ? `(Rutas ${c.prefix}xx)` : '• Todo el Estado'}
              </option>
            ))}
          </select>
        </div>

        {/* TV Zoom Control */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-xs">
          <span className="text-[10px] text-slate-500 font-semibold">Zoom:</span>
          {[1, 1.15, 1.3].map((scale) => (
            <button
              key={scale}
              onClick={() => onChangeTvScale(scale)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                tvScale === scale ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
              title={`Ajustar zoom al ${Math.round(scale * 100)}%`}
            >
              {scale === 1 ? '100%' : scale === 1.15 ? '115%' : '130%'}
            </button>
          ))}
        </div>

        {/* Fullscreen TV Mode */}
        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
          title={isFullscreen ? "Salir de pantalla completa" : "Modo TV Pantalla Completa"}
        >
          {isFullscreen ? <Minimize className="w-4 h-4 text-amber-600" /> : <Maximize className="w-4 h-4 text-emerald-600" />}
        </button>

        {/* Rotation Pause/Play */}
        <button
          onClick={onTogglePause}
          className={`p-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all border ${
            isPaused 
              ? 'bg-amber-100 text-amber-800 border-amber-300' 
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
          title={isPaused ? "Reanudar auto-rotación de pantallas" : "Pausar auto-rotación"}
        >
          {isPaused ? <Play className="w-4 h-4 text-amber-600 fill-amber-600" /> : <Pause className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Help & Setup Modal (Explica carpetas por CEDIS) */}
        <button
          onClick={onOpenPhpModal}
          className="px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 transition-colors border border-blue-200"
          title="Ver cómo usar por CEDIS en TVs y descargar PHP"
        >
          <FolderArchive className="w-3.5 h-3.5" />
          <span className="hidden md:inline">CEDIS & PHP</span>
        </button>

        {/* Real-Time Clock */}
        <div className="text-right pl-2 border-l border-slate-200">
          <div className="text-lg md:text-xl font-black text-slate-900 tabular-nums tracking-tight font-mono leading-none">
            {time.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            {time.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
        </div>
      </div>
    </header>
  );
};

// Summary KPI Card for Light Theme
const SummaryCard = ({ title, value, subtitle, borderColor = "border-blue-500", icon: Icon, badgeColor = "bg-blue-50 text-blue-700" }) => (
  <div className={`bg-white rounded-xl border border-slate-200 p-3.5 lg:p-4 flex flex-col justify-between border-l-4 ${borderColor} shadow-sm`}>
    <div className="flex justify-between items-start mb-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</span>
      {Icon && <Icon className="w-4 h-4 text-slate-400" />}
    </div>
    <div className="text-2xl lg:text-3xl font-black text-slate-900 tabular-nums tracking-tight font-mono">
      {value}
    </div>
    {subtitle && <p className="text-[11px] font-medium text-slate-500 mt-1">{subtitle}</p>}
  </div>
);

// Route Card in Bitácora (Crisp Light Theme, readable from across the warehouse)
const RouteCard = ({ row }) => {
  const isSinLic = row.tieneLic === 'Sin Licencia';
  const isLiquidada = !!row.horaLiquidacion;
  const hasAlmacen = !!row.enAlmacen;
  
  const formatTime = (dtStr) => {
    if (!dtStr) return '--:--';
    if (dtStr.includes(' ')) {
      return dtStr.split(' ')[1].substring(0, 5);
    }
    return dtStr.substring(0, 5);
  };

  return (
    <div className={`rounded-xl border p-3 flex flex-col justify-between transition-all select-none shadow-sm hover:shadow-md ${
      isSinLic 
        ? 'bg-rose-50/90 border-rose-300' 
        : isLiquidada 
          ? 'bg-emerald-50/70 border-emerald-300' 
          : 'bg-white border-slate-200 hover:border-blue-300'
    }`}>
      {/* Route Header */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          <Truck className={`w-4 h-4 ${isLiquidada ? 'text-emerald-600' : isSinLic ? 'text-rose-600' : 'text-blue-600'}`} />
          <span className="text-base font-black text-slate-900 tracking-tight font-mono">Ruta {row.ruta}</span>
        </div>
        
        {isSinLic ? (
          <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <AlertTriangle className="w-3 h-3" /> Sin Lic.
          </span>
        ) : isLiquidada ? (
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> Liquidada
          </span>
        ) : (
          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full">
            En Ruta
          </span>
        )}
      </div>

      {/* Route Metrics Timeline */}
      <div className="py-2 space-y-1 text-xs font-mono">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-500 font-sans font-semibold">Salida:</span>
          <span className="font-bold text-slate-800">{formatTime(row.horaSalida)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-500 font-sans font-semibold">Almacén:</span>
          <span className={`font-bold ${hasAlmacen ? 'text-amber-700' : 'text-slate-400'}`}>
            {formatTime(row.enAlmacen)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-500 font-sans font-semibold">Liquidación:</span>
          <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
            isLiquidada 
              ? 'bg-emerald-100 text-emerald-900' 
              : 'bg-amber-100 text-amber-900'
          }`}>
            {isLiquidada ? formatTime(row.horaLiquidacion) : 'Pendiente'}
          </span>
        </div>
      </div>

      {/* Temperature & Km Footer */}
      <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-bold font-mono">
        <span className="text-emerald-700 flex items-center gap-1">
          <Gauge className="w-3.5 h-3.5 text-emerald-600" />
          {row.kmRecorrido ? `${Math.round(row.kmRecorrido)} km` : '-- km'}
        </span>
        <span className="text-amber-700 flex items-center gap-1">
          <Thermometer className="w-3.5 h-3.5 text-amber-600" />
          {row.temSalida ? `${parseFloat(row.temSalida).toFixed(1)}°C` : '--'}
        </span>
      </div>
    </div>
  );
};

// Screen 0: Bitácora de Rutas with Adaptive Auto-Scroll (Light Theme)
const ScreenBitacora = ({ 
  data, 
  time, 
  isActive, 
  onComplete, 
  currentScreen, 
  onSelectScreen, 
  isPaused, 
  onTogglePause,
  onScrollProgressUpdate,
  onOpenPhpModal,
  isFullscreen,
  onToggleFullscreen,
  tvScale,
  onChangeTvScale,
  customLogo,
  selectedCedis,
  onSelectCedis
}) => {
  const scrollContainerRef = useRef(null);
  const isHoveredRef = useRef(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [statusText, setStatusText] = useState("Iniciando...");
  const [scrollSpeed, setScrollSpeed] = useState(70);

  const speedRef = useRef(scrollSpeed);
  useEffect(() => {
    speedRef.current = scrollSpeed;
  }, [scrollSpeed]);

  // Filter routes by selected CEDIS prefix
  const currentCedisObj = CEDIS_LIST.find(c => c.id === selectedCedis) || CEDIS_LIST[0];
  const filteredRoutes = useMemo(() => {
    if (!data?.data) return [];
    if (selectedCedis === 'all' || !currentCedisObj.prefix) {
      return data.data;
    }
    return data.data.filter(r => {
      const rutaStr = String(r.ruta || '');
      return rutaStr.startsWith(currentCedisObj.prefix);
    });
  }, [data, selectedCedis, currentCedisObj]);

  useEffect(() => {
    if (!isActive) return;
    const container = scrollContainerRef.current;
    if (!container || !filteredRoutes.length) return;

    container.scrollTop = 0;
    setScrollProgress(0);
    if (onScrollProgressUpdate) onScrollProgressUpdate(0);
    setStatusText("Inicio de rutas (Pausa 2s)");

    let animationFrameId = null;
    let timerId = null;
    let completed = false;

    // Pause 2 seconds at top for operators to digest initial state
    timerId = setTimeout(() => {
      setStatusText("Desplazando hacia abajo");
      let lastTimestamp = performance.now();

      const step = (timestamp) => {
        if (!container || completed) return;

        const delta = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;

        if (!isHoveredRef.current && !isPaused) {
          const maxScroll = container.scrollHeight - container.clientHeight;

          if (maxScroll <= 15) {
            setStatusText("Todas las rutas visibles");
            if (onScrollProgressUpdate) onScrollProgressUpdate(100);
            timerId = setTimeout(() => {
              if (onComplete) onComplete();
            }, 12000);
            return;
          }

          if (container.scrollTop >= maxScroll - 4) {
            container.scrollTop = maxScroll;
            setScrollProgress(100);
            if (onScrollProgressUpdate) onScrollProgressUpdate(100);
            setStatusText("Fin de lista (Pausa 4s antes de rotar)");
            completed = true;

            timerId = setTimeout(() => {
              setStatusText("Completado - Cambiando pantalla...");
              if (onComplete) onComplete();
            }, 4000);
            return;
          } else {
            container.scrollTop += speedRef.current * delta;
            const currentMax = container.scrollHeight - container.clientHeight;
            const pct = Math.min(99, Math.round((container.scrollTop / currentMax) * 100));
            setScrollProgress(pct);
            if (onScrollProgressUpdate) onScrollProgressUpdate(pct);
          }
        }

        animationFrameId = requestAnimationFrame(step);
      };

      animationFrameId = requestAnimationFrame(step);
    }, 2000);

    return () => {
      if (timerId) clearTimeout(timerId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, filteredRoutes, isPaused]);

  if (!data?.data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-xl font-bold text-slate-500 bg-slate-100">
        <Activity className="w-10 h-10 text-blue-600 animate-spin mb-3" />
        Cargando bitácora de rutas...
      </div>
    );
  }

  const totalOperadas = filteredRoutes.length;
  const sinLicencia = filteredRoutes.filter(r => r.tieneLic === 'Sin Licencia').length;
  const liquidadas = filteredRoutes.filter(r => !!r.horaLiquidacion).length;
  const enRuta = totalOperadas - liquidadas;
  const avgKm = totalOperadas > 0 ? Math.round(filteredRoutes.reduce((acc, r) => acc + (Number(r.kmRecorrido) || 0), 0) / totalOperadas) : 0;

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden text-slate-800">
      <Header 
        title="Bitácora de Rutas - Monitoreo Operativo" 
        time={time} 
        currentScreen={currentScreen}
        onSelectScreen={onSelectScreen}
        isPaused={isPaused}
        onTogglePause={onTogglePause}
        onOpenPhpModal={onOpenPhpModal}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
        tvScale={tvScale}
        onChangeTvScale={onChangeTvScale}
        customLogo={customLogo}
        selectedCedis={selectedCedis}
        onSelectCedis={onSelectCedis}
      />

      {/* Mode Banner if Specific CEDIS is selected */}
      {selectedCedis !== 'all' && (
        <div className="bg-blue-600 text-white px-4 py-1.5 flex items-center justify-between text-xs font-bold shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-white text-blue-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
              MODO TV CEDIS
            </span>
            <span>Estás viendo exclusivamente las rutas de: <strong>{currentCedisObj.name}</strong></span>
          </div>
          <button 
            onClick={() => onSelectCedis('all')}
            className="text-white hover:text-blue-100 underline text-xs"
          >
            Ver todos los CEDIS (Vista Gerencial)
          </button>
        </div>
      )}
      
      {/* KPI Cards Row */}
      <div className="px-4 lg:px-6 pt-3 grid grid-cols-2 md:grid-cols-4 gap-3 mb-2 shrink-0">
        <SummaryCard 
          title="Rutas en Operación" 
          value={totalOperadas} 
          subtitle={selectedCedis === 'all' ? "Total registradas hoy (6 Plazas)" : `Rutas registradas en ${currentCedisObj.short}`}
          borderColor="border-blue-500"
          icon={Truck}
        />
        <SummaryCard 
          title="Sin Licencia" 
          value={sinLicencia} 
          subtitle="Alertas de operador" 
          borderColor="border-rose-500"
          icon={AlertTriangle}
        />
        <SummaryCard 
          title="Rutas Liquidadas" 
          value={`${liquidadas} / ${totalOperadas}`} 
          subtitle={`${enRuta} unidades aún en ruta`} 
          borderColor="border-emerald-500"
          icon={CheckCircle}
        />
        <SummaryCard 
          title="Recorrido Promedio" 
          value={`${avgKm} km`} 
          subtitle="Kilometraje por unidad" 
          borderColor="border-amber-500"
          icon={Gauge}
        />
      </div>

      {/* Subheader: Auto-scroll progress & Speed Controls */}
      <div className="px-4 lg:px-6 py-1.5 flex flex-wrap justify-between items-center gap-2 text-xs font-semibold text-slate-500 shrink-0 bg-white/80 border-y border-slate-200">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-800">Mostrando {totalOperadas} unidades</span>
          <span className="text-slate-300">•</span>
          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 font-mono font-bold">
            {statusText}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
            <span className="text-slate-500 px-1.5 font-medium">Velocidad TV:</span>
            {[
              { label: 'Normal', speed: 50 },
              { label: 'Rápido', speed: 75 },
              { label: 'Muy Rápido', speed: 110 }
            ].map((sp) => (
              <button 
                key={sp.speed}
                onClick={() => setScrollSpeed(sp.speed)}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  scrollSpeed === sp.speed 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>

          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 ease-out" 
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
          <span className="font-mono font-bold text-slate-700">{scrollProgress}%</span>
        </div>
      </div>

      {/* Auto-Scrollable Routes Grid */}
      <div className="flex-1 min-h-0 px-4 lg:px-6 pb-12 overflow-hidden flex flex-col pt-3">
        <div 
          ref={scrollContainerRef} 
          onMouseEnter={() => { isHoveredRef.current = true; }}
          onMouseLeave={() => { isHoveredRef.current = false; }}
          className="flex-1 overflow-y-auto pr-1 pb-16 no-scrollbar"
        >
          {filteredRoutes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              No hay rutas registradas actualmente para este CEDIS.
            </div>
          ) : (
            <div className={`grid gap-3 ${
              selectedCedis === 'all' 
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7' 
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5'
            }`}>
              {filteredRoutes.map((row, idx) => (
                <RouteCard key={idx} row={row} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Alert Ticker */}
      <div className="absolute bottom-2 left-0 right-0 h-9 bg-white rounded-xl mx-4 lg:mx-6 text-slate-800 flex items-center overflow-hidden shadow-md border border-slate-200 z-40">
        <div className="bg-red-600 px-3 h-full flex items-center font-black text-xs uppercase tracking-wider text-white shrink-0">
          Avisos
        </div>
        <div className="whitespace-nowrap animate-marquee flex gap-12 text-xs font-semibold px-4 tracking-wide text-slate-700">
          {filteredRoutes.filter(r => r.observaciones && r.observaciones !== 'Ninguna').map((row, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <span className="text-amber-600 font-bold">⚠️ Ruta {row.ruta}:</span>
              <span className="text-slate-800">{row.observaciones}</span>
            </span>
          ))}
          {filteredRoutes.filter(r => r.observaciones && r.observaciones !== 'Ninguna').length === 0 && (
            <span>🚚 Todas las unidades operando en itinerario normal con enlace satelital activo en tiempo real.</span>
          )}
        </div>
      </div>
      
      <style>{`
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
      `}</style>
    </div>
  );
};

// Generic City Column container for Light Theme
const CityColumnTV = ({ ciudad, children, badge = "Plaza" }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 lg:p-5 flex flex-col h-full overflow-hidden shadow-sm">
    <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-200">
      <h2 className="text-base lg:text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5">
        <MapPin className="w-4 h-4 text-blue-600" />
        {ciudad}
      </h2>
      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
        {badge}
      </span>
    </div>
    <div className="flex-1 flex flex-col justify-around gap-2.5 overflow-hidden">
      {children}
    </div>
  </div>
);

// Generic Data Grid Screen Container (Light Theme)
const DataGridScreenTV = ({ 
  title, 
  time, 
  currentScreen, 
  onSelectScreen, 
  isPaused, 
  onTogglePause, 
  onOpenPhpModal, 
  isFullscreen,
  onToggleFullscreen,
  tvScale,
  onChangeTvScale,
  customLogo,
  selectedCedis,
  onSelectCedis,
  children 
}) => {
  const currentCedisObj = CEDIS_LIST.find(c => c.id === selectedCedis) || CEDIS_LIST[0];

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden text-slate-800">
      <Header 
        title={title} 
        time={time} 
        currentScreen={currentScreen}
        onSelectScreen={onSelectScreen}
        isPaused={isPaused}
        onTogglePause={onTogglePause}
        onOpenPhpModal={onOpenPhpModal}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
        tvScale={tvScale}
        onChangeTvScale={onChangeTvScale}
        customLogo={customLogo}
        selectedCedis={selectedCedis}
        onSelectCedis={onSelectCedis}
      />

      {/* Mode Banner if Specific CEDIS is selected */}
      {selectedCedis !== 'all' && (
        <div className="bg-blue-600 text-white px-4 py-1.5 flex items-center justify-between text-xs font-bold shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-white text-blue-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
              MODO TV CEDIS
            </span>
            <span>Vista exclusiva para la pantalla de <strong>{currentCedisObj.name}</strong></span>
          </div>
          <button 
            onClick={() => onSelectCedis('all')}
            className="text-white hover:text-blue-100 underline text-xs"
          >
            Ver todos los CEDIS (Gerencial)
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 p-3 lg:p-5 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

// Screen 1: Rendimiento y Visitas (Supports All Plazas or Single Focused CEDIS)
const ScreenVisitas = (props) => {
  const { data, selectedCedis } = props;
  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center text-xl font-bold text-slate-500 bg-slate-100">
        <Activity className="w-8 h-8 text-blue-600 animate-spin mr-3" />
        Cargando rendimiento de visitas...
      </div>
    );
  }

  const currentCedisObj = CEDIS_LIST.find(c => c.id === selectedCedis) || CEDIS_LIST[0];

  // If specific CEDIS selected, show rich single-CEDIS dashboard
  if (selectedCedis !== 'all' && currentCedisObj.dbName) {
    const stats = data[currentCedisObj.dbName] || {
      ventas: 0,
      visitas: 0,
      clientesDelDia: 0,
      clientesTotales: 0,
      efectividadVentas: 0,
      coberturaVisitas: 0
    };

    return (
      <DataGridScreenTV {...props} title={`Rendimiento y Visitas - ${currentCedisObj.name}`}>
        <div className="h-full flex flex-col justify-center max-w-5xl mx-auto gap-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Efectividad Ventas</span>
              <div className="text-4xl lg:text-5xl font-black text-emerald-600 font-mono">
                {stats.efectividadVentas || Math.round((stats.ventas / (stats.clientesDelDia || 1)) * 100)}%
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">{stats.ventas} ventas concretadas</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Cobertura de Visitas</span>
              <div className="text-4xl lg:text-5xl font-black text-blue-600 font-mono">
                {stats.coberturaVisitas || Math.round((stats.visitas / (stats.clientesDelDia || 1)) * 100)}%
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">{stats.visitas} clientes visitados</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Clientes Programados Hoy</span>
              <div className="text-4xl lg:text-5xl font-black text-slate-900 font-mono">
                {stats.clientesDelDia || '--'}
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">En itinerario del día</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Padrón de Clientes</span>
              <div className="text-4xl lg:text-5xl font-black text-slate-700 font-mono">
                {stats.clientesTotales || '--'}
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Clientes registrados en plaza</p>
            </div>
          </div>

          {/* Visual Progress Bar Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Avance de Cobertura en Ruta ({currentCedisObj.short})</span>
            </h3>
            
            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span className="text-slate-600">Visitas Realizadas vs Programadas</span>
                <span className="text-blue-700">{stats.visitas} de {stats.clientesDelDia} ({stats.coberturaVisitas}%)</span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, stats.coberturaVisitas)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span className="text-slate-600">Efectividad de Venta</span>
                <span className="text-emerald-700">{stats.ventas} de {stats.clientesDelDia} ({stats.efectividadVentas}%)</span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, stats.efectividadVentas)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </DataGridScreenTV>
    );
  }

  // 6-City View for Executive / General Manager
  const ciudades = Object.keys(data).length > 0 ? Object.keys(data) : REAL_CITIES;

  return (
    <DataGridScreenTV {...props} title="Rendimiento de Ruta y Visitas (6 Plazas)">
      <div className="h-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4 overflow-hidden">
        {ciudades.map(ciudad => {
          const stats = data[ciudad];
          if (!stats) return null;
          return (
            <CityColumnTV key={ciudad} ciudad={ciudad} badge="Sucursal">
              {/* Efectividad Ventas */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Efectividad Ventas</div>
                <div className="text-2xl font-black text-emerald-600 font-mono">
                  {stats.efectividadVentas || Math.round((stats.ventas / (stats.clientesDelDia || 1)) * 100)}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {stats.ventas} ventas concretadas
                </div>
              </div>

              {/* Cobertura Visitas */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Cobertura Visitas</div>
                <div className="text-2xl font-black text-blue-600 font-mono">
                  {stats.coberturaVisitas || Math.round((stats.visitas / (stats.clientesDelDia || 1)) * 100)}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {stats.visitas} de {stats.clientesDelDia || stats.clientesTotales} clientes
                </div>
              </div>

              {/* Clientes Activos y Totales */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex justify-between items-center text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Clientes Día:</span>
                  <span className="font-bold text-slate-900 text-base">{stats.clientesDelDia || '--'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-sans block">Padrón Total:</span>
                  <span className="font-bold text-slate-500">{stats.clientesTotales || '--'}</span>
                </div>
              </div>
            </CityColumnTV>
          );
        })}
      </div>
    </DataGridScreenTV>
  );
};

// Screen 2: Proyección de Litros (Supports All Plazas or Single Focused CEDIS)
const ScreenLitros = (props) => {
  const { data, selectedCedis } = props;
  if (!data?.data) {
    return (
      <div className="flex-1 flex items-center justify-center text-xl font-bold text-slate-500 bg-slate-100">
        <Activity className="w-8 h-8 text-blue-600 animate-spin mr-3" />
        Cargando proyección de litros...
      </div>
    );
  }

  const currentCedisObj = CEDIS_LIST.find(c => c.id === selectedCedis) || CEDIS_LIST[0];

  // Single CEDIS view
  if (selectedCedis !== 'all' && currentCedisObj.dbName) {
    const items = data.data[currentCedisObj.dbName] || [];
    const totalPlaza = items.reduce((acc, it) => acc + (parseFloat(it.litros) || 0), 0);

    return (
      <DataGridScreenTV {...props} title={`Proyección de Litros - ${currentCedisObj.name}`}>
        <div className="h-full flex flex-col justify-center max-w-4xl mx-auto gap-5">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">Total Proyección del Día</span>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 font-mono mt-1">
                {Math.round(totalPlaza).toLocaleString()} <span className="text-2xl text-slate-500 font-sans">Litros</span>
              </h2>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-bold text-slate-500 block">Familias Activas</span>
              <span className="text-2xl font-black text-blue-600 font-mono">{items.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-500 block uppercase">Familia {item.familia}</span>
                  <span className="text-base font-black text-slate-800">{item.nombre}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-blue-700 font-mono block">
                    {Math.round(item.litros).toLocaleString()} L
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold">
                    {totalPlaza > 0 ? `${Math.round((item.litros / totalPlaza) * 100)}%` : '--'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DataGridScreenTV>
    );
  }

  // 6-City Grid View
  const ciudades = Object.keys(data.data).length > 0 ? Object.keys(data.data) : REAL_CITIES;

  return (
    <DataGridScreenTV {...props} title="Proyección de Litros por Familia (6 Plazas)">
      <div className="h-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4 overflow-hidden">
        {ciudades.map(ciudad => {
          const items = data.data[ciudad] || [];
          const totalPlaza = items.reduce((acc, it) => acc + (parseFloat(it.litros) || 0), 0);

          return (
            <CityColumnTV key={ciudad} ciudad={ciudad} badge="Proyección">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider block">Total Proyectado</span>
                <span className="text-2xl font-black text-blue-900 font-mono">{Math.round(totalPlaza).toLocaleString()} L</span>
              </div>

              <div className="space-y-2 overflow-y-auto no-scrollbar flex-1 flex flex-col justify-around">
                {items.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-700 truncate max-w-[60%]">{item.nombre}</span>
                    <span className="text-base font-black text-slate-900 font-mono">{Math.round(item.litros).toLocaleString()} L</span>
                  </div>
                ))}
              </div>
            </CityColumnTV>
          );
        })}
      </div>
    </DataGridScreenTV>
  );
};

// Screen 3: Litros Vendidos (Supports All Plazas or Single Focused CEDIS)
const ScreenVendidos = (props) => {
  const { data, selectedCedis } = props;
  if (!data?.data) {
    return (
      <div className="flex-1 flex items-center justify-center text-xl font-bold text-slate-500 bg-slate-100">
        <Activity className="w-8 h-8 text-blue-600 animate-spin mr-3" />
        Cargando volumen vendido...
      </div>
    );
  }

  const currentCedisObj = CEDIS_LIST.find(c => c.id === selectedCedis) || CEDIS_LIST[0];

  // Single CEDIS view
  if (selectedCedis !== 'all' && currentCedisObj.dbName) {
    const items = data.data[currentCedisObj.dbName] || [];
    const totalVendido = items.reduce((acc, it) => acc + (parseFloat(it.litros) || 0), 0);

    return (
      <DataGridScreenTV {...props} title={`Volumen Vendido Efectivo - ${currentCedisObj.name}`}>
        <div className="h-full flex flex-col justify-center max-w-4xl mx-auto gap-5">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Total Vendido Hoy</span>
              <h2 className="text-4xl lg:text-5xl font-black text-emerald-700 font-mono mt-1">
                {Math.round(totalVendido).toLocaleString()} <span className="text-2xl text-slate-500 font-sans">Litros</span>
              </h2>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-bold text-emerald-800 block">Efectivo Despachado</span>
              <span className="text-sm font-black text-emerald-700">En Ruta</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-500 block uppercase">Familia {item.familia}</span>
                  <span className="text-base font-black text-slate-800">{item.nombre}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-600 font-mono block">
                    {Math.round(item.litros).toLocaleString()} L
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold">
                    {totalVendido > 0 ? `${Math.round((item.litros / totalVendido) * 100)}%` : '--'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DataGridScreenTV>
    );
  }

  // 6-City Grid View
  const ciudades = Object.keys(data.data).length > 0 ? Object.keys(data.data) : REAL_CITIES;

  return (
    <DataGridScreenTV {...props} title="Volumen Vendido Efectivo (Hoy - 6 Plazas)">
      <div className="h-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4 overflow-hidden">
        {ciudades.map(ciudad => {
          const items = data.data[ciudad] || [];
          const totalVendido = items.reduce((acc, it) => acc + (parseFloat(it.litros) || 0), 0);

          return (
            <CityColumnTV key={ciudad} ciudad={ciudad} badge="Ventas">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Total Vendido</span>
                <span className="text-2xl font-black text-emerald-700 font-mono">{Math.round(totalVendido).toLocaleString()} L</span>
              </div>

              <div className="space-y-2 overflow-y-auto no-scrollbar flex-1 flex flex-col justify-around">
                {items.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-700 truncate max-w-[60%]">{item.nombre}</span>
                    <span className="text-base font-black text-emerald-600 font-mono">{Math.round(item.litros).toLocaleString()} L</span>
                  </div>
                ))}
              </div>
            </CityColumnTV>
          );
        })}
      </div>
    </DataGridScreenTV>
  );
};

// Screen 4: Cancelaciones por Tipo (Supports All Plazas or Single Focused CEDIS)
const ScreenCancelaciones = (props) => {
  const { data, selectedCedis } = props;
  if (!data?.data?.ciudades) {
    return (
      <div className="flex-1 flex items-center justify-center text-xl font-bold text-slate-500 bg-slate-100">
        <Activity className="w-8 h-8 text-blue-600 animate-spin mr-3" />
        Cargando cancelaciones...
      </div>
    );
  }

  const currentCedisObj = CEDIS_LIST.find(c => c.id === selectedCedis) || CEDIS_LIST[0];
  const tipos = ['6', '8', 'C', 'V'];

  // Single CEDIS view
  if (selectedCedis !== 'all' && currentCedisObj.dbName) {
    const ciudadTipos = data.data.ciudades[currentCedisObj.dbName] || {};
    const rutasCanceladas = data.data.rutas?.[currentCedisObj.dbName] || [];

    return (
      <DataGridScreenTV {...props} title={`Incidencias y Cancelaciones - ${currentCedisObj.name}`}>
        <div className="h-full flex flex-col justify-center max-w-4xl mx-auto gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {tipos.map(tipo => {
              const stat = ciudadTipos[tipo] || { activos: 0, cancelados: 0 };
              const hasCanc = stat.cancelados > 0;
              return (
                <div 
                  key={tipo}
                  className={`rounded-2xl p-5 border text-center shadow-sm ${
                    hasCanc ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1">MOVIMIENTO TIPO {tipo}</span>
                  <div className={`text-4xl font-black font-mono ${hasCanc ? 'text-rose-600' : 'text-slate-400'}`}>
                    {stat.cancelados}
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">de {stat.activos} transacciones</span>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-base mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Rutas con Incidencias en {currentCedisObj.short}</span>
            </h3>
            {rutasCanceladas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {rutasCanceladas.map((r, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono">
                    <span className="font-bold text-slate-800">Ruta {r.ruta}</span>
                    <span className="text-rose-600 font-black bg-rose-100 px-2 py-0.5 rounded text-xs">
                      {r.cancelados} cancelaciones
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Excelente: Cero cancelaciones registradas hoy en este CEDIS.</span>
              </div>
            )}
          </div>
        </div>
      </DataGridScreenTV>
    );
  }

  // 6-City Grid View
  const ciudades = Object.keys(data.data.ciudades).length > 0 ? Object.keys(data.data.ciudades) : REAL_CITIES;

  return (
    <DataGridScreenTV {...props} title="Cancelaciones por Tipo de Movimiento (6 Plazas)">
      <div className="h-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4 overflow-hidden">
        {ciudades.map(ciudad => {
          const ciudadTipos = data.data.ciudades[ciudad] || {};
          const rutasCanceladas = data.data.rutas?.[ciudad] || [];

          return (
            <CityColumnTV key={ciudad} ciudad={ciudad} badge="Incidencias">
              {/* Grid of Tipos */}
              <div className="grid grid-cols-2 gap-2">
                {tipos.map(tipo => {
                  const stat = ciudadTipos[tipo] || { activos: 0, cancelados: 0 };
                  const hasCanc = stat.cancelados > 0;

                  return (
                    <div 
                      key={tipo} 
                      className={`rounded-xl p-2 border flex flex-col items-center justify-center text-center ${
                        hasCanc 
                          ? 'bg-rose-50 border-rose-300' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-[10px] font-black text-slate-500 uppercase">TIPO {tipo}</span>
                      <span className={`text-xl font-black font-mono ${hasCanc ? 'text-rose-600' : 'text-slate-400'}`}>
                        {stat.cancelados}
                      </span>
                      <span className="text-[9px] text-slate-500">de {stat.activos}</span>
                    </div>
                  );
                })}
              </div>

              {/* Top Cancelled Routes per City */}
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Top Rutas con Incidencias
                </span>
                {rutasCanceladas.length > 0 ? (
                  <div className="space-y-1">
                    {rutasCanceladas.slice(0, 3).map((r, i) => (
                      <div key={i} className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-700">Ruta {r.ruta}</span>
                        <span className="text-rose-600 font-bold bg-rose-100 px-1.5 py-0.5 rounded text-[10px]">
                          {r.cancelados} canc.
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
                    <Check className="w-3.5 h-3.5" /> 0 cancelaciones
                  </div>
                )}
              </div>
            </CityColumnTV>
          );
        })}
      </div>
    </DataGridScreenTV>
  );
};

// Main Application Component
function App() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(new Date());
  const [bitacoraScrollPct, setBitacoraScrollPct] = useState(0);
  const [showPhpModal, setShowPhpModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tvScale, setTvScale] = useState(1);
  const [customLogo, setCustomLogo] = useState(null);

  // CEDIS selection: 'all', 'obregon', 'hermosillo', 'navojoa', 'nogales', 'caborca', 'guaymas'
  const [selectedCedis, setSelectedCedis] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const cedisParam = urlParams.get('cedis') || urlParams.get('plaza');
      if (cedisParam) {
        const found = CEDIS_LIST.find(c => c.id === cedisParam.toLowerCase() || c.prefix === cedisParam);
        if (found) return found.id;
      }
    }
    return 'all';
  });
  
  const [dataLitros, setDataLitros] = useState(null);
  const [dataVisitas, setDataVisitas] = useState(null);
  const [dataVendidos, setDataVendidos] = useState(null);
  const [dataCancelaciones, setDataCancelaciones] = useState(null);
  const [dataBitacora, setDataBitacora] = useState(null);

  // Fullscreen toggle for TV displays
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const fetchAllData = async () => {
    try {
      const [l, v, vend, c, b] = await Promise.all([
        fetch(API_ENDPOINTS.litros).then(r => r.json()).catch(() => null),
        fetch(API_ENDPOINTS.visitas).then(r => r.json()).catch(() => null),
        fetch(API_ENDPOINTS.vendidos).then(r => r.json()).catch(() => null),
        fetch(API_ENDPOINTS.cancelaciones).then(r => r.json()).catch(() => null),
        fetch(API_ENDPOINTS.bitacora).then(r => r.json()).catch(() => null),
      ]);
      if (l) setDataLitros(l);
      if (v) setDataVisitas(v);
      if (vend) setDataVendidos(vend);
      if (c) setDataCancelaciones(c);
      if (b) setDataBitacora(b);
    } catch (error) {
      // Silently catch fetch errors
    }
  };

  useEffect(() => {
    fetchAllData();
    const intervalData = setInterval(fetchAllData, 60000); 
    return () => clearInterval(intervalData);
  }, []);

  useEffect(() => {
    const intervalTime = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(intervalTime);
  }, []);

  const goToNextScreen = () => {
    setCurrentScreen(prev => (prev + 1) % 5);
  };

  // Rotation controller:
  // Screen 0 (Bitácora): DOES NOT change until all routes have scrolled to the bottom.
  // Screens 1 to 4: Each stays for 15 seconds.
  useEffect(() => {
    if (isPaused) return;
    if (currentScreen === 0) {
      return;
    }

    const timer = setTimeout(() => {
      goToNextScreen();
    }, 15000);

    return () => clearTimeout(timer);
  }, [currentScreen, isPaused]);

  const commonProps = {
    time,
    currentScreen,
    onSelectScreen: setCurrentScreen,
    isPaused,
    onTogglePause: () => setIsPaused(p => !p),
    onOpenPhpModal: () => setShowPhpModal(true),
    isFullscreen,
    onToggleFullscreen: toggleFullscreen,
    tvScale,
    onChangeTvScale: setTvScale,
    customLogo,
    selectedCedis,
    onSelectCedis: setSelectedCedis
  };

  return (
    <div 
      className="w-full h-full bg-slate-100 font-sans text-slate-800 overflow-hidden relative flex flex-col"
      style={{
        zoom: tvScale !== 1 ? `${tvScale}` : undefined
      }}
    >
      {/* Top Rotation Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 z-[100]">
        {currentScreen === 0 ? (
          <div 
            className="h-full bg-blue-600 transition-all duration-300 ease-linear shadow-sm"
            style={{ width: `${bitacoraScrollPct}%` }}
          />
        ) : (
          <div 
            key={`progress-${currentScreen}`}
            className="h-full bg-red-600 transition-all ease-linear shadow-sm"
            style={{ 
              width: '100%', 
              animation: isPaused ? 'none' : 'screenProgress 15s linear forwards' 
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes screenProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

      {/* Screen Containers */}
      <div className="flex-1 min-h-0 relative">
        <div 
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ 
            opacity: currentScreen === 0 ? 1 : 0, 
            pointerEvents: currentScreen === 0 ? 'auto' : 'none',
            zIndex: currentScreen === 0 ? 10 : 0
          }}
        >
          <ScreenBitacora 
            {...commonProps}
            data={dataBitacora} 
            isActive={currentScreen === 0}
            onComplete={goToNextScreen}
            onScrollProgressUpdate={setBitacoraScrollPct}
          />
        </div>

        <div 
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ 
            opacity: currentScreen === 1 ? 1 : 0, 
            pointerEvents: currentScreen === 1 ? 'auto' : 'none',
            zIndex: currentScreen === 1 ? 10 : 0
          }}
        >
          <ScreenVisitas {...commonProps} data={dataVisitas} />
        </div>

        <div 
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ 
            opacity: currentScreen === 2 ? 1 : 0, 
            pointerEvents: currentScreen === 2 ? 'auto' : 'none',
            zIndex: currentScreen === 2 ? 10 : 0
          }}
        >
          <ScreenLitros {...commonProps} data={dataLitros} />
        </div>

        <div 
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ 
            opacity: currentScreen === 3 ? 1 : 0, 
            pointerEvents: currentScreen === 3 ? 'auto' : 'none',
            zIndex: currentScreen === 3 ? 10 : 0
          }}
        >
          <ScreenVendidos {...commonProps} data={dataVendidos} />
        </div>

        <div 
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ 
            opacity: currentScreen === 4 ? 1 : 0, 
            pointerEvents: currentScreen === 4 ? 'auto' : 'none',
            zIndex: currentScreen === 4 ? 10 : 0
          }}
        >
          <ScreenCancelaciones {...commonProps} data={dataCancelaciones} />
        </div>
      </div>

      {/* Modal Guía PHP, Carpetas por CEDIS, Logo & TV Setup */}
      {showPhpModal && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 md:p-8 flex flex-col gap-5 text-slate-800">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 border border-blue-200 rounded-2xl">
                  <FolderArchive className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Tablero por CEDIS & Proyecto PHP
                  </h2>
                  <p className="text-xs font-semibold text-slate-500">
                    Carpetas listas para Smart TV por CEDIS y Vista Gerencial
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowPhpModal(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CEDIS Setup Callout */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
              <h3 className="text-sm font-extrabold text-blue-900 mb-1.5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>¿Cómo ponerlo en una TV para que solo mire Obregón (o cualquier CEDIS)?</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed mb-3">
                ¡Se crearon las carpetas individuales para cada CEDIS en tu proyecto PHP! Puedes usar cualquiera de estas dos formas súper sencillas:
              </p>
              <div className="space-y-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-blue-200">
                  <strong className="text-blue-900 block">Opción A: Por carpetas independientes (Recomendado para TV)</strong>
                  <p className="text-slate-600 mt-0.5">En el navegador de la TV de Obregón pon:</p>
                  <code className="text-blue-700 bg-blue-50 px-2 py-1 rounded font-mono block mt-1">
                    http://tu-servidor/proyecto/obregon/
                  </code>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Y listo: esa TV solo cargará las rutas 100 de Obregón. Lo mismo para <code className="font-mono">/hermosillo/</code>, <code className="font-mono">/navojoa/</code>, <code className="font-mono">/nogales/</code>, <code className="font-mono">/caborca/</code>, <code className="font-mono">/guaymas/</code>.
                  </p>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-blue-200">
                  <strong className="text-blue-900 block">Opción B: Vista del Gerente (Ver Todo o filtrar)</strong>
                  <p className="text-slate-600 mt-0.5">El gerente abre la carpeta raíz:</p>
                  <code className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-mono block mt-1">
                    http://tu-servidor/proyecto/
                  </code>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Y tiene el selector arriba para ver todas las 6 plazas al mismo tiempo o saltar a cualquiera.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Logo Test */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <span>🎨 Tu Logotipo Real y Favicon</span>
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                Guarda tu logotipo como <strong className="text-slate-900 font-mono">logo.png</strong> dentro de la carpeta <code className="text-blue-700 bg-white px-1.5 py-0.5 rounded font-mono border border-slate-200">proyecto</code>. Se mostrará automáticamente en la cabecera y como icono de la pestaña.
              </p>
              <div className="flex items-center gap-3">
                <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-sm">
                  Probar logo aquí ahora
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setCustomLogo(url);
                        const fav = document.getElementById('app-favicon');
                        if (fav) fav.href = url;
                      }
                    }}
                  />
                </label>
                {customLogo && (
                  <button 
                    onClick={() => { setCustomLogo(null); }}
                    className="text-xs text-slate-500 hover:text-rose-600 underline"
                  >
                    Restablecer logo original
                  </button>
                )}
              </div>
            </div>

            {/* Main Download Callout */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-emerald-950 text-base mb-0.5">
                  Descargar paquete "proyecto.zip"
                </h3>
                <p className="text-xs text-emerald-800 font-medium">
                  Incluye las subcarpetas por CEDIS, tema claro, APIs analizadas y LEEME.
                </p>
              </div>
              <a
                href="/proyecto.zip"
                download="proyecto.zip"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md flex items-center gap-2 transition-all whitespace-nowrap"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Descargar ZIP</span>
              </a>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowPhpModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Cerrar
              </button>
              <a
                href="/proyecto.zip"
                download="proyecto.zip"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Proyecto PHP</span>
              </a>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;
