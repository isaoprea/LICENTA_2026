import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, solved: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Extragem token-ul salvat la Login
    const token = localStorage.getItem('token');

    // 2. Dacă nu există token, redirecționăm la login
    if (!token) {
      navigate('/login');
      return;
    }

    // 3. Trimitem cererea incluzând Token-ul în Header
    axios.get('http://localhost:3000/submissions', {
      headers: {
        Authorization: `Bearer ${token}` // Cheia care îi spune serverului cine ești
      }
    })
    .then(res => {
      // Calculăm statisticile DOAR pe datele primite (care sunt deja filtrate de backend)
      const successful = new Set(
        res.data
          .filter((s: any) => s.status === 'SUCCESS')
          .map((s: any) => s.problemId)
      );
      
      setStats({ 
        total: res.data.length, 
        solved: successful.size 
      });
    })
    .catch(err => {
      console.error("Eroare la încărcare:", err);
      // Dacă token-ul a expirat sau e invalid, trimitem userul la login
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    });
  }, [navigate]);

  return (
    // Am corectat min-h-screen aici
    <div className="p-10 bg-slate-50 min-h-screen">
      {/* Header cu Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-10 shadow-lg">
        <h1 className="text-4xl font-black text-white">
          Bun venit la DevJudge!
        </h1>
        <p className="text-blue-100 mt-2 text-lg">
          Monitorizează progresul tău și rezolvă noi provocări.
        </p>
      </div>

      {/* Grid de Statistici */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Probleme Rezolvate */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <h3 className="text-slate-500 font-bold uppercase text-xs tracking-wider">
            Probleme Rezolvate
          </h3>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-5xl font-black text-emerald-600 leading-none">
              {stats.solved}
            </span>
            <span className="text-slate-400 mb-1">probleme unice</span>
          </div>
        </div>

        {/* Card Încercări Totale */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <h3 className="text-slate-500 font-bold uppercase text-xs tracking-wider">
            Încercări Totale
          </h3>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-5xl font-black text-blue-600 leading-none">
              {stats.total}
            </span>
            <span className="text-slate-400 mb-1">submisii personale</span>
          </div>
        </div>
      </div>
    </div>
  );
}