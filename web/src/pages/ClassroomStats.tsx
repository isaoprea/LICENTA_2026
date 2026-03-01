import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle2, 
  CircleDashed, 
  User as UserIcon, 
  ChevronRight,
  Star,
  Send
} from 'lucide-react';

export const ClassroomStats = ({ classroomId }: { classroomId: string }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tempGrades, setTempGrades] = useState<{ [key: string]: number }>({});

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`http://localhost:3000/classrooms/${classroomId}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error("Eroare la încărcarea statisticilor:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [classroomId]);

  const submitGrade = async (assignmentId: string) => {
    const token = localStorage.getItem('token');
    const grade = tempGrades[assignmentId];
    
    if (!grade || grade < 1 || grade > 10) {
      return alert("Introdu o notă între 1 și 10!");
    }

    try {
      await axios.patch(`http://localhost:3000/classrooms/assignment/${assignmentId}/grade`, 
        { grade: Number(grade) },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert("✅ Notă salvată!");
      fetchData();
    } catch (err) {
      alert("Eroare la salvare.");
    }
  };

  if (loading) return <div className="p-10 text-slate-500 animate-pulse">Se încarcă catalogul clasei...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
          Catalog: {data?.name}
        </h2>
        <span className="bg-blue-600/10 text-blue-500 text-[10px] font-black px-3 py-1 rounded-full border border-blue-500/20">
          {data?.students?.length || 0} STUDENȚI ÎNSCRIȘI
        </span>
      </div>

      <div className="grid gap-6">
        {data?.students?.map((student: any) => (
          <div key={student.id} className="bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden transition-all hover:border-slate-700">
            {/* Header Student */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-white/5">
                  <UserIcon className="text-slate-400" size={20} />
                </div>
                <div>
                  <h3 className="font-black text-white">{student.name || "Student"}</h3>
                  <p className="text-xs text-slate-500 font-bold">{student.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-black uppercase">Progres Teme</p>
                <p className="text-sm font-black text-blue-500">
                  {student.assignments?.filter((a: any) => a.status === 'SUCCESS').length} / {student.assignments?.length}
                </p>
              </div>
            </div>

            {/* Listă Teme Student */}
            <div className="p-4 space-y-3">
              {student.assignments?.length > 0 ? (
                student.assignments.map((asg: any) => (
                  <div key={asg.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/[0.02] gap-4">
                    <div className="flex items-center gap-3">
                      {asg.status === 'SUCCESS' ? (
                        <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                      ) : (
                        <CircleDashed className="text-amber-500 animate-spin-slow shrink-0" size={18} />
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-200">{asg.title}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{asg.language}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                      {asg.status === 'SUCCESS' ? (
                        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 w-full md:w-auto">
                          <Star size={14} className="text-amber-500 ml-2" />
                          <input 
                            type="number" 
                            min="1" max="10"
                            placeholder={asg.grade ? `Nota: ${asg.grade}` : "Notă"}
                            className="bg-transparent text-xs font-black w-16 outline-none text-white px-1"
                            onChange={(e) => setTempGrades({...tempGrades, [asg.id]: parseInt(e.target.value)})}
                          />
                          <button 
                            onClick={() => submitGrade(asg.id)}
                            className="bg-blue-600 hover:bg-blue-500 p-2 rounded-lg transition-all active:scale-90"
                          >
                            <Send size={12} className="text-white" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[9px] font-black text-slate-600 uppercase border border-slate-800 px-3 py-1 rounded-full">
                          Neîncepută / În lucru
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-600 italic text-center py-4">Nicio temă alocată acestui student.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};