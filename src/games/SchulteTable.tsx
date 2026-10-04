import React, { useState, useEffect, useCallback } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface SchulteTableProps {
  onClose?: () => void;
}

const SchulteTable: React.FC<SchulteTableProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  
  // highScore now means bestTime (lowest is better)
  const [bestTime, setBestTime] = useState(() => {
    const saved = localStorage.getItem('bestTime_SchulteTable');
    return saved ? parseInt(saved, 10) : null;
  });
  
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  const [grid, setGrid] = useState<number[]>([]);
  const [nextExpected, setNextExpected] = useState(1);
  const [clickedBoxes, setClickedBoxes] = useState<number[]>([]);
  const [errorBox, setErrorBox] = useState<number | null>(null);
  const [penaltyFlash, setPenaltyFlash] = useState(false);

  const startNewRound = useCallback(() => {
    const nums = Array.from({ length: 25 }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    setGrid(nums);
    setNextExpected(1);
    setClickedBoxes([]);
    setErrorBox(null);
  }, []);

  const startGame = () => {
    setTimeElapsed(0);
    setIsNewRecord(false);
    startNewRound();
    setGameState('playing');
  };

  const handleBoxClick = (num: number, index: number) => {
    if (gameState !== 'playing') return;
    if (clickedBoxes.includes(num)) return; // Zaten doğru tıklandıysa yoksay

    if (num === nextExpected) {
      // Doğru sayı
      setClickedBoxes(prev => [...prev, num]);
      
      if (nextExpected === 25) {
        // Tablo bitti
        setGameState('finished');
      } else {
        setNextExpected(prev => prev + 1);
      }
    } else {
      // Yanlış sayı (Ceza: +3 saniye)
      setErrorBox(index);
      setTimeElapsed(prev => prev + 3);
      setPenaltyFlash(true);
      setTimeout(() => setPenaltyFlash(false), 300);
      setTimeout(() => setErrorBox(null), 300);
    }
  };

  useEffect(() => {
    let timer: number;
    if (gameState === 'playing') {
      timer = window.setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'finished') {
      if (bestTime === null || timeElapsed < bestTime) {
        setBestTime(timeElapsed);
        setIsNewRecord(true);
        localStorage.setItem('bestTime_SchulteTable', timeElapsed.toString());
      } else {
        setIsNewRecord(false);
      }
    } else if (gameState === 'idle') {
      setIsNewRecord(false);
    }
  }, [gameState, timeElapsed, bestTime]);

  const getBoxStyle = (num: number, index: number) => {
    if (clickedBoxes.includes(num)) {
      return 'bg-green-500 scale-95 shadow-inner opacity-70 text-white';
    }
    if (errorBox === index) {
      return 'bg-red-500 scale-95 shadow-red-500/50 text-white';
    }
    return 'bg-white/70 dark:bg-slate-800/70 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-800 dark:text-slate-100 shadow-sm';
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-y-auto transition-colors duration-300 ${penaltyFlash ? 'bg-red-500/30 dark:bg-red-600/30' : 'bg-white/40 dark:bg-slate-800/40'}`}>
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
        <div className="select-none touch-none flex justify-between items-center w-full mb-8 sm:mb-10 pb-4 sm:pb-6 border-b border-slate-300/30 dark:border-slate-500/30">
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Schulte Tablosu</h1>
          <div className="select-none touch-none flex gap-2 sm:gap-4">
            <div className="select-none touch-none flex flex-col items-center bg-blue-500/10 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-blue-500/20">
              <span className="select-none touch-none text-[10px] sm:text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">Geçen Süre</span>
              <span className={`text-xl sm:text-2xl font-black ${penaltyFlash ? 'text-red-600 dark:text-red-400 animate-bounce' : 'text-blue-900 dark:text-blue-100'}`}>
                {timeElapsed}s
              </span>
            </div>
            <div className="select-none touch-none flex flex-col items-center bg-yellow-500/10 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-yellow-500/20 hidden sm:flex">
              <span className="select-none touch-none text-[10px] sm:text-xs font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-wider mb-1">En Hızlı Süre</span>
              <span className="select-none touch-none text-xl sm:text-2xl font-black text-yellow-900 dark:text-yellow-100">
                {bestTime !== null ? `${bestTime}s` : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Game Content Area */}
        <div className="select-none touch-none flex flex-col items-center justify-center min-h-[350px] w-full">
          {gameState === 'idle' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md">
              <div className="select-none touch-none w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-indigo-500/30">
                <span className="select-none touch-none text-4xl font-black text-indigo-600 dark:text-indigo-400">1-25</span>
              </div>
              <h2 className="select-none touch-none text-2xl font-bold text-slate-900 dark:text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                Tablodaki sayıları <strong>1'den 25'e kadar</strong> sırayla ve en hızlı şekilde bulup tıklayın. Yanlış tıklamalar <strong className="select-none touch-none text-red-500">+3 saniye</strong> ceza verir!
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
              <div className="select-none touch-none mb-4 sm:mb-6 text-slate-600 dark:text-slate-400 font-bold flex gap-2 items-center">
                Sıradaki Sayı: <span className="select-none touch-none inline-flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg w-10 h-10 text-xl font-black">{nextExpected}</span>
              </div>
              <div className="select-none touch-none grid grid-cols-5 gap-1.5 sm:gap-2 w-full max-w-sm sm:max-w-md p-2 sm:p-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                {grid.map((num, i) => (
                  <button
                    key={i}
                    onPointerDownCapture={() => handleBoxClick(num, i)}
                    className={`aspect-square rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold transition-all duration-150 border-2 border-transparent select-none ${getBoxStyle(num, i)}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md">
              <div className="select-none touch-none text-7xl mb-6">🏁</div>
              <h2 className="select-none touch-none text-4xl font-bold text-slate-900 dark:text-white mb-4">Tamamlandı!</h2>
              {isNewRecord && (
                <div className="select-none touch-none mb-4 text-2xl font-black text-yellow-500 animate-bounce">
                  🏆 Yeni En Hızlı Süre!
                </div>
              )}
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-xl">
                Tamamlama Süresi: <span className="select-none touch-none text-4xl font-black text-indigo-600 dark:text-indigo-400 ml-2 block mt-2">{timeElapsed} saniye</span>
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

export default SchulteTable;

