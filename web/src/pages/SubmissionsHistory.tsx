import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SubmissionsHistory() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    // Preluăm toate încercările din baza de date
    axios.get('http://localhost:3000/submissions').then(res => setSubmissions(res.data));
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Activitatea Ta</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Limbaj</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Scor/Output</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {submissions.map((s: any) => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    s.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-slate-600 capitalize">{s.language}</td>
                <td className="px-6 py-4 text-slate-600 italic">{s.output}</td>
                <td className="px-6 py-4 text-right text-slate-400">
                  {new Date(s.createdAt).toLocaleDateString('ro-RO')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}