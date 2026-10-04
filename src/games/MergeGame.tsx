import React, { useState, useEffect, useCallback } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface MergeGameProps {
  onClose?: () => void;
}

const MergeGame: React.FC<MergeGameProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_MergeGame') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [grid, setGrid] = useState<number[][]>(Array(4).fill(Array(4).fill(0)));

  const spawnRandom = (currentGrid: number[][]): number[][] => {
    const emptyCells: {r: number, c: number}[] = [];
    currentGrid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 0) emptyCells.push({r, c});
      });
    });

    if (emptyCells.length === 0) return currentGrid;

    const newGrid = currentGrid.map(row => [...row]);
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    
    let newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
    newGrid = spawnRandom(newGrid);
    newGrid = spawnRandom(newGrid);
    setGrid(newGrid);
    setGameState('playing');
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState !== 'playing') return;
    
    const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'];
    if (!validKeys.includes(e.key)) return;

    e.preventDefault(); // Scroll önlemek için

    setGrid(prevGrid => {
      let newGrid = prevGrid.map(row => [...row]);
      let moved = false;
      let pointsGained = 0;

      const slide = (row: number[]) => {
        const filtered = row.filter(val => val !== 0);
        const empty = Array(4 - filtered.length).fill(0);
        return [...filtered, ...empty];
      };

      const combine = (row: number[]) => {
        for (let i = 0; i < 3; i++) {
          if (row[i] !== 0 && row[i] === row[i + 1]) {
            row[i] *= 2;
            pointsGained += row[i];
            row[i + 1] = 0;
          }
        }
        return row;
      };

      const processLine = (row: number[]) => {
        let newRow = slide(row);
        newRow = combine(newRow);
        newRow = slide(newRow);
        return newRow;
      };

      if (e.key === 'ArrowLeft' || e.key === 'a') {
        for (let r = 0; r < 4; r++) {
          const oldRow = [...newGrid[r]];
          newGrid[r] = processLine(newGrid[r]);
          if (oldRow.join(',') !== newGrid[r].join(',')) moved = true;
        }
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        for (let r = 0; r < 4; r++) {
          const oldRow = [...newGrid[r]];
          let row = [...newGrid[r]].reverse();
          row = processLine(row);
          newGrid[r] = row.reverse();
          if (oldRow.join(',') !== newGrid[r].join(',')) moved = true;
        }
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        for (let c = 0; c < 4; c++) {
          const oldCol = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
          let col = [...oldCol];
          col = processLine(col);
          for (let r = 0; r < 4; r++) newGrid[r][c] = col[r];
          if (oldCol.join(',') !== col.join(',')) moved = true;
        }
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        for (let c = 0; c < 4; c++) {
          const oldCol = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
          let col = [...oldCol].reverse();
          col = processLine(col);
          col = col.reverse();
          for (let r = 0; r < 4; r++) newGrid[r][c] = col[r];
          if (oldCol.join(',') !== col.join(',')) moved = true;
        }
      }

      if (moved) {
        setScore(prev => prev + pointsGained);
        return spawnRandom(newGrid);
      }
      return prevGrid;
    });
  }, [gameState]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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
        localStorage.setItem('highScore_MergeGame', score.toString());
      } else {
        setIsNewRecord(false);
      }
    } else if (gameState === 'idle') {
      setIsNewRecord(false);
    }
  }, [gameState, score, highScore]);

  const getCellColor = (val: number) => {
    switch (val) {
      case 0: return 'bg-white/20 dark:bg-slate-700/30';
      case 2: return 'bg-slate-100 dark:bg-slate-200 text-slate-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 8: return 'bg-orange-300 text-orange-900';
      case 16: return 'bg-orange-500 text-white';
      case 32: return 'bg-red-400 text-white';
      case 64: return 'bg-red-500 text-white';
      case 128: return 'bg-yellow-400 text-slate-800 text-3xl sm:text-4xl';
      case 256: return 'bg-yellow-500 text-slate-900 text-3xl sm:text-4xl shadow-yellow-500/50';
      case 512: return 'bg-yellow-600 text-white text-3xl sm:text-4xl shadow-yellow-600/50';
      case 1024: return 'bg-indigo-500 text-white text-2xl sm:text-3xl shadow-indigo-500/50';
      case 2048: return 'bg-purple-500 text-white text-2xl sm:text-3xl shadow-purple-500/50';
      default: return 'bg-pink-500 text-white text-xl sm:text-2xl shadow-pink-500/50';
    }
  };

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
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Blok Birleştirme</h1>
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
              <div className="select-none touch-none w-24 h-24 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-orange-500/30">
                <span className="select-none touch-none text-3xl font-black text-orange-600 dark:text-orange-400">2048</span>
              </div>
              <h2 className="select-none touch-none text-2xl font-bold text-slate-900 dark:text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                Aynı değerli blokları yön tuşlarıyla (W,A,S,D veya Ok Tuşları) kaydırarak birleştirin. Süre bitmeden en yüksek değere ulaşın!
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
            <div className="select-none touch-none bg-slate-200/50 dark:bg-slate-800/60 p-3 sm:p-4 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-xl backdrop-blur-md flex flex-col gap-2 sm:gap-3">
              {grid.map((row, rIdx) => (
                <div key={rIdx} className="select-none touch-none flex gap-2 sm:gap-3">
                  {row.map((cell, cIdx) => (
                    <div 
                      key={`${rIdx}-${cIdx}`} 
                      className={`w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-black shadow-sm transition-all duration-150 transform ${getCellColor(cell)}`}
                    >
                      {cell !== 0 ? cell : ''}
                    </div>
                  ))}
                </div>
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

export default MergeGame;

