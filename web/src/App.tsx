import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface Problem {
  id: string;
  title: string;
  description: string;
}

export default function App() {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('');
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // 1. Fetch Lista de Probleme
  const { data: problems, isLoading } = useQuery({
    queryKey: ['problems'],
    queryFn: () => fetch('http://localhost:3000/problems').then(res => res.json()),
  });

  // 2. Polling pentru Rezultatul Evaluării
  // Această interogare rulează automat la fiecare 2 secunde dacă statusul este PENDING
  const { data: result } = useQuery({
    queryKey: ['submission', submissionId],
    queryFn: () => fetch(`http://localhost:3000/submissions/${submissionId}`).then(res => res.json()),
    enabled: !!submissionId, // Se activează doar când avem un ID
    refetchInterval: (query) => 
      query.state.data?.status === 'PENDING' ? 2000 : false, // Verifică la 2 secunde dacă e în lucru
  });

  // 3. Logică de Trimitere Cod
  const mutation = useMutation({
    mutationFn: (newSubmission: any) => 
      fetch('http://localhost:3000/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubmission),
      }).then(res => res.json()),
    onSuccess: (data) => {
      setSubmissionId(data.id); // Salvăm ID-ul pentru a porni polling-ul
    }
  });

  if (isLoading) return <div style={{ padding: '20px' }}>Se încarcă problemele...</div>;

  return (
    <div style={{ display: 'flex', padding: '20px', gap: '20px', fontFamily: 'sans-serif' }}>
      {/* Sidebar: Lista de Probleme */}
      <div style={{ width: '300px', borderRight: '1px solid #eee', paddingRight: '20px' }}>
        <h2>Challenges</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {problems?.map((p: Problem) => (
            <div 
              key={p.id} 
              onClick={() => {
                setSelectedProblem(p);
                setSubmissionId(null); // Resetăm rezultatul vechi la schimbarea problemei
              }} 
              style={{ 
                cursor: 'pointer', 
                padding: '15px', 
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: selectedProblem?.id === p.id ? '#f0f7ff' : '#fff',
                borderColor: selectedProblem?.id === p.id ? '#007bff' : '#ddd'
              }}
            >
              <strong>{p.title}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Zona Principală: Editor și Rezultate */}
      <div style={{ flex: 1 }}>
        {selectedProblem ? (
          <>
            <h1>{selectedProblem.title}</h1>
            <p style={{ color: '#666', marginBottom: '20px' }}>{selectedProblem.description}</p>
            
            <textarea 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              style={{ 
                width: '100%', 
                height: '300px', 
                fontFamily: 'monospace', 
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                marginBottom: '10px'
              }}
              placeholder="Scrie codul tău JavaScript aici..."
            />

            <button 
              onClick={() => mutation.mutate({ problemId: selectedProblem.id, code, language: 'javascript' })}
              disabled={mutation.isPending || (result?.status === 'PENDING')}
              style={{ 
                padding: '10px 25px', 
                fontSize: '16px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                opacity: (mutation.isPending || result?.status === 'PENDING') ? 0.6 : 1
              }}
            >
              {mutation.isPending || result?.status === 'PENDING' ? 'Se evaluează...' : 'Run Code'}
            </button>

            {/* Afișarea Rezultatului */}
            {result && (
              <div style={{ 
                marginTop: '20px', 
                padding: '20px', 
                borderRadius: '8px',
                border: '1px solid',
                backgroundColor: result.status === 'SUCCESS' ? '#d4edda' : 
                                 result.status === 'PENDING' ? '#fff3cd' : '#f8d7da',
                color: result.status === 'SUCCESS' ? '#155724' : 
                       result.status === 'PENDING' ? '#856404' : '#721c24',
                borderColor: result.status === 'SUCCESS' ? '#c3e6cb' : 
                             result.status === 'PENDING' ? '#ffeeba' : '#f5c6cb'
              }}>
                <h3 style={{ margin: '0 0 10px 0' }}>Status: {result.status}</h3>
                <p style={{ margin: 0 }}><strong>Feedback:</strong> {result.output}</p>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>
            <h2>Selectează o problemă din stânga pentru a începe.</h2>
          </div>
        )}
      </div>
    </div>
  );
}