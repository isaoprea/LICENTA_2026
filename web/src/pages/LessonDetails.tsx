import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

export default function LessonDetails() {
  const { id } = useParams();
  const [lesson, setLesson] = useState<any>(null);

  useEffect(() => {
    axios.get(`http://localhost:3000/lessons/${id}`).then(res => setLesson(res.data));
  }, [id]);

  if (!lesson) return <div className="p-20 text-center font-bold">Se încarcă lecția...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <Link to="/lessons" className="text-blue-600 font-bold text-sm mb-8 block hover:underline">
        ← Înapoi la listă
      </Link>
      
      <article className="bg-white p-10 md:p-16 rounded-3xl border border-slate-100 shadow-2xl">
        <h1 className="text-4xl font-black text-slate-900 mb-8 border-b pb-6">
          {lesson.title}
        </h1>
        
        {/* Folosim prose pentru a formata automat textul din Markdown */}
        <div className="prose prose-blue lg:prose-xl max-w-none text-slate-700 leading-relaxed">
          <ReactMarkdown>{lesson.description}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}