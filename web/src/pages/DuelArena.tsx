import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Timer, Swords, Send, Loader2, Code2, 
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import axios from 'axios';

const SOCKET_URL = "http://localhost:3000";
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getUserIdFromToken(): string | null {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("DEBUG: Nu există niciun token în localStorage.");
      return null;
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log("DEBUG TOKEN: Payload extras:", payload);
    // Verificăm dacă ID-ul este pe 'sub' sau pe 'id'
    const userId = payload.sub || payload.id; 
    console.log("DEBUG TOKEN: UserID identificat:", userId);
    return userId;
  } catch (err) {
    console.error("DEBUG TOKEN: Eroare la parsare token:", err);
    return null;
  }
}

export default function DuelArena() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const duelData = location.state?.duelData;

  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myProgress, setMyProgress] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [duelResult, setDuelResult] = useState<{
    won: boolean;
    winnerName: string;
    xpGained: number;
  } | null>(null);

  const socketRef = useRef<Socket | null>(null);

  // 1. Socket + evenimente
  useEffect(() => {
    console.log("DEBUG MOUNT: Componenta DuelArena s-a încărcat pentru duelId:", id);
    const token = localStorage.getItem('token');
    socketRef.current = io(SOCKET_URL, { auth: { token } });

    socketRef.current.emit('join_duel_room', { duelId: id });

    socketRef.current.on('opponent_progress', (data) => {
      setOpponentProgress(data.progress);
    });

    socketRef.current.on('duel_finished', (data: {
      winnerId: string;
      winnerName: string;
      xpGained: number;
    }) => {
      console.log("DEBUG SOCKET: Eveniment 'duel_finished' primit de la server:", data);
      const myUserId = getUserIdFromToken();
      console.log("DEBUG SOCKET: Comparăm winnerId (server):", data.winnerId, "cu myUserId (local):", myUserId);
      
      const amCastigat = data.winnerId === myUserId;

      setDuelResult({
        won: amCastigat,
        winnerName: data.winnerName,
        xpGained: data.xpGained,
      });

      console.log("DEBUG RESULT: Duelul s-a terminat. Am câștigat?", amCastigat);

      // Redirect după 2.5s — timp să vadă bannerul
      setTimeout(() => navigate('/dashboard'), 2500);
    });

    return () => { 
      console.log("DEBUG UNMOUNT: Deconectare socket.");
      socketRef.current?.disconnect(); 
    };
  }, [id, navigate]);

  // 2. Cronometru
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // 3. Submit cod
  const handleRunCode = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    console.log("DEBUG RUN: Trimitere cod pentru evaluare...");

    try {
      const res = await axios.post(`${API_BASE_URL}/submissions/run`, {
        code,
        language: duelData?.language || 'python',
        problemId: duelData?.problem?.id,
        duelId: id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const passed   = res.data.passed   || 0;
      const total    = res.data.total    || 1;
      const details  = res.data.details || [];

      setTestResults(details);

      const progress = Math.round((passed / total) * 100);
      console.log(`DEBUG RUN: Rezultat teste: ${passed}/${total} (${progress}%)`);
      
      setMyProgress(progress);

      socketRef.current?.emit('update_progress', { duelId: id, progress });

      // 100% → trimite finish_duel cu userId
      if (progress === 100) {
        const userId = getUserIdFromToken();
        console.log("DEBUG FINISH: Progres 100%! Emitem 'finish_duel' pentru userId:", userId);
        socketRef.current?.emit('finish_duel', { duelId: id, userId });
      }

    } catch (err) {
      console.error("DEBUG RUN: Eroare la trimiterea codului:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!duelData) return (
    <div className="h-screen bg-[#020617] flex items-center justify-center text-white">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans">

      {/* BANNER REZULTAT DUEL */}
      {duelResult && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm
          ${duelResult.won ? 'bg-blue-900/40' : 'bg-red-900/30'}`}>
          <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-12 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="text-7xl mb-6">{duelResult.won ? '🏆' : '💀'}</div>
            <h2 className="text-4xl font-black uppercase italic tracking-tight mb-3">
              {duelResult.won ? 'Victorie!' : 'Înfrângere'}
            </h2>
            <p className="text-slate-300 text-lg mb-2">
              {duelResult.won
                ? `+${duelResult.xpGained} XP adăugat în profilul tău`
                : `${duelResult.winnerName} a câștigat duelul`}
            </p>
            <p className="text-xs text-slate-600 uppercase tracking-widest mt-6">
              Redirecționare către dashboard...
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP BAR */}
        <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-4 rounded-3xl shadow-lg shadow-blue-500/20">
              <Swords size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Duel Arena</h2>
              <div className="flex items-center gap-2 text-blue-400">
                <Code2 size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{duelData.language}</span>
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-3 px-8 py-3 rounded-2xl border
            ${timeLeft < 60
              ? 'border-red-500/50 bg-red-500/10 animate-pulse'
              : 'border-blue-500/20 bg-black/40'}`}>
            <Timer size={20} className={timeLeft < 60 ? 'text-red-500' : 'text-blue-500'} />
            <span className="text-2xl font-black italic mono">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* BARE PROGRES */}
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-400 px-2">
              <span>Efortul tău</span>
              <span>{myProgress}%</span>
            </div>
            <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-blue-500 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                style={{ width: `${myProgress}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-red-500 px-2">
              <span>Adversar</span>
              <span>{opponentProgress}%</span>
            </div>
            <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-red-500 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(239,68,68,0.6)]"
                style={{ width: `${opponentProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 items-start">

          {/* STÂNGA: PROBLEMĂ + TESTE */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
              <h3 className="text-2xl font-black uppercase italic tracking-tight mb-4">
                {duelData.problem.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                {duelData.problem.description}
              </p>

              <div className="pt-8 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={14} className="text-slate-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Unit Tests</h4>
                </div>

                <div className="space-y-3">
                  {testResults.length > 0 ? testResults.map((test, i) => (
                    <div key={i}
                      className="flex items-center justify-between bg-black/30 p-4 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-colors">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                        Test Case #{i + 1}
                      </span>
                      {test.passed ? (
                        <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black">
                          <CheckCircle2 size={16} /> SUCCESS
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500 text-[10px] font-black">
                          <XCircle size={16} /> FAILED
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="text-center py-6 border-2 border-dashed border-slate-800 rounded-2xl">
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">
                        Așteptare compilare...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* DREAPTA: EDITOR */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-[#050a18] rounded-[2.5rem] border border-white/10 overflow-hidden relative shadow-2xl min-h-[550px]">
              <div className="bg-slate-800/40 px-8 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Code Terminal</span>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                </div>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-[480px] bg-transparent p-10 font-mono text-sm outline-none resize-none text-blue-50/90 leading-relaxed caret-blue-500"
                placeholder={`# Scrie aici soluția în ${duelData.language}...`}
              />

              <div className="absolute bottom-8 right-8">
                <button
                  onClick={handleRunCode}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 px-12 py-5 rounded-3xl font-black uppercase italic transition-all flex items-center gap-4 shadow-xl shadow-blue-600/20 active:scale-95 group"
                >
                  {isSubmitting
                    ? <Loader2 className="animate-spin" size={20} />
                    : <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  Run & Submit
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}