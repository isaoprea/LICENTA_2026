import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  LogOut, 
  ChevronDown, 
  Sun, 
  Moon, 
  Palette, 
  Bell,
  CheckCheck,
  Circle,
  Briefcase,
  BrainCircuit
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Navbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Luăm token-ul direct din storage la fiecare randare pentru siguranță
  const token = localStorage.getItem('token');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  }, [navigate]);

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

  const navLinks = {
    USER: [
      { name: 'Probleme', path: '/problems' },
      { name: 'Istoric', path: '/submissions' },
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Lecții', path: '/select-language' },
      { name: 'Comunitate', path: '/community' },
    ],
    TEACHER: [
      { name: 'Probleme', path: '/problems' },
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Comunitate', path: '/community' },
    ],
    RECRUITER: [
      { name: 'Dashboard Recrutare', path: '/dashboard?tab=dashboard' },
      { name: 'Bază de Probleme', path: '/dashboard?tab=problems' },
    ]
  };

  const linksToShow = userData?.role ? (navLinks[userData.role as keyof typeof navLinks] || navLinks.USER) : [];

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

  const fetchNotifications = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;

    try {
      const res = await axios.get(`${API_BASE_URL}/notifications/me`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      // AM SCOS handleLogout() DE AICI ca să nu te mai dea afară în buclă
      console.warn("Notificările nu s-au putut încărca (probabil token expirat).");
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token, fetchNotifications]);

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDark(prev => !prev);
  };

  const unreadCount = notifications.filter(n => n && !n.read).length;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-10">
        <Link to="/dashboard" className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          CodeOverload
        </Link>
        <div className="hidden md:flex gap-8 text-slate-600 dark:text-slate-300 font-bold text-sm">
          {linksToShow.map((link) => (
            <Link key={link.path} to={link.path} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {token && userData ? (
          <>
            <div className="relative">
              <button onClick={() => { setIsNotifOpen(!isNotifOpen); setIsDropdownOpen(false); }} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500">
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
              </button>
            </div>

            <div className="relative">
              <button onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }} className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] text-white font-black ${userData.role === 'RECRUITER' ? 'bg-amber-600' : 'bg-blue-600'}`}>
                  {userData.name ? userData.name.substring(0, 2).toUpperCase() : '?'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{userData.name}</span>
                  <span className="text-[9px] font-black uppercase text-blue-500">{userData.role}</span>
                </div>
                <ChevronDown size={16} className="text-slate-400" />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50">
                    <button onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <User size={18} className="text-slate-400" /> Profilul Meu
                    </button>
                    <button onClick={() => { navigate('/ai-profile'); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                      <BrainCircuit size={18} /> Analiză Coder AI
                    </button>
                    <button onClick={toggleTheme} className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <div className="flex items-center gap-3"><Palette size={18} className="text-slate-400" /><span>Aspect Pagina</span></div>
                      {isDark ? <Sun size={14} className="text-yellow-500" /> : <Moon size={14} className="text-blue-500" />}
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                      <LogOut size={18} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-300">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold">Înregistrare</Link>
          </div>
        )}
      </div>
    </nav>
  );
}