import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/auth/register', formData);
      alert("Cont creat cu succes! Acum te poți loga.");
      navigate('/login'); // Îl trimitem la login după înregistrare
    } catch (err) { alert("Eroare la înregistrare!"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-xl shadow-lg w-96 border border-slate-200">
        <h2 className="text-2xl font-black mb-6 text-center text-indigo-600">Creează Cont</h2>
        <input type="text" placeholder="Nume Complet" className="w-full mb-4 p-3 border rounded-lg" 
               onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input type="email" placeholder="Email" className="w-full mb-4 p-3 border rounded-lg" 
               onChange={e => setFormData({...formData, email: e.target.value})} required />
        <input type="password" placeholder="Parolă" className="w-full mb-6 p-3 border rounded-lg" 
               onChange={e => setFormData({...formData, password: e.target.value})} required />
        <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 transition-all">Înregistrare</button>
        <p className="mt-4 text-center text-sm text-slate-500">
          Ai deja cont? <Link to="/login" className="text-indigo-600 font-bold">Loghează-te</Link>
        </p>
      </form>
    </div>
  );
}