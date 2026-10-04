import React, { useState, useEffect, useCallback, useRef } from 'react';

type GameState = 'idle' | 'playing' | 'finished';
type ColorType = 'red' | 'blue' | 'green' | 'yellow';

interface TrainObj {
  id: number;
  color: ColorType;
  position: number; // 0 (top) to 100 (bottom)
}

interface ThoughtTrainProps {
  onClose?: () => void;
}

const COLORS: ColorType[] = ['red', 'blue', 'green', 'yellow'];

const ThoughtTrain: React.FC<ThoughtTrainProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_ThoughtTrain') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [trains, setTrains] = useState<TrainObj[]>([]);
  const [flashState, setFlashState] = useState<'correct' | 'wrong' | null>(null);
  const trainIdCounter = useRef(0);

  const spawnTrain = useCallback(() => {
    setTrains(prev => [
      ...prev, 
      { 
        id: trainIdCounter.current++, 
        color: COLORS[Math.floor(Math.random() * COLORS.length)], 
        position: 0 
      }
    ]);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setTrains([]);
    setIsNewRecord(false);
    trainIdCounter.current = 0;
    setGameState('playing');
  };

  // Trenlerin aşağı inmesi
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setTrains(prevTrains => {
        let missed = false;
        const updated = prevTrains.map(t => {
          const newPos = t.position + 1.5; // Düşme hızı
          if (newPos >= 90) missed = true;
          return { ...t, position: newPos };
        }).filter(t => t.position < 90);

        if (missed) {
          setScore(s => Math.max(0, s - 5)); // Yere çarparsa eksi puan
          setFlashState('wrong');
          setTimeout(() => setFlashState(null), 200);
        }

        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameState]);

  // Tren spawn aralığı
  useEffect(() => {
    if (gameState !== 'playing') return;
    spawnTrain(); // İlk tren
    
    // Her 1.5 saniyede bir yeni tren
    const spawnInterval = setInterval(spawnTrain, 1500);
    return () => clearInterval(spawnInterval);
  }, [gameState, spawnTrain]);

  const handleStationClick = useCallback((stationColor: ColorType) => {
    if (gameState !== 'playing') return;

    setTrains(prev => {
      if (prev.length === 0) return prev;
      
      // En alttaki treni bul (pozisyonu en büyük olan)
      const bottomTrain = [...prev].sort((a, b) => b.position - a.position)[0];
      
      if (bottomTrain.color === stationColor) {
        // Doğru eşleşme
        setScore(s => s + 10);
        setFlashState('correct');
      } else {
        // Yanlış eşleşme
        setScore(s => Math.max(0, s - 5));
        setFlashState('wrong');
      }
      setTimeout(() => setFlashState(null), 200);

      // O treni kaldır
      return prev.filter(t => t.id !== bottomTrain.id);
    });
  }, [gameState]);

  // Klavye kontrolleri
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      switch (e.key) {
        case 'ArrowLeft': handleStationClick('red'); break;
        case 'ArrowUp': handleStationClick('blue'); break;
        case 'ArrowDown': handleStationClick('green'); break;
        case 'ArrowRight': handleStationClick('yellow'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleStationClick]);

  useEffect(() => {
    let timer: number;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
      setTrains([]);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'finished') {
      if (score > highScore) {
        setHighScore(score);
        setIsNewRecord(true);
        localStorage.setItem('highScore_ThoughtTrain', score.toString());
      } else {
        setIsNewRecord(false);
      }
    } else if (gameState === 'idle') {
      setIsNewRecord(false);
    }
  }, [gameState, score, highScore]);

  const getBackgroundClass = () => {
    if (flashState === 'correct') return 'bg-green-500/20 dark:bg-green-600/20';
    if (flashState === 'wrong') return 'bg-red-500/20 dark:bg-red-600/20';
    return 'bg-white/40 dark:bg-slate-800/40';
  };

  const getColorClasses = (color: ColorType) => {
    switch (color) {
      case 'red': return 'bg-red-500 shadow-red-500/50';
      case 'blue': return 'bg-blue-500 shadow-blue-500/50';
      case 'green': return 'bg-green-500 shadow-green-500/50';
      case 'yellow': return 'bg-yellow-400 shadow-yellow-400/50';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-hidden transition-colors duration-150 ${getBackgroundClass()}`}>
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
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Düşünce Treni</h1>
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
          </div>
        </div>

        {/* Game Content Area */}
        <div className="select-none touch-none flex-1 w-full flex flex-col items-center relative h-full">
          {gameState === 'idle' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md mt-10 z-10">
              <div className="select-none touch-none w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-amber-500/30">
                <span className="select-none touch-none text-5xl">🚂</span>
              </div>
              <h2 className="select-none touch-none text-2xl font-bold text-slate-900 dark:text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                Yukarıdan inen objeleri, alt kısımdaki kendi rengiyle eşleşen istasyon butonlarına tıklayarak (veya Ok Tuşlarıyla) doğru yöne gönderin.
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
            <div className="select-none touch-none absolute inset-0 w-full h-full flex flex-col pb-4">
              {/* Oyun Alanı / Raylar */}
              <div className="select-none touch-none flex-1 relative w-full max-w-lg mx-auto bg-white/10 dark:bg-slate-900/20 rounded-t-3xl border-x-4 border-t-4 border-slate-300/50 dark:border-slate-600/50 overflow-hidden mb-4 shadow-inner">
                {trains.map(train => (
                  <div 
                    key={train.id}
                    className={`absolute left-1/2 transform -translate-x-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-xl shadow-lg border-2 border-white/50 flex items-center justify-center text-2xl ${getColorClasses(train.color)}`}
                    style={{ top: `${train.position}%`, transition: 'top 50ms linear' }}
                  >
                    📦
                  </div>
                ))}
              </div>

              {/* İstasyon Butonları */}
              <div className="select-none touch-none flex gap-2 sm:gap-4 justify-center w-full max-w-xl mx-auto">
                <button
                  onPointerDownCapture={() => handleStationClick('red')}
                  className="select-none touch-none flex-1 py-4 sm:py-6 rounded-2xl bg-red-500 text-white font-bold shadow-lg hover:bg-red-400 active:scale-95 transition-all flex flex-col items-center gap-1 border border-white/20"
                >
                  <span className="select-none touch-none hidden sm:block text-xs opacity-75">SOL OK</span>
                </button>
                <button
                  onPointerDownCapture={() => handleStationClick('blue')}
                  className="select-none touch-none flex-1 py-4 sm:py-6 rounded-2xl bg-blue-500 text-white font-bold shadow-lg hover:bg-blue-400 active:scale-95 transition-all flex flex-col items-center gap-1 border border-white/20"
                >
                  <span className="select-none touch-none hidden sm:block text-xs opacity-75">ÜST OK</span>
                </button>
                <button
                  onPointerDownCapture={() => handleStationClick('green')}
                  className="select-none touch-none flex-1 py-4 sm:py-6 rounded-2xl bg-green-500 text-white font-bold shadow-lg hover:bg-green-400 active:scale-95 transition-all flex flex-col items-center gap-1 border border-white/20"
                >
                  <span className="select-none touch-none hidden sm:block text-xs opacity-75">ALT OK</span>
                </button>
                <button
                  onPointerDownCapture={() => handleStationClick('yellow')}
                  className="select-none touch-none flex-1 py-4 sm:py-6 rounded-2xl bg-yellow-400 text-slate-900 font-bold shadow-lg hover:bg-yellow-300 active:scale-95 transition-all flex flex-col items-center gap-1 border border-white/20"
                >
                  <span className="select-none touch-none hidden sm:block text-xs opacity-75">SAĞ OK</span>
                </button>
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md mt-10 z-10">
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

export default ThoughtTrain;

