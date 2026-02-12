import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Lessons() {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    // Luăm datele pe care tocmai le-ai văzut în browser
    axios.get('http://localhost:3000/lessons')
      .then(res => setLessons(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Learning Path 📚</h1>
        <p className="text-slate-500 text-lg">Alege o lecție și începe să îți construiești fundația în programare.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {lessons.map((lesson: any) => (
          <Link 
            key={lesson.id} 
            to={`/lessons/${lesson.id}`}
            className="group bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {lesson.id}
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-3">{lesson.title}</h2>
              <p className="text-slate-500 text-sm line-clamp-3 mb-6">
                {lesson.description}
              </p>
            </div>
            <div className="text-blue-600 font-bold text-sm flex items-center gap-2">
              Începe studiul <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}