import React, { useState, useEffect } from 'react';

interface CreateAssignmentProps {
  classrooms: any[];
  onAssignmentCreated: () => void;
}

export const CreateAssignment: React.FC<CreateAssignmentProps> = ({ classrooms, onAssignmentCreated }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [formData, setFormData] = useState({ title: '', problemId: '', language: 'python' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:3000/users/students', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => { if (Array.isArray(data)) setStudents(data); })
    .catch(err => console.error("Error loading students:", err));

    fetch('http://localhost:3000/problems')
    .then(res => res.json())
    .then(data => { if (Array.isArray(data)) setProblems(data); });
  }, []);

  const handleSend = async () => {
    const token = localStorage.getItem('token');
    if (!formData.problemId || selectedStudents.length === 0) {
      return alert("Selectează problema și cel puțin un student!");
    }

    const response = await fetch('http://localhost:3000/classrooms/assignment', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...formData,
        studentIds: selectedStudents
      })
    });

    if (response.ok) {
      alert("✅ Tema a fost trimisă cu succes!");
      setSelectedStudents([]);
      onAssignmentCreated();
    }
  };

  return (
    <div className="bg-[#111114] p-6 rounded-2xl border border-gray-800 sticky top-10">
      <h2 className="text-xl font-black mb-4 text-white uppercase tracking-tight">Alocă o Temă Nouă</h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Titlu Temă</label>
          <input 
            className="w-full bg-black border border-gray-800 p-3 rounded-lg text-white focus:border-purple-500 outline-none transition-all"
            placeholder="Ex: Tema pentru recursivitate"
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div className="bg-black border border-gray-800 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 mb-2 uppercase font-bold">Selectează Studenții:</p>
          <div className="max-h-48 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
            {students.length > 0 ? students.map((s: any) => (
              <label key={s.id} className="flex items-center gap-3 p-2 hover:bg-gray-900 rounded-md cursor-pointer transition-colors group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-purple-600 rounded border-gray-700 bg-gray-800"
                  checked={selectedStudents.includes(s.id)}
                  onChange={(e) => {
                    if(e.target.checked) setSelectedStudents([...selectedStudents, s.id]);
                    else setSelectedStudents(selectedStudents.filter(id => id !== s.id));
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-sm text-gray-300 group-hover:text-white font-medium">{s.name || "Elev Fără Nume"}</span>
                  <span className="text-[10px] text-gray-600">{s.email}</span>
                </div>
              </label>
            )) : <p className="text-xs text-gray-600 italic p-2">Nu există studenți înregistrați.</p>}
          </div>
        </div>

        <div>
          <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Problema din catalog</label>
          <select 
            className="w-full bg-black border border-gray-800 p-3 rounded-lg text-white focus:border-purple-500 outline-none cursor-pointer"
            value={formData.problemId}
            onChange={(e) => setFormData({...formData, problemId: e.target.value})}
          >
            <option value="">Alege o problemă...</option>
            {problems.map((p: any) => (
              <option key={p.id} value={p.id}>{p.title} ({p.difficulty})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Limbaj obligatoriu</label>
          <select 
            className="w-full bg-black border border-gray-800 p-3 rounded-lg text-white focus:border-purple-500 outline-none cursor-pointer"
            value={formData.language}
            onChange={(e) => setFormData({...formData, language: e.target.value})}
          >
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        <button 
          onClick={handleSend}
          disabled={selectedStudents.length === 0}
          className={`w-full py-4 rounded-xl font-black transition-all transform active:scale-95 mt-4 ${
            selectedStudents.length > 0 
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20' 
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          TRIMITE LA {selectedStudents.length} {selectedStudents.length === 1 ? 'ELEV' : 'ELEVI'}
        </button>
      </div>
    </div>
  );
};