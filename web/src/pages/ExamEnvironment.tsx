import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useExamMonitor } from '../hooks/useExamMonitor';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const apiFetch = (url: string, options: RequestInit = {}) => {
  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json',
      ...options.headers,
    }
  });
};

export default function ExamEnvironment() {
  const { token } = useParams<{ token: string }>();
  const [session, setSession] = useState<any>(null);
  const [step, setStep] = useState<'LOADING' | 'LOBBY' | 'EXAM' | 'COMPLETED' | 'KICKED'>('LOADING');
  const [code, setCode] = useState('// Scrie codul tău aici...\n');
  
  const [history, setHistory] = useState<{t: number, c: string}[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const lastSavedCodeRef = useRef<string>('');

  const { warnings, isKicked, startMonitoring, stopMonitoring } = useExamMonitor(token || '', 3);

  useEffect(() => {
    apiFetch(`/assessments/session/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.statusCode === 404 || data.error) {
          setStep('KICKED');
        } else {
          setSession(data);
          if (data.status === 'COMPLETED') setStep('COMPLETED');
          else if (data.status === 'SUSPENDED_CHEATING') setStep('KICKED');
          else setStep('LOBBY');
        }
      })
      .catch(() => setStep('KICKED'));
  }, [token]);

  useEffect(() => {
    if (step !== 'EXAM') return;

    const recorder = setInterval(() => {
      if (code === lastSavedCodeRef.current) return;

      const elapsed = startTimeRef.current 
        ? Math.floor((Date.now() - startTimeRef.current) / 1000) 
        : 0;

      setHistory(prev => [...prev, { t: elapsed, c: code }]);
      lastSavedCodeRef.current = code;
    }, 3000);

    return () => clearInterval(recorder);
  }, [code, step]);

  useEffect(() => {
    if (isKicked) {
      setStep('KICKED');
      stopMonitoring();
    }
  }, [isKicked, stopMonitoring]);

  const handleStart = () => {
    startTimeRef.current = Date.now();
    startMonitoring();
    setStep('EXAM');
  };

  const handleSubmit = async () => {
    stopMonitoring();
    
    const hasPasteDetected = history.some((entry, index) => {
      if (index === 0) return entry.c.length > 300;
      return entry.c.length - history[index - 1].c.length > 300;
    });

    // ✅ apiFetch în loc de fetch
    await apiFetch(`/assessments/session/${token}/submit`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        score: 100,
        finalCode: code,
        codeHistory: history,
        detectedPaste: hasPasteDetected
      })
    });
    
    setStep('COMPLETED');
  };

  const requiredLanguage = session?.assessment?.language || 'javascript';

  if (step === 'LOADING') return (
    <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center font-bold tracking-widest animate-pulse">
      SE ÎNCARCĂ MEDIUL SECURIZAT...
    </div>
  );

  if (step === 'COMPLETED') return (
    <div className="min-h-screen bg-slate-950 text-green-400 flex flex-col justify-center items-center text-center p-4">
      <h1 className="text-5xl font-extrabold mb-4">Examen Finalizat!</h1>
      <p className="text-xl text-slate-300">Rezultatele tale au fost trimise către {session?.assessment?.companyName}.</p>
    </div>
  );

  if (step === 'KICKED') return (
    <div className="min-h-screen bg-slate-950 text-red-500 flex flex-col justify-center items-center text-center p-4">
      <h1 className="text-5xl font-extrabold mb-4">Sesiune Terminată/Invalidă</h1>
      <p className="text-xl text-slate-400 max-w-md">Accesul a fost revocat din cauza detectării tentativelor de fraudă.</p>
    </div>
  );

  if (step === 'LOBBY') return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center pt-20 px-4">
      <div className="bg-slate-900 p-10 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-800">
        <h1 className="text-4xl font-bold text-blue-500 mb-2">{session?.assessment?.title}</h1>
        <p className="text-slate-400 text-lg mb-8 italic text-white font-semibold">{session?.assessment?.companyName}</p>
        <div className="bg-red-950/20 border border-red-900/40 p-6 rounded-xl text-red-100 mb-10">
          <h3 className="font-bold text-lg mb-3">⚠️ PROTOCOL DE SECURITATE:</h3>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>Limbaj: <span className="text-amber-400 font-bold uppercase">{requiredLanguage}</span></li>
            <li>Testul se desfășoară în regim monitorizat.</li>
            <li>La <span className="text-red-400 font-bold">{warnings}/3 avertismente</span>, ești exclus.</li>
          </ul>
        </div>
        <button onClick={handleStart} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20">
          Accept regulile și încep examenul
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white">
      <header className="flex justify-between items-center px-6 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-6">
          <h2 className="font-bold text-xl text-blue-400 tracking-tight">{session?.assessment?.title}</h2>
          {warnings > 0 && (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-red-600/20 border border-red-600/50 rounded-full text-red-500 text-sm font-black animate-pulse">
              AVERTISMENT: {warnings}/3
            </div>
          )}
        </div>
        <button 
          onClick={handleSubmit} 
          className="px-8 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-all transform hover:scale-105"
        >
          Finalizează și Trimite
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 p-8 border-r border-slate-800 overflow-y-auto bg-slate-900/30">
          <h3 className="text-3xl font-extrabold">{session?.assessment?.problems[0]?.title}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded bg-blue-900/30 text-blue-400 text-xs font-bold border border-blue-800">
              Dificultate: {session?.assessment?.problems[0]?.difficulty}
            </span>
          </div>
          <hr className="border-slate-800 my-6" />
          <div className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
            {session?.assessment?.problems[0]?.description}
          </div>
        </div>

        <div className="w-2/3 bg-[#1e1e1e]">
          <Editor
            height="100%"
            theme="vs-dark"
            language={requiredLanguage} 
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              padding: { top: 20 },
              cursorSmoothCaretAnimation: "on",
              smoothScrolling: true,
              fontFamily: "'Fira Code', 'Courier New', monospace"
            }}
          />
        </div>
      </div>
    </div>
  );
}