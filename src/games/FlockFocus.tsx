import React, { useState, useEffect, useCallback } from 'react';

type GameState = 'idle' | 'playing' | 'finished';
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface FlockFocusProps {
  onClose?: () => void;
}

const DIRECTIONS: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];



const FlockFocus: React.FC<FlockFocusProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_FlockFocus') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [centerDir, setCenterDir] = useState<Direction>('UP');
  const [flockDir, setFlockDir] = useState<Direction>('UP');
  const [flashState, setFlashState] = useState<'correct' | 'wrong' | null>(null);

  const startNewRound = useCallback(() => {
    const center = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    const isCongruent = Math.random() > 0.5;
    
    setCenterDir(center);
    if (isCongruent) {
      setFlockDir(center);
    } else {
      let otherDirs = DIRECTIONS.filter(d => d !== center);
      setFlockDir(otherDirs[Math.floor(Math.random() * otherDirs.length)]);
    }
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    startNewRound();
    setGameState('playing');
  };

  const handleInput = useCallback((dir: Direction) => {
    if (gameState !== 'playing') return;

    if (dir === centerDir) {
      setScore(s => s + 10);
      setFlashState('correct');
      setTimeout(() => setFlashState(null), 150);
      startNewRound();
    } else {
      setScore(s => Math.max(0, s - 5));
      setFlashState('wrong');
      setTimeout(() => setFlashState(null), 150);
    }
  }, [gameState, centerDir, startNewRound]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      switch (e.key) {
        case 'ArrowUp': handleInput('UP'); break;
        case 'ArrowDown': handleInput('DOWN'); break;
        case 'ArrowLeft': handleInput('LEFT'); break;
        case 'ArrowRight': handleInput('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleInput]);

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
        localStorage.setItem('highScore_FlockFocus', score.toString());
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
    return 'bg-white/40 dark:bg-slate-800/40';
  };

  const getRotationClass = (dir: Direction) => {
    // 🦅 emojisi varsayılan olarak SOLA bakar.
    switch (dir) {
      case 'LEFT': return 'rotate-0';
      case 'RIGHT': return 'scale-x-[-1]';
      case 'UP': return 'rotate-90';
      case 'DOWN': return '-rotate-90';
    }
  };

  const renderFlock = () => {
    const flock = [flockDir, flockDir, centerDir, flockDir, flockDir];
    return (
      <div className="select-none touch-none flex gap-4 sm:gap-8 justify-center items-center">
        {flock.map((dir, idx) => {
          const isCenter = idx === 2;
          return (
            <div 
              key={idx}
              className={`flex items-center justify-center transition-all duration-150 transform ${getRotationClass(dir)} ${isCenter ? 'text-7xl sm:text-9xl scale-125 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] z-10' : 'text-5xl sm:text-7xl opacity-50 grayscale'}`}
            >
              🦅
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 select-none touch-none z-50 flex flex-col backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-hidden transition-colors duration-150 ${getBackgroundClass()}`}>
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
        <div className="select-none touch-none flex justify-between items-center w-full mb-4 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-300/30 dark:border-slate-500/30 z-10">
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Göç Kuşları</h1>
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
        <div className="select-none touch-none flex-1 w-full flex flex-col items-center justify-center relative">
          {gameState === 'idle' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md z-10">
              <div className="select-none touch-none w-24 h-24 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-sky-500/30">
                <span className="select-none touch-none text-5xl text-sky-600">🦅</span>
              </div>
              <h2 className="select-none touch-none text-2xl font-bold text-slate-900 dark:text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                Ekranda beliren kuş sürüsünde <strong>SADECE ORTADAKİ</strong> kuşun baktığı yöne odaklanın ve aşağıdaki butonları (veya ok tuşlarını) kullanarak doğru yönü seçin.
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
            <div className="select-none touch-none w-full flex flex-col items-center animate-fade-in">
              
              <div className="select-none touch-none bg-sky-500/20 dark:bg-slate-900/40 w-full py-12 sm:py-20 rounded-3xl border border-white/50 dark:border-slate-700/50 shadow-inner mb-8 flex justify-center items-center overflow-hidden">
                {renderFlock()}
              </div>

              {/* On-screen controls - Her zaman görünür ve daha belirgin */}
              <div className="select-none touch-none grid grid-cols-3 gap-3 w-full max-w-[320px] mx-auto mt-4">
                <div />
                <button onPointerDownCapture={() => handleInput('UP')} className="select-none touch-none h-20 bg-indigo-500/20 hover:bg-indigo-500/40 dark:bg-slate-800/80 rounded-2xl shadow-xl border-b-4 border-indigo-600/50 dark:border-slate-900 flex justify-center items-center text-4xl active:translate-y-1 active:border-b-0 transition-all">↑</button>
                <div />
                <button onPointerDownCapture={() => handleInput('LEFT')} className="select-none touch-none h-20 bg-indigo-500/20 hover:bg-indigo-500/40 dark:bg-slate-800/80 rounded-2xl shadow-xl border-b-4 border-indigo-600/50 dark:border-slate-900 flex justify-center items-center text-4xl active:translate-y-1 active:border-b-0 transition-all">←</button>
                <button onPointerDownCapture={() => handleInput('DOWN')} className="select-none touch-none h-20 bg-indigo-500/20 hover:bg-indigo-500/40 dark:bg-slate-800/80 rounded-2xl shadow-xl border-b-4 border-indigo-600/50 dark:border-slate-900 flex justify-center items-center text-4xl active:translate-y-1 active:border-b-0 transition-all">↓</button>
                <button onPointerDownCapture={() => handleInput('RIGHT')} className="select-none touch-none h-20 bg-indigo-500/20 hover:bg-indigo-500/40 dark:bg-slate-800/80 rounded-2xl shadow-xl border-b-4 border-indigo-600/50 dark:border-slate-900 flex justify-center items-center text-4xl active:translate-y-1 active:border-b-0 transition-all">→</button>
              </div>

              <div className="select-none touch-none hidden sm:block text-slate-500 dark:text-slate-400 font-medium tracking-widest uppercase mt-8">
                Klavye Yön Tuşlarını da Kullanabilirsiniz
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

export default FlockFocus;

