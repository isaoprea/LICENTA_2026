import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
  ChevronLeft, 
  Play, 
  CheckCircle, 
  Loader2, 
  Sparkles, 
  ArrowRight, 
  X
} from 'lucide-react';

export default function LessonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  
  // --- STATE-URI PRINCIPALE ---
  const [lesson, setLesson] = useState<any>(null);
  const [mode, setMode] = useState<'study' | 'code'>('study');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

  // --- STATE-URI AI MENTOR ---
  const [aiHint, setAiHint] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const { scrollYProgress } = useScroll({ container: contentRef });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    axios.get(`http://localhost:3000/lessons/${id}`)
      .then(res => {
        setLesson(res.data);
        const lang = res.data.module?.language || 'python';
        setCode(lang === 'python' ? '# Rezolvă task-ul aici\n' : '// Codul tău aici\n');
      })
      .catch(err => console.error("Eroare la încărcarea lecției:", err));
  }, [id]);

  const handleRunCode = async () => {
    if (!lesson?.problems?.length) {
      setOutput("Eroare: Nu există nicio problemă asociată acestei lecții.");
      return;
    }

    setLoading(true);
    setAiHint(""); 
    setOutput("> Se execută testele...");
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Sesiunea a expirat. Te rugăm să te loghezi din nou.');
        return;
      }

      const res = await axios.post('http://localhost:3000/submissions/run', {
        problemId: lesson.problems[0].id,
        code: code,
        language: lesson.module.language
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const results = res.data;
      let consoleText = `Status: ${results.success ? "✅ SUCCESS" : "❌ FAILED"}\n`;
      consoleText += `Teste trecute: ${results.passed} / ${results.total}\n\n`;
      
      results.details.forEach((d: any, i: number) => {
        consoleText += `Test ${i + 1}: ${d.passed ? 'PASSED' : `FAILED (Așteptat: ${d.expected}, Primit: ${d.actual})`}\n`;
      });

      setOutput(consoleText);
      if (results.success) setIsSolved(true);

    } catch (err: any) {
      setOutput(`Eroare: ${err.response?.data?.message || "Server inaccesibil"}`);
    } finally {
      setLoading(false);
    }
  };

  // FUNCȚIA PENTRU AI MENTOR
  const handleGetAIHint = async () => {
    if (!output || output.includes("✅ SUCCESS")) return;

    setIsAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:3000/ai/explain', {
        problemId: lesson.problems[0].id,
        code: code,
        error: output 
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setAiHint(res.data);
    } catch (err) {
      setAiHint("Mentorul a întâmpinat o problemă. Încearcă din nou.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!lesson) return <div className="h-screen flex items-center justify-center font-bold text-slate-400">Se pregătește lecția...</div>;

  const language = lesson.module?.language || 'python';

  return (
    <div className="h-[calc(100vh-64px)] bg-white dark:bg-slate-950 overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        {mode === 'study' ? (
          <motion.div key="study" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative flex-1 overflow-hidden">
            <motion.div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600 z-50 origin-left" style={{ scaleX }} />
            <div ref={contentRef} className="h-full overflow-y-auto pt-16 pb-32 px-6">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 text-blue-400 font-bold text-sm mb-6 uppercase tracking-widest italic">
                   <Sparkles size={18} /> <span>{lesson.module?.title}</span>
                </div>
                <h1 className="text-5xl font-black text-slate-50 mb-10 leading-tight">{lesson.title}</h1>
                <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed">
                  <ReactMarkdown>{lesson.content}</ReactMarkdown>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setMode('code')}
                  className="mt-16 w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-xl flex items-center justify-center gap-4 shadow-2xl">
                  Sunt gata să codez! <ArrowRight />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="code" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} className="flex h-full">
            {/* Panou Stânga: Cerința */}
            <div className="w-[30%] border-r border-slate-800 flex flex-col bg-slate-900">
              <div className="p-6 border-b border-slate-800 bg-slate-800/50 text-xs">
                <button onClick={() => setMode('study')} className="text-slate-400 hover:text-blue-400 flex items-center gap-2 font-black uppercase tracking-tighter">
                  <ChevronLeft size={16} /> Înapoi la teorie
                </button>
              </div>
              <div className="p-10 overflow-y-auto flex-1">
                <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded inline-block mb-4 uppercase">Misiune</div>
                <h2 className="text-2xl font-black text-slate-50 mb-6">{lesson.problems[0]?.title}</h2>
                <p className="text-slate-400 text-lg leading-relaxed">{lesson.problems[0]?.description}</p>
              </div>
            </div>

            {/* Panou Dreapta: Editor + Consola cu AI */}
            <div className="flex-1 flex flex-col bg-slate-950">
              <div className="flex-1">
                <Editor height="100%" theme="vs-dark" language={language} value={code} onChange={(val) => setCode(val || '')}
                  options={{ fontSize: 16, minimap: { enabled: false }, padding: { top: 24 }, smoothScrolling: true }} />
              </div>

              {/* CONSOLA DE OUTPUT + AI MENTOR */}
              <div className="h-[40%] bg-slate-900 border-t border-slate-800 p-6 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500 font-mono text-[10px] font-black uppercase tracking-widest italic">Output Console</span>
                    {isAiLoading && (
                      <div className="flex items-center gap-2 text-purple-400 text-xs font-bold animate-pulse">
                        <Loader2 className="animate-spin" size={14} /> Mentorul analizează...
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    {output.includes("❌ FAILED") && (
                      <motion.button initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={handleGetAIHint} disabled={isAiLoading}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20">
                        <Sparkles size={16} /> De ce am greșit?
                      </motion.button>
                    )}
                    <button onClick={handleRunCode} disabled={loading} className="px-8 py-2 bg-blue-600 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20">
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />} Rulează
                    </button>
                    {isSolved && (
                      <button onClick={() => navigate(`/lessons/${language}`)} className="px-8 py-2 bg-green-500 text-white rounded-xl font-black text-xs flex items-center gap-2 animate-pulse shadow-lg shadow-green-500/20">
                        Pasul Următor <CheckCircle size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
                  {/* Textul Consolei */}
                  <div className="flex-1 bg-black/50 rounded-2xl p-5 font-mono text-sm text-green-400 border border-slate-800 overflow-y-auto whitespace-pre-wrap">
                    {output || '> Sistem online. Aștept execuția codului...'}
                  </div>

                  {/* Fereastra AI Mentor */}
                  <AnimatePresence>
                    {aiHint && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="lg:w-1/3 bg-purple-900/10 border border-purple-500/30 rounded-2xl p-5 overflow-y-auto relative backdrop-blur-md">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-purple-400 font-black text-[10px] uppercase tracking-tighter">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                            AI Mentor Insight
                          </div>
                          <button onClick={() => setAiHint("")} className="text-slate-500 hover:text-white"><X size={14}/></button>
                        </div>
                        <p className="text-slate-200 text-sm leading-relaxed italic">{aiHint}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}