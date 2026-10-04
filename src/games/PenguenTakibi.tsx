import React, { useState, useEffect, useRef } from 'react';

type GameState = 'idle' | 'showing' | 'shuffling' | 'waiting' | 'finished';

interface Penguin {
  id: number;
  x: number; // position index (0 to length-1)
  isTarget: boolean;
}

interface PenguenTakibiProps {
  onClose?: () => void;
}

const PenguenTakibi: React.FC<PenguenTakibiProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_PenguenTakibi') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const [penguins, setPenguins] = useState<Penguin[]>([]);
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState('');
  const timeoutRefs = useRef<number[]>([]);

  const clearTimeouts = () => {
    timeoutRefs.current.forEach(t => window.clearTimeout(t));
    timeoutRefs.current = [];
  };

  const startLevel = (currentLevel: number) => {
    clearTimeouts();
    const count = Math.min(3 + Math.floor(currentLevel / 3), 6);
    const newPenguins: Penguin[] = [];
    const targetId = Math.floor(Math.random() * count);
    
    for (let i = 0; i < count; i++) {
      newPenguins.push({
        id: i,
        x: i,
        isTarget: i === targetId
      });
    }
    setPenguins(newPenguins);
    setGameState('showing');
    setMessage('Hedef Pengueni İzle!');

    const t1 = window.setTimeout(() => {
      setGameState('shuffling');
      setMessage('Nereye Gitti?');
      doShuffle(newPenguins, 3 + Math.floor(currentLevel / 2));
    }, 2500);
    timeoutRefs.current.push(t1);
  };

  const doShuffle = (currentPenguins: Penguin[], shufflesLeft: number) => {
    if (shufflesLeft <= 0) {
      setGameState('waiting');
      setMessage('Hedef Pengueni Seç!');
      return;
    }

    const len = currentPenguins.length;
    const idx1 = Math.floor(Math.random() * len);
    let idx2 = Math.floor(Math.random() * len);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * len);
    }

    // Swap their x positions
    const newArr = [...currentPenguins];
    const p1 = newArr.find(p => p.x === idx1)!;
    const p2 = newArr.find(p => p.x === idx2)!;
    p1.x = idx2;
    p2.x = idx1;

    setPenguins(newArr);

    const speed = Math.max(300, 800 - level * 50);
    const t = window.setTimeout(() => {
      doShuffle(newArr, shufflesLeft - 1);
    }, speed);
    timeoutRefs.current.push(t);
  };

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
    setIsNewRecord(false);
    startLevel(1);
  };

  const handlePenguinClick = (id: number) => {
    if (gameState !== 'waiting') return;

    const clicked = penguins.find(p => p.id === id);
    if (clicked?.isTarget) {
      setScore(s => s + 20);
      setLevel(l => l + 1);
      setMessage('Tebrikler!');
      setGameState('idle');
      
      const t = window.setTimeout(() => startLevel(level + 1), 1500);
      timeoutRefs.current.push(t);
    } else {
      setScore(s => Math.max(0, s - 10));
      setMessage('Yanlış Penguen!');
      setGameState('showing'); // Reveal briefly
      
      const t = window.setTimeout(() => startLevel(Math.max(1, level - 1)), 2000);
      timeoutRefs.current.push(t);
    }
  };

  useEffect(() => {
    let timer: number;
    if ((gameState === 'showing' || gameState === 'shuffling' || gameState === 'waiting') && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && gameState !== 'idle' && gameState !== 'finished') {
      setGameState('finished');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'finished') {
      if (score > highScore) {
        setHighScore(score);
        setIsNewRecord(true);
        localStorage.setItem('highScore_PenguenTakibi', score.toString());
      }
    }
  }, [gameState, score, highScore]);

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

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
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-white">Penguen Takibi</h1>
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
          {gameState === 'idle' && score === 0 && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700 z-10 mt-10">
              <div className="select-none touch-none text-6xl mb-6">🐧</div>
              <h2 className="select-none touch-none text-2xl font-bold text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-300 mb-8 text-lg leading-relaxed">
                İşaretli pengueni dikkatlice takip et. Yerleri karıştığında nerede olduğunu bul!
              </p>
              <button
                onPointerDownCapture={(e) => { e.stopPropagation(); startGame(); }}
                className="select-none touch-none w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {(gameState === 'showing' || gameState === 'shuffling' || gameState === 'waiting' || (gameState === 'idle' && score > 0)) && (
            <div className="select-none touch-none w-full h-full flex flex-col items-center justify-center relative">
              <div className="select-none touch-none text-2xl font-bold text-white mb-12 bg-black/40 px-6 py-2 rounded-full backdrop-blur-md z-10">
                {message}
              </div>
              
              <div className="select-none touch-none relative w-full max-w-3xl h-48 flex items-center justify-center">
                {penguins.map(p => (
                  <div
                    key={p.id}
                    onPointerDownCapture={() => handlePenguinClick(p.id)}
                    className={`absolute w-24 h-32 flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all border border-white/20 shadow-xl ${
                      gameState === 'waiting' ? 'hover:scale-105 hover:bg-white/20 bg-slate-700' : 'bg-slate-700'
                    }`}
                    style={{
                      left: `calc(50% + ${(p.x - (penguins.length - 1) / 2) * 120}px)`,
                      transform: 'translateX(-50%)',
                      transitionDuration: `${Math.max(300, 800 - level * 50)}ms`
                    }}
                  >
                    {/* Inner Card/Penguin */}
                    {(gameState === 'showing' || p.isTarget && message === 'Tebrikler!') ? (
                      <div className="select-none touch-none text-6xl">{p.isTarget ? '🐧' : '⛄'}</div>
                    ) : (
                      <div className="select-none touch-none text-5xl opacity-50">❄️</div>
                    )}
                  </div>
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

export default PenguenTakibi;

