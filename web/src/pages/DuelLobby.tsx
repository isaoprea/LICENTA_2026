import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Swords, Loader2, XCircle, ChevronDown, Code2, Terminal, Coffee } from 'lucide-react';
import axios from 'axios';

const SOCKET_URL = "http://localhost:3000"; 
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Listă restrânsă la cele 3 limbaje principale
const PISTON_LANGUAGES = [
  { id: 'python', name: 'Python 3', icon: <Code2 size={18} /> },
  { id: 'cpp', name: 'C++ (GCC)', icon: <Terminal size={18} /> },
  { id: 'java', name: 'Java (OpenJDK)', icon: <Coffee size={18} /> },
];

export default function DuelLobby() {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const startSearch = async () => {
    if (!selectedLanguage) {
      setError("Selectează un limbaj pentru a intra în arenă!");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      const res = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userId = res.data.id;

      setError(null);
      setIsSearching(true);
      
      const newSocket = io(SOCKET_URL, { auth: { token } });
      setSocket(newSocket);

      // Trimitem limbajul ales către coada de Matchmaking din Backend
      newSocket.emit('joinQueue', { 
        userId, 
        language: selectedLanguage 
      });

      newSocket.on('duelStarted', (data) => {
        navigate(`/duel-arena/${data.duelId}`, { state: { duelData: data } });
      });

      newSocket.on('error', (data) => {
        setError(data.message);
        setIsSearching(false);
        newSocket.disconnect();
      });

    } catch (err) {
      setError("Conexiunea la server a eșuat.");
      setIsSearching(false);
    }
  };

  useEffect(() => {
    return () => { if (socket) socket.disconnect(); };
  }, [socket]);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-sans">
      <div className="max-w-md w-full bg-slate-900/50 border border-white/5 p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
            <XCircle size={14} /> {error}
          </div>
        )}

        {!isSearching ? (
          <>
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
              <Swords size={32} className="text-white" />
            </div>
            
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Arena 1v1</h2>
            <p className="text-slate-400 font-medium mt-2 mb-8 text-sm italic">Pregătește-ți compilatorul.</p>

            {/* DROPDOWN STILIZAT */}
            <div className="relative mb-8 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4 mb-2 block">
                Alege Limbajul
              </label>
              <div className="relative group">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-4 pl-12 rounded-2xl font-bold appearance-none outline-none focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="" disabled>Selectează...</option>
                  {PISTON_LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id} className="bg-slate-900">
                      {lang.name}
                    </option>
                  ))}
                </select>
                
                {/* Icon dinamic in stanga selectului */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                  {selectedLanguage ? 
                    PISTON_LANGUAGES.find(l => l.id === selectedLanguage)?.icon : 
                    <Terminal size={18} />
                  }
                </div>
                
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <button 
              onClick={startSearch}
              className={`w-full py-5 rounded-2xl font-black uppercase italic transition-all active:scale-95 shadow-xl 
                ${selectedLanguage 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'}`}
            >
              Intră în Matchmaking
            </button>
          </>
        ) : (
          <div className="space-y-8 py-6">
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
              <Loader2 size={70} className="text-blue-500 animate-spin relative z-10" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50">
                <Swords size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black italic uppercase tracking-tight">
                Căutăm adversar pentru <span className="text-blue-500">{selectedLanguage.toUpperCase()}</span>
              </h3>
              <div className="flex justify-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
              </div>
            </div>
            
            <button 
              onClick={() => { setIsSearching(false); socket?.disconnect(); }}
              className="text-slate-500 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              Anulează Căutarea
            </button>
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}