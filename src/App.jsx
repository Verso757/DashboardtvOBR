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
  Filter,
  BarChart3,
  PieChart,
  ShieldCheck,
  Target
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
  { id: 'all', name: 'Red Estatal Completa', short: 'Todos', prefix: null, code: 'ALL' },
  { id: 'obregon', name: 'CEDIS Cd. Obregón', short: 'Obregón', prefix: '1', code: '001', dbName: 'Obregon' },
  { id: 'hermosillo', name: 'CEDIS Hermosillo', short: 'Hermosillo', prefix: '2', code: '002', dbName: 'Hermosillo' },
  { id: 'navojoa', name: 'CEDIS Navojoa', short: 'Navojoa', prefix: '3', code: '003', dbName: 'Navojoa' },
  { id: 'nogales', name: 'CEDIS Nogales', short: 'Nogales', prefix: '4', code: '004', dbName: 'Nogales' },
  { id: 'caborca', name: 'CEDIS Caborca', short: 'Caborca', prefix: '5', code: '005', dbName: 'Caborca' },
  { id: 'guaymas', name: 'CEDIS Guaymas', short: 'Guaymas', prefix: '6', code: '006', dbName: 'Guaymas' }
];

const REAL_CITIES = ['Obregon', 'Hermosillo', 'Navojoa', 'Nogales', 'Caborca', 'Guaymas'];

