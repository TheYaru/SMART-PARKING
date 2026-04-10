import { useState, useEffect, ReactNode } from 'react';
// Guía 2 - Actividad 2:
// Importación base del lenguaje y herramientas del framework para estructurar el programa

import { 
  Car, Info, RefreshCw, MapPin, CheckCircle2, XCircle, 
  LayoutDashboard, Smartphone, CreditCard, TrendingUp, 
  DollarSign, Users, ShieldCheck, Camera
} from 'lucide-react';
// Apoyo visual de la interfaz, no corresponde directamente a una actividad central de las guías,
// pero fortalece la salida visual del sistema

import { motion, AnimatePresence } from 'motion/react';
// Apoyo visual/animación de la interfaz

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
// Guía 4 - Actividad 2:
// Presentación visual de resultados procesados en forma gráfica

interface ParkingSpace {
  id: number; 
  // Guía 2 - Actividad 2:
  // Variable numérica identificadora de cada espacio

  occupied: boolean;
  // Guía 3 - Actividad 1:
  // Estado lógico que luego participa en reglas de negocio

  plate?: string;
  // Guía 2 - Actividad 3:
  // Cadena asociada a cada espacio del parqueadero
  // Guía 5 - Actividad 2:
  // Forma parte de una estructura tipo clave:valor
}

interface ParkingStatus {
  freeSpaces: number;
  totalSpaces: number;
  spaces: ParkingSpace[];
  // Guía 6 - Actividad 1:
  // Vector o lista unidimensional de espacios
  // Guía 5 - Actividad 2:
  // Colección de objetos clave:valor

  totalRevenue: number;

  history: { hour: string; occupancy: number }[];
  // Guía 6 - Actividad 1:
  // Vector de historial para series de tiempo
  // Guía 2 - Actividad 3:
  // Manejo de cadenas y listas

  timestamp: string;
}

