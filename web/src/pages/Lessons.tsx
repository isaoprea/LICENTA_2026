import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ComposableMap, 
  Geographies, 
  Geography 
} from "react-simple-maps";
import { 
  ShieldCheck, 
  Lock, 
  Swords, 
  Trophy, 
  Compass, 
  ChevronLeft, 
  MapPin 
} from 'lucide-react';

// URL pentru harta lumii/europei
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// DEFINIM CELE 6 ȚĂRI PENTRU CELE 6 LECȚII
const CAMPAIGN_COUNTRIES = [
  "Romania",
  "France",
  "Germany",
  "Italy",
  "Spain",
  "United Kingdom"
];

export default function Lessons() {
  const { language } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:3000/lessons/modules/${language}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setModules(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Eroare API:", err);
      setLoading(false);
    });
  }, [language]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
      <Compass className="animate-spin text-blue-500 mb-4" size={50} />
      <p className="font-black dark:text-white uppercase tracking-widest text-sm">Se pregătește teatrul de operațiuni...</p>
    </div>
  );

  const allLessons = modules.flatMap(m => m.lessons);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white p-6 md:p-10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- PANOU STATISTICI --- */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-xl transition-all">
            <button onClick={() => navigate('/dashboard')} className="mb-6 flex items-center gap-1 text-xs font-black text-blue-600 uppercase">
              <ChevronLeft size={14} /> Înapoi
            </button>
            <h1 className="text-2xl font-black mb-2 uppercase italic tracking-tighter">
              Expediția <span className="text-blue-500">{language}</span>
            </h1>
            <div className="flex items-center gap-3 mt-4">
              <Trophy className="text-amber-500" size={24} />
              <div className="flex flex-col">
                <span className="text-2xl font-black italic leading-none">
                  {allLessons.filter(l => l.isCompleted).length} / {allLessons.length}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Obiective Cucerite</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem]">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Legenda Frontului</h3>
            <div className="space-y-3 text-xs font-bold">
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" /> Eliberat</div>
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]" /> Sub Asediu (Activ)</div>
              <div className="flex items-center gap-3 text-slate-400"><div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-800" /> Blocat / Neutru</div>
            </div>
          </div>
        </div>

        {/* --- HARTA INTERACTIVĂ --- */}
        <div className="lg:col-span-9 relative bg-slate-200 dark:bg-slate-950 rounded-[3rem] border-4 border-slate-300 dark:border-slate-900 shadow-inner overflow-hidden min-h-[550px] h-[75vh] transition-all">
          
          <ComposableMap 
            projection="geoMercator" 
            projectionConfig={{ scale: 350, center: [15, 52] }} 
            className="w-full h-full"
          >
            <Geographies geography={geoUrl}>
              {({ geographies }: { geographies: any[] }) => 
                geographies && geographies.map((geo: any) => {
                  const countryName = geo.properties.name;
                  // Verificăm dacă țara curentă face parte din campania noastră
                  const campaignIndex = CAMPAIGN_COUNTRIES.indexOf(countryName);
                  
                  // Dacă țara este în listă, îi asignăm lecția corespunzătoare indexului
                  const lesson = campaignIndex !== -1 ? allLessons[campaignIndex] : null;
                  
                  const isCompleted = lesson?.isCompleted;
                  const isCurrent = lesson && !lesson.isLocked && !isCompleted;
                  const isLocked = lesson?.isLocked;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => setHoveredCountry(countryName)}
                      onMouseLeave={() => setHoveredCountry(null)}
                      onClick={() => {
                        if (lesson && !isLocked) navigate(`/lesson/${lesson.id}`);
                      }}
                      style={{
                        default: {
                          // Culori: Amber pentru cucerit, Blue pentru activ, Gray pentru restul
                          fill: lesson 
                            ? (isCompleted ? "#f59e0b" : isCurrent ? "#2563eb" : "#475569") 
                            : "#e2e8f0", 
                          stroke: "#020617",
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                        hover: { 
                          fill: lesson && !isLocked ? "#3b82f6" : "#94a3b8", 
                          outline: "none", 
                          cursor: lesson && !isLocked ? "pointer" : "default" 
                        },
                        pressed: { outline: "none" }
                      }}
                      className={!lesson ? "dark:!fill-slate-900 dark:!stroke-slate-800" : ""}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>

          {/* Indicator Localizare */}
          <div className="absolute bottom-8 right-8 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-sm">
            <div className="bg-blue-600 p-2 rounded-xl">
              <MapPin className="text-white" size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Localizare</p>
              <p className="text-sm font-black truncate max-w-[150px]">
                {hoveredCountry || "Explorează Europa"}
              </p>
            </div>
          </div>

          {/* Banner Campanie Activă */}
          <AnimatePresence>
            {allLessons.some(l => !l.isCompleted && !l.isLocked) && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center gap-2"
              >
                <Swords size={16} className="animate-pulse" /> Luptă în curs
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}