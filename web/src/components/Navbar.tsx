import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronDown, LayoutDashboard, History, BookOpen, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    // Only use localStorage if user has explicitly set a theme
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    // Otherwise use system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme whenever isDark changes
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

  // Listen for system theme changes (only if user hasn't set explicit preference via toggle)
  useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e: MediaQueryListEvent) => {
    // Schimbăm tema DOAR dacă utilizatorul nu a setat deja o preferință manuală
    if (!localStorage.getItem('theme')) {
      setIsDark(e.matches);
    }
  };

  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}, []);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const getUserData = () => {
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
  };

  const userData = getUserData();

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
    // Adaptare culori Navbar pentru Dark Mode
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-3 flex justify-between items-center shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-10">
        <Link to="/" className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          CodeOverload
        </Link>
        
        <div className="hidden md:flex gap-8 text-slate-600 dark:text-slate-300 font-bold text-sm">
          <Link to="/problems" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">Probleme</Link>
          <Link to="/submissions" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Istoric</Link>
          <Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dashboard</Link>
          <Link to="/select-language" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Lecții</Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* BUTON TOGGLE DARK MODE */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:ring-2 ring-blue-500 transition-all"
          title={isDark ? "Comută la Light Mode" : "Comută la Dark Mode"}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {token && userData ? (
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-[11px] text-white font-black shadow-inner group-hover:scale-105 transition-transform">
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
                    className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 mb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contul meu</p>
                    </div>

                    <button 
                      onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-colors"
                    >
                      <User size={18} /> Vezi Profilul Meu
                    </button>

                    <button 
                      onClick={() => { navigate('/dashboard'); setIsDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors md:hidden"
                    >
                      <LayoutDashboard size={18} /> Dashboard
                    </button>

                    {userData.role === 'ADMIN' && (
                      <button 
                        onClick={() => { navigate('/admin'); setIsDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                      >
                        <Lock size={18} /> Admin Panel
                      </button>
                    )}

                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
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

const Lock = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);