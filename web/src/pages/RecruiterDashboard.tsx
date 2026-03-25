import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CodeReplayModal from '../components/CodeReplayModal'; 

// --- CONFIGURARE URL-URI ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const PUBLIC_EXAM_URL = 'https://alden-inflectional-coretta.ngrok-free.dev';

export default function RecruiterDashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [availableProblems, setAvailableProblems] = useState<any[]>([]);
  
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard'; 

  const [selectedSessionForReplay, setSelectedSessionForReplay] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false); 
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [inviteFormData, setInviteFormData] = useState({ name: '', email: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  const token = localStorage.getItem('token');
  let recruiterId = "";
  if (token && token.includes('.')) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      recruiterId = payload.userId || payload.sub;
    } catch (e) { console.error("Eroare decodare token"); }
  }

  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    timeLimit: 60,
    language: 'javascript',
    problemIds: [] as string[]
  });

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchData = async () => {
    if (!recruiterId) return;
    try {
      const resSessions = await fetch(`${API_BASE_URL}/assessments/recruiter/${recruiterId}`);
      const dataSessions = await resSessions.json();
      setSessions(Array.isArray(dataSessions) ? dataSessions : []);

      const resAssessments = await fetch(`${API_BASE_URL}/assessments/recruiter-templates/${recruiterId}`);
      if (resAssessments.ok) {
        const dataAssessments = await resAssessments.json();
        setAssessments(Array.isArray(dataAssessments) ? dataAssessments : []);
      }

      const resProbs = await fetch(`${API_BASE_URL}/problems/recruiter`);
      if (resProbs.ok) {
        const allProbs = await resProbs.json();
        const filteredProbs = Array.isArray(allProbs) ? allProbs.filter((p: any) => p.type === 'RECRUITER') : [];
        setAvailableProblems(filteredProbs);
      }
    } catch (err) { 
      console.error("Eroare la preluarea datelor:", err);
      setSessions([]); 
    }
  };

  useEffect(() => {
    fetchData();
  }, [recruiterId]);

  const handleSaveAssessment = async () => {
    if (!formData.title || formData.problemIds.length === 0) {
      showNotification("Titlul și problemele sunt obligatorii!", "error");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recruiterId })
      });
      if(res.ok) {
        showNotification("Assessment creat!");
        setIsModalOpen(false);
        setFormData({ title: '', companyName: '', timeLimit: 60, language: 'javascript', problemIds: [] });
        fetchData(); 
      }
    } catch (e) { showNotification("Eroare la salvare.", "error"); }
  };

  const openInviteModal = (id: string) => { setSelectedAssessmentId(id); setIsInviteModalOpen(true); };

  const submitInvite = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/assessments/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inviteFormData, assessmentId: selectedAssessmentId })
      });
      if(res.ok) {
        showNotification(`Invitație trimisă!`);
        setIsInviteModalOpen(false);
        setInviteFormData({ name: '', email: '' });
        fetchData();
      }
    } catch (err) { showNotification("Eroare la trimitere.", "error"); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification("Link copiat!");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-4xl font-extrabold text-blue-500 tracking-tight italic">CodeOverload <span className="text-white not-italic">Dashboard</span></h1>
                <p className="text-slate-400 mt-2 font-medium italic">Monitorizarea candidaților în timp real.</p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2">
                <span>+</span> Creează Assessment
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StatCard title="Candidați Activi" value={sessions.length} color="blue" />
              <StatCard title="Teste Finalizate" value={sessions.filter(s => s.status === 'COMPLETED').length} color="green" />
              <StatCard title="Alerte Integritate" value={sessions.filter(s => s.cheatWarnings > 0).length} color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest px-2">Monitorizare în timp real</h2>
                <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Candidat</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Warn</th>
                        <th className="px-6 py-4 text-center">Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {sessions.length > 0 ? sessions.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-white">{s.candidateName || 'Nume Indisponibil'}</div>
                            <div className="text-[10px] text-slate-500">{s.candidateEmail}</div>
                          </td>
                          <td className="px-6 py-4 text-center"><StatusBadge status={s.status} /></td>
                          <td className="px-6 py-4 text-center font-bold text-red-500">{s.cheatWarnings || 0}</td>
                          <td className="px-6 py-4 text-center flex justify-center gap-3">
                            <button onClick={() => copyToClipboard(`${PUBLIC_EXAM_URL}/exam/${s.token}`)} className="text-blue-500 hover:text-blue-400 text-[10px] font-black underline uppercase">Link</button>
                            {s.status === 'COMPLETED' && (
                              <button 
                                onClick={() => setSelectedSessionForReplay(s)}
                                className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-black uppercase hover:bg-amber-500 hover:text-white transition-all"
                              >
                                Replay
                              </button>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-600 italic text-sm">Niciun candidat găsit.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest px-2">Teste Active</h2>
                <div className="space-y-4">
                  {assessments.map((a) => (
                    <div key={a.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 group">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-white">{a.title}</h3>
                        <span className="text-[9px] px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-900 font-bold rounded uppercase">{a.language}</span>
                      </div>
                      <button onClick={() => openInviteModal(a.id)} className="w-full py-2 bg-slate-800 hover:bg-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Invită</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL CREARE ASSESSMENT ACTUALIZAT --- */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-8 relative shadow-2xl">
              <h2 className="text-3xl font-black mb-6">Configurare Test</h2>
              <div className="space-y-4">
                <input 
                    type="text" 
                    placeholder="Titlu Poziție (ex: Junior JS Developer)" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white" 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                />
                <div className="grid grid-cols-2 gap-4">
                    <input 
                        type="number" 
                        placeholder="Timp (min)" 
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white" 
                        onChange={e => setFormData({...formData, timeLimit: parseInt(e.target.value)})} 
                    />
                    {/* DROPDOWN CU TOATE LIMBAJELE */}
                    <select 
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none cursor-pointer text-white focus:border-blue-500 appearance-none" 
                        value={formData.language}
                        onChange={e => setFormData({...formData, language: e.target.value})}
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++ (Clang)</option>
                        <option value="csharp">C# (.NET)</option>
                        <option value="php">PHP</option>
                        <option value="go">Go</option>
                        <option value="rust">Rust</option>
                        <option value="swift">Swift</option>
                    </select>
                </div>
                <div className="max-h-40 overflow-auto space-y-2 p-2 border border-slate-800 rounded-xl bg-slate-950 custom-scrollbar">
                    {availableProblems.map(p => (
                        <label key={p.id} className="flex items-center gap-3 p-2 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                            <input type="checkbox" className="w-4 h-4 accent-blue-600" onChange={(e) => {
                                const ids = e.target.checked ? [...formData.problemIds, p.id] : formData.problemIds.filter(id => id !== p.id);
                                setFormData({...formData, problemIds: ids});
                            }} /> 
                            <span className="text-sm font-bold">{p.title}</span>
                        </label>
                    ))}
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400 hover:text-white transition-colors">Anulează</button>
                <button onClick={handleSaveAssessment} className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">Salvează Testul</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Invite, Toast și Replay rămân neschimbate... */}
        {isInviteModalOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex justify-center items-center z-[60] p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-black mb-6">Invită Candidat</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Nume Candidat" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white" value={inviteFormData.name} onChange={e => setInviteFormData({...inviteFormData, name: e.target.value})} />
                <input type="email" placeholder="Email Candidat" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white" value={inviteFormData.email} onChange={e => setInviteFormData({...inviteFormData, email: e.target.value})} />
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setIsInviteModalOpen(false)} className="flex-1 py-3 border border-slate-800 rounded-xl font-bold text-slate-400">Anulează</button>
                <button onClick={submitInvite} className="flex-1 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-all">Trimite Invitația</button>
              </div>
            </div>
          </div>
        )}

        {toast.show && (
          <div className="fixed bottom-10 left-10 z-[100] animate-in fade-in slide-in-from-left-10 duration-300">
            <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${toast.type === 'success' ? 'bg-slate-900/90 border-blue-500/50 text-blue-400' : 'bg-slate-900/90 border-red-500/50 text-red-500'}`}>
              <p className="font-bold text-sm text-white tracking-wide">{toast.message}</p>
            </div>
          </div>
        )}

        {selectedSessionForReplay && (
          <CodeReplayModal 
            session={selectedSessionForReplay} 
            onClose={() => setSelectedSessionForReplay(null)} 
          />
        )}

      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function StatCard({ title, value, color }: any) {
  const colors: any = { 
    blue: "border-blue-500/30 bg-blue-500/5 text-blue-500 shadow-blue-900/10", 
    green: "border-green-500/30 bg-green-500/5 text-green-500 shadow-green-900/10", 
    red: "border-red-500/30 bg-red-500/5 text-red-500 shadow-red-900/10" 
  };
  return ( 
    <div className={`p-6 rounded-3xl border ${colors[color]} shadow-xl transition-all hover:scale-105`}>
      <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</h3>
      <p className="text-5xl font-black mt-2 leading-none tracking-tighter">{value}</p>
    </div> 
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = { 
    PENDING: "bg-slate-800 text-slate-400 border-slate-700", 
    IN_PROGRESS: "bg-blue-900/30 text-blue-400 border-blue-800", 
    COMPLETED: "bg-green-900/30 text-green-400 border-green-800", 
    SUSPENDED_CHEATING: "bg-red-900/30 text-red-500 border-red-800" 
  };
  return ( 
    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest border ${styles[status] || styles.PENDING}`}>
      {(status || 'PENDING').replace('_', ' ')}
    </span> 
  );
}