import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ProblemsList from './pages/ProblemsList';
import ProblemDetail from './pages/ProblemDetail';
import SubmissionsHistory from './pages/SubmissionsHistory';
import Login from './pages/Login';
import Register from './pages/Register'; // 1. IMPORTUL lipsea

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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;