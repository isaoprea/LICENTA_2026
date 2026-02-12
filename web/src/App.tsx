import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      {/* 2. Am înlocuit style={{...}} cu clase Tailwind */}
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Rutele tale sunt acum bine organizate */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/problems" element={<ProblemsList />} />
            <Route path="/problem/:id" element={<ProblemDetail />} />
            <Route path="/submissions" element={<SubmissionsHistory />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/submissions/:id" element={<SubmissionDetails />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/lessons/:id" element={<LessonDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;