export default function App() {
  const [view, setView] = useState<'user' | 'admin'>('admin');
  // Guía 2 - Actividad 2:
  // Variable de estado principal
  // Guía 3 - Actividad 1:
  // Será usada para decidir qué vista mostrar

  const [status, setStatus] = useState<ParkingStatus | null>(null);
  // Guía 2 - Actividad 2:
  // Variable que almacena el estado global del parqueadero
  // Guía 4 - Actividad 3:
  // Forma parte del flujo captura -> almacenamiento -> salida

  const [loading, setLoading] = useState(true);
  // Guía 2 - Actividad 2:
  // Variable booleana para controlar el estado de carga

  const [paying, setPaying] = useState<number | null>(null);
  // Guía 2 - Actividad 2:
  // Variable para indicar qué espacio está en proceso de pago

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status');
      // Guía 4 - Actividad 1:
      // Entrada de datos desde el backend mediante petición HTTP

      const data = await response.json();
      // Guía 4 - Actividad 1:
      // Captura y conversión de la respuesta a un formato procesable

      setStatus(data);
      // Guía 4 - Actividad 3:
      // Almacenamiento del dato recibido para integrarlo al flujo funcional
    } catch (err) {
      console.error('Error fetching status:', err);
      // Guía 3 - Actividad 3:
      // Control básico de errores y debugging
    } finally {
      setLoading(false);
      // Guía 3 - Actividad 1:
      // Estado final del flujo independientemente del resultado
    }
  };

  const handlePay = async (spaceId: number) => {
    setPaying(spaceId);
    // Guía 4 - Actividad 1:
    // Captura del identificador del espacio seleccionado por el usuario

    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceId }),
        // Guía 4 - Actividad 1:
        // Envío de entrada al backend en formato JSON
      });

      if (response.ok) {
        // Guía 3 - Actividad 1:
        // Validación de regla lógica según la respuesta del servidor

        await fetchStatus();
        // Guía 4 - Actividad 3:
        // Reintegración del flujo para refrescar el estado del sistema

        alert('¡Pago procesado! Ventura Plaza le desea un feliz viaje.');
        // Guía 4 - Actividad 2:
        // Salida directa del resultado al usuario
      }
    } catch (err) {
      console.error('Payment error:', err);
      // Guía 3 - Actividad 3:
      // Manejo de errores del flujo de pago
    } finally {
      setPaying(null);
      // Guía 3 - Actividad 1:
      // Reinicio del estado del proceso
    }
  };

  useEffect(() => {
    fetchStatus();
    // Guía 4 - Actividad 3:
    // Inicio automático del flujo funcional al cargar la app

    const interval = setInterval(fetchStatus, 3000);
    // Guía 5 - Actividad 1:
    // Repetición automatizada del proceso cada cierto tiempo
    // Aunque no es un for/while clásico, sí representa iteración periódica del sistema

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-[#F27D26]/30">
      {/* Navigation Rail */}
      <nav className="fixed left-0 top-0 h-full w-16 bg-[#121214] border-r border-white/5 flex flex-col items-center py-8 gap-8 z-50">
        <div className="bg-[#F27D26] p-2 rounded-xl mb-4">
          <Car size={24} className="text-black" />
        </div>

        <button 
          onClick={() => setView('admin')}
          // Guía 4 - Actividad 1:
          // Entrada del usuario mediante interacción con botón

          className={`p-3 rounded-xl transition-all ${view === 'admin' ? 'bg-white/10 text-[#F27D26]' : 'text-white/40 hover:text-white'}`}
          // Guía 3 - Actividad 1:
          // Condición para aplicar estilos dependiendo de la vista activa

          title="Admin Dashboard"
        >
          <LayoutDashboard size={20} />
        </button>

        <button 
          onClick={() => setView('user')}
          // Guía 4 - Actividad 1:
          // Segunda entrada del usuario para cambiar de vista

          className={`p-3 rounded-xl transition-all ${view === 'user' ? 'bg-white/10 text-[#F27D26]' : 'text-white/40 hover:text-white'}`}
          // Guía 3 - Actividad 1:
          // Regla visual basada en condición lógica

          title="User Mobile App"
        >
          <Smartphone size={20} />
        </button>
      </nav>

      <div className="pl-16">
        {view === 'admin' ? (
          <AdminDashboard status={status} loading={loading} />
        ) : (
          <UserApp status={status} onPay={handlePay} paying={paying} />
        )}
        {/* Guía 3 - Actividad 1:
            Estructura condicional principal para decidir qué componente mostrar
        */}
      </div>
    </div>
  );
}

function AdminDashboard({ status, loading }: { status: ParkingStatus | null, loading: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-7xl mx-auto"
    >
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Ventura Control <span className="text-[#F27D26]">Pro</span>
          </h1>
          <p className="text-white/40 uppercase text-[10px] tracking-[0.3em]">
            Gestión de Infraestructura SI • Cúcuta
          </p>
          {/* Guía 4 - Actividad 2:
              Salida textual del sistema
          */}
        </div>

        <div className="text-right">
          <div className="text-xs text-white/40 mb-1">Última Sincronización</div>
          <div className="font-mono text-sm flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {/* Guía 3 - Actividad 1:
                Condición visual según estado de carga
            */}

            {status ? new Date(status.timestamp).toLocaleTimeString() : '--:--:--'}
            {/* Guía 4 - Actividad 2:
                Formateo y salida del tiempo del sistema
            */}
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard 
          icon={<Users className="text-blue-400" />} 
          label="Ocupación" 
          value={`${((status?.spaces.filter(s => s.occupied).length || 0) / 10 * 100).toFixed(0)}%`}
          // Guía 5 - Actividad 1:
          // Uso de filter para procesar la colección de espacios
          // Guía 2 - Actividad 4:
          // Cálculo aritmético de porcentaje
          // Guía 4 - Actividad 2:
          // Presentación del resultado formateado
          sub="Tiempo Real" 
        />

        <StatCard 
          icon={<CheckCircle2 className="text-green-400" />} 
          label="Libres" 
          value={status?.freeSpaces || 0}
          // Guía 2 - Actividad 4:
          // Operador lógico para valor alternativo
          sub="Espacios" 
        />

        <StatCard 
          icon={<DollarSign className="text-yellow-400" />} 
          label="Ingresos" 
          value={`$${(status?.totalRevenue || 0).toLocaleString()}`}
          // Guía 2 - Actividad 3:
          // Manejo de strings
          // Guía 4 - Actividad 2:
          // Salida con formato monetario
          sub="Hoy (COP)" 
        />

        <StatCard 
          icon={<ShieldCheck className="text-purple-400" />} 
          label="Seguridad" 
          value="Activa" 
          sub="IA Validando" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-[#121214] border border-white/5 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <TrendingUp size={18} className="text-[#F27D26]" /> Tendencia de Ocupación
            </h3>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">
              Simulación de Flujo Ventura
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={status?.history || []}>
                {/* Guía 6 - Actividad 1:
                    Uso de vector/lista de historial como base del gráfico
                */}

                <defs>
                  <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F27D26" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="hour" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />

                <Tooltip 
                  contentStyle={{ backgroundColor: '#121214', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#F27D26' }}
                />

                <Area 
                  type="monotone" 
                  dataKey="occupancy" 
                  stroke="#F27D26" 
                  fillOpacity={1} 
                  fill="url(#colorOcc)" 
                  strokeWidth={3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Feed Mock */}
        <div className="bg-[#121214] border border-white/5 rounded-3xl p-8">
          <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
            <Camera size={18} className="text-blue-400" /> Validación IA
          </h3>

          <div className="space-y-4">
            {status?.spaces.filter(s => s.occupied).slice(0, 4).map(space => (
              <div key={space.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                {/* Guía 5 - Actividad 1:
                    Procesamiento iterativo sobre la colección con filter + slice + map
                */}

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold text-xs">
                    {space.plate?.split('-')[0]}
                    {/* Guía 5 - Actividad 3:
                        Manipulación avanzada de cadenas con .split()
                    */}
                  </div>

                  <div>
                    <div className="text-xs font-bold">{space.plate}</div>
                    <div className="text-[9px] text-white/40 uppercase">
                      Espacio P-{space.id}
                    </div>
                    {/* Guía 2 - Actividad 3:
                        Construcción de cadenas y visualización de datos
                    */}
                  </div>
                </div>

                <div className="text-[8px] px-2 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 uppercase font-bold">
                  Match 98%
                </div>
              </div>
            ))}

            {status?.spaces.filter(s => s.occupied).length === 0 && (
              <div className="text-center py-12 text-white/20 text-xs italic">
                Esperando detecciones...
              </div>
            )}
            {/* Guía 3 - Actividad 1:
                Validación condicional para caso alternativo
            */}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function UserApp({ status, onPay, paying }: { status: ParkingStatus | null, onPay: (id: number) => void, paying: number | null }) {
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-[380px] bg-[#121214] rounded-[3rem] border-[8px] border-[#1C1D21] shadow-2xl overflow-hidden aspect-[9/19] flex flex-col"
      >
        {/* Mobile Header */}
        <div className="p-8 pb-4">
          <div className="flex justify-between items-center mb-8">
            <div className="text-xs font-bold tracking-tighter">9:41</div>
            <div className="flex gap-1">
              <div className="w-4 h-2 bg-white/20 rounded-sm" />
              <div className="w-4 h-2 bg-white/20 rounded-sm" />
              <div className="w-4 h-2 bg-white rounded-sm" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-1">Hola, Conductor</h2>
          <p className="text-white/40 text-xs">Encuentra tu lugar en Ventura Plaza</p>
          {/* Guía 4 - Actividad 2:
              Salida textual en interfaz para el usuario final
          */}
        </div>

        {/* Availability Card */}
        <div className="px-6 mb-6">
          <div className="bg-[#F27D26] rounded-3xl p-6 text-black shadow-lg shadow-[#F27D26]/20">
            <div className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-70">
              Disponibilidad
            </div>

            <div className="text-4xl font-black mb-2">
              {status?.freeSpaces} <span className="text-sm font-bold opacity-70">Libres</span>
            </div>
            {/* Guía 4 - Actividad 2:
                Salida del valor procesado
            */}

            <div className="text-[10px] font-medium">¡Ahorra tiempo y combustible hoy!</div>
          </div>
        </div>

        {/* Spaces List */}
        <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-8 custom-scrollbar">
          <div className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">
            Selecciona para pagar
          </div>

          {status?.spaces.map(space => (
            <div 
              key={space.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                space.occupied 
                ? 'bg-white/5 border-white/10' 
                : 'bg-green-500/5 border-green-500/20'
              }`}
              // Guía 5 - Actividad 1:
              // Recorrido iterativo de la colección spaces con map
              // Guía 3 - Actividad 1:
              // Estilo definido según condición lógica del espacio
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${space.occupied ? 'bg-white/10' : 'bg-green-500/20 text-green-400'}`}>
                  <Car size={20} />
                </div>

                <div>
                  <div className="text-sm font-bold">Espacio P-{space.id}</div>
                  <div className="text-[10px] text-white/40 uppercase">
                    {space.occupied ? `Placa: ${space.plate}` : 'Disponible'}
                  </div>
                  {/* Guía 3 - Actividad 1:
                      Condición lógica para decidir qué texto mostrar
                  */}
                  {/* Guía 2 - Actividad 3:
                      Uso de strings dinámicos
                  */}
                </div>
              </div>

              {space.occupied && (
                <button 
                  onClick={() => onPay(space.id)}
                  // Guía 4 - Actividad 1:
                  // Entrada del usuario al seleccionar un espacio para pagar

                  disabled={paying === space.id}
                  // Guía 3 - Actividad 2:
                  // Validación lógica de control de interacción

                  className="bg-white text-black p-2 rounded-xl hover:bg-[#F27D26] transition-colors disabled:opacity-50"
                >
                  {paying === space.id ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <CreditCard size={16} />
                  )}
                  {/* Guía 3 - Actividad 1:
                      Condición visual para mostrar ícono según estado del pago
                  */}
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: ReactNode, label: string, value: string | number, sub: string }) {
  return (
    <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 hover:border-[#F27D26]/30 transition-all group">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white/5 rounded-lg group-hover:scale-110 transition-transform">
          {icon}
        </div>

        <span className="text-[10px] uppercase tracking-widest text-white/40">
          {label}
        </span>
        {/* Guía 4 - Actividad 2:
            Presentación de etiquetas de salida
        */}
      </div>

      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-[10px] text-white/20 uppercase tracking-tighter">{sub}</div>
      {/* Guía 4 - Actividad 2:
          Componente reutilizable para mostrar salidas procesadas
      */}
    </div>
  );
}