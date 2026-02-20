import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { BookOpen, Code2, ChevronLeft, Play, CheckCircle, Loader2, Sparkles, ArrowRight, Lock } from 'lucide-react';

export default function LessonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  
  // --- STATE-URI ---
  const [lesson, setLesson] = useState<any>(null);
  const [mode, setMode] = useState<'study' | 'code'>('study');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

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
    setOutput("> Se execută testele...");
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Sesiunea a expirat. Te rugăm să te loghezi din nou.');
        setLoading(false);
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
      
      // Formatăm rezultatele pentru consolă
      let consoleText = `Status: ${results.success ? "✅ SUCCESS" : "❌ FAILED"}\n`;
      consoleText += `Teste trecute: ${results.passed} / ${results.total}\n\n`;
      
      results.details.forEach((d: any, i: number) => {
        consoleText += `Test ${i + 1}: ${d.passed ? 'PASSED' : `FAILED (Așteptat: ${d.expected}, Primit: ${d.actual})`}\n`;
      });

      setOutput(consoleText);
      if (results.success) setIsSolved(true);

    } catch (err: any) {
      console.error('Eroare la submisie:', err.response?.data || err.message);
      setOutput(`Eroare: ${err.response?.data?.message || "Server inaccesibil"}`);
    } finally {
      setLoading(false);
    }
  };

  // Verificare încărcare
  if (!lesson) return <div className="h-screen flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">Se pregătește lecția...</div>;

  // REPARARE: Definim variabila language folosind datele din lesson
  const language = lesson.module?.language || 'python';

  return (
    <div className="h-[calc(100vh-64px)] bg-white dark:bg-slate-950 overflow-hidden flex flex-col font-sans">
      <AnimatePresence mode="wait">
        {mode === 'study' ? (
          <motion.div 
            key="study"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative flex-1 overflow-hidden"
          >
            <motion.div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600 z-50 origin-left" style={{ scaleX }} />

            <div ref={contentRef} className="h-full overflow-y-auto pt-16 pb-32 px-6">
              <div className="max-w-3xl mx-auto">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-bold text-sm mb-6 uppercase tracking-widest">
                    <Sparkles size={18} /> <span>{lesson.module?.title}</span>
                  </div>
                  <h1 className="text-5xl font-black text-slate-900 dark:text-slate-50 mb-10 leading-tight">
                    {lesson.title}
                  </h1>
                </motion.div>

                <div className="prose prose-slate dark:prose-invert prose-lg max-w-none text-slate-600 dark:text-slate-300 leading-relaxed">
                  <ReactMarkdown>{lesson.content}</ReactMarkdown>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('code')}
                  className="mt-16 w-full py-6 bg-slate-900 dark:bg-blue-600 text-white rounded-3xl font-black text-xl flex items-center justify-center gap-4 hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors shadow-2xl"
                >
                  Sunt gata să codez! <ArrowRight />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="code"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex h-full"
          >
            <div className="w-[35%] border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-slate-900">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <button onClick={() => setMode('study')} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 font-bold text-sm">
                  <ChevronLeft size={18} /> Înapoi la teorie
                </button>
              </div>
              <div className="p-10 overflow-y-auto flex-1">
                <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded inline-block mb-4 uppercase">Task</div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">{lesson.problems[0]?.title}</h2>
                <p className="text-slate-600 dark:text-slate-300 text-lg">{lesson.problems[0]?.description}</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-[#1e1e1e] dark:bg-[#1e293b]">
              <div className="flex-1">
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language={lesson.module?.language}
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  options={{ fontSize: 16, minimap: { enabled: false }, padding: { top: 24 } }}
                />
              </div>

              <div className="h-[35%] bg-black/40 dark:bg-slate-900/40 border-t border-white/10 dark:border-slate-700 p-8 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-white/30 dark:text-slate-400 font-mono text-xs font-bold tracking-widest uppercase">Output Console</span>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleRunCode}
                      disabled={loading}
                      className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-500 transition-all flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />} Rulează
                    </button>
                    {isSolved && (
                      <button 
                        // REPARARE: Acum folosim variabila language pentru a naviga înapoi la hartă
                        onClick={() => navigate(`/lessons/${language}`)}
                        className="px-10 py-3 bg-green-500 text-white rounded-2xl font-black flex items-center gap-2 animate-bounce shadow-lg shadow-green-500/20"
                      >
                        Pasul Următor <CheckCircle size={20} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 bg-black/30 dark:bg-slate-900/30 rounded-2xl p-6 font-mono text-green-400 border border-white/5 dark:border-slate-700 overflow-y-auto whitespace-pre-wrap">
                  {output || '> Sistem pregătit. Scrie codul și apasă pe Rulează.'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}