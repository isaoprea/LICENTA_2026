import React, { useState, useEffect } from 'react';
import { CreateAssignment } from './CreateAssignment';
import { ClassroomStats } from './ClassroomStats';
import { CreateClassroomModal } from './CreateClassroomModal'; // Import nou
import { Plus, Users, GraduationCap } from 'lucide-react';

export const TeacherDashboard = () => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Stare pentru modal
  
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const teacherId = user?.id || user?.sub || user?.userId;

  const loadData = () => {
    if (!teacherId) return;
    fetch(`http://localhost:3000/classrooms/teacher/${teacherId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setClassrooms(data);
      })
      .catch(err => console.error("Error loading classrooms:", err));
  };

  useEffect(() => { 
    loadData(); 
  }, [teacherId]);

  return (
    <div className="p-10 bg-[#0a0a0c] min-h-screen text-white grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-8">
        {/* Header cu Buton de Adăugare */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-purple-500 uppercase italic tracking-tighter">Dashboard Admin</h1>
            <p className="text-gray-500 mt-1 font-medium">Gestionează clasele și urmărește progresul studenților.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-black transition-all transform active:scale-95 shadow-lg shadow-purple-500/20"
          >
            <Plus size={20} />
            CLASĂ NOUĂ
          </button>
        </div>

        {/* Listă Clase sau Empty State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classrooms.length > 0 ? (
            classrooms.map((cls: any) => (
              <div 
                key={cls.id} 
                className={`bg-[#111114] border p-6 rounded-[2rem] transition-all group cursor-pointer ${
                  selectedClassId === cls.id ? 'border-purple-500 shadow-lg shadow-purple-500/10' : 'border-gray-800 hover:border-gray-700'
                }`}
                onClick={() => setSelectedClassId(cls.id)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                    <GraduationCap size={24} />
                  </div>
                  <span className="bg-gray-800 text-[10px] px-3 py-1 rounded-full font-black text-gray-400 uppercase">
                    {cls.students?.length || 0} Elevi
                  </span>
                </div>
                
                <h3 className="text-xl font-black mb-1 group-hover:text-purple-400 transition-colors uppercase italic tracking-tight">
                  {cls.name}
                </h3>
                <p className="text-gray-600 text-xs mb-6 line-clamp-1">{cls.description || "Fără descriere adițională"}</p>
                
                <div className="flex items-center justify-between p-4 bg-black rounded-2xl border border-gray-900 group-hover:border-purple-500/30 transition-all">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Cod Invitație</span>
                    <span className="text-purple-400 font-mono font-black text-lg tracking-[0.2em]">{cls.inviteCode}</span>
                  </div>
                  <Users size={20} className="text-gray-800 group-hover:text-purple-500/50 transition-colors" />
                </div>
              </div>
            ))
          ) : (
            /* Empty State din image_538fb8.png */
            <div className="col-span-2 border-2 border-dashed border-gray-800 rounded-[3rem] p-20 text-center bg-[#111114]/30">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-700">
                <Plus size={32} />
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-6">Nu ai nicio clasă creată încă</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-white text-black px-10 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-xl active:scale-95"
              >
                CREEAZĂ PRIMA TA CLASĂ
              </button>
            </div>
          )}
        </div>

        {/* Secțiune Statistici */}
        {selectedClassId && (
            <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-6 mb-8">
                  <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] whitespace-nowrap">Monitorizare Activitate</h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-800 to-transparent"></div>
                </div>
                <ClassroomStats classroomId={selectedClassId} />
            </div>
        )}
      </div>

      
      <div className="relative">
        <CreateAssignment classrooms={classrooms} onAssignmentCreated={loadData} />
      </div>

      
      <CreateClassroomModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={loadData} 
      />
    </div>
  );
};