import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Rocket, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle,
  Code2
} from 'lucide-react';

export default function AssignmentSolving() {
  const { assignmentId } = useParams(); // ID-ul temei extras din URL
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<any>(null);
  const [code, setCode] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  // 1. Mapare ID-uri limbaje pentru Monaco Editor
  const getMonacoLang = (lang: string) => {
    const l = lang.toLowerCase();
    if (l === 'c++' || l === 'cpp') return 'cpp';
    if (l === 'python' || l === 'py') return 'python';
    return l;
  };

  // 2. Fetch date temă la încărcare
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/assignments/${assignmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAssignment(res.data);
        setCode(getDefaultCode(res.data.language));
      } catch (err: any) {
        setError("Nu s-a putut încărca tema oficială. Verifică dacă ești logat.");
      }
    };
    if (token && assignmentId) fetchAssignment();
  }, [assignmentId, token]);

  const getDefaultCode = (lang: string) => {
    const lowerLang = lang.toLowerCase();
    if (lowerLang.includes('py')) return "# Scrie rezolvarea aici\n\n";
    if (lowerLang.includes('c')) return "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Scrie codul tău aici\n    return 0;\n}";
    return "// Scrie codul tău aici...";
  };

  // 3. Trimiterea soluției către Backend
  const handleRun = async () => {
    if (!assignment) return;
    
    setLoading(true);
    setResults(null);
    try {
      // Trimitem assignmentId pentru a declanșa notificarea profesorului în SubmissionsService
      const res = await axios.post('http://localhost:3000/submissions/run', {
        problemId: assignment.problem.id,
        code,
        language: getMonacoLang(assignment.language),
        assignmentId: assignmentId // 👈 LEGĂTURA CRITICĂ: Trimitem ID-ul temei
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setResults(res.data);

      // Dacă a trecut toate testele, poți adăuga o redirecționare sau un mesaj special
      if (res.data.success) {
        console.log("Tema a fost marcată ca succes în DB și profesorul a fost notificat!");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Eroare la comunicarea cu serverul.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className="h-screen bg-slate-950 flex items-center justify-center text-rose-500 font-bold">{error}</div>;
  if (!assignment) return <div className="h-screen bg-[#020617] flex items-center justify-center animate-pulse text-blue-500 font-black tracking-widest">SECURIZARE MEDIU...</div>;

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      
      {/* HEADER: BLOCAT PE LIMBAJUL PROFESORULUI */}
      <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
              <Code2 size={16} className="text-blue-500" /> Rezolvare Temă Oficială
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {assignment.classroom?.name || 'Fără clasă asociată'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-blue-500/10 px-4 py-2 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/5">
          <Lock size={12} className="text-blue-400" />
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">
            COMPILATOR FIXAT: {assignment.language}
          </span>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

        {/* PANOU STÂNGA: DESCRIERE PROBLEMĂ */}
        <aside className="w-[30%] border-r border-white/5 overflow-y-auto p-8 bg-slate-950/20 scrollbar-thin scrollbar-thumb-slate-800">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <span className="text-[10px] font-black bg-rose-600/20 text-rose-500 px-3 py-1 rounded-md uppercase tracking-widest border border-rose-500/20">
              {assignment.problem.difficulty || 'HARD'}
            </span>
            <h1 className="text-3xl font-black text-white mt-4 italic uppercase tracking-tighter leading-none">
              {assignment.problem.title}
            </h1>
            <div className="h-1.5 w-12 bg-blue-600 rounded-full mt-3 mb-8" />
            
            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {assignment.problem.description}
            </p>
          </motion.div>
        </aside>

        {/* PANOU DREAPTA: EDITOR ȘI REZULTATE */}
        <section className="flex-1 flex flex-col p-6 gap-6 relative bg-slate-900/10">
          <div className="flex-1 rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#1e1e1e] shadow-2xl relative group">
            <Editor 
              height="100%" 
              language={getMonacoLang(assignment.language)} 
              theme="vs-dark" 
              value={code} 
              onChange={(v) => setCode(v || '')} 
              options={{
                fontSize: 15,
                fontFamily: 'JetBrains Mono',
                minimap: { enabled: false },
                padding: { top: 20 },
                lineNumbersMinChars: 3,
                smoothScrolling: true,
                cursorSmoothCaretAnimation: "on"
              }}
            />
            
            <motion.button 
              onClick={handleRun} 
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`absolute bottom-8 right-8 px-10 py-5 rounded-3xl font-black flex items-center gap-3 shadow-2xl transition-all z-10
                ${loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/20'}`}
            >
              {loading ? "SE VERIFICĂ..." : <><Rocket size={20} /> TRIMITE REZOLVAREA</>}
            </motion.button>
          </div>

          {/* AFIȘARE REZULTATE */}
          <AnimatePresence>
            {results && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                className="h-1/3 min-h-[280px] shrink-0"
              >
                <div className={`h-full rounded-[2.5rem] border-2 backdrop-blur-3xl overflow-hidden flex flex-col 
                  ${results.success ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                  
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {results.success ? <CheckCircle2 className="text-emerald-500" size={24} /> : <XCircle className="text-rose-500" size={24} />}
                      <h4 className="text-xl font-black uppercase italic tracking-tighter">
                        STATUS: {results.success ? "FINALIZAT" : "REÎNCEARCĂ"}
                      </h4>
                    </div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-500">
                      TESTE TRECUTE: {results.passed} / {results.total}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {results.details?.map((d: any, i: number) => (
                      <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-xs shadow-inner">
                        <div className="flex justify-between items-center mb-3">
                          <span className={`font-black uppercase tracking-tighter ${d.passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {d.passed ? '✅ Test Passed' : '❌ Test Failed'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-slate-600 font-black uppercase text-[9px] tracking-widest italic">Input</p>
                            <pre className="bg-slate-900/50 p-3 rounded-xl border border-white/5 text-slate-300 overflow-x-auto">{d.input}</pre>
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-600 font-black uppercase text-[9px] tracking-widest italic">Expected / Actual</p>
                            <div className="flex flex-col gap-1">
                              <pre className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400 border border-emerald-500/20">Exp: {d.expected}</pre>
                              {!d.passed && <pre className="bg-rose-500/10 p-3 rounded-xl text-rose-400 border border-rose-500/20 shadow-lg">Got: {d.actual}</pre>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {results.success && (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                        <p className="text-emerald-500 font-black uppercase text-xs italic tracking-widest">
                          🌟 Felicitări! Profesorul a fost notificat de succesul tău.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}