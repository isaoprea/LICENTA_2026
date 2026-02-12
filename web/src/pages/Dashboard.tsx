import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, solved: 0, accuracy: 0 });
  const [recentProblems, setRecentProblems] = useState<any[]>([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Funcție pentru a lua numele din token
  const getUserName = () => {
    if (!token) return "Exploratorule";
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      return payload.name;
    } catch (e) { return "Exploratorule"; }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get('http://localhost:3000/submissions', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const submissions = res.data;
      
      // 1. Calculăm problemele unice rezolvate
      const successful = new Set(
        submissions.filter((s: any) => s.status === 'SUCCESS').map((s: any) => s.problemId)
      );
      
      // 2. Calculăm rata de succes
      const acc = submissions.length > 0 
        ? Math.round((submissions.filter((s: any) => s.status === 'SUCCESS').length / submissions.length) * 100) 
        : 0;

      // 3. Extragem ultimele 3 probleme unice accesate (recent activity)
      const recent = [];
      const seen = new Set();
      for (let i = submissions.length - 1; i >= 0 && recent.length < 3; i--) {
        if (!seen.has(submissions[i].problemId)) {
          recent.push(submissions[i]);
          seen.add(submissions[i].problemId);
        }
      }

      setStats({ 
        total: submissions.length, 
        solved: successful.size,
        accuracy: acc
      });
      setRecentProblems(recent);
    })
    .catch(err => {
      if (err.response?.status === 401) navigate('/login');
    });
  }, [navigate, token]);

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10 bg-slate-50 min-h-screen">
      
      {/* Secțiunea 1: Hero / Welcome */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 mb-10 flex flex-col md:flex-row justify-between items-center shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Salut, <span className="text-blue-600">{getUserName()}</span>! 👋
          </h1>
          <p className="text-slate-500 mt-2">
            Ai rezolvat <span className="font-bold text-slate-800">{stats.solved} probleme</span> până acum. Ești pe drumul cel bun!
          </p>
        </div>
        <Link to="/problems" className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
          Continuă să înveți
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Secțiunea 2: Statistici Principale (Sidebar stânga) */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Progresul tău</h2>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500 text-sm font-bold uppercase">Rata de succes</span>
              <span className="text-emerald-600 font-bold">{stats.accuracy}%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-1000" 
                style={{ width: `${stats.accuracy}%` }}
              ></div>
            </div>
          </div>

          {/* Statistici rapide sub formă de grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <p className="text-2xl font-black text-blue-600">{stats.solved}</p>
              <p className="text-xs text-slate-400 font-bold uppercase">Rezolvate</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <p className="text-2xl font-black text-indigo-600">{stats.total}</p>
              <p className="text-xs text-slate-400 font-bold uppercase">Încercări</p>
            </div>
          </div>
        </div>

        {/* Secțiunea 3: Recent Activity (Centru) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Continuă de unde ai rămas</h2>
          {recentProblems.length > 0 ? (
            <div className="space-y-4">
              {recentProblems.map((p) => (
                <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center hover:border-blue-300 transition-colors shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      p.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {p.status === 'SUCCESS' ? '✓' : '!'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{p.problem?.title || "Problemă recentă"}</h4>
                      <p className="text-xs text-slate-400 italic">Ultima încercare: {new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/submissions/${p.id}`)}
                    className="text-blue-600 font-bold text-sm hover:underline"
                  >
                    Vezi detalii →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center">
              <p className="text-slate-500">Încă nu ai nicio submisie. Începe cu prima ta problemă!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}