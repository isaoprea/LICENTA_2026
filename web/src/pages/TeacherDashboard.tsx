import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreateAssignment } from './CreateAssignment';
import { ClassroomStats } from './ClassroomStats';
import { CreateClassroomModal } from './CreateClassroomModal';
import { 
  Plus, 
  Users, 
  GraduationCap, 
  Loader2, 
  BookOpen, 
  Zap, 
  Settings
} from 'lucide-react';

export const TeacherDashboard = () => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const teacherId = user?.id || user?.sub || user?.userId;

  const loadData = () => {
    if (!teacherId) return;
    setLoading(true);
    fetch(`http://localhost:3000/classrooms/teacher/${teacherId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setClassrooms(data);
        setLoading(false);
      })
      .catch(err => { console.error("Error loading classrooms:", err); setLoading(false); });
  };

  useEffect(() => { loadData(); }, [teacherId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="text-blue-500 animate-spin" size={40} />
      </div>
    );
  }

  const selectedClassroom = classrooms.find((c) => c.id === selectedClassId);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
              Dashboard <span className="text-blue-500">Profesor</span>
            </h1>
            <p className="text-slate-400 font-bold mt-2 text-xs uppercase tracking-[0.22em]">
              Selectează o clasă, verifică progresul, apoi alocă tema
            </p>
          </div>
          <motion.button
            onClick={() => setIsModalOpen(true)}
            whileHover={{ scale: 1.03 }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-3.5 rounded-2xl font-black shadow-lg shadow-blue-500/20 flex items-center gap-2 uppercase text-sm"
          >
            <Plus size={18} strokeWidth={3} /> Clasă Nouă
          </motion.button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            icon={<GraduationCap className="text-blue-400" />}
            label="Total Clase"
            value={classrooms.length}
            color="border-blue-500/20"
          />
          <StatCard
            icon={<Users className="text-purple-400" />}
            label="Elevi Înscriși"
            value={classrooms.reduce((sum, c) => sum + (c.students?.length || 0), 0)}
            color="border-purple-500/20"
          />
          <StatCard
            icon={<Zap className="text-amber-400" />}
            label="Teme Active"
            value={classrooms.reduce((sum, c) => sum + (c._count?.assignments || 0), 0)}
            color="border-amber-500/20"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="xl:col-span-7 space-y-6">
            <section className="bg-slate-900/35 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-black italic uppercase tracking-tight">Clasele mele</h3>
                </div>
                <p className="text-[11px] uppercase tracking-widest text-slate-500 font-black">
                  Click pe o clasă pentru detalii
                </p>
              </div>

              {classrooms.length === 0 ? (
                <div className="border border-dashed border-slate-700 rounded-2xl p-10 text-center bg-slate-950/30">
                  <p className="text-sm font-bold text-slate-400 mb-4">Nu ai clase create încă.</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-black uppercase text-sm transition-colors"
                  >
                    Creează prima clasă
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {classrooms.map((cls, idx) => (
                    <motion.button
                      key={cls.id}
                      type="button"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      onClick={() => setSelectedClassId(selectedClassId === cls.id ? null : cls.id)}
                      className={`text-left bg-slate-900/30 border rounded-2xl p-5 transition-all group ${
                        selectedClassId === cls.id
                          ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                          : 'border-white/10 hover:border-blue-500/40'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className={`p-2.5 rounded-xl ${selectedClassId === cls.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400'}`}>
                          <GraduationCap size={20} />
                        </div>
                        <span className="bg-slate-800 text-[10px] px-3 py-1 rounded-full font-black text-slate-300 uppercase">
                          {cls.students?.length || 0} elevi
                        </span>
                      </div>

                      <h4 className="text-lg font-black uppercase italic mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">
                        {cls.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mb-3">{cls.description || 'Fără descriere'}</p>

                      <div className="p-3 bg-black/40 rounded-xl border border-white/10 flex justify-between items-center">
                        <span className="text-blue-400 font-mono font-black tracking-wider text-xs">{cls.inviteCode}</span>
                        <Settings className="text-slate-600" size={14} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </section>

            {selectedClassId ? (
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/45 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6"
              >
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                    <h3 className="text-base font-black uppercase italic text-blue-400">Monitorizare activitate</h3>
                  </div>
                  <span className="text-[11px] uppercase tracking-widest text-slate-500 font-black">
                    {selectedClassroom?.name || 'Clasă selectată'}
                  </span>
                </div>
                <ClassroomStats classroomId={selectedClassId} />
              </motion.section>
            ) : (
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-slate-900/45 to-indigo-900/20 backdrop-blur-2xl border border-indigo-500/20 rounded-[2rem] p-12 text-center min-h-96 flex flex-col items-center justify-center"
              >
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-600/20 border-2 border-indigo-500/30 mb-4">
                    <BookOpen className="text-indigo-400" size={40} />
                  </div>
                </div>
                <h3 className="text-xl font-black uppercase italic mb-2 text-indigo-300">Selectează o clasă</h3>
                <p className="text-sm text-slate-400 max-w-xs mb-6">
                  Alege o clasă de sus pentru a vedea progresul elevilor și statistici detaliate
                </p>
                <div className="flex gap-3 text-xs text-slate-500 flex-col">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                    <span>Vizualizează progresul fiecărui elev</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                    <span>Analizează statistici la nivel de clasă</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                    <span>Urmărește încărcări și submisia temelor</span>
                  </div>
                </div>
              </motion.section>
            )}
          </div>

          <div className="xl:col-span-5 space-y-4 xl:sticky xl:top-24">
            <section className="bg-slate-900/45 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/20">
                  <BookOpen className="text-white" size={18} />
                </div>
                <h3 className="text-lg font-black italic uppercase tracking-tight">Alocă o temă</h3>
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                Poți trimite individual sau la un classroom întreg
              </p>
            </section>

            <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar">
              <CreateAssignment classrooms={classrooms} onAssignmentCreated={loadData} />
            </div>
          </div>
        </div>
      </div>

      <CreateClassroomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={loadData} />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

function StatCard({ icon, label, value, color }: any) {
  return (
    <motion.div whileHover={{ y: -5 }} className={`bg-slate-900/40 border-2 ${color} p-6 rounded-[2.5rem] backdrop-blur-xl transition-all`}>
      <div className="mb-4">{icon}</div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-4xl font-black italic mt-1">{value}</p>
    </motion.div>
  );
}