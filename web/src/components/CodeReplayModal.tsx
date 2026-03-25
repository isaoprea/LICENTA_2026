import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, X, Clock, 
  AlertCircle, Keyboard, Clipboard, FastForward 
} from 'lucide-react';

export default function CodeReplayModal({ session, onClose }: { session: any, onClose: () => void }) {
  const history = useMemo(() => session.codeHistory || [], [session.codeHistory]);
  
  // Timpul total al examenului în secunde (din ultimul snapshot)
  const totalDuration = history.length > 0 ? history[history.length - 1].t : 0;

  // Stările player-ului
  const [currentTime, setCurrentTime] = useState<number>(0); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPasting, setIsPasting] = useState(false);

  // Referințe pentru timer (FIX TS: Specificăm că pot fi number sau undefined)
  const requestRef = useRef<number | undefined>(undefined);
  const lastUpdateTimeRef = useRef<number | undefined>(undefined);

  // --- 1. MOTORUL DE REDARE FLUIDĂ (60 FPS) ---
  const animate = (time: number) => {
    if (lastUpdateTimeRef.current !== undefined) {
      const deltaTime = (time - lastUpdateTimeRef.current) / 1000;
      const step = deltaTime * playbackSpeed;

      setCurrentTime((prevTime) => {
        const nextTime = prevTime + step;
        if (nextTime >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }
        return nextTime;
      });
    }
    lastUpdateTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current);
      lastUpdateTimeRef.current = undefined;
    }
    return () => {
      if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  // --- 2. CALCULARE COD AFIȘAT (INTERPOLARE MILISECUNDE) ---
  const displayedCode = useMemo(() => {
    if (history.length === 0) return "";
    
    // Găsim snapshot-ul anterior și cel următor momentului curent
    const prevIndex = history.findLastIndex((h: any) => h.t <= currentTime);
    const prev = history[prevIndex === -1 ? 0 : prevIndex];
    const next = history[prevIndex + 1];

    if (!next) return prev.c;

    const timeDiff = next.t - prev.t;
    const progressInGap = (currentTime - prev.t) / (timeDiff || 1);
    const charDiff = next.c.length - prev.c.length;

    // Detectare Copy-Paste între cadre (>250 caractere)
    if (charDiff > 250) {
      return progressInGap > 0.5 ? next.c : prev.c;
    } 
    
    // Tastare fluidă: adăugăm caracterele proporțional cu timpul scurs
    if (charDiff > 0) {
      const charsToShow = Math.floor(charDiff * progressInGap);
      return prev.c + next.c.substring(prev.c.length, prev.c.length + charsToShow);
    }

    // Ștergere sau stagnare
    return prev.c;
  }, [currentTime, history]);

  // --- 3. IDENTIFICARE FRAUDĂ (PUNCTE ROȘII) ---
  const pasteMarkers = useMemo(() => {
    return history.reduce((acc: number[], entry: any, index: number) => {
      if (index > 0 && entry.c.length - history[index - 1].c.length > 250) {
        acc.push(entry.t);
      }
      return acc;
    }, []);
  }, [history]);

  // Alertă vizuală când trecem peste un punct de Paste
  useEffect(() => {
    const hasPasteNow = pasteMarkers.some((t: number) => Math.abs(t - currentTime) < 0.2);
    setIsPasting(hasPasteNow);
  }, [currentTime, pasteMarkers]);

  if (history.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-[#020617] z-[100] flex flex-col font-sans overflow-hidden">
      
      {/* HEADER: PRO-MONITOR STYLE */}
      <header className="flex justify-between items-center px-8 py-4 bg-slate-900/90 border-b border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className={`p-3 rounded-2xl border transition-all duration-500 ${isPasting ? 'bg-red-600 border-red-400 shadow-[0_0_25px_rgba(220,38,38,0.5)]' : 'bg-slate-800 border-white/5'}`}>
             <div className="relative w-6 h-6">
                <AnimatePresence mode="wait">
                  {isPasting ? (
                    <motion.div key="paste" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}>
                      <Clipboard className="text-white" size={24} />
                    </motion.div>
                  ) : (
                    <motion.div key="kb" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}>
                      <Keyboard className="text-blue-500" size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></span>
              <h2 className="text-lg font-black text-white uppercase italic tracking-tighter">Live_Feed: {session.candidateName}</h2>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              Sincronizare: {(currentTime * 1000).toFixed(0)}ms / {(totalDuration * 1000).toFixed(0)}ms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            {[1, 2, 4, 8].map((speed: number) => (
              <button key={speed} onClick={() => setPlaybackSpeed(speed)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${playbackSpeed === speed ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                {speed}x
              </button>
            ))}
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl text-slate-500 transition-all border border-transparent hover:border-white/10">
            <X size={24} />
          </button>
        </div>
      </header>

      {/* MONITORUL DE COD (TERMINAL STYLE) */}
      <main className="flex-1 p-6 bg-black flex justify-center">
        <div className={`w-full max-w-6xl bg-[#0d1117] rounded-t-[2.5rem] border-x border-t transition-all duration-700 flex flex-col shadow-2xl ${isPasting ? 'border-red-500/50' : 'border-white/5'}`}>
          <div className="bg-slate-900/80 px-8 py-3 border-b border-white/5 flex justify-between items-center">
            <div className="flex gap-2">
               <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
               <div className="w-3 h-3 rounded-full bg-amber-500/20"></div>
               <div className="w-3 h-3 rounded-full bg-emerald-500/20"></div>
            </div>
            <span className="text-[9px] font-black text-slate-600 tracking-[0.3em] uppercase italic">IDE_Capture_v4.2.ms</span>
          </div>
          
          <div className="flex-1 p-10 font-mono text-base overflow-auto custom-scrollbar leading-relaxed">
            <code className={isPasting ? 'text-red-400' : 'text-blue-100/90'}>
              {displayedCode}
              <span className="inline-block w-2.5 h-6 bg-blue-500 animate-pulse ml-1 align-middle"></span>
            </code>
          </div>
        </div>
      </main>

      {/* TIMELINE CONTROLS (PUNCTE ROȘII) */}
      <footer className="bg-slate-900 border-t border-white/10 p-8 pb-12 shadow-[0_-10px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-6xl mx-auto flex items-center gap-10">
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all active:scale-95 ${isPlaying ? 'bg-slate-800 text-slate-400' : 'bg-blue-600 text-white shadow-xl shadow-blue-600/30'}`}
          >
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>

          <button onClick={() => {setCurrentTime(0); setIsPlaying(false);}} className="p-4 text-slate-500 hover:text-white transition-all">
            <RotateCcw size={24} />
          </button>

          <div className="flex-1 relative pt-2">
            {/* PUNCTE ROȘII EXACTE PE BAZA DE TIMP (SECUNDE) */}
            <div className="absolute top-[1.15rem] left-0 right-0 h-1.5 pointer-events-none">
              {pasteMarkers.map((timeMarker: number) => {
                const percent = (timeMarker / totalDuration) * 100;
                return (
                  <div key={timeMarker} className="absolute w-4 h-4 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 top-1/2 border-2 border-slate-900 shadow-[0_0_15px_#dc2626] z-10" style={{ left: `${percent}%` }} />
                );
              })}
            </div>

            <input 
              type="range" min="0" max={totalDuration} step="0.01" value={currentTime}
              onChange={(e) => {setCurrentTime(parseFloat(e.target.value)); setIsPlaying(false);}}
              className="relative w-full h-2.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500 z-20"
            />
            
            <div className="flex justify-between mt-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <span>00:00.000</span>
              <div className="flex flex-col items-center">
                <div className="bg-black/40 px-5 py-1.5 rounded-full border border-white/5 mb-1">
                  <span className="text-sm font-mono font-black text-blue-400">
                    {currentTime.toFixed(3)}s
                  </span>
                </div>
                <span className="text-[9px] text-slate-700 font-bold uppercase tracking-widest">Master_Sync_Time</span>
              </div>
              <span>{totalDuration.toFixed(3)}s</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0d1117; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        input[type='range']::-webkit-slider-thumb { 
          height: 24px; width: 24px; border-radius: 50%; 
          background: #3b82f6; cursor: pointer; border: 4px solid #0f172a; 
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
          transition: all 0.2s;
        }
        input[type='range']::-webkit-slider-thumb:hover { transform: scale(1.2); }
      `}</style>
    </div>
  );
}