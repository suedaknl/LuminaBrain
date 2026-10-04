import React, { useState, useEffect, useRef, useCallback } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface Drop {
  id: number;
  expression: string;
  answer: number;
  x: number; // percentage
  y: number; // percentage
  speed: number;
}

interface YagmurDamlalariProps {
  onClose?: () => void;
}

const YagmurDamlalari: React.FC<YagmurDamlalariProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_YagmurDamlalari') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [flash, setFlash] = useState(false);

  const [drops, setDrops] = useState<Drop[]>([]);
  const [options, setOptions] = useState<number[]>([]);
  const dropIdCounter = useRef(0);
  const speedRef = useRef(1.0);
  
  const generateProblem = () => {
    const ops = ['+', '-'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, ans;
    if (op === '+') {
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      ans = a + b;
    } else {
      a = Math.floor(Math.random() * 20) + 10;
      b = Math.floor(Math.random() * a);
      ans = a - b;
    }
    return { expression: `${a} ${op} ${b}`, answer: ans };
  };

  const spawnDrop = useCallback(() => {
    const prob = generateProblem();
    const newDrop: Drop = {
      id: dropIdCounter.current++,
      expression: prob.expression,
      answer: prob.answer,
      x: 10 + Math.random() * 80,
      y: -10,
      speed: speedRef.current + Math.random() * 0.5
    };
    
    // Generate 3 unique options including the correct answer
    const newOpts = [prob.answer];
    while (newOpts.length < 3) {
      const wrong = prob.answer + Math.floor(Math.random() * 10) - 5;
      if (wrong !== prob.answer && !newOpts.includes(wrong) && wrong > 0) {
        newOpts.push(wrong);
      }
    }
    setOptions(newOpts.sort(() => Math.random() - 0.5));
    
    return newDrop;
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    speedRef.current = 0.5; // slow speed initially
    setDrops([spawnDrop()]);
    setGameState('playing');
  };

  const handleOptionClick = (val: number) => {
    if (gameState !== 'playing') return;
    
    // Assuming there's only one drop at a time to simplify
    const activeDrop = drops[0];
    if (!activeDrop) return;

    if (val === activeDrop.answer) {
      setScore(s => s + 15);
      speedRef.current += 0.05; // Gets faster
      setDrops([spawnDrop()]);
    } else {
      setScore(s => s - 5);
      setFlash(true);
      setTimeout(() => setFlash(false), 300);
    }
  };

  // Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setDrops(prev => {
        const updated = prev.map(d => ({ ...d, y: d.y + d.speed }));
        
        // If drop hits bottom (100%)
        if (updated.length > 0 && updated[0].y > 90) {
          setScore(s => s - 10);
          setFlash(true);
          setTimeout(() => setFlash(false), 300);
          speedRef.current = Math.max(0.3, speedRef.current - 0.1);
          setOptions([]); // To avoid clicking old options
          // Schedule next drop
          setTimeout(() => setDrops([spawnDrop()]), 100);
          return [];
        }
        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameState, spawnDrop]);

  // Timer
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
        localStorage.setItem('highScore_YagmurDamlalari', score.toString());
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
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-white">Yağmur Damlaları</h1>
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
              <div className="select-none touch-none text-6xl mb-6">💧</div>
              <h2 className="select-none touch-none text-2xl font-bold text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-300 mb-8 text-lg leading-relaxed">
                Aşağı düşen yağmur damlalarındaki matematik işlemini çöz ve damla yere değmeden önce doğru cevabı seç!
              </p>
              <button
                onPointerDownCapture={(e) => { e.stopPropagation(); startGame(); }}
                className="select-none touch-none w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className={`w-full h-full relative overflow-hidden flex flex-col justify-between items-center rounded-3xl border border-white/10 shadow-inner transition-colors duration-150 ${flash ? 'bg-red-500/40' : 'bg-slate-900/30'}`}>
              
              {/* Rain Drops */}
              <div className="select-none touch-none flex-1 w-full relative">
                {drops.map(drop => (
                  <div
                    key={drop.id}
                    className="select-none touch-none absolute bg-blue-400/80 backdrop-blur-md text-white font-bold px-4 py-6 rounded-t-[50%] rounded-b-[50%] shadow-lg shadow-blue-500/50 flex flex-col items-center justify-end"
                    style={{
                      left: `${drop.x}%`,
                      top: `${drop.y}%`,
                      transform: 'translateX(-50%)',
                      minWidth: '60px',
                      minHeight: '80px'
                    }}
                  >
                    <span className="select-none touch-none text-xl mb-1">{drop.expression}</span>
                  </div>
                ))}
              </div>

              {/* Water Level / Ground */}
              <div className="select-none touch-none w-full h-24 bg-blue-900/40 backdrop-blur-sm border-t border-blue-500/30 flex items-center justify-center gap-4 px-4 z-10">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    onPointerDownCapture={() => handleOptionClick(opt)}
                    className="select-none touch-none flex-1 max-w-32 bg-white/10 hover:bg-white/20 text-blue-100 font-bold text-3xl py-4 rounded-xl transition-all active:scale-95 border border-white/20 shadow-lg"
                  >
                    {opt}
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
                Toplam Skorunuz: <span className="select-none touch-none text-4xl font-black text-indigo-400 ml-2 block mt-2">{score}</span>
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

export default YagmurDamlalari;

