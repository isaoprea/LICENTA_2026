import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ProblemsList() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/problems').then(res => setProblems(res.data));
  }, []);

  return (
    <div style={{ padding: '40px' }}>
      <h2>Provocări de Programare</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', backgroundColor: '#fff' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
            <th style={{ padding: '15px' }}>Titlu</th>
            <th>Dificultate</th>
            <th>Acțiune</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((p: any) => (
            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '15px' }}>{p.title}</td>
              <td style={{ color: p.difficulty === 'Easy' ? '#28a745' : p.difficulty === 'Medium' ? '#ffc107' : '#dc3545', fontWeight: 'bold' }}>
                {p.difficulty}
              </td>
              <td>
                <Link to={`/problem/${p.id}`} style={{ color: '#007bff', textDecoration: 'none' }}>Rezolvă</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}