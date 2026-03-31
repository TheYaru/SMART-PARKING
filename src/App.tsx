import { useState, useEffect, ReactNode } from 'react';
import { 
  Car, Info, RefreshCw, MapPin, CheckCircle2, XCircle, 
  LayoutDashboard, Smartphone, CreditCard, TrendingUp, 
  DollarSign, Users, ShieldCheck, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

interface ParkingSpace {
  id: number;
  occupied: boolean;
  plate?: string;
}

interface ParkingStatus {
  freeSpaces: number;
  totalSpaces: number;
  spaces: ParkingSpace[];
  totalRevenue: number;
  history: { hour: string; occupancy: number }[];
  timestamp: string;
}

export default function App() {
  const [view, setView] = useState<'user' | 'admin'>('admin');
  const [status, setStatus] = useState<ParkingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<number | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error('Error fetching status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (spaceId: number) => {
    setPaying(spaceId);
    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceId }),
      });
      if (response.ok) {
        await fetchStatus();
        alert('¡Pago procesado! Ventura Plaza le desea un feliz viaje.');
      }
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setPaying(null);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
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
          className={`p-3 rounded-xl transition-all ${view === 'admin' ? 'bg-white/10 text-[#F27D26]' : 'text-white/40 hover:text-white'}`}
          title="Admin Dashboard"
        >
          <LayoutDashboard size={20} />
        </button>
        <button 
          onClick={() => setView('user')}
          className={`p-3 rounded-xl transition-all ${view === 'user' ? 'bg-white/10 text-[#F27D26]' : 'text-white/40 hover:text-white'}`}
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
          <h1 className="text-4xl font-bold tracking-tight mb-2">Ventura Control <span className="text-[#F27D26]">Pro</span></h1>
          <p className="text-white/40 uppercase text-[10px] tracking-[0.3em]">Gestión de Infraestructura SI • Cúcuta</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/40 mb-1">Última Sincronización</div>
          <div className="font-mono text-sm flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {status ? new Date(status.timestamp).toLocaleTimeString() : '--:--:--'}
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<Users className="text-blue-400" />} label="Ocupación" value={`${((status?.spaces.filter(s => s.occupied).length || 0) / 10 * 100).toFixed(0)}%`} sub="Tiempo Real" />
        <StatCard icon={<CheckCircle2 className="text-green-400" />} label="Libres" value={status?.freeSpaces || 0} sub="Espacios" />
        <StatCard icon={<DollarSign className="text-yellow-400" />} label="Ingresos" value={`$${(status?.totalRevenue || 0).toLocaleString()}`} sub="Hoy (COP)" />
        <StatCard icon={<ShieldCheck className="text-purple-400" />} label="Seguridad" value="Activa" sub="IA Validando" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-[#121214] border border-white/5 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <TrendingUp size={18} className="text-[#F27D26]" /> Tendencia de Ocupación
            </h3>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">Simulación de Flujo Ventura</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={status?.history || []}>
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
                <Area type="monotone" dataKey="occupancy" stroke="#F27D26" fillOpacity={1} fill="url(#colorOcc)" strokeWidth={3} />
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
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold text-xs">
                    {space.plate?.split('-')[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold">{space.plate}</div>
                    <div className="text-[9px] text-white/40 uppercase">Espacio P-{space.id}</div>
                  </div>
                </div>
                <div className="text-[8px] px-2 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 uppercase font-bold">
                  Match 98%
                </div>
              </div>
            ))}
            {status?.spaces.filter(s => s.occupied).length === 0 && (
              <div className="text-center py-12 text-white/20 text-xs italic">Esperando detecciones...</div>
            )}
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
        </div>

        {/* Availability Card */}
        <div className="px-6 mb-6">
          <div className="bg-[#F27D26] rounded-3xl p-6 text-black shadow-lg shadow-[#F27D26]/20">
            <div className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-70">Disponibilidad</div>
            <div className="text-4xl font-black mb-2">{status?.freeSpaces} <span className="text-sm font-bold opacity-70">Libres</span></div>
            <div className="text-[10px] font-medium">¡Ahorra tiempo y combustible hoy!</div>
          </div>
        </div>

        {/* Spaces List */}
        <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-8 custom-scrollbar">
          <div className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Selecciona para pagar</div>
          {status?.spaces.map(space => (
            <div 
              key={space.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                space.occupied 
                ? 'bg-white/5 border-white/10' 
                : 'bg-green-500/5 border-green-500/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${space.occupied ? 'bg-white/10' : 'bg-green-500/20 text-green-400'}`}>
                  <Car size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold">Espacio P-{space.id}</div>
                  <div className="text-[10px] text-white/40 uppercase">{space.occupied ? `Placa: ${space.plate}` : 'Disponible'}</div>
                </div>
              </div>
              {space.occupied && (
                <button 
                  onClick={() => onPay(space.id)}
                  disabled={paying === space.id}
                  className="bg-white text-black p-2 rounded-xl hover:bg-[#F27D26] transition-colors disabled:opacity-50"
                >
                  {paying === space.id ? <RefreshCw size={16} className="animate-spin" /> : <CreditCard size={16} />}
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
        <span className="text-[10px] uppercase tracking-widest text-white/40">{label}</span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-[10px] text-white/20 uppercase tracking-tighter">{sub}</div>
    </div>
  );
}
