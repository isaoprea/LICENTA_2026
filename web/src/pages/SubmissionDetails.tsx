import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function SubmissionDetails() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:3000/submissions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Eroare la preluarea detaliilor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="p-10 text-center font-bold text-slate-600 dark:text-slate-400 animate-pulse">Se încarcă detaliile submisiei...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Submisia nu a fost găsită.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fadeIn bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      {/* Header cu Navigare */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link to="/submissions" className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-2 block">
            ← Înapoi la Istoric
          </Link>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-50">
            Detalii Submisie: <span className="text-blue-600 dark:text-blue-400">{data.problem.title}</span>
          </h1>
        </div>
        <div className={`px-6 py-2 rounded-full font-black shadow-sm ${
          data.status === 'SUCCESS' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
        }`}>
          {data.status === 'SUCCESS' ? '✅ ADMIS' : '❌ RESPINS'}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-slate-400 dark:text-slate-500 text-xs uppercase font-bold mb-1">Limbaj utilizat</p>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300 capitalize">{data.language}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-slate-400 dark:text-slate-500 text-xs uppercase font-bold mb-1">Data trimiterii</p>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
            {new Date(data.createdAt).toLocaleString('ro-RO')}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-slate-400 dark:text-slate-500 text-xs uppercase font-bold mb-1">Scor evaluare</p>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{data.output}</p>
        </div>
      </div>

      {/* Tabel Analiză Teste */}
      {data.testResults && data.testResults.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <span>📊</span> Analiză Detaliată pe Teste
          </h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs uppercase">
                  <th className="px-6 py-4 font-bold">Test</th>
                  <th className="px-6 py-4 font-bold">Input</th>
                  <th className="px-6 py-4 font-bold">Așteptat</th>
                  <th className="px-6 py-4 font-bold">Primit</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {data.testResults.map((test: any, idx: number) => (
                  <tr key={idx} className={test.passed ? "" : "bg-rose-50/30 dark:bg-rose-900/10"}>
                    <td className="px-6 py-4 font-mono text-slate-400 dark:text-slate-600">#{idx + 1}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">{test.input}</td>
                    <td className="px-6 py-4 font-mono text-xs text-emerald-700 dark:text-emerald-400 font-bold">{test.expected}</td>
                    <td className="px-6 py-4 font-mono text-xs text-rose-700 dark:text-rose-400 font-bold whitespace-pre-wrap">
                      {test.actual || "[FĂRĂ OUTPUT]"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {test.passed ? (
                        <span className="text-emerald-500 text-xl font-bold">✓</span>
                      ) : (
                        <span className="text-rose-500 text-xl font-bold">✕</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Secțiunea de Cod cu cele 3 bulinuțe */}
      <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Codul trimis</h3>
      <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-800 dark:border-slate-700">
        <div className="bg-slate-800 dark:bg-slate-900 px-4 py-2 flex justify-between items-center border-b border-slate-700">
          <span className="text-slate-400 text-xs font-mono">
            source_code.{data.language === 'python' ? 'py' : data.language === 'cpp' ? 'cpp' : data.language === 'java' ? 'java' : 'js'}
          </span>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          </div>
        </div>
        <SyntaxHighlighter 
          language={data.language} 
          style={oneDark}
          customStyle={{ margin: 0, padding: '20px', fontSize: '14px', backgroundColor: '#1e293b' }}
          showLineNumbers
        >
          {data.code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}