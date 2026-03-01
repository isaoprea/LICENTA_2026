import React, { useState } from 'react';
import axios from 'axios';
import { X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export const CreateClassroomModal = ({ isOpen, onClose, onCreated }: any) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const user = JSON.parse(atob(token!.split('.')[1])); // Extragem teacherId

    try {
      await axios.post('http://localhost:3000/classrooms', {
        name,
        description,
        teacherId: user.id || user.sub
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onCreated(); // Reîncărcăm lista de clase
      onClose();
      setName('');
      setDescription('');
    } catch (err) {
      alert("Eroare la crearea clasei.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#111114] border border-gray-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black italic uppercase">Creează Clasă</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            required
            className="w-full bg-black border border-gray-800 p-4 rounded-2xl text-white outline-none focus:border-purple-500 transition-all"
            placeholder="Numele Clasei (ex: Grupa 102)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea 
            className="w-full bg-black border border-gray-800 p-4 rounded-2xl text-white outline-none focus:border-purple-500 h-32 resize-none"
            placeholder="Scurtă descriere..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 py-4 rounded-2xl font-black transition-all">
            GENEREAZĂ CLASA ȘI CODUL
          </button>
        </form>
      </motion.div>
    </div>
  );
};