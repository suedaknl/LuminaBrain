import React, { useState, useEffect } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface Problem {
  sequence: (number | string)[];
  options: number[];
  answer: number;
}

const generateProblem = (level: number): Problem => {
  const type = Math.floor(Math.random() * 3);
  let seq: (number | string)[] = [];
  let ans = 0;

  if (type === 0) {
    // Arithmetic
    const start = Math.floor(Math.random() * 20);
    const step = Math.floor(Math.random() * (5 + level)) + 1;
    seq = [start, start + step, start + 2 * step, start + 3 * step, '?'];
    ans = start + 4 * step;
  } else if (type === 1) {
    // Multiplicative
    const start = Math.floor(Math.random() * 3) + 1;
    const step = Math.floor(Math.random() * 2) + 2;
    seq = [start, start * step, start * step * step, '?'];
    ans = start * step * step * step;
  } else {
    // Fibonacci-like
    let a = Math.floor(Math.random() * 5) + 1;
    let b = Math.floor(Math.random() * 5) + 1;
    seq = [a, b, a + b, a + 2 * b, '?'];
    ans = 2 * a + 3 * b;
  }

  const options = [ans];
  while (options.length < 4) {
    const wrong = ans + Math.floor(Math.random() * 15) - 7;
    if (wrong !== ans && !options.includes(wrong) && wrong >= 0) {
      options.push(wrong);
    }
  }

  return {
    sequence: seq,
    answer: ans,
    options: options.sort(() => Math.random() - 0.5)
  };
};

interface TahtaMucadelesiProps {
  onClose?: () => void;
}

const TahtaMucadelesi: React.FC<TahtaMucadelesiProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_TahtaMucadelesi') || '0', 10));
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

  const handleOptionClick = (opt: number) => {
    if (gameState !== 'playing' || !problem) return;

    if (opt === problem.answer) {
      setScore(s => s + 10);
      setFlash('green');
      setLevel(l => l + 1);
      setTimeout(() => setFlash(null), 300);
      setTimeout(() => setProblem(generateProblem(level + 1)), 300);
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
        localStorage.setItem('highScore_TahtaMucadelesi', score.toString());
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
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-white">Tahta Mücadelesi</h1>
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
              <div className="select-none touch-none text-6xl mb-6">🧮</div>
              <h2 className="select-none touch-none text-2xl font-bold text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-300 mb-8 text-lg leading-relaxed">
                Tahtadaki sayı örüntüsünü incele ve sıradaki sayıyı mantık yürüterek bul!
              </p>
              <button
                onPointerDownCapture={(e) => { e.stopPropagation(); startGame(); }}
                className="select-none touch-none w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {gameState === 'playing' && problem && (
            <div className={`w-full h-full flex flex-col items-center justify-center rounded-3xl border border-white/10 shadow-inner transition-colors duration-150 p-4 sm:p-8 ${
              flash === 'red' ? 'bg-red-500/40' : flash === 'green' ? 'bg-emerald-500/40' : 'bg-slate-900/30'
            }`}>
              
              <div className="select-none touch-none w-full max-w-2xl aspect-[2/1] bg-teal-950/80 border-8 border-teal-800 rounded-lg shadow-2xl relative flex items-center justify-center overflow-hidden mb-8">
                {/* Chalkboard noise effect */}
                <div className="select-none touch-none absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>
                
                <div className="select-none touch-none flex gap-4 sm:gap-6 z-10 font-['Comic_Sans_MS',_cursive] text-4xl sm:text-6xl text-white/90">
                  {problem.sequence.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <span>{item}</span>
                      {idx < problem.sequence.length - 1 && <span className="select-none touch-none opacity-50">,</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="select-none touch-none grid grid-cols-2 gap-4 w-full max-w-lg">
                {problem.options.map((opt, i) => (
                  <button
                    key={i}
                    onPointerDownCapture={() => handleOptionClick(opt)}
                    className="select-none touch-none bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-3xl py-6 rounded-2xl transition-all duration-200 active:scale-95 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
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
                Toplam Skorunuz: <span className="select-none touch-none text-4xl font-black text-teal-400 ml-2 block mt-2">{score}</span>
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

export default TahtaMucadelesi;

