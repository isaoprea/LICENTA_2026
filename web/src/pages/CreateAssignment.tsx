import { useState, useEffect } from 'react';
import { ChevronDown, Plus, Loader2 } from 'lucide-react';

interface CreateAssignmentProps {
  classrooms?: any[];
  onAssignmentCreated: () => void;
}

const LANGUAGES = ['Python', 'C++', 'Java', 'Node.js'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export const CreateAssignment: React.FC<CreateAssignmentProps> = ({ classrooms = [], onAssignmentCreated }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [practicProblems, setPracticeProblems] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [selectedProblemId, setSelectedProblemId] = useState('');
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');
  const [recipientType, setRecipientType] = useState<'individual' | 'classroom'>('individual');
  const [loading, setLoading] = useState(false);
  
  const [newProblem, setNewProblem] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    language: 'Python',
    testCases: [{ input: '', output: '' }]
  });

  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    language: 'Python'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Fetch students
    fetch('http://localhost:3000/users/students', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => { if (Array.isArray(data)) setStudents(data); })
    .catch(err => console.error("Error loading students:", err));

    // Fetch practice problems
    fetch('http://localhost:3000/problems/practice', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => { if (Array.isArray(data)) setPracticeProblems(data); })
    .catch(err => console.error("Error loading practice problems:", err));
  }, []);

  const handleAddTestCase = () => {
    setNewProblem({
      ...newProblem,
      testCases: [...newProblem.testCases, { input: '', output: '' }]
    });
  };

  const handleRemoveTestCase = (idx: number) => {
    setNewProblem({
      ...newProblem,
      testCases: newProblem.testCases.filter((_, i) => i !== idx)
    });
  };

  const handleSend = async () => {
    const token = localStorage.getItem('token');
    
    let studentIds = selectedStudents;
    
    // Dacă classroom-ul e selectat, iau studenții din classroom
    if (recipientType === 'classroom' && selectedClassroom) {
      const classroom = classrooms.find(c => c.id === selectedClassroom);
      if (!classroom?.students?.length) {
        return alert("Classroom-ul selectat nu are studenți!");
      }
      studentIds = classroom.students.map((s: any) => s.id);
    }

    if (studentIds.length === 0) {
      return alert("Selectează cel puțin un student sau classroom!");
    }

    if (activeTab === 'existing' && !selectedProblemId) {
      return alert("Selectează o problemă!");
    }

    setLoading(true);

    try {
      let problemId = selectedProblemId;

      // Dacă creează problemă nouă
      if (activeTab === 'new') {
        const createRes = await fetch('http://localhost:3000/problems', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...newProblem,
            type: 'HOMEWORK'
          })
        });

        if (!createRes.ok) throw new Error('Eroare la crearea problemei');
        const created = await createRes.json();
        problemId = created.id;
      }

      // Alocă tema pentru fiecare student
      const response = await fetch('http://localhost:3000/classrooms/assignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: assignmentForm.title || 'Tema Nouă',
          problemId,
          language: assignmentForm.language,
          studentIds,
          classroomId: recipientType === 'classroom' ? selectedClassroom : undefined
        })
      });

      if (response.ok) {
        const count = studentIds.length;
        alert(`✅ Tema a fost trimisă la ${count} ${count === 1 ? 'student' : 'studenți'}!`);
        setSelectedStudents([]);
        setSelectedClassroom('');
        setSelectedProblemId('');
        setAssignmentForm({ title: '', language: 'Python' });
        setNewProblem({
          title: '',
          description: '',
          difficulty: 'Easy',
          language: 'Python',
          testCases: [{ input: '', output: '' }]
        });
        setActiveTab('existing');
        onAssignmentCreated();
      } else {
        throw new Error('Eroare la alocarea temei');
      }
    } catch (err: any) {
      alert(`❌ ${err.message || 'Eroare necunoscută'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8">
      <h3 className="text-xl font-black italic uppercase mb-6">Alocă o Temă Nouă</h3>
      
      <div className="space-y-6">
        {/* Tab Selector */}
        <div className="flex gap-2 bg-slate-800/30 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('existing')}
            className={`flex-1 px-4 py-3 rounded-xl font-black text-sm uppercase transition-all ${
              activeTab === 'existing'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Din Catalog
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 px-4 py-3 rounded-xl font-black text-sm uppercase transition-all ${
              activeTab === 'new'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Creează Nouă
          </button>
        </div>

        {/* Problem Selection / Creation */}
        {activeTab === 'existing' ? (
          <div>
            <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block tracking-widest">
              Alege Problemă Practice
            </label>
            <div className="relative">
              <select
                value={selectedProblemId}
                onChange={(e) => setSelectedProblemId(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 rounded-2xl appearance-none focus:border-blue-500 outline-none font-medium transition-all cursor-pointer"
              >
                <option value="">Selectează o problemă...</option>
                {practicProblems.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.title} • {p.difficulty}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
        ) : (
          <div className="space-y-4 bg-slate-800/20 p-6 rounded-2xl border border-slate-700/30">
            <input
              type="text"
              placeholder="Titlu problemă"
              value={newProblem.title}
              onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 text-white p-3 rounded-xl focus:border-blue-500 outline-none transition-all"
            />

            <textarea
              placeholder="Descriere detaliată a problemei..."
              value={newProblem.description}
              onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 text-white p-3 rounded-xl focus:border-blue-500 outline-none transition-all h-20 resize-none"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-500 font-black uppercase mb-1 block">Dificultate</label>
                <select
                  value={newProblem.difficulty}
                  onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white p-3 rounded-xl focus:border-blue-500 outline-none cursor-pointer"
                >
                  {DIFFICULTIES.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-black uppercase mb-1 block">Limbaj</label>
                <select
                  value={newProblem.language}
                  onChange={(e) => setNewProblem({ ...newProblem, language: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white p-3 rounded-xl focus:border-blue-500 outline-none cursor-pointer"
                >
                  {LANGUAGES.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-black uppercase mb-3 block">Test Cases</label>
              <div className="space-y-3">
                {newProblem.testCases.map((tc, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-3 items-end">
                    <input
                      type="text"
                      placeholder="Input"
                      value={tc.input}
                      onChange={(e) => {
                        const updated = [...newProblem.testCases];
                        updated[idx].input = e.target.value;
                        setNewProblem({ ...newProblem, testCases: updated });
                      }}
                      className="bg-slate-800/50 border border-slate-700 text-white p-2 rounded-lg text-sm focus:border-blue-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Output"
                        value={tc.output}
                        onChange={(e) => {
                          const updated = [...newProblem.testCases];
                          updated[idx].output = e.target.value;
                          setNewProblem({ ...newProblem, testCases: updated });
                        }}
                        className="flex-1 bg-slate-800/50 border border-slate-700 text-white p-2 rounded-lg text-sm focus:border-blue-500 outline-none"
                      />
                      {newProblem.testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTestCase(idx)}
                          className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 transition-all text-sm font-black"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddTestCase}
                className="mt-3 text-blue-400 text-sm font-black hover:text-blue-300 flex items-center gap-1"
              >
                <Plus size={16} /> Adaug Test Case
              </button>
            </div>
          </div>
        )}

        {/* Language & Title */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block">Limbaj Obligatoriu</label>
            <select
              value={assignmentForm.language}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, language: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 text-white p-3 rounded-xl focus:border-blue-500 outline-none cursor-pointer"
            >
              {LANGUAGES.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block">Titlu Temă</label>
            <input
              type="text"
              placeholder="Ex: Tema recursivitate"
              value={assignmentForm.title}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 text-white p-3 rounded-xl focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Students Selection */}
        <div className="space-y-4">
          <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block tracking-widest">Alege Recipient</label>
          
          {/* Recipient Type Selector */}
          <div className="flex gap-3 bg-slate-800/30 p-2 rounded-2xl">
            <button
              onClick={() => {
                setRecipientType('individual');
                setSelectedClassroom('');
              }}
              className={`flex-1 px-4 py-3 rounded-xl font-black text-sm uppercase transition-all ${
                recipientType === 'individual'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Studenți Individuali
            </button>
            <button
              onClick={() => {
                setRecipientType('classroom');
                setSelectedStudents([]);
              }}
              disabled={classrooms.length === 0}
              className={`flex-1 px-4 py-3 rounded-xl font-black text-sm uppercase transition-all ${
                recipientType === 'classroom'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : classrooms.length === 0
                  ? 'text-slate-700 cursor-not-allowed'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Classroom Întreg
            </button>
          </div>

          {/* Classroom Selection */}
          {recipientType === 'classroom' ? (
            <div className="space-y-4">
              <div className="relative">
                <select
                  value={selectedClassroom}
                  onChange={(e) => setSelectedClassroom(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 rounded-2xl appearance-none focus:border-blue-500 outline-none font-medium transition-all cursor-pointer"
                >
                  <option value="">Selectează o clasă...</option>
                  {classrooms.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.students?.length || 0} elevi)
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>

              {/* Preview Students from Classroom */}
              {selectedClassroom && (
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 max-h-48 overflow-y-auto space-y-2">
                  <p className="text-[10px] text-slate-500 font-black uppercase mb-2">Studenți din clasă:</p>
                  {classrooms.find(c => c.id === selectedClassroom)?.students?.length ? (
                    classrooms.find(c => c.id === selectedClassroom).students.map((s: any) => (
                      <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-800/20 rounded-xl border border-slate-700/30">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">{s.name || 'Utilizator'}</p>
                          <p className="text-[10px] text-slate-500 truncate">{s.email}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-600 italic">Niciun student în această clasă.</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Individual Students Selection */
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 max-h-64 overflow-y-auto space-y-2">
              {students.length > 0 ? (
                students.map((s: any) => (
                  <label key={s.id} className="flex items-center gap-3 p-3 hover:bg-slate-800/50 rounded-xl cursor-pointer transition-all group">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(s.id)}
                      onChange={(e) => {
                        if (e.target.checked)
                          setSelectedStudents([...selectedStudents, s.id]);
                        else
                          setSelectedStudents(selectedStudents.filter(id => id !== s.id));
                      }}
                      className="w-4 h-4 accent-blue-600 rounded border-slate-600 bg-slate-700 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{s.name || 'Utilizator'}</p>
                      <p className="text-[10px] text-slate-500 truncate">{s.email}</p>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-xs text-slate-600 italic p-3">Nu există studenți.</p>
              )}
            </div>
          )}
        </div>

        {/* Send Button */}
        {(() => {
          const recipientCount = recipientType === 'classroom' 
            ? (classrooms.find(c => c.id === selectedClassroom)?.students?.length || 0)
            : selectedStudents.length;
          
          return (
            <button
              onClick={handleSend}
              disabled={recipientCount === 0 || loading}
              className={`w-full py-4 rounded-2xl font-black uppercase transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                recipientCount > 0 && !loading
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              TRIMITE LA {recipientCount} {recipientCount === 1 ? 'STUDENT' : 'STUDENȚI'}
            </button>
          );
        })()}
      </div>
    </div>
  );
};