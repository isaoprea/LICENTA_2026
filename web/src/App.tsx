import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ProblemsList from './pages/ProblemsList';
import ProblemDetail from './pages/ProblemDetail';
import SubmissionsHistory from './pages/SubmissionsHistory';
import Login from './pages/Login';
import Register from './pages/Register'; 
import AdminPanel from './pages/AdminPanel';
import SubmissionDetails from './pages/SubmissionDetails';
import LessonDetails from './pages/LessonDetails';
import Lessons from './pages/Lessons';
import LanguageSelection from './pages/LanguageSelection';
import Profile from './pages/Profile';

function App() {
  // Verificăm dacă există un token în stocarea locală
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* 1. PAGINA DE START: Acum redirecționează direct la Dashboard */}
            <Route 
              path="/" 
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
            />
            
            {/* 2. DASHBOARD: Centrul tău de comandă */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Selecția Limbajului (mutată de pe prima pagină) */}
            <Route path="/select-language" element={<LanguageSelection />} />
            
            {/* Listă Module filtrate (ex: /lessons/python) */}
            <Route path="/lessons/:language" element={<Lessons />} />
            
            {/* Conținut Lecție (ex: /lesson/5) */}
            <Route path="/lesson/:id" element={<LessonDetails />} />
            
            {/* Profil și Progres utilizator */}
            <Route path="/profile" element={<Profile />} />
            
            {/* Probleme și Administrare */}
            <Route path="/problems" element={<ProblemsList />} />
            <Route path="/problem/:id" element={<ProblemDetail />} />
            <Route path="/submissions" element={<SubmissionsHistory />} />
            <Route path="/submissions/:id" element={<SubmissionDetails />} />
            
            {/* Autentificare */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminPanel />} />

            {/* Redirecționare pentru orice altă rută inexistentă */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;