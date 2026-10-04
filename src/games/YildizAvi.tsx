import React, { useState, useEffect, useCallback } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface Shape {
  id: number;
  type: 'circle' | 'square' | 'triangle' | 'star';
  top: number;
  left: number;
  color: string;
}

interface YildizAviProps {
  onClose?: () => void;
}

const COLORS = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-yellow-400', 'bg-pink-400', 'bg-cyan-400'];

const YildizAvi: React.FC<YildizAviProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_YildizAvi') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [flashState, setFlashState] = useState<'correct' | 'wrong' | null>(null);

  const startNewRound = useCallback(() => {
    const shapeCount = Math.floor(Math.random() * 15) + 20; // 20-34 arası
    const newShapes: Shape[] = [];

    // Sahte nesneler ekle
    for (let i = 0; i < shapeCount; i++) {
      const typeRand = Math.random();
      const type = typeRand < 0.33 ? 'circle' : typeRand < 0.66 ? 'square' : 'triangle';
      newShapes.push({
        id: i,
        type,
        top: Math.floor(Math.random() * 80) + 10,
        left: Math.floor(Math.random() * 80) + 10,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      });
    }

    // Gerçek hedefi ekle (Yıldız)
    newShapes.push({
      id: shapeCount,
      type: 'star',
      top: Math.floor(Math.random() * 80) + 10,
      left: Math.floor(Math.random() * 80) + 10,
      color: 'bg-yellow-400' // Yıldız her zaman sarımsı olabilir veya rastgele
    });

    // Karıştır (z-index olarak üstte/altta kalma durumunu randomize etmek için)
    newShapes.sort(() => Math.random() - 0.5);

    setShapes(newShapes);
  }, []);

  // Dikkat dağıtıcı hareket efekti
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setShapes(prev => prev.map(s => ({
        ...s,
        top: Math.max(5, Math.min(90, s.top + (Math.random() * 10 - 5))),
        left: Math.max(5, Math.min(90, s.left + (Math.random() * 10 - 5)))
      })));
    }, 1500); // Her 1.5 saniyede bir hafifçe kayarlar
    return () => clearInterval(interval);
  }, [gameState]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    startNewRound();
    setGameState('playing');
  };

  const handleShapeClick = (type: string) => {
    if (gameState !== 'playing') return;

    if (type === 'star') {
      setScore(s => s + 10);
      setFlashState('correct');
      setTimeout(() => setFlashState(null), 300);
      startNewRound();
    } else {
      setScore(s => Math.max(0, s - 5));
      setFlashState('wrong');
      setTimeout(() => setFlashState(null), 300);
    }
  };

  useEffect(() => {
    let timer: number;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'finished') {
      if (score > highScore) {
        setHighScore(score);
        setIsNewRecord(true);
        localStorage.setItem('highScore_YildizAvi', score.toString());
      } else {
        setIsNewRecord(false);
      }
    } else if (gameState === 'idle') {
      setIsNewRecord(false);
    }
  }, [gameState, score, highScore]);

  const getBackgroundClass = () => {
    if (flashState === 'correct') return 'bg-green-500/30 dark:bg-green-600/30';
    if (flashState === 'wrong') return 'bg-red-500/30 dark:bg-red-600/30';
    return 'bg-slate-900/40 dark:bg-slate-950/40'; // Uzay teması için biraz daha koyu
  };

  const renderShapeIcon = (type: string) => {
    switch(type) {
      case 'circle': return <div className="select-none touch-none w-full h-full rounded-full bg-current opacity-80 mix-blend-screen shadow-lg"></div>;
      case 'square': return <div className="select-none touch-none w-full h-full rounded-xl bg-current opacity-80 mix-blend-screen shadow-lg rotate-12"></div>;
      case 'triangle': return (
        <div className="select-none touch-none w-0 h-0 border-l-[20px] border-r-[20px] border-b-[34.6px] border-l-transparent border-r-transparent text-current opacity-80 mix-blend-screen -rotate-12" style={{ borderBottomColor: 'currentColor' }}></div>
      );
      case 'star': return <span className="select-none touch-none text-4xl sm:text-5xl drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] filter brightness-125">⭐</span>;
      default: return null;
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-hidden transition-colors duration-300 ${getBackgroundClass()}`}>
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
        <div className="select-none touch-none flex justify-between items-center w-full mb-4 sm:mb-6 pb-4 border-b border-slate-300/30 dark:border-slate-500/30 z-10">
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-white">Yıldız Avı</h1>
          <div className="select-none touch-none flex gap-2 sm:gap-4">
            <div className="select-none touch-none flex flex-col items-center bg-blue-500/20 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-blue-500/30">
              <span className="select-none touch-none text-[10px] sm:text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Süre</span>
              <span className={`text-xl sm:text-2xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-blue-100'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="select-none touch-none flex flex-col items-center bg-green-500/20 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-green-500/30">
              <span className="select-none touch-none text-[10px] sm:text-xs font-bold text-green-200 uppercase tracking-wider mb-1">Skor</span>
              <span className="select-none touch-none text-xl sm:text-2xl font-black text-green-100">{score}</span>
            </div>
          </div>
        </div>

        {/* Game Content */}
        <div className="select-none touch-none flex-1 w-full flex flex-col items-center relative overflow-hidden bg-slate-950/20 rounded-3xl border border-white/10 shadow-inner">
          {gameState === 'idle' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md mt-16 z-10 p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700">
              <div className="select-none touch-none text-6xl mb-6 animate-bounce">⭐</div>
              <h2 className="select-none touch-none text-2xl font-bold text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-300 mb-8 text-lg leading-relaxed">
                Hareket eden onlarca şekil arasından <strong>gerçek yıldızı</strong> bulun ve en hızlı şekilde tıklayın!
              </p>
              <button
                onPointerDownCapture={startGame}
                className="select-none touch-none w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="select-none touch-none absolute inset-0 w-full h-full">
              {shapes.map(shape => (
                <button
                  key={shape.id}
                  onPointerDownCapture={() => handleShapeClick(shape.type)}
                  className={`absolute w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center transition-all duration-1000 ease-in-out hover:scale-110 active:scale-90 ${shape.type !== 'star' ? shape.color.replace('bg-', 'text-') : ''}`}
                  style={{ top: `${shape.top}%`, left: `${shape.left}%` }}
                >
                  {renderShapeIcon(shape.type)}
                </button>
              ))}
            </div>
          )}

          {gameState === 'finished' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md mt-16 z-10 p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700">
              <div className="select-none touch-none text-7xl mb-6">🏆</div>
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
                onPointerDownCapture={startGame}
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

export default YildizAvi;

