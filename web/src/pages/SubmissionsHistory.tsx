import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SubmissionsHistory() {
  const [submissions, setSubmissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    axios.get('http://localhost:3000/submissions', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => setSubmissions(res.data))
    .catch(err => {
      console.error('Eroare la încărcare:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    });
  }, [navigate]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Activitatea Ta</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              {/* COLOANĂ NOUĂ */}
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-blue-600">Problemă</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Limbaj</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Scor/Output</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {submissions.map((s: any) => (
              <tr 
                key={s.id} 
                onClick={() => navigate(`/submissions/${s.id}`)} 
                className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                title="Click pentru a vedea codul sursă"
              >
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    s.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {s.status}
                  </span>
                </td>
                
                {/* DATE COLOANĂ NOUĂ */}
                <td className="px-6 py-4 font-bold text-slate-700">
                  {s.problem?.title || 'Problemă Necunoscută'}
                </td>

                <td className="px-6 py-4 font-mono text-slate-600 capitalize">{s.language}</td>
                <td className="px-6 py-4 text-slate-600 italic">
                  {s.output}
                  <span className="ml-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold">
                    VEZI COD →
                  </span>
                </td>
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