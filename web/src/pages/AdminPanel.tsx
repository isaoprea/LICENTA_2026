import { useState } from 'react';
import axios from 'axios';

export default function AdminPanel() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  // Începem cu un singur test case gol
  const [testCases, setTestCases] = useState([{ input: '', output: '' }]);

  // Funcție pentru a adăuga un nou rând de test case
  const addTestCase = () => {
    setTestCases([...testCases, { input: '', output: '' }]);
  };

  // Funcție pentru a actualiza un test case specific
  const updateTestCase = (index: number, field: 'input' | 'output', value: string) => {
    const newTests = [...testCases];
    newTests[index][field] = value;
    setTestCases(newTests);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.post('http://localhost:3000/admin/problems', 
        { title, description, difficulty, testCases }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Problemă adăugată cu succes!");
      // Resetăm formularul
      setTitle(''); setDescription(''); setTestCases([{ input: '', output: '' }]);
    } catch (err) {
      console.error(err);
      alert("Eroare! Verifică dacă ești logat ca ADMIN.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-lg rounded-xl mt-10">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Panou Administrare: Adaugă Problemă</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">Titlu Problemă</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required
            className="w-full mt-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Descriere (Cerință)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required
            className="w-full mt-1 p-2 border border-slate-300 rounded-md h-32" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Dificultate</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
            className="w-full mt-1 p-2 border border-slate-300 rounded-md">
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Test Cases (Date de test)</label>
          {testCases.map((tc, index) => (
            <div key={index} className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex-1">
                <input placeholder="Input (ex: 9\n2 7 11)" value={tc.input} 
                  onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-sm font-mono" />
              </div>
              <div className="flex-1">
                <input placeholder="Output așteptat (ex: 0 1)" value={tc.output}
                  onChange={(e) => updateTestCase(index, 'output', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-sm font-mono" />
              </div>
            </div>
          ))}
          <button type="button" onClick={addTestCase}
            className="text-sm text-blue-600 font-semibold hover:text-blue-800 transition">
            + Adaugă încă un test case
          </button>
        </div>

        <button type="submit" 
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-md">
          Salvează Problema în Baza de Date
        </button>
      </form>
    </div>
  );
}