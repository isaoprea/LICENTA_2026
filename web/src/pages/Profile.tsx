import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Award, CheckCircle, BookOpen } from 'lucide-react';

export default function Profile() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:3000/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setData(res.data));
  }, []);

  if (!data) return <div className="p-20 text-center text-slate-600 dark:text-slate-400 animate-pulse">Se încarcă...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      {/* Card Utilizator */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-200 dark:border-slate-700 mb-10 flex items-center gap-6">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
          {data.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50">{data.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{data.email} • {data.role}</p>
        </div>
      </div>

      <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
        <Award className="text-yellow-500" /> Progresul tău
      </h2>

      <div className="grid gap-6">
        {data.progress.map((mod: any) => (
          <div key={mod.moduleTitle} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 capitalize">{mod.language} Mastery</h3>
              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-black">
                {mod.percentage}%
              </span>
            </div>
            
            {/* Progres Bar */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${mod.percentage}%` }}
                className="h-full bg-blue-600"
              />
            </div>
            
            <div className="mt-4 flex gap-4 text-sm font-bold text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1 text-green-500">
                <CheckCircle size={14}/> {mod.completedProblems} rezolvate
              </span>
              <span>/ {mod.totalProblems} probleme totale</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}