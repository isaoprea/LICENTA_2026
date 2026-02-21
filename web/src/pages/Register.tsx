import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/auth/register', formData);
      alert("Cont creat cu succes! Acum te poți loga.");
      navigate('/login');
    } catch (err) { 
      alert("Eroare la înregistrare!"); 
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <form 
          onSubmit={handleRegister} 
          className="bg-slate-900/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 shadow-2xl"
        >
          {/* Header Formular */}
          <div className="text-center mb-10">
            <div className="inline-flex p-4 rounded-2xl bg-blue-500/10 text-blue-500 mb-4">
              <UserPlus size={32} />
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
              Creează <span className="text-blue-500">Cont</span>
            </h2>
            <p className="text-slate-400 text-sm font-bold mt-2">Alătură-te expediției CodeOverload</p>
          </div>

          <div className="space-y-5">
            {/* Câmp Nume */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Nume Complet" 
                className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 pl-12 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 font-medium"
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>

            {/* Câmp Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                placeholder="Email" 
                className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 pl-12 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 font-medium"
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>

            {/* Câmp Parolă */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                placeholder="Parolă" 
                className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 pl-12 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 font-medium"
                onChange={e => setFormData({...formData, password: e.target.value})} 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-black italic uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            Înregistrare
          </button>

          <p className="mt-8 text-center text-sm text-slate-500 font-bold">
            Ai deja cont?{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-400 transition-colors">
              Loghează-te
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}