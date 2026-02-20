import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';

export default function ProblemDetail() {
  const { id } = useParams(); // Preluăm ID-ul din URL
  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState('// Scrie codul tău aici...');
  const [language, setLanguage] = useState('javascript');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:3000/problems/${id}`).then(res => {
      setProblem(res.data);
    });
  }, [id]);

  const handleRun = async () => {
    setLoading(true);
    setResults(null);
    try {
      const token = localStorage.getItem('token'); // Preia token-ul salvat la login
      if (!token) {
        alert('Nu ești autentificat. Te rog să te loghezi.');
        setLoading(false);
        return;
      }
      
      const res = await axios.post('http://localhost:3000/submissions/run', {
        problemId: id,
        code,
        language
      }, {
        headers: {
          'Authorization': `Bearer ${token}` // Adaugă token-ul în header
        }
      });
      setResults(res.data);
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message;
      console.error('Eroare:', err.response?.data || err.message);
      if (status === 401) {
        localStorage.removeItem('token');
        alert('Sesiunea a expirat. Te rog să te loghezi din nou.');
      } else {
        alert(`Eroare la verificarea codului: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!problem) return <div className="p-10 text-center text-slate-600 dark:text-slate-400 animate-pulse">Se încarcă...</div>;

  return (
    <div className="flex h-[calc(100vh-60px)] bg-slate-50 dark:bg-slate-950">
      {/* Panoul Stâng: Descriere */}
      <div className="flex-1 p-8 border-r border-slate-200 dark:border-slate-700 overflow-y-auto bg-white dark:bg-slate-900">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 mb-4">{problem.title}</h1>
        <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-1.5 rounded-full text-sm font-bold mb-6">
          {problem.difficulty}
        </span>
        <p className="mt-6 leading-relaxed text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{problem.description}</p>
      </div>

      {/* Panoul Drept: Editor și Rezultate */}
      <div className="flex-1 flex flex-col p-5 gap-4 bg-white dark:bg-slate-900">
        <div className="flex justify-between items-center">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-700 font-bold">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          <button 
            onClick={handleRun} 
            disabled={loading} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Se rulează...' : 'Run Code'}
          </button>
        </div>

        <div className="flex-1 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          <Editor height="100%" language={language} theme="vs-dark" value={code} onChange={(v) => setCode(v || '')} />
        </div>

        {results && (
          <div className={`p-4 rounded-lg max-h-40 overflow-y-auto border-t-4 ${
            results.success 
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-900 dark:text-emerald-100' 
              : 'bg-rose-50 dark:bg-rose-900/20 border-rose-500 text-rose-900 dark:text-rose-100'
          }`}>
            <h4 className="font-bold mb-2">Status: {results.success ? "✅ SUCCESS" : "❌ FAILED"}</h4>
            <p className="mb-2">Teste trecute: {results.passed} / {results.total}</p>
            {results.details?.map((d: any, i: number) => (
              <div key={i} className="text-sm font-mono mb-1">
                Test {i+1}: {d.passed ? '✅ PASSED' : `❌ FAILED (Expected: ${d.expected}, Got: ${d.actual})`}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}