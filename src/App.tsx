import { useState, useEffect } from 'react';
import { Car, Info, RefreshCw, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ParkingSpace {
  id: number;
  occupied: boolean;
}

interface ParkingStatus {
  freeSpaces: number;
  totalSpaces: number;
  spaces: ParkingSpace[];
  timestamp: string;
}

export default function App() {
  const [status, setStatus] = useState<ParkingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status');
      if (!response.ok) throw new Error('Error al conectar con los sensores');
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError('Fallo en la comunicación con el sistema IoT');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Refrescar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#151619] text-white font-mono p-4 md:p-8 flex flex-col items-center">
      {/* Header / Brand */}
      <header className="w-full max-w-4xl mb-8 flex flex-col md:flex-row justify-between items-center border-b border-white/10 pb-6">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="bg-[#F27D26] p-3 rounded-lg shadow-[0_0_15px_rgba(242,125,38,0.3)]">
            <Car size={32} className="text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase">Ventura Plaza</h1>
            <p className="text-xs text-[#8E9299] tracking-widest uppercase">Smart Parking System v1.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
          <MapPin size={16} className="text-[#F27D26]" />
          <span className="text-xs font-medium uppercase tracking-wider">Cúcuta, Colombia</span>
        </div>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1C1D21] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            {/* Decorative radial track */}
            <div className="absolute -top-10 -right-10 w-32 h-32 border border-dashed border-white/5 rounded-full" />
            
            <h2 className="text-[#8E9299] text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Info size={12} /> Disponibilidad Actual
            </h2>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-7xl font-bold text-[#00FF00] tabular-nums leading-none">
                {status?.freeSpaces ?? '--'}
              </span>
              <span className="text-[#8E9299] text-xl">/ {status?.totalSpaces ?? '10'}</span>
            </div>
            <p className="text-sm text-[#8E9299] mb-6">Espacios Libres</p>
            
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-8">
              <motion.div 
                className="h-full bg-[#00FF00]"
                initial={{ width: 0 }}
                animate={{ width: status ? `${(status.freeSpaces / status.totalSpaces) * 100}%` : 0 }}
                transition={{ type: 'spring', stiffness: 50 }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#8E9299]">
              <div className="flex items-center gap-2">
                <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
                <span>Auto-Refresh: 5s</span>
              </div>
              <span>{status ? new Date(status.timestamp).toLocaleTimeString() : '--:--:--'}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-xs flex items-center gap-3">
              <XCircle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Parking Grid */}
        <div className="lg:col-span-2">
          <div className="bg-[#1C1D21] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-[#8E9299] text-[10px] uppercase tracking-[0.2em] mb-6">Mapa de Sensores IoT</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <AnimatePresence mode="popLayout">
                {status?.spaces.map((space) => (
                  <motion.div
                    key={space.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`
                      relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-500
                      ${space.occupied 
                        ? 'bg-red-500/5 border-red-500/20 text-red-500 shadow-[inset_0_0_15px_rgba(239,68,68,0.05)]' 
                        : 'bg-green-500/5 border-green-500/20 text-green-500 shadow-[inset_0_0_15px_rgba(34,197,94,0.05)]'}
                    `}
                  >
                    <div className="text-[10px] uppercase tracking-widest mb-2 opacity-50">P-{space.id.toString().padStart(2, '0')}</div>
                    {space.occupied ? <XCircle size={24} /> : <CheckCircle2 size={24} />}
                    <div className="mt-2 text-[8px] uppercase font-bold tracking-tighter">
                      {space.occupied ? 'Ocupado' : 'Libre'}
                    </div>
                    
                    {/* Status Glow Indicator */}
                    <div className={`
                      absolute top-2 right-2 w-1.5 h-1.5 rounded-full 
                      ${space.occupied ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]'}
                    `} />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {!status && Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse border border-white/5" />
              ))}
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-6 text-[10px] uppercase tracking-widest text-[#8E9299] px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Ocupado</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto pt-12 text-[#4A4D54] text-[9px] uppercase tracking-[0.3em]">
        Ventura Plaza Cúcuta • Smart Infrastructure Division
      </footer>
    </div>
  );
}
