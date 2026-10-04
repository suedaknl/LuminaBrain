import React, { useState, useEffect } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface Problem {
  targetLabel: string;
  options: number[]; // degrees of slices
  answer: number;
}

const FRACTIONS = [
  { n: 1, d: 2 }, { n: 1, d: 3 }, { n: 2, d: 3 }, { n: 1, d: 4 }, { n: 3, d: 4 },
  { n: 1, d: 5 }, { n: 2, d: 5 }, { n: 3, d: 5 }, { n: 4, d: 5 },
  { n: 1, d: 6 }, { n: 5, d: 6 }, { n: 1, d: 8 }, { n: 3, d: 8 }, { n: 5, d: 8 }, { n: 7, d: 8 }
];

const generateProblem = (level: number): Problem => {
  const targetFrac = FRACTIONS[Math.floor(Math.random() * Math.min(FRACTIONS.length, 3 + level))];
  const targetAngle = (targetFrac.n / targetFrac.d) * 360;
  
  const options = [targetAngle];
  while (options.length < 4) {
    const randomFrac = FRACTIONS[Math.floor(Math.random() * FRACTIONS.length)];
    let wrongAngle = (randomFrac.n / randomFrac.d) * 360;
    
    // Sometimes jitter the wrong answers slightly
    if (Math.random() > 0.5) {
      wrongAngle += (Math.random() > 0.5 ? 15 : -15);
    }
    
    // Ensure no duplicates or identical to target
    if (Math.abs(wrongAngle - targetAngle) > 2 && !options.some(o => Math.abs(o - wrongAngle) < 2) && wrongAngle > 0 && wrongAngle < 360) {
      options.push(wrongAngle);
    }
  }

  return {
    targetLabel: `${targetFrac.n}/${targetFrac.d}`,
    answer: targetAngle,
    options: options.sort(() => Math.random() - 0.5)
  };
};

const CakeSlice = ({ angle }: { angle: number }) => {
  // SVG Pie chart slice
  let d = '';
  if (angle >= 360) {
    d = 'M 50 50 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0';
  } else {
    const rad = (angle - 90) * (Math.PI / 180);
    const x = 50 + 50 * Math.cos(rad);
    const y = 50 + 50 * Math.sin(rad);
    const largeArcFlag = angle > 180 ? 1 : 0;
    d = `M 50 50 L 50 0 A 50 50 0 ${largeArcFlag} 1 ${x} ${y} Z`;
  }

  return (
    <svg viewBox="0 0 100 100" className="select-none touch-none w-full h-full drop-shadow-md">
      <circle cx="50" cy="50" r="50" fill="rgba(255,255,255,0.1)" />
      <path d={d} fill="#f43f5e" />
    </svg>
  );
};

interface PastayiBolProps {
  onClose?: () => void;
}

