import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Swords, Trophy, Map as MapIcon, Compass } from 'lucide-react';

// --- DATE NOI: Harta cu Forme Geografice Distincte ---
// Fiecare path este unic, cu margini neregulate pentru a arăta ca o țară reală.
const fantasyMap = [
  { id: 't1', name: 'Arhipelagul de Nord', path: "M150,80 L180,70 L210,90 L230,120 L200,150 L160,160 L130,140 L120,110 Z" },
  { id: 't2', name: 'Regatul Obsidian', path: "M300,50 L350,40 L400,60 L420,100 L380,140 L330,130 L290,100 Z" },
  { id: 't3', name: 'Câmpiile de Smarald', path: "M480,120 L530,110 L560,150 L540,200 L490,220 L450,180 L460,140 Z" },
  { id: 't4', name: 'Valea Umbrelor', path: "M50,250 L100,230 L140,260 L150,310 L110,350 L60,340 L40,300 Z" },
  { id: 't5', name: 'Citadela de Foc', path: "M250,220 L310,210 L350,250 L330,310 L270,320 L230,280 Z" },
  { id: 't6', name: 'Insula Speranței', path: "M430,280 L480,270 L510,310 L490,360 L440,370 L410,330 Z" },
  { id: 't7', name: 'Deșertul de Aur', path: "M180,380 L240,370 L280,410 L260,460 L200,470 L160,430 Z" },
  { id: 't8', name: 'Bastionul de Gheață', path: "M380,420 L440,410 L470,450 L450,500 L390,510 L360,470 Z" },
];

export default function Lessons() {
  const { language } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:3000/lessons/modules/${language}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setModules(res.data);
      setLoading(false);
    });
  }, [language]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
      <Compass className="animate-spin text-blue-500 mb-4" size={50} />
      <p className="font-black uppercase tracking-widest text-sm">Cartografiem teritoriile...</p>
    </div>
  );

  const allLessons = modules.flatMap(m => m.lessons);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10 transition-all duration-500">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Panou Statistici (Stânga) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-6 rounded-[2rem] shadow-2xl">
            <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">
              Expediția <span className="text-blue-500">{language}</span>
            </h1>
            <div className="h-1 w-20 bg-blue-600 mb-4 rounded-full" />
            
            <div className="space-y-2">
              <p className="text-slate-400 text-xs font-bold uppercase">Progresul Cuceririi</p>
              <div className="flex items-center gap-3">
                <Trophy className="text-amber-500" size={24} />
                <span className="text-3xl font-black italic">
                  {allLessons.filter(l => l.isCompleted).length} <span className="text-slate-600">/ {allLessons.length}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem]">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Codul Culorilor</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                <div className="w-3 h-3 rounded-full bg-amber-500" /> Teritoriu Eliberat
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" /> Sub Asediu
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                <div className="w-3 h-3 rounded-full bg-slate-800" /> Teritoriu Necunoscut
              </div>
            </div>
          </div>
        </div>

        {/* HARTA INTERACTIVĂ */}
        <div className="lg:col-span-9 relative bg-slate-950 rounded-[3rem] border-4 border-slate-900 shadow-inner flex items-center justify-center p-4 overflow-hidden">
          {/* Background Grid Style */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          
          <svg viewBox="0 0 600 550" className="w-full h-full max-h-[75vh]">
            <AnimatePresence>
              {allLessons.map((lesson: any, index: number) => {
                const territory = fantasyMap[index % fantasyMap.length];
                const isCurrent = !lesson.isLocked && !lesson.isCompleted;

                return (
                  <g 
                    key={lesson.id} 
                    className="cursor-pointer group"
                    onClick={() => !lesson.isLocked && navigate(`/lesson/${lesson.id}`)}
                    onMouseEnter={() => setHovered(territory.name)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {/* Umbra/Glow pentru țări */}
                    <motion.path
                      d={territory.path}
                      animate={{
                        fill: lesson.isCompleted ? "#d97706" : isCurrent ? "#2563eb" : "#111827",
                        stroke: lesson.isCompleted ? "#fbbf24" : isCurrent ? "#60a5fa" : "#1e293b",
                        strokeWidth: isCurrent ? 3 : 1.5,
                        opacity: lesson.isLocked ? 0.4 : 1,
                      }}
                      whileHover={!lesson.isLocked ? { scale: 1.02, filter: "brightness(1.2)" } : {}}
                      transition={{ duration: 0.4 }}
                    />

                    {/* Simbolul de status în centrul țării */}
                    <foreignObject 
                      x={parseInt(territory.path.split(',')[0].replace('M', '')) + 10} 
                      y={parseInt(territory.path.split(',')[1]) + 20} 
                      width="40" height="40"
                    >
                      <div className="flex items-center justify-center h-full w-full">
                        {lesson.isCompleted ? (
                          <ShieldCheck size={18} className="text-amber-200" />
                        ) : lesson.isLocked ? (
                          <Lock size={14} className="text-slate-700" />
                        ) : (
                          <Swords size={20} className="text-white animate-pulse" />
                        )}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </AnimatePresence>
          </svg>

          {/* Info-box plutitor */}
          <div className="absolute bottom-10 right-10 bg-slate-900/90 border border-slate-700 p-4 rounded-2xl backdrop-blur-sm">
             <div className="flex items-center gap-3">
                <div className="bg-blue-600/20 p-2 rounded-lg">
                    <MapIcon className="text-blue-500" size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase">Localizare</p>
                    <p className="text-sm font-black text-white">{hovered || 'Navighează pe hartă'}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}