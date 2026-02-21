import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {

    localStorage.removeItem('token'); // Ștergem token-ul vechi înainte de a încerca un nou login
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/auth/login', { email, password });
      
      // 1. Salvăm token-ul nou
      localStorage.setItem('token', res.data.access_token); 

      // 2. MODIFICARE CRITICĂ: Anunțăm Dashboard-ul că utilizatorul s-a schimbat
      window.dispatchEvent(new Event('auth-change')); 

      // 3. Mergem la Dashboard
      navigate('/dashboard'); 
    } catch (err) { 
      alert("Email sau parolă incorectă!"); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden p-4">
      
      {/* --- FUNDAL DECORATIV (CYBER GRID) --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <form 
          onSubmit={handleLogin} 
          className="bg-slate-900/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex p-4 rounded-2xl bg-blue-500/10 text-blue-500 mb-4">
              <LogIn size={32} />
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
              Sistem <span className="text-blue-500">Login</span>
            </h2>
            <p className="text-slate-400 text-sm font-bold mt-2">Introdu credențialele de acces</p>
          </div>

          <div className="space-y-5">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                placeholder="Email" 
                required
                className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 pl-12 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 font-medium"
                onChange={e => setEmail(e.target.value)} 
              />
            </div>

            {/* Parolă */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                placeholder="Parolă" 
                required
                className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 pl-12 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 font-medium"
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-black italic uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            Acces Sistem
          </button>

          <p className="mt-8 text-center text-sm text-slate-500 font-bold">
            Nu ai cont?{' '}
            <Link to="/register" className="text-blue-500 hover:text-blue-400 transition-colors">
              Creează unul acum
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}