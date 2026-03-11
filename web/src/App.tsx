import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
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
import AssignmentSolving from './pages/AssignmentSolving';
import  CommunityChat  from './pages/CommunityChat';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isAuthenticated = !!token;
  
  // Extragem obiectul de user complet din token
  let userData = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userData = {
        id: payload.userId || payload.sub, // ID-ul unic pentru legătura cu mesajele
        role: payload.role,
        name: payload.name || "Utilizator" // Folosit pentru afișarea numelui în chat
      };
    } catch (e) {
      console.error("Token invalid");
    }
  }

  const handleAuthChange = () => {
    setToken(localStorage.getItem('token'));
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route 
              path="/" 
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? (
                  userData?.role === 'TEACHER' ? <TeacherDashboard /> : <Dashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            {/* RUTA NOUĂ PENTRU CHAT */}
            <Route 
              path="/community" 
              element={
                isAuthenticated ? (
                  <CommunityChat user={userData} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            <Route path="/select-language" element={<LanguageSelection />} />
            <Route path="/lessons/:language" element={<Lessons />} />
            <Route path="/lesson/:id" element={<LessonDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/problems" element={<ProblemsList />} />
            <Route path="/problem/:id" element={<ProblemDetail />} />
            <Route path="/assignment-solving/:assignmentId" element={<AssignmentSolving />} />
            <Route path="/submissions" element={<SubmissionsHistory />} />
            <Route path="/submissions/:id" element={<SubmissionDetails />} />
            <Route path="/login" element={<Login onLoginSuccess={handleAuthChange} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={userData?.role === 'TEACHER' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;