// Encabezado Corporativo
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
            <span>Supervisión y Control de Distribución</span>
          </div>
        </div>
      </div>

      {/* Screen Tabs */}
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

      {/* Right Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <Building2 className="w-3.5 h-3.5 text-blue-600 ml-1" />
          <select
            value={selectedCedis}
            onChange={(e) => onSelectCedis(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer pr-1 py-0.5"
            title="Seleccionar CEDIS o Red Completa"
          >
            {CEDIS_LIST.map((c) => (
              <option key={c.id} value={c.id} className="bg-white text-slate-800">
                {c.short} {c.prefix ? `(Rutas ${c.prefix}xx)` : '• Red Completa'}
              </option>
            ))}
          </select>
        </div>

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

        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
          title={isFullscreen ? "Salir de pantalla completa" : "Modo TV Pantalla Completa"}
        >
          {isFullscreen ? <Minimize className="w-4 h-4 text-amber-600" /> : <Maximize className="w-4 h-4 text-emerald-600" />}
        </button>

        <button
          onClick={onTogglePause}
          className={`p-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all border ${
            isPaused 
              ? 'bg-amber-100 text-amber-800 border-amber-300' 
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
          title={isPaused ? "Reanudar rotación automática" : "Pausar rotación"}
        >
          {isPaused ? <Play className="w-4 h-4 text-amber-600 fill-amber-600" /> : <Pause className="w-4 h-4 text-slate-600" />}
        </button>

        <button
          onClick={onOpenPhpModal}
          className="px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 transition-colors border border-blue-200"
          title="Manual de configuración y enlaces por CEDIS"
        >
          <FolderArchive className="w-3.5 h-3.5" />
          <span className="hidden md:inline">CEDIS & Enlaces</span>
        </button>

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

const SummaryCard = ({ title, value, subtitle, borderColor = "border-blue-500", icon: Icon }) => (
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

// Pantalla 0: Bitácora de Rutas
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
            }, 10000);
            return;
          }

          if (container.scrollTop >= maxScroll - 4) {
            container.scrollTop = maxScroll;
            setScrollProgress(100);
            if (onScrollProgressUpdate) onScrollProgressUpdate(100);
            setStatusText("Fin de lista (Pausa 4s)");
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
        Sincronizando bitácora de rutas...
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

      {selectedCedis !== 'all' && (
        <div className="bg-blue-600 text-white px-4 py-1.5 flex items-center justify-between text-xs font-bold shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-white text-blue-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
              MODO CEDIS ACTIVO
            </span>
            <span>Visualizando exclusivamente las rutas de: <strong>{currentCedisObj.name}</strong></span>
          </div>
          <button 
            onClick={() => onSelectCedis('all')}
            className="text-white hover:text-blue-100 underline text-xs"
          >
            Ver Red Estatal Completa
          </button>
        </div>
      )}
      
      {/* KPI Cards */}
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

      {/* Subheader */}
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
            <span className="text-slate-500 px-1.5 font-medium">Velocidad:</span>
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

      {/* Grid */}
      <div className="flex-1 min-h-0 px-4 lg:px-6 pb-12 overflow-hidden flex flex-col pt-3">
        <div 
          ref={scrollContainerRef} 
          onMouseEnter={() => { isHoveredRef.current = true; }}
          onMouseLeave={() => { isHoveredRef.current = false; }}
          className="flex-1 overflow-y-auto pr-1 pb-16 no-scrollbar"
        >
          {filteredRoutes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 font-bold">
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

      {/* Marquee Ticker */}
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
            <span>🚚 Telemetría satelital conectada con todas las unidades en ruta. Itinerarios en curso normal.</span>
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

// Contenedor Genérico para Pantallas 1, 2, 3, 4
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

      {selectedCedis !== 'all' && (
        <div className="bg-blue-600 text-white px-4 py-1.5 flex items-center justify-between text-xs font-bold shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-white text-blue-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
              MODO CEDIS ACTIVO
            </span>
            <span>Visualizando datos correspondientes a: <strong>{currentCedisObj.name}</strong></span>
          </div>
          <button 
            onClick={() => onSelectCedis('all')}
            className="text-white hover:text-blue-100 underline text-xs"
          >
            Ver Red Estatal Completa
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 p-3 lg:p-4 flex flex-col justify-between overflow-hidden gap-3">
        {children}
      </div>
    </div>
  );
};

// Pantalla 1: Rendimiento y Visitas (Llena 100% de la altura sin huecos)
const ScreenVisitas = (props) => {
  const { data, selectedCedis } = props;
  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center text-xl font-bold text-slate-500 bg-slate-100">
        <Activity className="w-8 h-8 text-blue-600 animate-spin mr-3" />
        Sincronizando cobertura de visitas...
      </div>
    );
  }

  const ciudades = Object.keys(data).length > 0 ? Object.keys(data) : REAL_CITIES;

  let totalProg = 0;
  let totalVis = 0;
  let totalVentas = 0;
  const ranking = [];

  ciudades.forEach(c => {
    const stats = data[c] || {};
    const p = stats.clientesDelDia || 0;
    const v = stats.visitas || 0;
    const vent = stats.ventas || 0;
    const ef = stats.efectividadVentas || (p > 0 ? Math.round((vent / p) * 100) : 0);
    const cob = stats.coberturaVisitas || (p > 0 ? Math.round((v / p) * 100) : 0);

    totalProg += p;
    totalVis += v;
    totalVentas += vent;
    ranking.push({ ciudad: c, efectividad: ef, cobertura: cob, ventas: vent, visitas: v, prog: p });
  });

  ranking.sort((a, b) => b.efectividad - a.efectividad);
  const pctCob = totalProg > 0 ? Math.round((totalVis / totalProg) * 100) : 0;
  const pctEf = totalProg > 0 ? Math.round((totalVentas / totalProg) * 100) : 0;

  return (
    <DataGridScreenTV {...props} title="Rendimiento de Ruta y Visitas">
      {/* Nivel Superior: Columnas de Plazas */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 shrink-0">
        {ciudades.map(ciudad => {
          const stats = data[ciudad] || {};
          const ef = stats.efectividadVentas || (stats.clientesDelDia > 0 ? Math.round((stats.ventas / stats.clientesDelDia) * 100) : 0);
          const cob = stats.coberturaVisitas || (stats.clientesDelDia > 0 ? Math.round((stats.visitas / stats.clientesDelDia) * 100) : 0);

          return (
            <div key={ciudad} className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
              <div className="flex justify-between items-center pb-1.5 mb-1.5 border-b border-slate-100">
                <h3 className="font-black text-slate-900 uppercase text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {ciudad}
                </h3>
                <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Sucursal</span>
              </div>
              <div className="space-y-1.5">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-bold uppercase text-slate-500 block">Efectividad</span>
                  <span className="text-xl font-black text-emerald-600 font-mono">{ef}%</span>
                  <span className="text-[9px] text-slate-500 block">{stats.ventas || 0} ventas</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-bold uppercase text-slate-500 block">Cobertura</span>
                  <span className="text-xl font-black text-blue-600 font-mono">{cob}%</span>
                  <span className="text-[9px] text-slate-500 block">{stats.visitas || 0} clientes</span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200 flex justify-between items-center text-xs font-mono">
                  <div><span className="text-[9px] text-slate-400 block">Día:</span><span className="font-bold text-slate-800">{stats.clientesDelDia || '--'}</span></div>
                  <div className="text-right"><span className="text-[9px] text-slate-400 block">Padrón:</span><span className="font-bold text-slate-500">{stats.clientesTotales || '--'}</span></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nivel Inferior: Gráficas de Cobertura y Desempeño Comercial */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-600" />
              <span>Balance Global de Atención a Clientes</span>
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2 my-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Programados</span>
              <span className="text-xl lg:text-2xl font-black text-slate-900 font-mono">{totalProg.toLocaleString()}</span>
            </div>
            <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200">
              <span className="text-[10px] font-bold text-blue-700 uppercase block">Visitados</span>
              <span className="text-xl lg:text-2xl font-black text-blue-800 font-mono">{totalVis.toLocaleString()}</span>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">Ventas</span>
              <span className="text-xl lg:text-2xl font-black text-emerald-800 font-mono">{totalVentas.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600">Cobertura de Visitas en Ruta</span>
                <span className="text-blue-700 font-mono">{pctCob}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, pctCob)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600">Efectividad de Venta Cerrada</span>
                <span className="text-emerald-700 font-mono">{pctEf}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, pctEf)}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Comparativa de Efectividad Comercial por CEDIS</span>
            </h3>
          </div>
          <div className="space-y-2 flex-1 flex flex-col justify-around py-2">
            {ranking.map(r => (
              <div key={r.ciudad} className="space-y-0.5">
                <div className="flex justify-between items-baseline text-xs font-bold">
                  <span className="text-slate-800">{r.ciudad}</span>
                  <span className="font-mono text-emerald-700">{r.efectividad}% efectividad ({r.ventas}/{r.prog} clientes)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, r.efectividad)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DataGridScreenTV>
  );
};

// Pantalla 2: Proyección de Litros (Llena 100% de la altura sin huecos)
const ScreenLitros = (props) => {
  const { data } = props;
  if (!data?.data) {
    return (
      <div className="flex-1 flex items-center justify-center text-xl font-bold text-slate-500 bg-slate-100">
        <Activity className="w-8 h-8 text-blue-600 animate-spin mr-3" />
        Sincronizando proyección de litros...
      </div>
    );
  }

  const ciudades = Object.keys(data.data).length > 0 ? Object.keys(data.data) : REAL_CITIES;

  let granTotal = 0;
  const ranking = [];
  const familiaTotales = {};

  ciudades.forEach(c => {
    const items = data.data[c] || [];
    const total = items.reduce((acc, it) => acc + (parseFloat(it.litros) || 0), 0);
    granTotal += total;
    ranking.push({ ciudad: c, total, items });

    items.forEach(it => {
      if (!familiaTotales[it.nombre]) familiaTotales[it.nombre] = 0;
      familiaTotales[it.nombre] += (parseFloat(it.litros) || 0);
    });
  });

  ranking.sort((a, b) => b.total - a.total);

  return (
    <DataGridScreenTV {...props} title="Proyección de Litros por Familia">
      {/* Nivel Superior: Columnas de Plazas con Mini-Barras */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 shrink-0">
        {ciudades.map(ciudad => {
          const items = data.data[ciudad] || [];
          const total = items.reduce((acc, it) => acc + (parseFloat(it.litros) || 0), 0);

          return (
            <div key={ciudad} className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
              <div className="flex justify-between items-center pb-1.5 mb-1.5 border-b border-slate-100">
                <h3 className="font-black text-slate-900 uppercase text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {ciudad}
                </h3>
                <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">Litros</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center mb-1.5">
                <span className="text-[9px] font-bold uppercase text-blue-800 block">Total Proyectado</span>
                <span className="text-xl font-black text-blue-900 font-mono">{Math.round(total).toLocaleString()} L</span>
              </div>
              <div className="space-y-1">
                {items.slice(0, 4).map((it, idx) => {
                  const pct = total > 0 ? Math.round((it.litros / total) * 100) : 0;
                  return (
                    <div key={idx} className="bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-xs">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-semibold text-slate-700 truncate max-w-[65%] text-[11px]">{it.nombre}</span>
                        <span className="font-black text-slate-900 font-mono text-[11px]">{Math.round(it.litros).toLocaleString()} L</span>
                      </div>
                      <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Nivel Inferior: Gráficas de Consolidado Estatal y Comparativa de Demanda */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-blue-600" />
              <span>Consolidado de Demanda por Producto</span>
            </h3>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Total: {Math.round(granTotal).toLocaleString()} L
            </span>
          </div>

          <div className="space-y-2 flex-1 flex flex-col justify-around py-2">
            {Object.keys(familiaTotales).map(fam => {
              const litros = familiaTotales[fam];
              const pct = granTotal > 0 ? Math.round((litros / granTotal) * 100) : 0;
              return (
                <div key={fam} className="space-y-0.5">
                  <div className="flex justify-between items-baseline text-xs font-bold">
                    <span className="text-slate-700">{fam}</span>
                    <span className="font-mono text-blue-900">{Math.round(litros).toLocaleString()} L <span className="text-slate-400 font-sans">({pct}%)</span></span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Distribución y Participación de Volumen por Plaza</span>
            </h3>
          </div>
          <div className="space-y-2 flex-1 flex flex-col justify-around py-2">
            {ranking.map(r => {
              const pct = granTotal > 0 ? Math.round((r.total / granTotal) * 100) : 0;
              return (
                <div key={r.ciudad} className="space-y-0.5">
                  <div className="flex justify-between items-baseline text-xs font-bold">
                    <span className="text-slate-800">{r.ciudad}</span>
                    <span className="font-mono text-blue-900">{Math.round(r.total).toLocaleString()} Litros <span className="text-slate-400 font-sans">({pct}%)</span></span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-blue-700 rounded-full transition-all" style={{ width: `${pct * 2.5}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DataGridScreenTV>
  );
};

// Pantalla 3: Litros Vendidos (Llena 100% de la altura sin huecos)
const ScreenVendidos = (props) => {
  const { data } = props;
  if (!data?.data) {
    return (
      <div className="flex-1 flex items-center justify-center text-xl font-bold text-slate-500 bg-slate-100">
        <Activity className="w-8 h-8 text-blue-600 animate-spin mr-3" />
        Sincronizando volumen facturado...
      </div>
    );
  }

  const ciudades = Object.keys(data.data).length > 0 ? Object.keys(data.data) : REAL_CITIES;

  let granTotal = 0;
  const ranking = [];
  const familiaTotales = {};

  ciudades.forEach(c => {
    const items = data.data[c] || [];
    const total = items.reduce((acc, it) => acc + (parseFloat(it.litros) || 0), 0);
    granTotal += total;
    ranking.push({ ciudad: c, total, items });

    items.forEach(it => {
      if (!familiaTotales[it.nombre]) familiaTotales[it.nombre] = 0;
      familiaTotales[it.nombre] += (parseFloat(it.litros) || 0);
    });
  });

  ranking.sort((a, b) => b.total - a.total);

  return (
    <DataGridScreenTV {...props} title="Volumen Vendido Efectivo (Hoy)">
      {/* Nivel Superior: Columnas de Plazas */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 shrink-0">
        {ciudades.map(ciudad => {
          const items = data.data[ciudad] || [];
          const total = items.reduce((acc, it) => acc + (parseFloat(it.litros) || 0), 0);

          return (
            <div key={ciudad} className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
              <div className="flex justify-between items-center pb-1.5 mb-1.5 border-b border-slate-100">
                <h3 className="font-black text-slate-900 uppercase text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {ciudad}
                </h3>
                <span className="text-[9px] font-bold bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded">Ventas</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-center mb-1.5">
                <span className="text-[9px] font-bold uppercase text-emerald-800 block">Total Vendido</span>
                <span className="text-xl font-black text-emerald-700 font-mono">{Math.round(total).toLocaleString()} L</span>
              </div>
              <div className="space-y-1">
                {items.slice(0, 4).map((it, idx) => {
                  const pct = total > 0 ? Math.round((it.litros / total) * 100) : 0;
                  return (
                    <div key={idx} className="bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-xs">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-semibold text-slate-700 truncate max-w-[65%] text-[11px]">{it.nombre}</span>
                        <span className="font-black text-emerald-600 font-mono text-[11px]">{Math.round(it.litros).toLocaleString()} L</span>
                      </div>
                      <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Nivel Inferior: Gráficas de Cumplimiento de Meta */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Avance de Facturación vs Proyección</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Total: {Math.round(granTotal).toLocaleString()} L
            </span>
          </div>

          <div className="my-2">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs text-slate-500 font-semibold">Cumplimiento Global:</span>
              <span className="text-2xl font-black text-emerald-700 font-mono">96.5%</span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: '96.5%' }} />
            </div>
          </div>

          <div className="space-y-1.5 flex-1 flex flex-col justify-around">
            {Object.keys(familiaTotales).map(fam => {
              const litros = familiaTotales[fam];
              const pct = granTotal > 0 ? Math.round((litros / granTotal) * 100) : 0;
              return (
                <div key={fam} className="space-y-0.5">
                  <div className="flex justify-between items-baseline text-xs font-bold">
                    <span className="text-slate-700">{fam}</span>
                    <span className="font-mono text-emerald-800">{Math.round(litros).toLocaleString()} L <span className="text-slate-400 font-sans">(${pct}%)</span></span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Rendimiento y Cumplimiento de Cuota por CEDIS</span>
            </h3>
          </div>
          <div className="space-y-2 flex-1 flex flex-col justify-around py-2">
            {ranking.map(r => {
              const pct = granTotal > 0 ? Math.round((r.total / granTotal) * 100) : 0;
              return (
                <div key={r.ciudad} className="space-y-0.5">
                  <div className="flex justify-between items-baseline text-xs font-bold">
                    <span className="text-slate-800">{r.ciudad}</span>
                    <span className="font-mono text-emerald-700">{Math.round(r.total).toLocaleString()} L entregados ({pct}% del total)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${pct * 2.5}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DataGridScreenTV>
  );
};

// Pantalla 4: Cancelaciones (Llena 100% de la altura sin huecos)
const ScreenCancelaciones = (props) => {
  const { data } = props;
  if (!data?.data?.ciudades) {
    return (
      <div className="flex-1 flex items-center justify-center text-xl font-bold text-slate-500 bg-slate-100">
        <Activity className="w-8 h-8 text-blue-600 animate-spin mr-3" />
        Sincronizando incidencias operativas...
      </div>
    );
  }

  const ciudades = Object.keys(data.data.ciudades).length > 0 ? Object.keys(data.data.ciudades) : REAL_CITIES;
  const tipos = ['6', '8', 'C', 'V'];

  let t6 = 0, t8 = 0, tC = 0, tV = 0;
  const ranking = [];

  ciudades.forEach(c => {
    const ciudadTipos = data.data.ciudades[c] || {};
    const c6 = ciudadTipos['6']?.cancelados || 0;
    const c8 = ciudadTipos['8']?.cancelados || 0;
    const cc = ciudadTipos['C']?.cancelados || 0;
    const cv = ciudadTipos['V']?.cancelados || 0;
    const totalCanc = c6 + c8 + cc + cv;

    t6 += c6; t8 += c8; tC += cc; tV += cv;
    ranking.push({ ciudad: c, totalCanc });
  });

  ranking.sort((a, b) => a.totalCanc - b.totalCanc);

  return (
    <DataGridScreenTV {...props} title="Cancelaciones por Tipo de Movimiento">
      {/* Nivel Superior: Columnas de Plazas */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 shrink-0">
        {ciudades.map(ciudad => {
          const ciudadTipos = data.data.ciudades[ciudad] || {};

          return (
            <div key={ciudad} className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
              <div className="flex justify-between items-center pb-1.5 mb-1.5 border-b border-slate-100">
                <h3 className="font-black text-slate-900 uppercase text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {ciudad}
                </h3>
                <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Incidencias</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                {tipos.map(tipo => {
                  const stat = ciudadTipos[tipo] || { activos: 0, cancelados: 0 };
                  const hasCanc = stat.cancelados > 0;

                  return (
                    <div 
                      key={tipo} 
                      className={`rounded-lg p-1.5 border text-center ${
                        hasCanc 
                          ? 'bg-rose-50 border-rose-300' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-[9px] font-black text-slate-500 uppercase block">TIPO {tipo}</span>
                      <span className={`text-base font-black font-mono ${hasCanc ? 'text-rose-600' : 'text-slate-400'}`}>
                        {stat.cancelados}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Nivel Inferior: Gráficas de Clasificación e Índice de Confiabilidad */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Clasificación de Movimientos Operativos</span>
            </h3>
          </div>
          <div className="space-y-2 my-1 flex-1 flex flex-col justify-around text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 block">Tipo 6 • Cancelación en Ruta</span>
                <span className="text-[10px] text-slate-500">Producto devuelto o rechazado al entregar</span>
              </div>
              <span className="font-mono font-black text-rose-600 text-lg">{t6}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 block">Tipo 8 • Cliente Cerrado / No Localizado</span>
                <span className="text-[10px] text-slate-500">Visita no concretada por horario</span>
              </div>
              <span className="font-mono font-black text-amber-600 text-lg">{t8}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 block">Tipo C • Ajuste por Merma o Cambio</span>
                <span className="text-[10px] text-slate-500">Garantía de calidad o empaque</span>
              </div>
              <span className="font-mono font-black text-slate-700 text-lg">{tC}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 block">Tipo V • Cancelación de Factura / Venta</span>
                <span className="text-[10px] text-slate-500">Reajuste administrativo</span>
              </div>
              <span className="font-mono font-black text-blue-700 text-lg">{tV}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Índice de Confiabilidad y Calidad de Entrega por Plaza</span>
            </h3>
          </div>
          <div className="space-y-2 flex-1 flex flex-col justify-around py-2">
            {ranking.map(r => {
              const isClean = r.totalCanc === 0;
              return (
                <div key={r.ciudad} className="space-y-0.5">
                  <div className="flex justify-between items-baseline text-xs font-bold">
                    <span className="text-slate-800">{r.ciudad}</span>
                    <span className={`font-mono ${isClean ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {isClean ? '✓ 0 incidencias (100% efectividad)' : `${r.totalCanc} incidencias registradas`}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className={`h-full ${isClean ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full transition-all`} 
                      style={{ width: `${Math.max(5, r.totalCanc * 12)}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DataGridScreenTV>
  );
};

// Componente Principal
function App() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(new Date());
  const [bitacoraScrollPct, setBitacoraScrollPct] = useState(0);
  const [showPhpModal, setShowPhpModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tvScale, setTvScale] = useState(1);
  const [customLogo, setCustomLogo] = useState(null);

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

  // Rotación automática garantizada
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

      {/* Pantallas */}
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

      {/* Modal Corporativo de Configuración */}
      {showPhpModal && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 md:p-8 flex flex-col gap-5 text-slate-800">
            
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 border border-blue-200 rounded-2xl">
                  <FolderArchive className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Control de Pantallas por CEDIS
                  </h2>
                  <p className="text-xs font-semibold text-slate-500">
                    Configuración de enlaces dedicados por sucursal y pantalla general
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

            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
              <h3 className="text-sm font-extrabold text-blue-900 mb-1.5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Rutas de acceso para Smart TV en cada CEDIS</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed mb-3">
                Cada sucursal cuenta con su enlace directo para configurar en la televisión correspondiente:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-blue-200">
                  <strong className="text-blue-900 block">CEDIS Ciudad Obregón:</strong>
                  <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono text-[11px] block mt-0.5">
                    /proyecto/obregon/
                  </code>
                </div>
                <div className="bg-white p-2 rounded-lg border border-blue-200">
                  <strong className="text-blue-900 block">CEDIS Hermosillo:</strong>
                  <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono text-[11px] block mt-0.5">
                    /proyecto/hermosillo/
                  </code>
                </div>
                <div className="bg-white p-2 rounded-lg border border-blue-200">
                  <strong className="text-blue-900 block">CEDIS Navojoa:</strong>
                  <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono text-[11px] block mt-0.5">
                    /proyecto/navojoa/
                  </code>
                </div>
                <div className="bg-white p-2 rounded-lg border border-blue-200">
                  <strong className="text-blue-900 block">CEDIS Nogales:</strong>
                  <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono text-[11px] block mt-0.5">
                    /proyecto/nogales/
                  </code>
                </div>
                <div className="bg-white p-2 rounded-lg border border-blue-200">
                  <strong className="text-blue-900 block">CEDIS Caborca:</strong>
                  <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono text-[11px] block mt-0.5">
                    /proyecto/caborca/
                  </code>
                </div>
                <div className="bg-white p-2 rounded-lg border border-blue-200">
                  <strong className="text-blue-900 block">CEDIS Guaymas:</strong>
                  <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono text-[11px] block mt-0.5">
                    /proyecto/guaymas/
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <span>🎨 Logotipo Institucional</span>
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                Para actualizar el logotipo en todas las pantallas, coloca el archivo como <strong className="text-slate-900 font-mono">logo.png</strong> en la raíz del proyecto.
              </p>
              <div className="flex items-center gap-3">
                <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-sm">
                  Probar logotipo
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
                    Restablecer logotipo
                  </button>
                )}
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-emerald-950 text-base mb-0.5">
                  Descargar Paquete de Archivos (.zip)
                </h3>
                <p className="text-xs text-emerald-800 font-medium">
                  Incluye las subcarpetas por CEDIS, gráficas y controladores.
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
                <span>Descargar Proyecto</span>
              </a>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;
