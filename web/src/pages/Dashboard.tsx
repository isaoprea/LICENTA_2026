import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Target, 
  Activity, 
  Zap, 
  Code2, 
  Terminal, 
  Coffee,
  Loader2,
  BookOpen,
  ArrowRight,
  PlusCircle,
  Users 
} from 'lucide-react';
import axios from 'axios';

// --- DEFINIRE URL API ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [userData, setUserData] = useState({ name: "" });
  const [stats, setStats] = useState({ solved: 0, attempts: 0, successRate: 0 });
  const [assignments, setAssignments] = useState<any[]>([]);
  const [myClassrooms, setMyClassrooms] = useState<any[]>([]);
  const [selectedClassroomDetails, setSelectedClassroomDetails] = useState<any>(null);
  const [loadingClassroomDetails, setLoadingClassroomDetails] = useState(false);
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

      // Folosim `${API_BASE_URL}` peste tot
      const userRes = await axios.get(`${API_BASE_URL}/auth/profile`, { headers });
      setUserData({ 
        name: userRes.data.name || "Utilizator",
      });

      const statsRes = await axios.get(`${API_BASE_URL}/user/stats`, { headers });
      setStats({
        solved: statsRes.data.solvedCount || 0,
        attempts: statsRes.data.totalAttempts || 0,
        successRate: statsRes.data.successRate || 0
      });

      const assignmentsRes = await axios.get(`${API_BASE_URL}/classrooms/my-assignments`, { headers });
      setAssignments(assignmentsRes.data);

      const classroomsRes = await axios.get(`${API_BASE_URL}/classrooms/student/me`, { headers });
      setMyClassrooms(classroomsRes.data);

      const langPromises = ['python', 'cpp', 'java'].map(lang => 
        axios.get(`${API_BASE_URL}/lessons/modules/${lang}`, { headers })
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

  const handleJoinClassroom = async () => {
    if (inviteCode.length < 6) return alert("Codul trebuie să aibă cel puțin 6 caractere!");
    
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_BASE_URL}/classrooms/join`, 
        { inviteCode: inviteCode.toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      alert("✅ Te-ai alăturat clasei cu succes!");
      setInviteCode('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Cod invalid sau ești deja membru.");
    }
  };

  const handleOpenClassroomDetails = async (classroomId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoadingClassroomDetails(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/classrooms/student/${classroomId}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedClassroomDetails(res.data);
    } catch (err) {
      console.error('Eroare la încărcarea detaliilor clasei:', err);
      alert('Nu am putut încărca detaliile clasei.');
    } finally {
      setLoadingClassroomDetails(false);
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
              Salut, <span className="text-blue-500">{(userData?.name || "Explorator").split(' ')[0]}!</span> 
            </h1>
            <p className="text-slate-400 font-bold mt-1">Sistemele sunt online pentru tine.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={<Trophy color="#f59e0b" />} label="Probleme Rezolvate" value={stats.solved} color="border-amber-500/20" />
          <StatCard icon={<Target color="#3b82f6" />} label="Rată Succes" value={`${stats.successRate}%`} color="border-blue-500/20" />
          <StatCard icon={<Activity color="#10b981" />} label="Încercări" value={stats.attempts} color="border-emerald-500/20" />
          <StatCard icon={<Zap color="#a855f7" />} label="Status" value={stats.solved > 10 ? "Veteran" : "Recrut"} color="border-purple-500/20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            
            <section className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-xl border border-blue-500/20 rounded-[2.5rem] p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-black italic uppercase flex items-center gap-2">
                    <PlusCircle className="text-blue-400" size={24} /> Înscrie-te la o clasă
                  </h3>
                  <p className="text-slate-400 text-xs font-bold mt-1">Introdu codul primit de la profesor.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <input 
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="COD: 7X2B9A"
                    className="bg-slate-900 border border-slate-700 p-4 rounded-2xl text-center font-mono font-black tracking-[0.2em] uppercase focus:border-blue-500 outline-none w-full md:w-48 transition-all"
                  />
                  <button 
                    onClick={handleJoinClassroom}
                    className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl font-black transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-blue-500/20"
                  >
                    JOIN
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-xl font-black italic uppercase">Clasele Mele</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myClassrooms.length > 0 ? (
                  myClassrooms.map((cls) => (
                    <div key={cls.id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-black text-white uppercase italic">{cls.name}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Profesor: {cls.teacher?.name}</p>
                        </div>
                        <div className="bg-blue-500/10 text-blue-500 p-2 rounded-xl">
                          <Users size={20} />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-800/50">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-600 font-black uppercase tracking-tighter">Sarcini alocate</span>
                          <span className="text-sm font-black text-slate-300">{cls._count?.assignments || 0} Teme active</span>
                        </div>
                        <button
                          onClick={() => handleOpenClassroomDetails(cls.id)}
                          className="text-[10px] font-black bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors uppercase"
                        >
                          Detalii
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-10 text-center border border-dashed border-slate-800 rounded-[2rem] opacity-50">
                    <p className="text-slate-600 text-xs font-bold uppercase italic tracking-widest">Nu ești înscris în nicio clasă</p>
                  </div>
                )}
              </div>

              {(loadingClassroomDetails || selectedClassroomDetails) && (
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem]">
                  {loadingClassroomDetails ? (
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                      <Loader2 className="animate-spin" size={16} /> Se încarcă detaliile clasei...
                    </div>
                  ) : (
                    <>
                      <h4 className="text-lg font-black uppercase italic">Detalii clasă: {selectedClassroomDetails?.name}</h4>
                      <p className="text-xs text-slate-400 font-bold mt-1">Profesor: {selectedClassroomDetails?.teacher?.name} ({selectedClassroomDetails?.teacher?.email})</p>
                      <p className="text-xs text-slate-500 mt-2">{selectedClassroomDetails?.description || 'Fără descriere'}</p>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-slate-800/40 rounded-xl p-3">
                          <p className="text-[10px] text-slate-500 uppercase font-black">Colegi în clasă</p>
                          <p className="text-xl font-black">{selectedClassroomDetails?._count?.students || 0}</p>
                        </div>
                        <div className="bg-slate-800/40 rounded-xl p-3">
                          <p className="text-[10px] text-slate-500 uppercase font-black">Temele tale în clasă</p>
                          <p className="text-xl font-black">{selectedClassroomDetails?.assignments?.length || 0}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <p className="text-[10px] text-slate-500 uppercase font-black">Teme în această clasă</p>
                        {selectedClassroomDetails?.assignments?.length > 0 ? (
                          selectedClassroomDetails.assignments.map((asg: any) => (
                            <div key={asg.id} className="flex items-center justify-between bg-slate-800/30 rounded-xl px-3 py-2">
                              <div>
                                <p className="text-sm font-bold">{asg.title}</p>
                                <p className="text-[10px] text-slate-500">{asg.problem?.title} • {asg.language}</p>
                              </div>
                              <span className={`text-[10px] font-black px-2 py-1 rounded-md ${asg.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                {asg.status}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500">Nu ai teme în această clasă.</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </section>

            <section className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8">
              <h3 className="text-xl font-black italic mb-6 uppercase">Progres Personalizat</h3>
              <div className="space-y-6">
                {languages.map(lang => (
                  <LanguageProgress key={lang.id} {...lang} />
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <section className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 h-full">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="text-blue-500" size={20} />
                <h3 className="text-xl font-black italic uppercase">Teme Primite</h3>
              </div>
              
              <div className="space-y-4">
                {assignments.filter(a => a.status === 'PENDING').length > 0 ? (
                  assignments.filter(a => a.status === 'PENDING').map((asg: any) => (
                    <motion.div 
                      key={asg.id}
                      whileHover={{ x: 5 }}
                      className="bg-slate-800/40 border border-white/5 p-4 rounded-2xl group cursor-pointer"
                      onClick={() => navigate(`/assignment-solving/${asg.id}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{asg.language}</span>
                        <ArrowRight className="text-slate-600 group-hover:text-blue-500 transition-colors" size={16} />
                      </div>
                      <h4 className="font-bold text-sm mb-1">{asg.title}</h4>
                      <p className="text-[10px] text-slate-500 font-bold tracking-tight">{asg.problem?.title}</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <Coffee className="mx-auto text-slate-700 mb-2" size={30} />
                    <p className="text-xs font-bold text-slate-500 uppercase">Nicio temă activă</p>
                  </div>
                )}
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