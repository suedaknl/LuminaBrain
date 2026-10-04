import React, { useState, useEffect, useRef } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface RitmiYakalaProps {
  onClose?: () => void;
}

const RitmiYakala: React.FC<RitmiYakalaProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_RitmiYakala') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const [feedback, setFeedback] = useState<'Mükemmel!' | 'İyi!' | 'Erken!' | 'Geç Kaldın!' | null>(null);
  const [flash, setFlash] = useState<'green' | 'yellow' | 'red' | null>(null);
  const circleRef = useRef<HTMLDivElement>(null);

  const lastBeatTime = useRef(0);
  const beatInterval = useRef(1500);
  const reqRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    beatInterval.current = 1500;
    setFeedback(null);
    setFlash(null);
    setGameState('playing');
    isPlayingRef.current = true;
    lastBeatTime.current = performance.now();
    reqRef.current = requestAnimationFrame(updateLoop);
  };

  const updateLoop = (time: number) => {
    if (!isPlayingRef.current) return;

    const elapsed = time - lastBeatTime.current;
    
    if (elapsed > beatInterval.current + 300) {
      lastBeatTime.current = time;
      setFeedback('Geç Kaldın!');
      setFlash('red');
      setTimeout(() => setFlash(null), 150);
    } else {
      const progress = elapsed / beatInterval.current;
      const currentScale = 2 - progress;
      if (circleRef.current) {
        circleRef.current.style.transform = `scale(${Math.max(0.5, currentScale)})`;
      }
    }

    reqRef.current = requestAnimationFrame(updateLoop);
  };

  const handleTap = () => {
    if (gameState !== 'playing') return;

    const now = performance.now();
    const elapsed = now - lastBeatTime.current;
    const diff = elapsed - beatInterval.current; // Negative if early, positive if late

    const absError = Math.abs(diff);

    if (absError < 150) {
      setScore(s => s + 20);
      setFeedback('Mükemmel!');
      setFlash('green');
      beatInterval.current = Math.max(700, beatInterval.current - 50);
    } else if (absError < 300) {
      setScore(s => s + 10);
      setFeedback('İyi!');
      setFlash('yellow');
    } else if (diff < 0) {
      setScore(s => Math.max(0, s - 5));
      setFeedback('Erken!');
      setFlash('red');
    } else {
      setScore(s => Math.max(0, s - 5));
      setFeedback('Geç Kaldın!');
      setFlash('red');
    }

    lastBeatTime.current = now;
    setTimeout(() => setFlash(null), 150);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        handleTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Cleanup RAF
  useEffect(() => {
    if (gameState === 'playing') {
      isPlayingRef.current = true;
      lastBeatTime.current = performance.now();
      reqRef.current = requestAnimationFrame(updateLoop);
    } else {
      isPlayingRef.current = false;
    }
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
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
      isPlayingRef.current = false;
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'finished') {
      if (score > highScore) {
        setHighScore(score);
        setIsNewRecord(true);
        localStorage.setItem('highScore_RitmiYakala', score.toString());
      }
    }
  }, [gameState, score, highScore]);

  return (
    <div 
      className="select-none touch-none fixed inset-0 z-50 flex flex-col backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-hidden transition-colors duration-150 bg-slate-800/60 dark:bg-slate-900/60 select-none cursor-pointer"
      onPointerDownCapture={handleTap} // Tap anywhere
    >
      {onClose && (
        <button
          onPointerDownCapture={(e) => { e.stopPropagation(); onClose(); }}
          className="select-none touch-none absolute top-6 left-6 flex items-center gap-2 text-slate-800 dark:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50 transition font-semibold bg-white/30 dark:bg-slate-800/50 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm z-20"
        >
          ← Ana Menüye Dön
        </button>
      )}
      
      <div className="select-none touch-none flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto mt-16 sm:mt-0 relative pointer-events-none">
        <div className="select-none touch-none flex justify-between items-center w-full mb-4 sm:mb-6 pb-4 border-b border-slate-400/30 dark:border-slate-500/30 z-10 pointer-events-auto">
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-white">Ritmi Yakala</h1>
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

        <div className="select-none touch-none flex-1 w-full flex flex-col items-center relative overflow-hidden pointer-events-auto">
          {gameState === 'idle' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700 z-10 mt-10">
              <div className="select-none touch-none text-6xl mb-6">🎵</div>
              <h2 className="select-none touch-none text-2xl font-bold text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-300 mb-8 text-lg leading-relaxed">
                Daralan dış çember, tam olarak içteki hedef çembere oturduğu an ekrana dokun (veya BOŞLUK tuşuna bas). Zamanlaman ne kadar iyiyse o kadar çok puan alırsın!
              </p>
              <button
                onPointerDownCapture={(e) => { e.stopPropagation(); startGame(); }}
                className="select-none touch-none w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className={`w-full h-full flex flex-col items-center justify-center rounded-3xl border border-white/10 shadow-inner transition-colors duration-150 relative ${
              flash === 'red' ? 'bg-red-500/20' : flash === 'green' ? 'bg-emerald-500/20' : flash === 'yellow' ? 'bg-yellow-500/20' : 'bg-slate-900/30'
            }`}>
              
              {feedback && (
                <div className={`absolute top-1/4 text-3xl font-black uppercase tracking-widest animate-pulse ${
                  flash === 'green' ? 'text-emerald-400' : flash === 'yellow' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {feedback}
                </div>
              )}

              <div className="select-none touch-none relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
                {/* Target Circle (Inner) */}
                <div className="select-none touch-none absolute inset-0 m-auto w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-dashed border-white/50 bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.1)]"></div>
                
                {/* Shrinking Circle (Outer) */}
                <div 
                  ref={circleRef}
                  className="select-none touch-none absolute inset-0 m-auto w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-fuchsia-400 shadow-[0_0_20px_rgba(232,121,249,0.5)]"
                  style={{ transition: 'none' }}
                ></div>
              </div>
              
              <p className="select-none touch-none absolute bottom-8 text-white/50 font-semibold tracking-wider uppercase">
                Ekrana Dokun veya SPACE'e Bas
              </p>
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
                Toplam Skorunuz: <span className="select-none touch-none text-4xl font-black text-fuchsia-400 ml-2 block mt-2">{score}</span>
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

export default RitmiYakala;

