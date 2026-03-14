import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useExamMonitor } from '../hooks/useExamMonitor';

export default function ExamEnvironment() {
  const { token } = useParams<{ token: string }>();
  const [session, setSession] = useState<any>(null);
  const [step, setStep] = useState<'LOADING' | 'LOBBY' | 'EXAM' | 'COMPLETED' | 'KICKED'>('LOADING');
  const [code, setCode] = useState('// Scrie codul tău aici...\n');
  
  const { warnings, isKicked, startMonitoring, stopMonitoring } = useExamMonitor(token || '', 3);

  useEffect(() => {
    fetch(`http://localhost:3000/assessments/session/${token}`)
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
    if (isKicked) {
      setStep('KICKED');
      stopMonitoring();
    }
  }, [isKicked, stopMonitoring]);

  const handleStart = () => {
    startMonitoring();
    setStep('EXAM');
  };

  const handleSubmit = async () => {
    stopMonitoring();
   
    const finalScore = 100; 

    await fetch(`http://localhost:3000/assessments/session/${token}/submit`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: finalScore })
    });
    
    setStep('COMPLETED');
  };

  const requiredLanguage = session?.assessment?.language || 'javascript';


  if (step === 'LOADING') return <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center font-bold tracking-widest animate-pulse">SE ÎNCARCĂ MEDIUL SECURIZAT...</div>;

  if (step === 'COMPLETED') return (
    <div className="min-h-screen bg-slate-950 text-green-400 flex flex-col justify-center items-center text-center p-4">
      <h1 className="text-5xl font-extrabold mb-4">Examen Finalizat!</h1>
      <p className="text-xl text-slate-300">Mulțumim. Rezultatele tale au fost trimise către {session?.assessment?.companyName}.</p>
    </div>
  );

  if (step === 'KICKED') return (
    <div className="min-h-screen bg-slate-950 text-red-500 flex flex-col justify-center items-center text-center p-4">
      <h1 className="text-5xl font-extrabold mb-4">Sesiune Terminatat/Invalidă</h1>
      <p className="text-xl text-slate-400 max-w-md">Accesul a fost revocat din cauza detectării mai multor tentative de părăsire a paginii sau a unui token invalid.</p>
    </div>
  );

  if (step === 'LOBBY') return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center pt-20 px-4">
      <div className="bg-slate-900 p-10 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-800">
        <h1 className="text-4xl font-bold text-blue-500 mb-2">{session?.assessment?.title}</h1>
        <p className="text-slate-400 text-lg mb-8 italic">Organizat de: <span className="text-white font-semibold not-italic">{session?.assessment?.companyName}</span></p>
        
        <div className="bg-red-950/20 border border-red-900/40 p-6 rounded-xl text-red-100 mb-10">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
             <span>⚠️ PROTOCOL DE SECURITATE:</span>
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>Limbaj obligatoriu: <span className="text-amber-400 font-bold uppercase">{requiredLanguage}</span></li>
            <li>Testul se desfășoară exclusiv în modul **Fullscreen**.</li>
            <li>La **{warnings}/3 avertismente**, sesiunea este blocată definitiv.</li>
            <li>Timp limită: **{session?.assessment?.timeLimit} minute**.</li>
          </ul>
        </div>

        <button 
          onClick={handleStart}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20"
        >
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
          {session?.assessment?.problems?.length > 0 ? (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Problema Curentă</span>
                <h3 className="text-3xl font-extrabold mt-1">{session.assessment.problems[0].title}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded bg-blue-900/30 text-blue-400 text-xs font-bold border border-blue-800">
                    Dificultate: {session.assessment.problems[0].difficulty}
                  </span>
                  <span className="px-3 py-1 rounded bg-amber-900/30 text-amber-400 text-xs font-bold border border-amber-800 uppercase">
                    Limbaj: {requiredLanguage}
                  </span>
                </div>
              </div>
              
              <hr className="border-slate-800" />

              <div className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                {session.assessment.problems[0].description}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 italic">
              <p>Nu s-a găsit nicio cerință atașată acestui test.</p>
            </div>
          )}
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
              fontFamily: "'Fira Code', 'Courier New', monospace",
              renderValidationDecorations: "on"
            }}
          />
        </div>
      </div>
    </div>
  );
}