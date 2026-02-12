import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
// Importăm componentele pentru colorarea codului
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

  if (loading) return <div className="p-10 text-center font-bold">Se încarcă detaliile submisiei...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Submisia nu a fost găsită.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Header cu Navigare înapoi */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link to="/submissions" className="text-blue-600 hover:underline text-sm mb-2 block">
            ← Înapoi la Istoric
          </Link>
          <h1 className="text-3xl font-black text-slate-800">
            Detalii Submisie: <span className="text-blue-600">{data.problem.title}</span>
          </h1>
        </div>
        <div className={`px-4 py-2 rounded-lg font-bold shadow-sm ${
          data.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {data.status}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-xs uppercase font-bold mb-1">Limbaj utilizat</p>
          <p className="text-lg font-bold text-slate-700 capitalize">{data.language}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-xs uppercase font-bold mb-1">Data trimiterii</p>
          <p className="text-lg font-bold text-slate-700">
            {new Date(data.createdAt).toLocaleString('ro-RO')}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-xs uppercase font-bold mb-1">Scor evaluare</p>
          <p className="text-lg font-bold text-slate-700">{data.output}</p>
        </div>
      </div>

      {/* Secțiunea de Cod cu Syntax Highlighting */}
      <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-800">
        <div className="bg-slate-800 px-4 py-2 flex justify-between items-center">
          <span className="text-slate-400 text-xs font-mono">source_code.{data.language === 'python' ? 'py' : data.language === 'cpp' ? 'cpp' : data.language === 'java' ? 'java' : 'js'}</span>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          </div>
        </div>
        <SyntaxHighlighter 
          language={data.language} 
          style={oneDark}
          customStyle={{ margin: 0, padding: '20px', fontSize: '14px' }}
          showLineNumbers
        >
          {data.code}
        </SyntaxHighlighter>
      </div>

      {/* Mesaj de eroare (Stderr) - apare doar dacă nu este SUCCESS */}
      {data.status !== 'SUCCESS' && (
        <div className="mt-8 bg-slate-900 rounded-xl p-6 border-l-4 border-red-500">
          <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
            <span>⚠️</span> Detalii Eroare / Output Consolă
          </h3>
          <pre className="text-slate-300 font-mono text-sm whitespace-pre-wrap leading-relaxed">
            {data.output.includes('Trecute:') ? "Codul a rulat dar rezultatele sunt incorecte." : data.output}
          </pre>
        </div>
      )}
    </div>
  );
}