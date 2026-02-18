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

  if (!problem) return <div style={{ padding: '40px' }}>Se încarcă...</div>;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
      {/* Panoul Stâng: Descriere */}
      <div style={{ flex: 1, padding: '30px', borderRight: '1px solid #ddd', overflowY: 'auto', backgroundColor: '#fff' }}>
        <h1 style={{ marginBottom: '10px' }}>{problem.title}</h1>
        <span style={{ backgroundColor: '#e9ecef', padding: '4px 12px', borderRadius: '15px', fontSize: '0.8em', fontWeight: 'bold' }}>
          {problem.difficulty}
        </span>
        <p style={{ marginTop: '25px', lineHeight: '1.6', fontSize: '1.1em' }}>{problem.description}</p>
      </div>

      {/* Panoul Drept: Editor și Rezultate */}
      <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', padding: '20px', gap: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: '5px' }}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          <button onClick={handleRun} disabled={loading} style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '8px 25px', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Se rulează...' : 'Run Code'}
          </button>
        </div>

        <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
          <Editor height="100%" language={language} theme="vs-dark" value={code} onChange={(v) => setCode(v || '')} />
        </div>

        {results && (
          <div style={{ height: '150px', padding: '15px', backgroundColor: results.success ? '#d4edda' : '#f8d7da', borderRadius: '4px', overflowY: 'auto' }}>
            <h4 style={{ margin: 0 }}>Status: {results.success ? "✅ SUCCESS" : "❌ FAILED"}</h4>
            <p>Teste trecute: {results.passed} / {results.total}</p>
            {results.details?.map((d: any, i: number) => (
              <div key={i} style={{ fontSize: '0.85em' }}>Test {i+1}: {d.passed ? 'PASSED' : `FAILED (Expected: ${d.expected}, Got: ${d.actual})`}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}