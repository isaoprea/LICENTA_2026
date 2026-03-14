import { useState, useEffect } from 'react';
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
  Briefcase // Iconiță nouă pentru recruiter
} from 'lucide-react';
import axios from 'axios';

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
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Extragem datele utilizatorului
  const userData = (() => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return {
        name: payload.name,
        role: payload.role, // "USER", "TEACHER", "RECRUITER"
        id: payload.sub
      };
    } catch (e) {
      return null;
    }
  })();

  // --- LOGICA FILTRARE LINK-URI ---
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
      { name: 'Dashboard Recrutare', path: '/dashboard' },
      { name: 'Bază de Probleme', path: '/problems' },
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

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:3000/notifications/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Eroare notificări:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const markAsRead = async (id: string) => {
    try {
      await axios.patch(`http://localhost:3000/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDark(prev => !prev);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
        
        {/* Meniu Dinamic bazat pe Rol */}
        <div className="hidden md:flex gap-8 text-slate-600 dark:text-slate-300 font-bold text-sm">
          {linksToShow.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {token && userData && (
          <div className="relative">
            <button 
              onClick={() => { setIsNotifOpen(!isNotifOpen); setIsDropdownOpen(false); }}
              className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-all"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-950 rounded-full animate-pulse"></span>
              )}
            </button>

            <AnimatePresence>
              {isNotifOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-3 z-50 overflow-hidden"
                >
                  <div className="px-4 pb-2 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notificări</span>
                    {unreadCount > 0 && <span className="text-[9px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">{unreadCount} NOI</span>}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => markAsRead(n.id)}
                          className={`px-4 py-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800/30 ${!n.read ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''}`}
                        >
                          {!n.read ? <Circle size={8} className="fill-blue-500 text-blue-500 mt-1.5 shrink-0" /> : <CheckCheck size={14} className="text-slate-300 mt-1 shrink-0" />}
                          <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-snug">{n.message}</p>
                            <p className="text-[9px] text-slate-400 mt-1 font-medium">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center text-slate-400 text-xs italic">Nu ai nicio notificare</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {token && userData ? (
          <div className="relative">
            <button 
              onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }}
              className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] text-white font-black shadow-inner ${userData.role === 'RECRUITER' ? 'bg-amber-600' : 'bg-blue-600'}`}>
                {userData.name ? userData.name.split(' ').map((w:any) => w[0]).join('').toUpperCase().substring(0, 2) : '?'}
              </div>
              <div className="flex flex-col text-left mr-1">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{userData.name}</span>
                <span className={`text-[9px] font-black uppercase tracking-tighter ${userData.role === 'RECRUITER' ? 'text-amber-500' : 'text-blue-500'}`}>
                  {userData.role === 'TEACHER' ? 'Profesor' : userData.role === 'RECRUITER' ? 'Recruiter' : 'Student'}
                </span>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50 overflow-hidden"
                >
                  <button onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <User size={18} className="text-slate-400" /> Profilul Meu
                  </button>

                  <button onClick={toggleTheme} className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <Palette size={18} className="text-slate-400" />
                      <span>Aspect Pagina</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                      {isDark ? <Sun size={14} className="text-yellow-500" /> : <Moon size={14} className="text-blue-500" />}
                    </div>
                  </button>

                  {userData.role === 'TEACHER' && (
                    <button onClick={() => { navigate('/admin'); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors">
                      <Lock size={18} /> Admin Panel
                    </button>
                  )}

                  {userData.role === 'RECRUITER' && (
                    <button onClick={() => { navigate('/recruiter-dashboard'); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
                      <Briefcase size={18} /> Dashboard Recrutare
                    </button>
                  )}

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                    <LogOut size={18} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {!token && (
               <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:ring-2 ring-blue-500 transition-all">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
               </button>
            )}
            <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              Înregistrare
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}