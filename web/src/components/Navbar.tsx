import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  LogOut, 
  ChevronDown, 
  LayoutDashboard, 
  Sun, 
  Moon, 
  Palette, 
  Lock as LockIcon 
} from 'lucide-react';

// Mutăm componenta Lock sus pentru a fi disponibilă în tot fișierul
const Lock = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Starea pentru Dark Mode cu verificare în localStorage
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Aplicarea temei pe elementul rădăcină
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenim închiderea meniului la click pe toggle
    setIsDark(prev => !prev);
  };

  const userData = (() => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return {
        name: payload.name,
        role: payload.role,
        id: payload.sub
      };
    } catch (e) {
      return null;
    }
  })();

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-3 flex justify-between items-center shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-10">
        <Link to="/dashboard" className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          CodeOverload
        </Link>
        
        <div className="hidden md:flex gap-8 text-slate-600 dark:text-slate-300 font-bold text-sm">
          <Link to="/problems" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Probleme</Link>
          <Link to="/submissions" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Istoric</Link>
          <Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dashboard</Link>
          <Link to="/select-language" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Lecții</Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Buton toggle vizibil în exterior DOAR dacă nu ești logat */}
        {!token && (
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:ring-2 ring-blue-500 transition-all"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}

        {token && userData ? (
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-[11px] text-white font-black shadow-inner">
                {getInitials(userData.name)}
              </div>
              
              <div className="flex flex-col text-left mr-1">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {userData.name}
                </span>
                <span className="text-[9px] text-blue-500 font-black uppercase tracking-tighter">
                  {userData.role === 'ADMIN' ? 'Administrator' : 'Student'}
                </span>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-[-1]" onClick={() => setIsDropdownOpen(false)} />
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 mb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contul meu</p>
                    </div>

                    <button 
                      onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User size={18} className="text-slate-400" /> Vezi Profilul Meu
                    </button>

                    {/* --- TOGGLE TEMA INTEGRAT ÎN MENIU --- */}
                    <button 
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Palette size={18} className="text-slate-400" />
                        <span>Aspect Pagina</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        {isDark ? (
                          <Sun size={14} className="text-yellow-500" />
                        ) : (
                          <Moon size={14} className="text-blue-500" />
                        )}
                        <span className="text-[10px] uppercase">{isDark ? 'Light' : 'Dark'}</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => { navigate('/dashboard'); setIsDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors md:hidden"
                    >
                      <LayoutDashboard size={18} className="text-slate-400" /> Dashboard
                    </button>

                    {userData.role === 'ADMIN' && (
                      <button 
                        onClick={() => { navigate('/admin'); setIsDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                      >
                        <Lock size={18} /> Admin Panel
                      </button>
                    )}

                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600">Login</Link>
            <Link 
              to="/register" 
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              Înregistrare
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}