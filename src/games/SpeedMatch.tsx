import React, { useState, useEffect, useCallback } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface SpeedMatchProps {
  onClose?: () => void;
}

const SYMBOLS = ['⬛', '🔺', '🔵', '⭐', '🔶', '✖️'];

const SpeedMatch: React.FC<SpeedMatchProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_SpeedMatch') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [currentSymbol, setCurrentSymbol] = useState<string>('');
  const [previousSymbol, setPreviousSymbol] = useState<string | null>(null);
  const [isFirstSymbol, setIsFirstSymbol] = useState<boolean>(true);

  const generateNextSymbol = useCallback(() => {
    // %40 ihtimalle aynı sembol gelsin
    const shouldMatch = Math.random() < 0.4 && currentSymbol !== '';
    let nextSymbol = '';
    
    if (shouldMatch) {
      nextSymbol = currentSymbol;
    } else {
      const available = SYMBOLS.filter(s => s !== currentSymbol);
      nextSymbol = available[Math.floor(Math.random() * available.length)];
    }
    
    setPreviousSymbol(currentSymbol);
    setCurrentSymbol(nextSymbol);
  }, [currentSymbol]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setPreviousSymbol(null);
    setCurrentSymbol(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    setIsFirstSymbol(true);
    setGameState('playing');
  };

  const handleAnswer = useCallback((answer: 'SAME' | 'DIFFERENT') => {
    if (gameState !== 'playing') return;

    if (isFirstSymbol) {
      setIsFirstSymbol(false);
      generateNextSymbol();
      return;
    }

    const isCorrect = 
      (answer === 'SAME' && currentSymbol === previousSymbol) || 
      (answer === 'DIFFERENT' && currentSymbol !== previousSymbol);

    if (isCorrect) {
      setScore(prev => prev + 10);
    } else {
      setScore(prev => Math.max(0, prev - 5));
    }

    generateNextSymbol();
  }, [gameState, isFirstSymbol, currentSymbol, previousSymbol, generateNextSymbol]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'idle' && (e.key === 'Enter' || e.key === ' ')) {
        startGame();
        return;
      }
      if (gameState !== 'playing') return;
      
      if (e.key === 'ArrowRight') {
        handleAnswer('SAME');
      } else if (e.key === 'ArrowLeft') {
        handleAnswer('DIFFERENT');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleAnswer]);

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
        localStorage.setItem('highScore_SpeedMatch', score.toString());
      } else {
        setIsNewRecord(false);
      }
    } else if (gameState === 'idle') {
      setIsNewRecord(false);
    }
  }, [gameState, score, highScore]);

  return (
    <div className="select-none touch-none fixed inset-0 z-50 flex flex-col bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-y-auto">
      {onClose && (
        <button
          onPointerDownCapture={onClose}
          className="select-none touch-none absolute top-6 left-6 flex items-center gap-2 text-slate-800 dark:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50 transition font-semibold bg-white/30 dark:bg-slate-800/50 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm"
        >
          ← Ana Menüye Dön
        </button>
      )}
      
      <div className="select-none touch-none flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto mt-16 sm:mt-0">
        {/* Header Area */}
        <div className="select-none touch-none flex justify-between items-center w-full mb-10 pb-6 border-b border-slate-300/30 dark:border-slate-500/30">
          <h1 className="select-none touch-none text-2xl font-bold text-slate-900 dark:text-white">Hız Eşleştirme</h1>
          <div className="select-none touch-none flex gap-4">
            <div className="select-none touch-none flex flex-col items-center bg-blue-500/10 px-4 py-2 rounded-xl backdrop-blur-md border border-blue-500/20">
              <span className="select-none touch-none text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">Süre</span>
              <span className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-blue-900 dark:text-blue-100'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="select-none touch-none flex flex-col items-center bg-green-500/10 px-4 py-2 rounded-xl backdrop-blur-md border border-green-500/20">
              <span className="select-none touch-none text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider mb-1">Skor</span>
              <span className="select-none touch-none text-2xl font-black text-green-900 dark:text-green-100">{score}</span>
            </div>
            <div className="select-none touch-none flex flex-col items-center bg-yellow-500/10 px-4 py-2 rounded-xl backdrop-blur-md border border-yellow-500/20 hidden sm:flex">
              <span className="select-none touch-none text-xs font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-wider mb-1">En İyi</span>
              <span className="select-none touch-none text-2xl font-black text-yellow-900 dark:text-yellow-100">{highScore}</span>
            </div>
          </div>
        </div>

        {/* Game Content Area */}
        <div className="select-none touch-none flex flex-col items-center justify-center min-h-[350px] w-full">
          {gameState === 'idle' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md">
              <div className="select-none touch-none w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-indigo-500/30">
                <svg className="select-none touch-none w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="select-none touch-none text-2xl font-bold text-slate-900 dark:text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                Ekrana art arda semboller gelecek. "Bu sembol bir <strong>ÖNCEKİ</strong> sembol ile <strong>AYNI mı?</strong>" sorusuna cevap verin.
                <br/><br/>
                Klavye yön tuşlarını (← ve →) kullanabilirsiniz.
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
            <div className="select-none touch-none w-full flex flex-col items-center">
              {isFirstSymbol && (
                <div className="select-none touch-none mb-4 text-slate-600 dark:text-slate-400 font-bold animate-pulse">
                  İlk sembolü aklında tut! Başlamak için bir tuşa bas.
                </div>
              )}
              {!isFirstSymbol && (
                <div className="select-none touch-none mb-4 text-slate-600 dark:text-slate-400 font-bold">
                  Bir önceki sembolle aynı mı?
                </div>
              )}
              <div className="select-none touch-none flex items-center justify-center h-48 w-full max-w-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-3xl mb-10 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
                <span key={currentSymbol + score} className="select-none touch-none text-8xl sm:text-9xl font-black drop-shadow-md animate-fade-in transition-transform duration-200 transform scale-100 hover:scale-105">
                  {currentSymbol}
                </span>
              </div>
              
              <div className="select-none touch-none flex gap-4 sm:gap-6 w-full max-w-xl">
                <button
                  onPointerDownCapture={() => handleAnswer('DIFFERENT')}
                  className="select-none touch-none flex-1 h-20 sm:h-24 rounded-2xl bg-white/70 dark:bg-slate-800/70 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 border-2 border-transparent hover:border-indigo-400 dark:hover:border-indigo-500 flex items-center justify-center text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 backdrop-blur-md gap-3"
                >
                  <span className="select-none touch-none text-3xl text-indigo-500">←</span> FARKLI
                </button>
                <button
                  onPointerDownCapture={() => handleAnswer('SAME')}
                  className="select-none touch-none flex-1 h-20 sm:h-24 rounded-2xl bg-white/70 dark:bg-slate-800/70 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 border-2 border-transparent hover:border-indigo-400 dark:hover:border-indigo-500 flex items-center justify-center text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 backdrop-blur-md gap-3"
                >
                  AYNI <span className="select-none touch-none text-3xl text-indigo-500">→</span>
                </button>
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md">
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

export default SpeedMatch;

