import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Brain, Code2, Zap, Layout } from 'lucide-react';
import axios from 'axios';

interface AiApiResponse {
  logicScore: number;
  cleanCodeScore: number;
  efficiencyScore: number;
  versatilityScore: number;
  summary: string;
}

const AiProfile = () => {
  const brandColor = "#4facfe";
  const [analysis, setAnalysis] = useState<AiApiResponse | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // ✅ Date pentru chart vin din state, nu hardcodate
  const chartData = analysis ? [
    { subject: 'LOGICĂ',      A: analysis.logicScore,       fullMark: 10 },
    { subject: 'STIL',        A: analysis.cleanCodeScore,   fullMark: 10 },
    { subject: 'EFICIENȚĂ',   A: analysis.efficiencyScore,  fullMark: 10 },
    { subject: 'VERSATILITY', A: analysis.versatilityScore, fullMark: 10 },
  ] : [];

  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token')
      || localStorage.getItem('access_token')
      || localStorage.getItem('jwt');

    try {
      const res = await axios.post<AiApiResponse>(
        'http://localhost:3000/ai-analysis/generate',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalysis(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Sesiune expirată. Te rugăm să te re-loghezi!');
      } else if (err.response?.status === 404) {
        setError('Nu ai destul cod scris. Mai rezolvă niște probleme!');
      } else {
        setError(err.response?.data?.message || 'Eroare la serverul AI.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      background: 'radial-gradient(circle at center, #0a192f 0%, #020617 100%)',
      minHeight: '100vh', color: '#fff', padding: '60px 20px',
      fontFamily: "'Orbitron', sans-serif", overflow: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@300;500;700&display=swap');
        .glass-panel { background: rgba(79,175,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(79,175,255,0.15); }
        .neon-text-brand { color: ${brandColor}; text-shadow: 0 0 15px rgba(79,175,255,0.7); font-family: 'Orbitron', sans-serif; font-weight: 700; }
        .chart-3d { transform: rotateX(30deg); transform-style: preserve-3d; filter: drop-shadow(0px 15px 25px rgba(79,175,255,0.4)); transition: transform 0.5s; }
        .chart-3d:hover { transform: rotateX(20deg) rotateY(5deg); }
        .glow-border { border-top: 1px solid ${brandColor}; box-shadow: 0 -10px 20px -10px rgba(79,175,255,0.3); }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '80px' }}>
          <span style={{ fontSize: '11px', letterSpacing: '6px', color: '#334155', fontWeight: 700 }}>NEURAL_INTERFACE_v2.0</span>
          <h1 className="neon-text-brand" style={{ fontSize: '3rem', marginTop: '15px', letterSpacing: '12px' }}>CODER DNA</h1>
        </motion.div>

        {/* ✅ Stare inițială — buton generate */}
        {!analysis && !loading && (
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            {error && (
              <p style={{ color: '#f87171', fontFamily: 'Rajdhani', fontSize: '16px', marginBottom: '20px' }}>
                {'>'} {error}
              </p>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={generateAnalysis}
              style={{
                padding: '16px 48px', background: 'transparent',
                border: `1px solid ${brandColor}`, color: brandColor,
                fontFamily: 'Orbitron', fontSize: '13px', letterSpacing: '4px',
                cursor: 'pointer', boxShadow: `0 0 20px rgba(79,175,255,0.2)`,
              }}
            >
              INIȚIAZĂ ANALIZA
            </motion.button>
          </div>
        )}

        {/* ✅ Loading */}
        {loading && (
          <div style={{ textAlign: 'center', color: brandColor, fontFamily: 'Rajdhani', fontSize: '18px', letterSpacing: '4px' }}>
            {'>'} SE PROCESEAZĂ CODUL...
          </div>
        )}

        {/* ✅ Rezultate — apar doar când analysis e populated */}
        {analysis && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'center' }}>

            <div style={{ perspective: '1200px' }}>
              <div className="chart-3d">
                <ResponsiveContainer width="100%" height={500}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <defs>
                      <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={brandColor} stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7}/>
                      </linearGradient>
                    </defs>
                    <PolarGrid stroke="#1e293b" strokeWidth={1}/>
                    <PolarAngleAxis dataKey="subject"
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600, fontFamily: 'Rajdhani' }}/>
                    <Radar name="AI Analysis" dataKey="A"
                      stroke={brandColor} strokeWidth={3}
                      fill="url(#brandGrad)" fillOpacity={0.5} animationDuration={2500}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* ✅ Valorile vin din API */}
              <MetricBox label="LOGIC"       value={analysis.logicScore}       icon={<Brain size={18} color={brandColor}/>} brandColor={brandColor}/>
              <MetricBox label="STYLE"       value={analysis.cleanCodeScore}   icon={<Code2 size={18} color={brandColor}/>} brandColor={brandColor}/>
              <MetricBox label="EFFICIENCY"  value={analysis.efficiencyScore}  icon={<Zap size={18} color={brandColor}/>}   brandColor={brandColor}/>
              <MetricBox label="VERSATILITY" value={analysis.versatilityScore} icon={<Layout size={18} color={brandColor}/>} brandColor={brandColor}/>

              <div className="glow-border" style={{
                gridColumn: '1 / span 2', padding: '30px', marginTop: '20px',
                background: 'rgba(15,23,42,0.6)', fontFamily: 'Rajdhani',
              }}>
                <p style={{ margin: 0, fontSize: '13px', color: brandColor, letterSpacing: '3px', fontWeight: 700 }}>
                  {'>'} AI_ANALYSIS_COMPLETED
                </p>
                <p style={{ margin: '15px 0 0 0', fontSize: '18px', color: '#94a3b8', fontWeight: 300, lineHeight: 1.7 }}>
                  {'>'} {analysis.summary}
                </p>
              </div>

              <motion.button whileHover={{ scale: 1.03 }} onClick={() => setAnalysis(null)}
                style={{
                  gridColumn: '1 / span 2', padding: '10px', background: 'transparent',
                  border: '1px solid #1e293b', color: '#475569',
                  fontFamily: 'Rajdhani', fontSize: '13px', letterSpacing: '3px', cursor: 'pointer',
                }}>
                REGENEREAZĂ ANALIZA
              </motion.button>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
};

// ✅ value e number, nu string hardcodat
const MetricBox = ({ label, value, icon, brandColor }: { label: string; value: number; icon: React.ReactNode; brandColor: string }) => (
  <motion.div whileHover={{ y: -5, backgroundColor: 'rgba(79,175,255,0.08)' }}
    className="glass-panel" style={{ padding: '25px', textAlign: 'left' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
      <span style={{ fontSize: '10px', letterSpacing: '3px', color: '#475569', fontWeight: 700 }}>{label}</span>
      <div style={{ opacity: 0.6 }}>{icon}</div>
    </div>
    <div style={{ fontSize: '32px', fontWeight: 700, color: '#f8fafc', fontFamily: 'Orbitron' }}>
      {value.toFixed(1)}<span style={{ fontSize: '14px', color: brandColor, opacity: 0.8, marginLeft: '4px' }}>PTS</span>
    </div>
  </motion.div>
);

export default AiProfile;