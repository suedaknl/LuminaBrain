import React, { useState, useEffect, useCallback, useRef } from 'react';

type GameState = 'idle' | 'showing' | 'playing' | 'finished';

interface MemoryMatrixProps {
  onClose?: () => void;
}

// gridSize: 2×2 → 3×3 → 4×4 → 5×5 → 6×6 (max)
const MIN_GRID = 2;
const MAX_GRID = 6;

// How many boxes to highlight for a given grid size
const getHighlightCount = (gs: number) => Math.max(2, Math.floor(gs * gs * 0.35));

const MemoryMatrix: React.FC<MemoryMatrixProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() =>
    parseInt(localStorage.getItem('highScore_MemoryMatrix') || '0', 10)
  );
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const [gridSize, setGridSize] = useState(MIN_GRID);
  const successCountRef = useRef(0); // consecutive successes per level — not rendered

  const [activeBoxes, setActiveBoxes] = useState<number[]>([]);
  const [clickedCorrect, setClickedCorrect] = useState<number[]>([]);
  const [clickedWrong, setClickedWrong] = useState<number[]>([]);

  const startNewRound = useCallback((gs: number) => {
    setClickedCorrect([]);
    setClickedWrong([]);

    const total = gs * gs;
    const count = getHighlightCount(gs);
    const newBoxes = new Set<number>();
    while (newBoxes.size < count) {
      newBoxes.add(Math.floor(Math.random() * total));
    }
    setActiveBoxes(Array.from(newBoxes));
    setGameState('showing');

    // Show duration scales with grid: 1.5s for 2×2, up to 2.5s for 6×6
    const showDuration = 1500 + (gs - MIN_GRID) * 250;
    setTimeout(() => {
      setGameState(curr => (curr === 'showing' ? 'playing' : curr));
    }, showDuration);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGridSize(MIN_GRID);
    successCountRef.current = 0;
    startNewRound(MIN_GRID);
  };

  const handleBoxClick = (index: number) => {
    if (gameState !== 'playing') return;
    if (clickedCorrect.includes(index) || clickedWrong.includes(index)) return;

    if (activeBoxes.includes(index)) {
      const newCorrect = [...clickedCorrect, index];
      setClickedCorrect(newCorrect);

      if (newCorrect.length === activeBoxes.length) {
        // Round complete
        const basePoints = 10 + (gridSize - MIN_GRID) * 5;
        setScore(prev => prev + basePoints);

        successCountRef.current += 1;
        // Every 2 successes → grow grid (up to MAX_GRID)
        if (successCountRef.current >= 2) {
          successCountRef.current = 0;
          const nextGrid = Math.min(gridSize + 1, MAX_GRID);
          setGridSize(nextGrid);
          setGameState('idle');
          setTimeout(() => startNewRound(nextGrid), 800);
        } else {
          setGameState('idle');
          setTimeout(() => startNewRound(gridSize), 800);
        }
      }
    } else {
      setClickedWrong([index]);
      setScore(prev => Math.max(0, prev - 5));
      successCountRef.current = 0; // reset streak on error
      setGameState('idle');
      setTimeout(() => startNewRound(gridSize), 800);
    }
  };

  useEffect(() => {
    let timer: number;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    if (timeLeft === 0 && gameState !== 'idle' && activeBoxes.length > 0) {
      setGameState('finished');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, activeBoxes]);

  const getBoxStyle = (index: number) => {
    if (gameState === 'showing') {
      return activeBoxes.includes(index)
        ? 'bg-indigo-500 scale-105 shadow-indigo-500/50'
        : 'bg-white/70 dark:bg-slate-800/70';
    }
    if (clickedWrong.includes(index)) return 'bg-red-500 scale-95 shadow-red-500/50';
    if (clickedCorrect.includes(index)) return 'bg-green-500 scale-105 shadow-green-500/50';
    return 'bg-white/70 dark:bg-slate-800/70 hover:bg-indigo-50 dark:hover:bg-indigo-900/40';
  };

  useEffect(() => {
    if (gameState === 'finished') {
      if (score > highScore) {
        setHighScore(score);
        setIsNewRecord(true);
        localStorage.setItem('highScore_MemoryMatrix', score.toString());
      } else {
        setIsNewRecord(false);
      }
    } else if (gameState === 'idle') {
      setIsNewRecord(false);
    }
  }, [gameState, score, highScore]);

  // Cell size adapts to grid so it fits mobile screens
  const cellSize = gridSize <= 3 ? 'w-20 h-20 sm:w-24 sm:h-24' : gridSize === 4 ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-12 h-12 sm:w-16 sm:h-16';

  return (
    <div className="select-none touch-none fixed inset-0 z-50 flex flex-col bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-y-auto">
      {onClose && (
        <button
          onPointerDown={onClose}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-800 dark:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50 transition font-semibold bg-white/30 dark:bg-slate-800/50 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm z-20"
        >
          ← Ana Menüye Dön
        </button>
      )}

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto mt-16 sm:mt-0">
        {/* Header */}
        <div className="flex justify-between items-center w-full mb-6 pb-4 border-b border-slate-300/30 dark:border-slate-500/30">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hafıza Matrisi</h1>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {gridSize}×{gridSize} ızgara
            </span>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <div className="flex flex-col items-center bg-blue-500/10 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-blue-500/20">
              <span className="text-[10px] sm:text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">Süre</span>
              <span className={`text-xl sm:text-2xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-blue-900 dark:text-blue-100'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="flex flex-col items-center bg-green-500/10 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-green-500/20">
              <span className="text-[10px] sm:text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider mb-1">Skor</span>
              <span className="text-xl sm:text-2xl font-black text-green-900 dark:text-green-100">{score}</span>
            </div>
            <div className="flex flex-col items-center bg-yellow-500/10 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-yellow-500/20 hidden sm:flex">
              <span className="text-[10px] sm:text-xs font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-wider mb-1">En İyi</span>
              <span className="text-xl sm:text-2xl font-black text-yellow-900 dark:text-yellow-100">{highScore}</span>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex flex-col items-center justify-center min-h-[350px] w-full">
          {gameState === 'idle' && activeBoxes.length === 0 && (
            <div className="text-center animate-fade-in w-full max-w-md">
              <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-indigo-500/30">
                <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Nasıl Oynanır?</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-2 text-lg leading-relaxed">
                Kutular kısa süreliğine parlayacak — konumlarını hatırlayıp tıklayın.
              </p>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                Her 2 başarılı turda ızgara büyür: 2×2 → 3×3 → … → 6×6
              </p>
              <button
                onPointerDown={startGame}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {(gameState === 'showing' || gameState === 'playing' || (gameState === 'idle' && activeBoxes.length > 0)) && (
            <div className="flex flex-col items-center animate-fade-in w-full">
              {gameState === 'showing' && (
                <p className="text-slate-600 dark:text-slate-300 font-semibold mb-4 text-sm tracking-widest uppercase animate-pulse">
                  Konumları Ezberle!
                </p>
              )}
              {gameState === 'playing' && (
                <p className="text-slate-600 dark:text-slate-300 font-semibold mb-4 text-sm tracking-widest uppercase">
                  Kutulara Tıkla!
                </p>
              )}
              <div
                className="grid gap-2 sm:gap-3"
                style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: gridSize * gridSize }).map((_, i) => (
                  <button
                    key={i}
                    onPointerDown={() => handleBoxClick(i)}
                    className={`${cellSize} rounded-2xl shadow-md transition-all duration-300 border-2 border-transparent backdrop-blur-md ${getBoxStyle(i)}`}
                    aria-label={`Kutu ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="text-center animate-fade-in w-full max-w-md">
              <div className="text-7xl mb-6">🏆</div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Süre Bitti!</h2>
              {isNewRecord && (
                <div className="mb-4 text-2xl font-black text-yellow-500 animate-bounce">🏆 Yeni Rekor!</div>
              )}
              <p className="text-slate-700 dark:text-slate-300 mb-8 text-xl">
                Toplam Skorunuz:{' '}
                <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 ml-2 block mt-2">
                  {score}
                </span>
              </p>
              <button
                onPointerDown={startGame}
                className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
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

export default MemoryMatrix;
