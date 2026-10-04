import React, { useState, useEffect, useCallback, useRef } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface Balloon {
  id: number;
  top: number;
  left: number;
  color: string;
}

interface BalloonPopProps {
  onClose?: () => void;
}

const COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];

const BalloonPop: React.FC<BalloonPopProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_BalloonPop') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [pops, setPops] = useState<{id:number, x:number, y:number}[]>([]);
  const balloonIdCounter = useRef(0);

  const spawnBalloon = useCallback(() => {
    const id = balloonIdCounter.current++;
    const top = Math.floor(Math.random() * 70) + 10; // 10% to 80%
    const left = Math.floor(Math.random() * 80) + 10; // 10% to 90%
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    setBalloons(prev => [...prev, { id, top, left, color }]);

    // Balonun 2 saniye sonra otomatik kaybolması
    setTimeout(() => {
      setBalloons(prev => {
        const exists = prev.find(b => b.id === id);
        if (exists && gameState === 'playing') {
          // Balon patlatılmadan süresi dolduysa küçük ceza veya puansızlık
          return prev.filter(b => b.id !== id);
        }
        return prev;
      });
    }, 2000);
  }, [gameState]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setBalloons([]);
    setIsNewRecord(false);
    balloonIdCounter.current = 0;
    setGameState('playing');
  };

  const handleBalloonClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (gameState !== 'playing') return;

    setScore(prev => prev + 10);
    setBalloons(prev => { 
      const b = prev.find(x => x.id === id); 
      if (b) { 
        setPops(p => [...p, {id:b.id, x:b.left, y:b.top}]); 
        setTimeout(() => setPops(p => p.filter(x => x.id !== b.id)), 300); 
      } 
      return prev.filter(x => x.id !== id); 
    });
  };

  // Balon spawn interval
  useEffect(() => {
    let spawnTimer: number;
    if (gameState === 'playing' && timeLeft > 0) {
      // Başlangıçta 1-2 balon
      spawnBalloon();
      
      spawnTimer = window.setInterval(() => {
        spawnBalloon();
      }, 700);
    }
    return () => clearInterval(spawnTimer);
  }, [gameState, timeLeft, spawnBalloon]);

  // Sayaç interval
  useEffect(() => {
    let timer: number;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
      setBalloons([]);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // High score
  useEffect(() => {
    if (gameState === 'finished') {
      if (score > highScore) {
        setHighScore(score);
        setIsNewRecord(true);
        localStorage.setItem('highScore_BalloonPop', score.toString());
      } else {
        setIsNewRecord(false);
      }
    } else if (gameState === 'idle') {
      setIsNewRecord(false);
    }
  }, [gameState, score, highScore]);

  return (
    <div className="select-none touch-none fixed inset-0 z-50 flex flex-col bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-y-auto transition-colors duration-300">
      {onClose && (
        <button
          onPointerDownCapture={onClose}
          className="select-none touch-none absolute top-6 left-6 flex items-center gap-2 text-slate-800 dark:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50 transition font-semibold bg-white/30 dark:bg-slate-800/50 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm z-20"
        >
          ← Ana Menüye Dön
        </button>
      )}
      
      <div className="select-none touch-none flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto mt-16 sm:mt-0 relative">
        {/* Header Area */}
        <div className="select-none touch-none flex justify-between items-center w-full mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-300/30 dark:border-slate-500/30 z-10">
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Balon Patlatma</h1>
          <div className="select-none touch-none flex gap-2 sm:gap-4">
            <div className="select-none touch-none flex flex-col items-center bg-blue-500/10 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-blue-500/20">
              <span className="select-none touch-none text-[10px] sm:text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">Süre</span>
              <span className={`text-xl sm:text-2xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-blue-900 dark:text-blue-100'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="select-none touch-none flex flex-col items-center bg-green-500/10 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-green-500/20">
              <span className="select-none touch-none text-[10px] sm:text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider mb-1">Skor</span>
              <span className="select-none touch-none text-xl sm:text-2xl font-black text-green-900 dark:text-green-100">{score}</span>
            </div>
            <div className="select-none touch-none flex flex-col items-center bg-yellow-500/10 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-yellow-500/20 hidden sm:flex">
              <span className="select-none touch-none text-[10px] sm:text-xs font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-wider mb-1">En İyi</span>
              <span className="select-none touch-none text-xl sm:text-2xl font-black text-yellow-900 dark:text-yellow-100">{highScore}</span>
            </div>
          </div>
        </div>

        {/* Game Content Area */}
        <div className="select-none touch-none flex-1 w-full flex flex-col items-center justify-center relative">
          {gameState === 'idle' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md z-10">
              <div className="select-none touch-none w-24 h-24 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-pink-500/30">
                <svg className="select-none touch-none w-12 h-12 text-pink-600 dark:text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C9.243 2 7 4.243 7 7c0 3.314 2.857 5.714 4.5 7.5L12 15l.5-.5C14.143 12.714 17 10.314 17 7c0-2.757-2.243-5-5-5zM11 16h2v4h-2v-4zM9.5 21h5v2h-5v-2z" />
                </svg>
              </div>
              <h2 className="select-none touch-none text-2xl font-bold text-slate-900 dark:text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                Ekranda rastgele beliren balonlar kısa süre sonra kaybolacak! Süre bitmeden olabildiğince çok balon patlatarak puan toplayın.
              </p>
              <button
                onPointerDownCapture={startGame}
                className="select-none touch-none w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="select-none touch-none absolute inset-0 w-full h-full bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-slate-700 overflow-hidden cursor-crosshair shadow-inner">
              {pops.map(p => <div key={'pop' + p.id} className="select-none touch-none absolute text-5xl transform -translate-x-1/2 -translate-y-1/2 animate-ping z-10" style={{ left: `${p.x}%`, top: `${p.y}%` }}>💥</div>)}
              {balloons.map(balloon => (
                <button
                  key={balloon.id}
                  onPointerDownCapture={(e) => handleBalloonClick(e, balloon.id)}
                  className={`absolute w-14 h-16 sm:w-16 sm:h-20 ${balloon.color} rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-75 hover:scale-110 flex flex-col items-center justify-end pb-1 animate-fade-in`}
                  style={{ top: `${balloon.top}%`, left: `${balloon.left}%`, borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%' }}
                  aria-label="Balon"
                >
                  <div className="select-none touch-none w-2 h-3 bg-white/30 rounded-full absolute top-2 left-2 rotate-45"></div>
                  <div className="select-none touch-none w-1 h-3 bg-white/50 clip-triangle mt-auto mb-[-8px]"></div>
                </button>
              ))}
            </div>
          )}

          {gameState === 'finished' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md z-10">
              <div className="select-none touch-none text-7xl mb-6">🏆</div>
              <h2 className="select-none touch-none text-4xl font-bold text-slate-900 dark:text-white mb-4">Süre Bitti!</h2>
              {isNewRecord && (
                <div className="select-none touch-none mb-4 text-2xl font-black text-yellow-500 animate-bounce">
                  🏆 Yeni Rekor!
                </div>
              )}
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-xl">
                Toplam Skorunuz: <span className="select-none touch-none text-4xl font-black text-indigo-600 dark:text-indigo-400 ml-2 block mt-2">{score}</span>
              </p>
              <button
                onPointerDownCapture={startGame}
                className="select-none touch-none w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
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

export default BalloonPop;

