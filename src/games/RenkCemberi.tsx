import React, { useState, useEffect, useRef } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

const COLOR_PAIRS = [
  { c1: { name: 'colorA', class: 'bg-rose-500' }, c2: { name: 'colorB', class: 'bg-cyan-500' } },
  { c1: { name: 'colorA', class: 'bg-emerald-500' }, c2: { name: 'colorB', class: 'bg-purple-500' } },
  { c1: { name: 'colorA', class: 'bg-amber-400' }, c2: { name: 'colorB', class: 'bg-pink-500' } },
  { c1: { name: 'colorA', class: 'bg-orange-500' }, c2: { name: 'colorB', class: 'bg-teal-400' } },
];

interface Ball {
  id: number;
  color: string;
  position: number; // 0 to 100
}

interface RenkCemberiProps {
  onClose?: () => void;
}

const RenkCemberi: React.FC<RenkCemberiProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_RenkCemberi') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [activePair, setActivePair] = useState(COLOR_PAIRS[0]);
  const [topColor, setTopColor] = useState<string>('colorA');
  
  const [balls, setBalls] = useState<Ball[]>([]);
  const [flash, setFlash] = useState<'green' | 'red' | null>(null);

  const ballIdCounter = useRef(0);
  const speedRef = useRef(1.0);
  const flashTimeoutRef = useRef<number | null>(null);

  const startGame = () => {
    const newPair = COLOR_PAIRS[Math.floor(Math.random() * COLOR_PAIRS.length)];
    setActivePair(newPair);
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    setTopColor('colorA');
    setBalls([]);
    ballIdCounter.current = 0;
    speedRef.current = 1.0;
    setGameState('playing');
  };

  const handleTap = () => {
    if (gameState === 'playing') {
      setTopColor(prev => prev === 'colorA' ? 'colorB' : 'colorA');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        handleTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Color changing interval
  useEffect(() => {
    let interval: number;
    if (gameState === 'playing') {
      interval = window.setInterval(() => {
        setActivePair(prev => {
          let next = COLOR_PAIRS[Math.floor(Math.random() * COLOR_PAIRS.length)];
          while (next === prev && COLOR_PAIRS.length > 1) {
            next = COLOR_PAIRS[Math.floor(Math.random() * COLOR_PAIRS.length)];
          }
          return next;
        });
      }, 7000); // Change colors every 7 seconds
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setBalls(prev => {
        let newScore = 0;
        let flashed: 'green' | 'red' | null = null;
        
        const updated = prev.map(ball => ({
          ...ball,
          position: ball.position + speedRef.current
        }));
        
        const remaining = updated.filter(ball => {
          if (ball.position >= 80) { // Hit line
            if (ball.color === topColor) {
              newScore += 10;
              flashed = 'green';
            } else {
              newScore -= 5;
              flashed = 'red';
            }
            return false;
          }
          return true;
        });

        if (newScore !== 0) {
          // Schedule side-effects outside of render phase using setTimeout
          setTimeout(() => {
            setScore(s => s + newScore);
            setFlash(flashed);
            if (flashTimeoutRef.current) window.clearTimeout(flashTimeoutRef.current);
            flashTimeoutRef.current = window.setTimeout(() => setFlash(null), 150);
          }, 0);
        }

        return remaining;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameState, topColor]);

  // Spawn and Speed
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnInterval = setInterval(() => {
      setBalls(prev => [
        ...prev,
        {
          id: ballIdCounter.current++,
          color: Math.random() > 0.5 ? 'colorA' : 'colorB',
          position: 0
        }
      ]);
    }, 1500);

    const speedInterval = setInterval(() => {
      speedRef.current = Math.min(speedRef.current + 0.1, 3.0);
    }, 5000);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(speedInterval);
    };
  }, [gameState]);

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

  // High Score
  useEffect(() => {
    if (gameState === 'finished') {
      if (score > highScore) {
        setHighScore(score);
        setIsNewRecord(true);
        localStorage.setItem('highScore_RenkCemberi', score.toString());
      }
    }
  }, [gameState, score, highScore]);

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-hidden transition-colors duration-150 bg-slate-800/60 dark:bg-slate-900/60 select-none touch-none"
      onClick={handleTap}
    >
      {onClose && (
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-800 dark:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50 transition font-semibold bg-white/30 dark:bg-slate-800/50 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm z-20"
        >
          ← Ana Menüye Dön
        </button>
      )}
      
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto mt-16 sm:mt-0 relative">
        <div className="flex justify-between items-center w-full mb-4 sm:mb-6 pb-4 border-b border-slate-400/30 dark:border-slate-500/30 z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Renk Çemberi</h1>
          <div className="flex gap-2 sm:gap-4">
            <div className="flex flex-col items-center bg-blue-500/20 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-blue-500/30">
              <span className="text-[10px] sm:text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Süre</span>
              <span className={`text-xl sm:text-2xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-blue-100'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="flex flex-col items-center bg-green-500/20 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-green-500/30">
              <span className="text-[10px] sm:text-xs font-bold text-green-200 uppercase tracking-wider mb-1">Skor</span>
              <span className={`text-xl sm:text-2xl font-black ${score < 0 ? 'text-red-300' : 'text-green-100'}`}>{score}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col items-center justify-center relative overflow-hidden">
          {gameState === 'idle' && (
            <div className="text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700 z-10 relative">
              <div className="text-6xl mb-6">🎯</div>
              <h2 className="text-2xl font-bold text-white mb-3">Nasıl Oynanır?</h2>
              <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                Ekrana dokunarak veya Boşluk (Space) tuşuna basarak çemberi çevir. Yukarıdan düşen top ile çemberin üst rengini eşleştir!
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className={`absolute inset-0 flex flex-col items-center pb-20 ${flash === 'red' ? 'bg-red-500/20' : flash === 'green' ? 'bg-green-500/20' : ''} transition-colors duration-100`}>
              {/* Falling Balls */}
              {balls.map(ball => (
                <div 
                  key={ball.id}
                  className={`absolute w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)] ${ball.color === 'colorA' ? activePair.c1.class : activePair.c2.class}`}
                  style={{ top: `${ball.position}%` }}
                />
              ))}

              {/* Central Circle */}
              <div 
                className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] border-4 border-white/20 transition-transform duration-150 ease-out flex flex-col overflow-hidden"
                style={{ top: '80%', transform: 'translateY(-50%)' }}
              >
                <div className={`w-full h-1/2 transition-colors duration-150 ${topColor === 'colorA' ? activePair.c1.class : activePair.c2.class}`} />
                <div className={`w-full h-1/2 transition-colors duration-150 ${topColor === 'colorA' ? activePair.c2.class : activePair.c1.class}`} />
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700 absolute z-20">
              <div className="text-7xl mb-6">⏰</div>
              <h2 className="text-4xl font-bold text-white mb-4">Süre Bitti!</h2>
              {isNewRecord && (
                <div className="mb-4 text-2xl font-black text-yellow-400 animate-bounce">
                  🏆 Yeni Rekor!
                </div>
              )}
              <p className="text-slate-300 mb-8 text-xl">
                Toplam Skorunuz: <span className="text-4xl font-black text-indigo-400 ml-2 block mt-2">{score}</span>
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="w-full bg-white hover:bg-slate-200 text-slate-900 font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
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

export default RenkCemberi;
