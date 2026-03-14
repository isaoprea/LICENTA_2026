import { useEffect, useState } from 'react';

export default function RecruiterDashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [availableProblems, setAvailableProblems] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Extragem ID-ul recrutorului din Token
  const token = localStorage.getItem('token');
  let recruiterId = "";
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      recruiterId = payload.userId || payload.sub;
    } catch (e) {
      console.error("Eroare decodare token");
    }
  }

  // Starea pentru formularul de Assessment Nou
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    timeLimit: 60,
    language: 'javascript',
    problemIds: [] as string[]
  });

  // 2. Încărcare Date Reale din Backend
  const fetchData = async () => {
    if (!recruiterId) return;
    
    try {
      // Luăm sesiunile candidaților (tabelul de jos)
      const resSessions = await fetch(`http://localhost:3000/assessments/recruiter/${recruiterId}`);
      const dataSessions = await resSessions.json();
      setSessions(dataSessions);

      // Luăm Assessment-urile create de acest recruiter (pentru a avea ID-urile la invitații)
      const resAssessments = await fetch(`http://localhost:3000/assessments/recruiter-templates/${recruiterId}`);
      if (resAssessments.ok) {
        const dataAssessments = await resAssessments.json();
        setAssessments(dataAssessments);
      }

      // Luăm lista de probleme folosind noul tău endpoint specific
      const resProbs = await fetch(`http://localhost:3000/problems/recruiter`);
      const dataProbs = await resProbs.json();
      setAvailableProblems(dataProbs);
    } catch (err) {
      console.error("Eroare la încărcarea datelor:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [recruiterId]);

  // 3. Creare Assessment Nou
  const handleSaveAssessment = async () => {
    if (!formData.title || formData.problemIds.length === 0) {
      alert("Te rugăm să pui un titlu și să alegi cel puțin o problemă!");
      return;
    }

    await fetch('http://localhost:3000/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, recruiterId })
    });

    setIsModalOpen(false);
    setFormData({ title: '', companyName: '', timeLimit: 60, language: 'javascript', problemIds: [] });
    fetchData(); 
  };

  // 4. Invitare Candidat
  const handleInviteCandidate = async () => {
    const email = prompt("Email-ul candidatului:");
    const name = prompt("Numele candidatului:");
    const assessmentId = prompt("ID-ul Assessment-ului (Îl găsești în lista de mai jos):");

    if (email && name && assessmentId) {
      await fetch(`http://localhost:3000/assessments/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, assessmentId })
      });
      alert(`Invitație trimisă cu succes către ${name}!`);
      fetchData();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiat în clipboard!");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Dashboard */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-500 tracking-tight">Recruiter Dashboard</h1>
            <p className="text-slate-400 mt-2 font-medium">Managementul testelor tehnice și monitorizarea candidaților.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
            >
              <span>+</span> Creează Assessment
            </button>
          </div>
        </div>

        {/* Statistici Rapide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Candidați Activi" value={sessions.length} color="blue" />
          <StatCard title="Teste Finalizate" value={sessions.filter(s => s.status === 'COMPLETED').length} color="green" />
          <StatCard title="Alerte Integritate" value={sessions.filter(s => s.cheatWarnings > 0).length} color="red" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SECȚIUNEA 1: TABEL CANDIDAȚI (2/3 din ecran) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-300 uppercase tracking-widest text-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Monitorizare Candidați
            </h2>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Candidat</th>
                    <th className="px-6 py-4">Status / Scor</th>
                    <th className="px-6 py-4 text-center">Avertismente</th>
                    <th className="px-6 py-4">Link Test</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sessions.length > 0 ? sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white leading-tight">{s.candidateName}</div>
                        <div className="text-[11px] text-slate-500">{s.candidateEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={s.status} />
                        <div className="mt-1 text-xs font-bold text-slate-400">{s.score}% Realizat</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${s.cheatWarnings > 0 ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'text-slate-700'}`}>
                          {s.cheatWarnings}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => copyToClipboard(`http://localhost:5173/exam/${s.token}`)}
                          className="text-blue-500 hover:text-blue-400 text-xs font-bold underline underline-offset-4"
                        >
                          Copy Link
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-600 italic text-sm">Niciun candidat activ momentan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECȚIUNEA 2: ASSESSMENT-URILE MELE (1/3 din ecran) */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-300 uppercase tracking-widest text-sm">
              Assessment-uri Active
            </h2>
            <div className="space-y-4">
              {assessments.length > 0 ? assessments.map((a) => (
                <div key={a.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white group-hover:text-blue-400">{a.title}</h3>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900 font-bold uppercase">{a.language}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-4 tracking-wider uppercase font-bold">ID: {a.id}</p>
                  <button 
                    onClick={handleInviteCandidate}
                    className="w-full py-2 bg-slate-800 hover:bg-blue-600 text-[11px] font-bold rounded-lg transition-colors"
                  >
                    Invită Candidat nou
                  </button>
                </div>
              )) : (
                <div className="p-6 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl text-center text-slate-500 text-sm italic">
                  Nu ai creat niciun test încă.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODAL CREARE ASSESSMENT */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-8 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              <h2 className="text-3xl font-black mb-2">Configurare Test</h2>
              <p className="text-slate-400 text-sm mb-8 italic">Definește cerințele și limbajul obligatoriu pentru candidați.</p>
              
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Titlu Poziție / Test</label>
                    <input 
                      type="text" 
                      placeholder="ex: Senior Fullstack Engineer"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Timp (minute)</label>
                    <input 
                      type="number" 
                      defaultValue={60}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 focus:border-blue-500 outline-none"
                      onChange={e => setFormData({...formData, timeLimit: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Limbaj Obligatoriu</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 focus:border-blue-500 outline-none cursor-pointer"
                      onChange={e => setFormData({...formData, language: e.target.value})}
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Probleme Disponibile (Filtru: Recrutare)</label>
                  <div className="max-h-56 overflow-y-auto space-y-2 border border-slate-800 p-4 rounded-2xl bg-slate-950/50 scrollbar-hide">
                    {availableProblems.length > 0 ? availableProblems.map(p => (
                      <label 
                        key={p.id} 
                        className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                          formData.problemIds.includes(p.id) ? 'bg-blue-600/10 border-blue-600' : 'bg-slate-900 border-transparent hover:border-slate-700'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-slate-700 text-blue-600 bg-slate-800"
                          onChange={(e) => {
                            const ids = e.target.checked 
                              ? [...formData.problemIds, p.id]
                              : formData.problemIds.filter(id => id !== p.id);
                            setFormData({...formData, problemIds: ids});
                          }}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-bold text-white">{p.title}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-tighter font-black">Dificultate: {p.difficulty}</div>
                        </div>
                      </label>
                    )) : (
                      <p className="text-center py-4 text-slate-600 text-xs italic">Nu s-au găsit probleme de tip RECRUITER.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 border border-slate-800 rounded-2xl font-bold hover:bg-slate-800 transition-colors text-slate-400"
                >
                  Anulează
                </button>
                <button 
                  onClick={handleSaveAssessment}
                  className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/30"
                >
                  Salvează Testul
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: any) {
  const colors: any = {
    blue: "border-blue-500/30 bg-blue-500/5 text-blue-500",
    green: "border-green-500/30 bg-green-500/5 text-green-500",
    red: "border-red-500/30 bg-red-500/5 text-red-500"
  };
  return (
    <div className={`p-6 rounded-3xl border ${colors[color]} shadow-xl`}>
      <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</h3>
      <p className="text-5xl font-black mt-2 leading-none">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    PENDING: "bg-slate-800 text-slate-400 border-slate-700",
    IN_PROGRESS: "bg-blue-900/30 text-blue-400 border-blue-800",
    COMPLETED: "bg-green-900/30 text-green-400 border-green-800",
    SUSPENDED_CHEATING: "bg-red-900/30 text-red-500 border-red-800",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest border ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}