import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Funcție pentru a extrage toate datele utilizatorului din JWT
  const getUserData = () => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return {
        name: payload.name, // Numele utilizatorului
        role: payload.role  // Rolul utilizatorului (ADMIN/USER)
      };
    } catch (e) {
      return null;
    }
  };

  const userData = getUserData();

  // Funcție pentru a genera inițialele (ex: "Popescu Ion" -> "PI")
  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          DevJudge
        </Link>
        
        <div className="flex gap-6 text-slate-600 font-semibold text-sm">
          <Link to="/problems" className="hover:text-blue-600 transition-colors">Probleme</Link>
          <Link to="/submissions" className="hover:text-blue-600 transition-colors">Istoric</Link>
          <Link to="/" className="hover:text-blue-600 transition-colors">Dashboard</Link>
          
          {/* Apare link-ul de Admin doar dacă rolul este ADMIN */}
          {userData?.role === 'ADMIN' && (
            <Link to="/admin" className="text-rose-600 hover:text-rose-700 font-bold border-l pl-6 border-slate-200">
              Admin Panel
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {token && userData ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 shadow-sm">
              {/* Inițiale dinamice în cercul albastru */}
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-bold shadow-md">
                {getInitials(userData.name)}
              </div>
              
              <div className="flex flex-col">
                {/* Numele real al utilizatorului */}
                <span className="text-sm font-bold text-slate-800 leading-tight">
                  {userData.name || 'Utilizator'}
                </span>
                {/* Badge mic pentru rol */}
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  {userData.role === 'ADMIN' ? 'Administrator' : 'Student'}
                </span>
              </div>
            </div>

            <button 
              onClick={handleLogout} 
              className="text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors ml-2"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600">Login</Link>
            <Link 
              to="/register" 
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
            >
              Înregistrare
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}