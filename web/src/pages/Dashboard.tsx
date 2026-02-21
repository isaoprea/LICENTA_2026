import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Flame, 
  Target, 
  Activity, 
  Zap, 
  Code2, 
  Terminal, 
  Coffee,
  Loader2 
} from 'lucide-react';
import axios from 'axios';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ name: "", streak: 0 });
  const [stats, setStats] = useState({ solved: 0, attempts: 0, successRate: 0 });
  const [languages, setLanguages] = useState([
    { id: 'python', name: 'Python', progress: 0, color: 'bg-blue-500', icon: <Code2 size={18}/> },
    { id: 'cpp', name: 'C++', progress: 0, color: 'bg-cyan-500', icon: <Terminal size={18}/> },
    { id: 'java', name: 'Java', progress: 0, color: 'bg-orange-500', icon: <Coffee size={18}/> }
  ]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Profil utilizator (Rămâne pe /auth/profile)
      const userRes = await axios.get('http://localhost:3000/auth/profile', { headers });
      setUserData({ 
        name: userRes.data.name || "Utilizator", 
        streak: userRes.data.streak || 0 
      });

      // 2. Statistici Generale (Sincronizat cu AppController - /user/stats)
      const statsRes = await axios.get('http://localhost:3000/user/stats', { headers });
      setStats({
        solved: statsRes.data.solvedCount || 0,
        attempts: statsRes.data.totalAttempts || 0,
        successRate: statsRes.data.successRate || 0
      });

      // 3. Progres Limbaje
      const langPromises = ['python', 'cpp', 'java'].map(lang => 
        axios.get(`http://localhost:3000/lessons/modules/${lang}`, { headers })
      );
      
      const langResults = await Promise.all(langPromises);
      const updatedLanguages = languages.map((lang, index) => {
        const modules = langResults[index].data;
        const allLessons = modules.flatMap((m: any) => m.lessons || []);
        const completed = allLessons.filter((l: any) => l.isCompleted).length;
        const progress = allLessons.length > 0 ? Math.round((completed / allLessons.length) * 100) : 0;
        return { ...lang, progress };
      });
      
      setLanguages(updatedLanguages);

    } catch (err) {
      console.error("Eroare la încărcarea datelor:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('auth-change', fetchData);
    return () => window.removeEventListener('auth-change', fetchData);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="text-blue-500 animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Salut, <span className="text-blue-500">{(userData?.name || "Explorator").split(' ')[0]}!</span> 👋
            </h1>
            <p className="text-slate-400 font-bold mt-1">Sistemele sunt online pentru tine.</p>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
            <div className="bg-orange-500/20 p-2 rounded-xl">
              <Flame className="text-orange-500" size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase">Streak</p>
              <p className="text-lg font-black leading-none">{userData.streak} Zile</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={<Trophy color="#f59e0b" />} label="Probleme Rezolvate" value={stats.solved} color="border-amber-500/20" />
          <StatCard icon={<Target color="#3b82f6" />} label="Rată Succes" value={`${stats.successRate}%`} color="border-blue-500/20" />
          <StatCard icon={<Activity color="#10b981" />} label="Încercări" value={stats.attempts} color="border-emerald-500/20" />
          <StatCard icon={<Zap color="#a855f7" />} label="Status" value={stats.solved > 10 ? "Veteran" : "Recrut"} color="border-purple-500/20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <section className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8">
              <h3 className="text-xl font-black italic mb-6 uppercase">Progres Personalizat</h3>
              <div className="space-y-6">
                {languages.map(lang => (
                  <LanguageProgress key={lang.id} {...lang} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className={`bg-slate-900/40 border-b-4 ${color} p-6 rounded-[2rem] transition-all hover:translate-y-[-5px]`}>
      <div className="mb-4">{icon}</div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black italic">{value}</p>
    </div>
  );
}

function LanguageProgress({ icon, name, progress, color }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{icon}</span>
          <span className="font-black italic text-sm">{name}</span>
        </div>
        <span className="text-xs font-black">{progress}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}