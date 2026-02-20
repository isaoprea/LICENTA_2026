import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ProblemsList() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/problems').then(res => setProblems(res.data));
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'Easy') return 'text-emerald-600 dark:text-emerald-400';
    if (difficulty === 'Medium') return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  return (
    <div className="max-w-7xl mx-auto p-10 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <h2 className="text-3xl font-black mb-8 text-slate-900 dark:text-slate-50">Provocări de Programare</h2>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              <th className="text-left px-6 py-4 font-bold text-slate-900 dark:text-slate-50">Titlu</th>
              <th className="text-left px-6 py-4 font-bold text-slate-900 dark:text-slate-50">Dificultate</th>
              <th className="text-left px-6 py-4 font-bold text-slate-900 dark:text-slate-50">Acțiune</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((p: any) => (
              <tr key={p.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{p.title}</td>
                <td className={`px-6 py-4 font-bold ${getDifficultyColor(p.difficulty)}`}>
                  {p.difficulty}
                </td>
                <td className="px-6 py-4">
                  <Link to={`/problem/${p.id}`} className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors">Rezolvă</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}