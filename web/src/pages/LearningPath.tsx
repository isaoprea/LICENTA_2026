// web/src/components/LearningPath.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LearningPath({ lessons }: { lessons: any[] }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center py-10 space-y-0">
      {lessons.map((lesson, index) => {
        const isLast = index === lessons.length - 1;
        
        return (
          <React.Fragment key={lesson.id}>
            {/* Nodul Lecției */}
            <div className="relative flex flex-col items-center">
              <motion.button
                whileHover={!lesson.isLocked ? { scale: 1.1 } : {}}
                onClick={() => !lesson.isLocked && navigate(`/lesson/${lesson.id}`)}
                className={`
                  z-10 w-16 h-16 rounded-2xl flex items-center justify-center border-4 transition-all
                  ${lesson.isCompleted 
                    ? 'bg-green-500 border-green-200 text-white shadow-lg shadow-green-500/30' 
                    : lesson.isLocked 
                      ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400' 
                      : 'bg-blue-600 border-blue-200 text-white shadow-lg shadow-blue-500/40 animate-bounce-subtle'
                  }
                `}
              >
                {lesson.isCompleted ? <Check size={28} /> : lesson.isLocked ? <Lock size={24} /> : <Play size={24} />}
              </motion.button>

              {/* Eticheta Lecției */}
              <div className="absolute left-20 top-1/2 -translate-y-1/2 w-48 text-left">
                <h4 className={`font-black text-sm uppercase tracking-tight ${lesson.isLocked ? 'text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                  {lesson.title}
                </h4>
                {!lesson.isLocked && (
                  <p className="text-[10px] font-bold text-blue-500 uppercase">
                    {lesson.isCompleted ? 'Finalizat' : 'Disponibil'}
                  </p>
                )}
              </div>
            </div>

            {/* Linia de conectare */}
            {!isLast && (
              <div 
                className={`w-1.5 h-16 -my-1 transition-colors duration-500 ${
                  lesson.isCompleted ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-800'
                }`} 
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}