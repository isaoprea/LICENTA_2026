import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/auth/login', { email, password });
      localStorage.setItem('token', res.data.access_token); // Salvăm cheia
      navigate('/'); // Mergem la Dashboard
    } catch (err) { alert("Login eșuat!"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-96 border border-slate-200">
        <h2 className="text-2xl font-black mb-6 text-slate-900 text-center text-blue-600">CodeOverload Login</h2>
        <input type="email" placeholder="Email" className="w-full mb-4 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Parolă" className="w-full mb-6 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setPassword(e.target.value)} />
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md">Intră în cont</button>
      </form>
    </div>
  );
}