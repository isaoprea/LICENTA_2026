import { useEffect, useState, useRef } from 'react';

export function useExamMonitor(token: string, maxWarnings: number = 3) {
  const [warnings, setWarnings] = useState(0);
  const [isKicked, setIsKicked] = useState(false);
  const isExamActive = useRef(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  const reportCheatToBackend = async (newWarnings: number) => {
    try {
      await fetch(`${API_BASE_URL}/assessments/session/${token}/cheat`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warnings: newWarnings }),
      });
    } catch (error) {
      console.error("Eroare la raportarea trișatului:", error);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isExamActive.current) {
        setWarnings((prev) => {
          const newWarnings = prev + 1;
          
          reportCheatToBackend(newWarnings); 

          if (newWarnings >= maxWarnings) {
            setIsKicked(true); 
          } else {
            alert(`⚠️ AVERTISMENT (${newWarnings}/${maxWarnings}): Ai părăsit pagina examenului! La ${maxWarnings} avertismente testul se închide automat.`);
          }
          return newWarnings;
        });
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isExamActive.current && !isKicked) {
        alert("⚠️ Atenție! Examenul trebuie susținut în modul Fullscreen! Te rugăm să revii.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [token, maxWarnings]);

  const startMonitoring = () => {
    isExamActive.current = true;
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => console.log(err));
    }
  };

  const stopMonitoring = () => {
    isExamActive.current = false;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err));
    }
  };

  return { warnings, isKicked, startMonitoring, stopMonitoring };
}