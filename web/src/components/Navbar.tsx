import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  // Verificăm dacă există un token salvat în browser
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    // Ștergem token-ul și trimitem utilizatorul la pagina de login
    localStorage.removeItem('token');
    navigate('/login');
    // Forțăm o reîmprospătare mică pentru a actualiza starea UI
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-8">
        {/* Logo cu gradient modern */}
        <Link to="/" className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          DevJudge
        </Link>
        
        {/* Link-uri de navigare vizibile mereu */}
        <div className="flex gap-6 text-slate-600 font-semibold text-sm">
          <Link to="/problems" className="hover:text-blue-600 transition-colors">
            Probleme
          </Link>
          <Link to="/submissions" className="hover:text-blue-600 transition-colors">
            Istoric
          </Link>
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Renderizare condiționată: Logat vs Nelogat */}
        {token ? (
          <div className="flex items-center gap-4">
            {/* Profilul utilizatorului logat */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
                US
              </div>
              <span className="text-xs font-bold text-slate-700">Utilizator</span>
            </div>
            {/* Buton de Logout */}
            <button 
              onClick={handleLogout}
              className="text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Opțiuni pentru vizitatori */}
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600">
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
            >
              Înregistrare
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}