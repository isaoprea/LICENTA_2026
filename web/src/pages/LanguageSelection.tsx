import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Code2, Terminal, Coffee, ChevronRight, Zap, Loader2 } from 'lucide-react';

interface LanguageStats {
  completed: number;
  total: number;
  loading: boolean;
}

export default function SelectLanguage() {
  const navigate = useNavigate();
  // Stocăm progresul pentru fiecare limbaj
  const [stats, setStats] = useState<Record<string, LanguageStats>>({
    python: { completed: 0, total: 0, loading: true },
    cpp: { completed: 0, total: 0, loading: true },
    java: { completed: 0, total: 0, loading: true },
  });

  useEffect(() => {
    const token = localStorage.getItem('token'); //
    const langs = ['python', 'cpp', 'java'];

    // Funcție pentru a prelua datele în timp real pentru fiecare limbaj
    const fetchProgress = async (lang: string) => {
      try {
        const res = await axios.get(`http://localhost:3000/lessons/modules/${lang}`, {
          headers: { Authorization: `Bearer ${token}` } //
        });
        
        // Calculăm lecțiile totale și cele completate
        const allLessons = res.data.flatMap((m: any) => m.lessons);
        const completed = allLessons.filter((l: any) => l.isCompleted).length;
        
        setStats(prev => ({
          ...prev,
          [lang]: { completed, total: allLessons.length, loading: false }
        }));
      } catch (err) {
        console.error(`Eroare la încărcarea datelor pentru ${lang}:`, err);
        setStats(prev => ({ ...prev, [lang]: { ...prev[lang], loading: false } }));
      }
    };

    langs.forEach(lang => fetchProgress(lang));
  }, []);

  const languages = [
    { 
      id: 'python', 
      name: 'Python', 
      icon: <Code2 size={40} />, 
      color: 'from-blue-500 to-yellow-500', 
      description: 'Perfect pentru AI, Scripting și Automatizare.'
    },
    { 
      id: 'cpp', 
      name: 'C++', 
      icon: <Terminal size={40} />, 
      color: 'from-blue-600 to-cyan-500', 
      description: 'Performanță brută și control low-level.'
    },
    { 
      id: 'java', 
      name: 'Java', 
      icon: <Coffee size={40} />, 
      color: 'from-orange-600 to-red-500', 
      description: 'Standardul industrial pentru Enterprise.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* --- FUNDAL DECORATIV --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-center mb-16">
        <h1 className="text-5xl font-black text-white mb-4 tracking-tighter italic uppercase">
          Alege-ți <span className="text-blue-500">Misiunea</span>
        </h1>
        <p className="text-slate-400 font-bold">Progresul tău este salvat în timp real în baza de date. 🚀</p>
      </motion.div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {languages.map((lang, index) => {
          const currentStats = stats[lang.id];
          
          return (
            <motion.div
              key={lang.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/lessons/${lang.id}`)}
              className="group relative cursor-pointer"
            >
              <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/5 group-hover:border-blue-500/50 p-8 rounded-[2.5rem] h-full flex flex-col transition-all duration-300">
                
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${lang.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                  {lang.icon}
                </div>

                <h2 className="text-3xl font-black text-white mb-2 italic">{lang.name}</h2>
                <p className="text-slate-400 text-sm mb-8">{lang.description}</p>

                {/* --- DATE REALE JOS --- */}
                <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Expediție</span>
                    <div className="flex items-center gap-2">
                      {currentStats.loading ? (
                        <Loader2 size={12} className="animate-spin text-blue-500" />
                      ) : (
                        <span className="text-sm font-black text-white italic">
                          {currentStats.completed} / {currentStats.total} <span className="text-blue-500 text-[10px]">CUCERIT</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-2 rounded-full bg-slate-800 text-white group-hover:bg-blue-600 transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </div>

                {/* Bară de progres vizuală */}
                {!currentStats.loading && (
                  <div className="absolute bottom-0 left-10 right-10 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentStats.completed / currentStats.total) * 100}%` }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}