const PastayiBol: React.FC<PastayiBolProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_PastayiBol') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [level, setLevel] = useState(1);

  const [problem, setProblem] = useState<Problem | null>(null);
  const [flash, setFlash] = useState<'red' | 'green' | null>(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    setLevel(1);
    setProblem(generateProblem(1));
    setGameState('playing');
  };

  const handleOptionClick = (angle: number) => {
    if (gameState !== 'playing' || !problem) return;

    if (angle === problem.answer) {
      setScore(s => s + 10);
      setFlash('green');
      setLevel(l => l + 1);
      setTimeout(() => setFlash(null), 300);
      setTimeout(() => setProblem(prev => {
        let newProb = generateProblem(level + 1);
        while (newProb.targetLabel === prev?.targetLabel) {
          newProb = generateProblem(level + 1);
        }
        return newProb;
      }), 300);
    } else {
      setScore(s => Math.max(0, s - 5));
      setFlash('red');
      setTimeout(() => setFlash(null), 300);
    }
  };

  useEffect(() => {
    let timer: number;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && gameState === 'playing') {
      setGameState('finished');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'finished') {
      if (score > highScore) {
        setHighScore(score);
        setIsNewRecord(true);
        localStorage.setItem('highScore_PastayiBol', score.toString());
      }
    }
  }, [gameState, score, highScore]);

  return (
    <div className="select-none touch-none fixed inset-0 z-50 flex flex-col backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-hidden transition-colors duration-150 bg-slate-800/60 dark:bg-slate-900/60 select-none">
      {onClose && (
        <button
          onPointerDownCapture={(e) => { e.stopPropagation(); onClose(); }}
          className="select-none touch-none absolute top-6 left-6 flex items-center gap-2 text-slate-800 dark:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50 transition font-semibold bg-white/30 dark:bg-slate-800/50 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm z-20"
        >
          ← Ana Menüye Dön
        </button>
      )}
      
      <div className="select-none touch-none flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto mt-16 sm:mt-0 relative">
        <div className="select-none touch-none flex justify-between items-center w-full mb-4 sm:mb-6 pb-4 border-b border-slate-400/30 dark:border-slate-500/30 z-10">
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-white">Pastayı Böl</h1>
          <div className="select-none touch-none flex gap-2 sm:gap-4">
            <div className="select-none touch-none flex flex-col items-center bg-blue-500/20 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-blue-500/30">
              <span className="select-none touch-none text-[10px] sm:text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Süre</span>
              <span className={`text-xl sm:text-2xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-blue-100'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="select-none touch-none flex flex-col items-center bg-green-500/20 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-green-500/30">
              <span className="select-none touch-none text-[10px] sm:text-xs font-bold text-green-200 uppercase tracking-wider mb-1">Skor</span>
              <span className={`text-xl sm:text-2xl font-black text-green-100`}>{score}</span>
            </div>
          </div>
        </div>

        <div className="select-none touch-none flex-1 w-full flex flex-col items-center relative overflow-hidden">
          {gameState === 'idle' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700 z-10 mt-10">
              <div className="select-none touch-none text-6xl mb-6">🍰</div>
              <h2 className="select-none touch-none text-2xl font-bold text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-300 mb-8 text-lg leading-relaxed">
                İstenen kesir veya oranı en iyi temsil eden pasta dilimini görsel olarak seç!
              </p>
              <button
                onPointerDownCapture={(e) => { e.stopPropagation(); startGame(); }}
                className="select-none touch-none w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {gameState === 'playing' && problem && (
            <div className={`w-full h-full flex flex-col items-center justify-center rounded-3xl border border-white/10 shadow-inner transition-colors duration-150 p-4 sm:p-8 ${
              flash === 'red' ? 'bg-red-500/40' : flash === 'green' ? 'bg-emerald-500/40' : 'bg-slate-900/30'
            }`}>
              
              <div className="select-none touch-none text-center mb-12">
                <p className="select-none touch-none text-xl sm:text-2xl text-white/80 font-medium mb-2">Hangi dilim bu ölçüdedir?</p>
                <h2 className="select-none touch-none text-4xl sm:text-5xl font-black text-rose-400">{problem.targetLabel}</h2>
              </div>

              <div className="select-none touch-none grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-3xl">
                {problem.options.map((opt, i) => (
                  <button
                    key={i}
                    onPointerDownCapture={() => handleOptionClick(opt)}
                    className="select-none touch-none aspect-square bg-white/5 hover:bg-white/10 border border-white/20 p-6 rounded-2xl transition-all duration-200 active:scale-95 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] flex flex-col items-center justify-center"
                  >
                    <CakeSlice angle={opt} />
                  </button>
                ))}
              </div>

            </div>
          )}

          {gameState === 'finished' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700 absolute z-20 mt-10">
              <div className="select-none touch-none text-7xl mb-6">⏰</div>
              <h2 className="select-none touch-none text-4xl font-bold text-white mb-4">Süre Bitti!</h2>
              {isNewRecord && (
                <div className="select-none touch-none mb-4 text-2xl font-black text-yellow-400 animate-bounce">
                  🏆 Yeni Rekor!
                </div>
              )}
              <p className="select-none touch-none text-slate-300 mb-8 text-xl">
                Toplam Skorunuz: <span className="select-none touch-none text-4xl font-black text-rose-400 ml-2 block mt-2">{score}</span>
              </p>
              <button
                onPointerDownCapture={(e) => { e.stopPropagation(); startGame(); }}
                className="select-none touch-none w-full bg-white hover:bg-slate-200 text-slate-900 font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Tekrar Oyna
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PastayiBol;

