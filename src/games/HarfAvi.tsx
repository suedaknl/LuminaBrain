import React, { useState, useEffect, useRef } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface LetterItem {
  id: number;
  char: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  vx: number;
  vy: number;
}

interface HarfAviProps {
  onClose?: () => void;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const HarfAvi: React.FC<HarfAviProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() =>
    parseInt(localStorage.getItem('highScore_HarfAvi') || '0', 10)
  );
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const [targetChar, setTargetChar] = useState('');
  const [letters, setLetters] = useState<LetterItem[]>([]);
  const [flash, setFlash] = useState<'green' | 'red' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const reqRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const generateRound = () => {
    const numLetters = 15 + Math.floor(Math.random() * 10);
    const target = CHARS[Math.floor(Math.random() * CHARS.length)];
    setTargetChar(target);

    const newLetters: LetterItem[] = [];

    // Add target
    newLetters.push({
      id: 0,
      char: target,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20,
    });

    // Add distractors
    for (let i = 1; i < numLetters; i++) {
      let char;
      do {
        char = CHARS[Math.floor(Math.random() * CHARS.length)];
      } while (char === target);

      newLetters.push({
        id: i,
        char,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        vx: (Math.random() - 0.5) * 30,
        vy: (Math.random() - 0.5) * 30,
      });
    }

    setLetters(newLetters);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    setGameState('playing');
    generateRound();
  };

  // Animation Loop
  const gameStateRef = useRef<GameState>('idle');
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const updatePhysics = (time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const dt = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    setLetters(prev =>
      prev.map(l => {
        let nx = l.x + l.vx * dt;
        let ny = l.y + l.vy * dt;
        let nvx = l.vx;
        let nvy = l.vy;

        if (nx <= 0 || nx >= 88) {
          nvx *= -1;
          nx = Math.max(0, Math.min(88, nx));
        }
        if (ny <= 0 || ny >= 88) {
          nvy *= -1;
          ny = Math.max(0, Math.min(88, ny));
        }

        return { ...l, x: nx, y: ny, vx: nvx, vy: nvy };
      })
    );

    if (gameStateRef.current === 'playing') {
      reqRef.current = requestAnimationFrame(updatePhysics);
    }
  };

  useEffect(() => {
    if (gameState === 'playing') {
      lastTimeRef.current = performance.now();
      reqRef.current = requestAnimationFrame(updatePhysics);
    }
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [gameState]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLetterClick = (char: string) => {
    if (gameStateRef.current !== 'playing') return;

    if (char === targetChar) {
      setScore(s => s + 10);
      setFlash('green');
      setTimeout(() => setFlash(null), 150);
      generateRound();
    } else {
      setScore(s => s - 5);
      setFlash('red');
      setTimeout(() => setFlash(null), 150);
    }
  };

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
        localStorage.setItem('highScore_HarfAvi', score.toString());
      }
    }
  }, [gameState, score, highScore]);

  return (
    <div
      className="select-none touch-none fixed inset-0 z-50 flex flex-col backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-hidden bg-slate-800/60 dark:bg-slate-900/60"
      style={{ userSelect: 'none' }}
    >
      {onClose && (
        <button
          onPointerDown={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-800 dark:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50 transition font-semibold bg-white/30 dark:bg-slate-800/50 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm z-20"
        >
          ← Ana Menüye Dön
        </button>
      )}

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto mt-16 sm:mt-0 relative">
        {/* Header */}
        <div className="flex justify-between items-center w-full mb-4 sm:mb-6 pb-4 border-b border-slate-400/30 dark:border-slate-500/30 z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Harf Avı</h1>
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

        <div className="flex-1 w-full flex flex-col items-center relative overflow-hidden">
          {/* Idle */}
          {gameState === 'idle' && score === 0 && (
            <div className="text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700 z-10 mt-10">
              <div className="text-6xl mb-6">🔍</div>
              <h2 className="text-2xl font-bold text-white mb-3">Nasıl Oynanır?</h2>
              <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                Ekranda uçuşan harfler arasından yukarıda belirtilen "Hedef Harfi" bul ve tıkla. Yanlış harfe tıklamak puan kaybettirir!
              </p>
              <button
                onPointerDown={(e) => { e.stopPropagation(); startGame(); }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {/* Playing */}
          {gameState === 'playing' && (
            <div
              className={`w-full h-full flex flex-col rounded-3xl border border-slate-700/50 overflow-hidden relative transition-colors duration-150 ${
                flash === 'red' ? 'bg-red-500/20' : flash === 'green' ? 'bg-green-500/20' : 'bg-slate-900/40 backdrop-blur-md'
              }`}
            >
              {/* Target Banner */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-500/40 border border-indigo-400/50 backdrop-blur-xl px-8 py-3 rounded-2xl shadow-xl z-20 flex flex-col items-center pointer-events-none">
                <span className="text-xs font-bold text-indigo-200 tracking-widest uppercase mb-1">Hedef</span>
                <span className="text-4xl font-black text-white">{targetChar}</span>
              </div>

              {/* Play Area — touchAction:none on container, pointer-events reach buttons */}
              <div
                className="flex-1 relative w-full h-full"
                ref={containerRef}
                style={{ touchAction: 'none' }}
              >
                {letters.map(l => (
                  <button
                    key={l.id}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleLetterClick(l.char);
                    }}
                    className="absolute cursor-pointer flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 text-2xl sm:text-3xl font-black text-white bg-white/10 hover:bg-white/25 active:scale-90 border border-white/20 rounded-2xl shadow-lg backdrop-blur-sm transition-transform duration-75 z-10"
                    style={{
                      left: `${l.x}%`,
                      top: `${l.y}%`,
                      touchAction: 'none',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      // important: no pointer-events override
                    }}
                    aria-label={`Harf: ${l.char}`}
                  >
                    {l.char}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Finished */}
          {gameState === 'finished' && (
            <div className="text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700 absolute z-20 mt-10">
              <div className="text-7xl mb-6">⏰</div>
              <h2 className="text-4xl font-bold text-white mb-4">Süre Bitti!</h2>
              {isNewRecord && (
                <div className="mb-4 text-2xl font-black text-yellow-400 animate-bounce">🏆 Yeni Rekor!</div>
              )}
              <p className="text-slate-300 mb-8 text-xl">
                Toplam Skorunuz:{' '}
                <span className="text-4xl font-black text-indigo-400 ml-2 block mt-2">{score}</span>
              </p>
              <button
                onPointerDown={(e) => { e.stopPropagation(); startGame(); }}
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

export default HarfAvi;
