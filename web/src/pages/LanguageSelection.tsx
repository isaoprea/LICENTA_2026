import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Terminal, Coffee, Code2, Sparkles } from 'lucide-react';

const languages = [
  { 
    id: 'python', 
    name: 'Python', 
    icon: <Code2 className="w-10 h-10 text-yellow-500" />, 
    color: 'from-yellow-400/20 to-blue-500/10',
    borderColor: 'group-hover:border-yellow-400'
  },
  { 
    id: 'cpp', 
    name: 'C++', 
    icon: <Terminal className="w-10 h-10 text-blue-500" />, 
    color: 'from-blue-600/20 to-indigo-600/10',
    borderColor: 'group-hover:border-blue-500'
  },
  { 
    id: 'java', 
    name: 'Java', 
    icon: <Coffee className="w-10 h-10 text-orange-600" />, 
    color: 'from-orange-500/20 to-red-500/10',
    borderColor: 'group-hover:border-orange-500'
  },
];

const LanguageSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      {/* Background Decorativ Subtil */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-5%] left-[-5%] w-64 h-64 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-[80px] opacity-60" />
        <div className="absolute bottom-[-5%] right-[-5%] w-80 h-80 bg-purple-50 dark:bg-purple-900/20 rounded-full blur-[90px] opacity-60" />
      </div>

      {/* Hero Section */}
      <div className="text-center z-10 mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block p-4 bg-blue-50 dark:bg-slate-900 rounded-2xl mb-4 border border-blue-100/50 dark:border-slate-800"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl"
          >
            🤖
          </motion.div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight transition-colors"
        >
          Ce vrei să <span className="text-blue-600 dark:text-blue-400">înveți astăzi?</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-500 dark:text-slate-400 text-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          Alege tehnologia și începe codarea <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        </motion.p>
      </div>

      {/* Grila de Carduri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl z-10">
        {languages.map((lang, index) => (
          <motion.button
            key={lang.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/lessons/${lang.id}`)}
            className={`relative group p-8 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-2 border-slate-100 dark:border-slate-800 rounded-3xl transition-all duration-300 shadow-sm hover:shadow-xl ${lang.borderColor}`}
          >
            {/* Hover Glow - Opacitate redusă pe dark mode pentru subtilitate */}
            <div className={`absolute inset-0 bg-gradient-to-br ${lang.color} opacity-0 group-hover:opacity-100 dark:group-hover:opacity-20 transition-opacity rounded-3xl -z-10`} />

            <div className="flex flex-col items-center">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-6 group-hover:rotate-6 transition-transform border border-slate-50 dark:border-slate-700">
                {lang.icon}
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">{lang.name}</h2>
              
              <div className="mt-6 px-5 py-1.5 bg-blue-600 text-white rounded-full font-bold text-xs opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg shadow-blue-600/30">
                Începe Cursul
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelection;