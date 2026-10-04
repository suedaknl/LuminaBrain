import React, { useState, useEffect, useCallback, useRef } from 'react';

type GameState = 'idle' | 'showing' | 'waiting' | 'finished';

interface GizliYolProps {
  onClose?: () => void;
}



const GizliYol: React.FC<GizliYolProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_GizliYol') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [path, setPath] = useState<number[]>([]);
  const [gridSize, setGridSize] = useState(5);
  const [playerPath, setPlayerPath] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [errorIndex, setErrorIndex] = useState<number | null>(null);
  const [showIndex, setShowIndex] = useState(0);
  const timeoutRefs = useRef<number[]>([]);

  const generatePath = useCallback((gs: number) => {
    let r = gs - 1;
    let c = Math.floor(Math.random() * gs);
    
    const newPath = [r * gs + c];
    
    while (r > 0) {
      const moves = [];
      moves.push({ r: r - 1, c });
      if (c > 0 && !newPath.includes(r * gs + (c - 1))) moves.push({ r, c: c - 1 });
      if (c < gs - 1 && !newPath.includes(r * gs + (c + 1))) moves.push({ r, c: c + 1 });
      
      const move = moves[Math.floor(Math.random() * moves.length)];
      r = move.r;
      c = move.c;
      newPath.push(r * gs + c);
    }
    
    return { path: newPath, gs };
  }, []);

  const clearAllTimeouts = () => {
    timeoutRefs.current.forEach((t: number) => window.clearTimeout(t));
    timeoutRefs.current = [];
  };

  const startLevel = useCallback((gs: number) => {
    clearAllTimeouts();
    const newPath = generatePath(gs).path;
    setGridSize(gs);
    setPath(newPath);
    setPlayerPath([]);
    setErrorIndex(null);
    setGameState('showing');
    setMessage('Yolu Ezberle!');
    setShowIndex(0);

    for (let i = 0; i < newPath.length; i++) {
      timeoutRefs.current.push(window.setTimeout(() => {
        setShowIndex(i);
      }, i * 300));
    }

    timeoutRefs.current.push(window.setTimeout(() => {
      setGameState('waiting');
      setMessage('Yolu Çiz!');
    }, newPath.length * 300 + 500));
  }, [generatePath]);

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
    setIsNewRecord(false);
    startLevel(4); // Start with grid size 4
  };

  const retryLevel = () => {
    clearAllTimeouts();
    setPlayerPath([]);
    setErrorIndex(null);
    setGameState('showing');
    setMessage('Tekrar Ezberle!');
    setShowIndex(0);

    for (let i = 0; i < path.length; i++) {
      timeoutRefs.current.push(window.setTimeout(() => {
        setShowIndex(i);
      }, i * 300));
    }

    timeoutRefs.current.push(window.setTimeout(() => {
      setGameState('waiting');
      setMessage('Yolu Çiz!');
    }, path.length * 300 + 500));
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'waiting') return;
    
    if (playerPath.includes(index)) return; // Zaten tıklandı
    
    const nextExpectedIndex = path[playerPath.length];
    
    if (index === nextExpectedIndex) {
      // Doğru hamle
      const newPlayerPath = [...playerPath, index];
      setPlayerPath(newPlayerPath);
      setScore(s => s + 2);
      
      if (newPlayerPath.length === path.length) {
        // Bölüm bitti
        const nextScore = score + 2 + level * 5;
        setScore(nextScore);
        const nextLevel = level + 1;
        setLevel(nextLevel);
        setGameState('idle'); // Geçici
        setMessage('Tebrikler! Yeni Seviye...');
        
        setTimeout(() => {
          startLevel(Math.min(8, 4 + Math.floor(nextScore / 20)));
        }, 1000);
      }
    } else {
      // Yanlış hamle
      setErrorIndex(index);
      setScore(s => s - 5);
      setGameState('idle');
      setMessage('Yanlış Yol!');
      
      setTimeout(() => {
        retryLevel();
      }, 1000);
    }
  };

  // Zamanlayıcı
  useEffect(() => {
    let timer: number;
    // Süre sadece 'waiting' (oyuncunun yolu çizdiği) aşamada aksın
    if (gameState === 'waiting' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && gameState === 'waiting') {
      setGameState('finished');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'finished') {
      if (score > highScore) {
        setHighScore(score);
        setIsNewRecord(true);
        localStorage.setItem('highScore_GizliYol', score.toString());
      }
    }
  }, [gameState, score, highScore]);

  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  const getTileClass = (index: number) => {
    const isPath = path.includes(index);
    const isClicked = playerPath.includes(index);
    const isError = errorIndex === index;
    const isStart = path[0] === index;
    
    
    let baseClass = "aspect-square rounded-xl transition-all duration-300 shadow-sm cursor-pointer border border-white/20 flex items-center justify-center text-xl sm:text-2xl font-bold ";
    
    if (gameState === 'showing') {
      const pathIndex = path.indexOf(index);
      if (isPath && pathIndex <= showIndex) {
        return baseClass + "bg-emerald-500 scale-105 shadow-emerald-500/50" + (isStart ? " text-emerald-950" : "");
      }
      return baseClass + "bg-white/10 dark:bg-slate-800/50 hover:bg-white/20";
    }
    
    if (gameState === 'waiting') {
      if (isClicked) {
        return baseClass + "bg-emerald-500 scale-95 shadow-inner text-emerald-950";
      }
      return baseClass + "bg-white/10 dark:bg-slate-800/50 hover:bg-white/20 active:scale-95";
    }
    
    if (isError) {
      return baseClass + "bg-red-500 animate-shake shadow-red-500/50";
    }
    
    // Idle/Finished state
    if (isClicked) return baseClass + "bg-emerald-500/50 text-emerald-900";
    return baseClass + "bg-white/10 dark:bg-slate-800/50";
  };

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
      
      <div className="select-none touch-none flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto mt-16 sm:mt-0 relative">
        <div className="select-none touch-none flex justify-between items-center w-full mb-4 sm:mb-6 pb-4 border-b border-slate-400/30 dark:border-slate-500/30 z-10">
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-white">Gizli Yol</h1>
          <div className="select-none touch-none flex gap-2 sm:gap-4">
            <div className="select-none touch-none flex flex-col items-center bg-blue-500/20 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-blue-500/30">
              <span className="select-none touch-none text-[10px] sm:text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Süre</span>
              <span className={`text-xl sm:text-2xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-blue-100'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="select-none touch-none flex flex-col items-center bg-indigo-500/20 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-indigo-500/30">
              <span className="select-none touch-none text-[10px] sm:text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">Seviye</span>
              <span className="select-none touch-none text-xl sm:text-2xl font-black text-indigo-100">{level}</span>
            </div>
            <div className="select-none touch-none flex flex-col items-center bg-green-500/20 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-green-500/30">
              <span className="select-none touch-none text-[10px] sm:text-xs font-bold text-green-200 uppercase tracking-wider mb-1">Skor</span>
              <span className={`text-xl sm:text-2xl font-black ${score < 0 ? 'text-red-300' : 'text-green-100'}`}>{score}</span>
            </div>
          </div>
        </div>

        <div className="select-none touch-none flex-1 w-full flex flex-col items-center justify-center relative">
          {gameState === 'idle' && score === 0 && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700">
              <div className="select-none touch-none text-6xl mb-6">🗺️</div>
              <h2 className="select-none touch-none text-2xl font-bold text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-300 mb-8 text-lg leading-relaxed">
                Yeşil yanıp sönen gizli yolu ezberle. Ardından sırasıyla doğru karelere tıklayarak yolu tamamla. Yanlış tıklarsan puan kaybedersin!
              </p>
              <button
                onPointerDownCapture={(e) => { e.stopPropagation(); startGame(); }}
                className="select-none touch-none w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {(gameState === 'showing' || gameState === 'waiting' || (gameState === 'idle' && score !== 0)) && (
            <div className="select-none touch-none w-full max-w-md flex flex-col items-center">
              <h2 className="select-none touch-none text-2xl font-bold text-white mb-6 h-8 drop-shadow-md">{message}</h2>
              <div 
                className={`grid gap-2 sm:gap-3 w-full max-w-[350px] p-4 sm:p-5 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-700/50`}
                style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: gridSize * gridSize }).map((_, i) => (
                  <div
                    key={i}
                    onPointerDownCapture={() => handleTileClick(i)}
                    className={getTileClass(i)}
                  >
                    {/* Optionally show start/end icons if needed, but keeping it clean with colors is good enough */}
                    {gameState === 'showing' && path[0] === i && '🏁'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700 absolute z-20">
              <div className="select-none touch-none text-7xl mb-6">⏰</div>
              <h2 className="select-none touch-none text-4xl font-bold text-white mb-4">Süre Bitti!</h2>
              {isNewRecord && (
                <div className="select-none touch-none mb-4 text-2xl font-black text-yellow-400 animate-bounce">
                  🏆 Yeni Rekor!
                </div>
              )}
              <p className="select-none touch-none text-slate-300 mb-8 text-xl">
                Seviye: <span className="select-none touch-none font-bold text-blue-400">{level}</span><br/>
                Skor: <span className="select-none touch-none text-4xl font-black text-indigo-400 block mt-2">{score}</span>
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

export default GizliYol;

