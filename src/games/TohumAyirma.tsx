import React, { useState, useEffect, useCallback } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface TohumAyirmaProps {
  onClose?: () => void;
}

const TohumAyirma: React.FC<TohumAyirmaProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_TohumAyirma') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [seeds, setSeeds] = useState(12);
  const [baskets, setBaskets] = useState(3);
  const [options, setOptions] = useState<number[]>([]);
  const [flashState, setFlashState] = useState<'correct' | 'wrong' | null>(null);

  const generateQuestion = useCallback(() => {
    // 2 ile 9 arası sepet
    const newBaskets = Math.floor(Math.random() * 8) + 2;
    // 2 ile 12 arası sonuç
    const answer = Math.floor(Math.random() * 11) + 2;
    const newSeeds = newBaskets * answer;

    setSeeds(newSeeds);
    setBaskets(newBaskets);

    const newOptions = new Set<number>();
    newOptions.add(answer);
    
    // Yanıltıcı şıklar üret
    while (newOptions.size < 4) {
      const wrong = answer + (Math.floor(Math.random() * 7) - 3);
      if (wrong > 0 && wrong !== answer) {
        newOptions.add(wrong);
      }
    }

    const shuffled = Array.from(newOptions).sort(() => Math.random() - 0.5);
    setOptions(shuffled);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    generateQuestion();
    setGameState('playing');
  };

  const handleOptionClick = (opt: number) => {
    if (gameState !== 'playing') return;

    if (opt === seeds / baskets) {
      setScore(s => s + 10);
      setFlashState('correct');
      setTimeout(() => setFlashState(null), 300);
      generateQuestion();
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
        localStorage.setItem('highScore_TohumAyirma', score.toString());
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
    return 'bg-amber-100/40 dark:bg-amber-900/40';
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
        <div className="select-none touch-none flex justify-between items-center w-full mb-4 sm:mb-8 pb-4 sm:pb-6 border-b border-amber-900/10 dark:border-amber-100/10 z-10">
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-100">Tohum Ayırma</h1>
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
              <div className="select-none touch-none w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-amber-500/30">
                <span className="select-none touch-none text-5xl">🌱</span>
              </div>
              <h2 className="select-none touch-none text-2xl font-bold text-slate-900 dark:text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                Ekranda görünen tohumları, sepetlere eşit bir şekilde dağıtın. Yani tohum sayısını sepet sayısına bölün ve doğru cevabı hızlıca işaretleyin!
              </p>
              <button
                onPointerDownCapture={startGame}
                className="select-none touch-none w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="select-none touch-none w-full flex flex-col items-center animate-fade-in max-w-md mx-auto">
              
              <div className="select-none touch-none bg-white/40 dark:bg-slate-900/40 w-full p-8 rounded-3xl border border-white/50 dark:border-slate-700/50 shadow-inner mb-8 flex flex-col items-center justify-center">
                <div className="select-none touch-none flex items-center gap-6 mb-6">
                  <div className="select-none touch-none flex flex-col items-center">
                    <span className="select-none touch-none text-5xl mb-2">🌱</span>
                    <span className="select-none touch-none text-4xl font-black text-slate-800 dark:text-slate-100">{seeds}</span>
                    <span className="select-none touch-none text-sm font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase">Tohum</span>
                  </div>
                  <div className="select-none touch-none text-4xl text-slate-400 font-black">÷</div>
                  <div className="select-none touch-none flex flex-col items-center">
                    <span className="select-none touch-none text-5xl mb-2">🧺</span>
                    <span className="select-none touch-none text-4xl font-black text-slate-800 dark:text-slate-100">{baskets}</span>
                    <span className="select-none touch-none text-sm font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase">Sepet</span>
                  </div>
                </div>
                <div className="select-none touch-none text-xl font-medium text-slate-600 dark:text-slate-300">
                  Her sepete kaç tohum düşer?
                </div>
              </div>

              <div className="select-none touch-none grid grid-cols-2 gap-4 w-full">
                {options.map((opt, idx) => (
                  <button
                    key={idx}
                    onPointerDownCapture={() => handleOptionClick(opt)}
                    className="select-none touch-none h-20 bg-amber-500/20 hover:bg-amber-500/40 dark:bg-slate-800/80 rounded-2xl shadow-lg border border-amber-600/30 flex justify-center items-center text-4xl font-black text-amber-900 dark:text-amber-100 active:scale-95 transition-transform"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md mt-10 z-10 p-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/50 dark:border-slate-700/50">
              <div className="select-none touch-none text-7xl mb-6">🏆</div>
              <h2 className="select-none touch-none text-4xl font-bold text-slate-900 dark:text-white mb-4">Süre Bitti!</h2>
              {isNewRecord && (
                <div className="select-none touch-none mb-4 text-2xl font-black text-yellow-500 animate-bounce">
                  🏆 Yeni Rekor!
                </div>
              )}
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-xl">
                Toplam Skorunuz: <span className="select-none touch-none text-4xl font-black text-amber-600 dark:text-amber-400 ml-2 block mt-2">{score}</span>
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

export default TohumAyirma;

