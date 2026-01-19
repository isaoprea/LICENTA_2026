import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import axios from 'axios';

interface Problem {
  id: string;
  title: string;
  description: string;
}

interface TestDetail {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

interface JudgeResponse {
  success: boolean;
  passed: number;
  total: number;
  details: TestDetail[];
}

export default function App() {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('// Scrie codul tău aici...');
  const [language, setLanguage] = useState('javascript');
  const [results, setResults] = useState<JudgeResponse | null>(null);

  // 1. Fetch Lista de Probleme (Rămâne la fel)
  const { data: problems, isLoading } = useQuery({
    queryKey: ['problems'],
    queryFn: () => axios.get('http://localhost:3000/problems').then(res => res.data),
  });

  // 2. Logică de Trimitere Cod (Actualizată pentru noul backend)
  const mutation = useMutation({
    mutationFn: (newSubmission: { problemId: string; code: string; language: string }) =>
      axios.post('http://localhost:3000/submissions/run', newSubmission).then(res => res.data),
    onSuccess: (data: JudgeResponse) => {
      setResults(data); // Salvăm rezultatele primite instant
    }
  });

  if (isLoading) return <div style={{ padding: '20px' }}>Se încarcă problemele...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#f8f9fa' }}>
      
      {/* Sidebar: Lista de Probleme */}
      <div style={{ width: '350px', borderRight: '1px solid #dee2e6', padding: '20px', backgroundColor: 'white', overflowY: 'auto' }}>
        <h2 style={{ color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>Challenges</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          {problems?.map((p: Problem) => (
            <div 
              key={p.id} 
              onClick={() => {
                setSelectedProblem(p);
                setResults(null); // Resetăm rezultatele când schimbăm problema
                setCode('// Scrie codul tău aici...');
              }} 
              style={{ 
                cursor: 'pointer', 
                padding: '15px', 
                border: '1px solid',
                borderRadius: '10px',
                transition: 'all 0.2s',
                background: selectedProblem?.id === p.id ? '#e7f1ff' : '#fff',
                borderColor: selectedProblem?.id === p.id ? '#007bff' : '#dee2e6',
                boxShadow: selectedProblem?.id === p.id ? '0 4px 6px rgba(0,123,255,0.1)' : 'none'
              }}
            >
              <strong style={{ color: selectedProblem?.id === p.id ? '#0056b3' : '#333' }}>{p.title}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Zona Principală */}
      <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        {selectedProblem ? (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h1 style={{ margin: 0, color: '#222' }}>{selectedProblem.title}</h1>
              
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </select>
            </div>
            
            <p style={{ color: '#555', fontSize: '1.1em', lineHeight: '1.5', marginBottom: '25px' }}>{selectedProblem.description}</p>
            
            {/* MONACO EDITOR în loc de TEXTAREA */}
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Editor
                height="400px"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            <button 
              onClick={() => mutation.mutate({ problemId: selectedProblem.id, code, language })}
              disabled={mutation.isPending}
              style={{ 
                marginTop: '20px',
                padding: '12px 40px', 
                fontSize: '16px', 
                fontWeight: 'bold',
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                transition: 'background 0.2s',
                opacity: mutation.isPending ? 0.7 : 1
              }}
            >
              {mutation.isPending ? 'Se evaluează...' : 'Run Code'}
            </button>

            {/* Afișarea Rezultatelor (Actualizată) */}
            {results && (
              <div style={{ 
                marginTop: '30px', 
                padding: '20px', 
                borderRadius: '10px',
                borderLeft: '6px solid',
                backgroundColor: results.success ? '#d4edda' : '#f8d7da',
                borderColor: results.success ? '#28a745' : '#dc3545'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: results.success ? '#155724' : '#721c24' }}>
                  {results.success ? '✅ Admis (Toate testele au trecut)' : '❌ Respins'}
                </h3>
                <p><strong>Scor:</strong> {results.passed} / {results.total} teste trecute</p>
                
                <div style={{ marginTop: '15px' }}>
                  {results.details.map((detail, idx) => (
                    <div key={idx} style={{ 
                      padding: '8px', 
                      backgroundColor: 'rgba(255,255,255,0.5)', 
                      marginBottom: '5px', 
                      borderRadius: '4px',
                      fontSize: '0.9em' 
                    }}>
                      <span style={{ color: detail.passed ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                        Test {idx + 1}: {detail.passed ? 'PASSED' : 'FAILED'}
                      </span>
                      {!detail.passed && (
                        <div style={{ marginLeft: '10px', marginTop: '4px', fontFamily: 'monospace' }}>
                          Așteptat: <span style={{color: '#444'}}>"{detail.expected}"</span> | 
                          Primit: <span style={{color: '#c00'}}>"{detail.actual}"</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '100px', color: '#6c757d' }}>
            <div style={{ fontSize: '50px' }}>💻</div>
            <h2>Selectează o problemă pentru a începe codarea</h2>
          </div>
        )}
      </div>
    </div>
  );
}