import React, { useState, useEffect, useCallback } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface Cell {
  r: number;
  c: number;
  isWall: boolean;
  isPath: boolean;
  isStart: boolean;
  isEnd: boolean;
}

interface KarincaYardimiProps {
  onClose?: () => void;
}

const ROWS = 6;
const COLS = 6;

const KarincaYardimi: React.FC<KarincaYardimiProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_KarincaYardimi') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [path, setPath] = useState<{r: number, c: number}[]>([]);
  const [flashState, setFlashState] = useState<'correct' | 'wrong' | null>(null);

  const generateMaze = useCallback(() => {
    // Basit bir labirent oluştur. (0,0) start, (ROWS-1, COLS-1) end
    const newGrid: Cell[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          r, c,
          isWall: false,
          isPath: false,
          isStart: r === 0 && c === 0,
          isEnd: r === ROWS - 1 && c === COLS - 1,
        });
      }
      newGrid.push(row);
    }

    // Rastgele duvarlar ekle (start ve end etrafına koymamaya dikkat et)
    for (let i = 0; i < 8; i++) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if ((r === 0 && c === 0) || (r === ROWS - 1 && c === COLS - 1) || (r === 0 && c === 1) || (r === 1 && c === 0)) continue;
      newGrid[r][c].isWall = true;
    }

    // Yolu başlat
    newGrid[0][0].isPath = true;
    
    setGrid(newGrid);
    setPath([{r: 0, c: 0}]);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    generateMaze();
    setGameState('playing');
  };

  const handleCellClick = (r: number, c: number) => {
    if (gameState !== 'playing') return;

    const targetCell = grid[r][c];
    if (targetCell.isWall) {
      setScore(s => Math.max(0, s - 2)); // Yanlış tıklama cezası
      setFlashState('wrong');
      setTimeout(() => setFlashState(null), 300);
      return;
    }

    // Tıklanan hücre son yoldaki hücreye komşu olmalı
    const lastPos = path[path.length - 1];
    const isAdjacent = Math.abs(lastPos.r - r) + Math.abs(lastPos.c - c) === 1;

    if (isAdjacent && !targetCell.isPath) {
      // Yola ekle
      const newPath = [...path, {r, c}];
      setPath(newPath);
      
      const newGrid = [...grid];
      newGrid[r][c] = { ...targetCell, isPath: true };
      setGrid(newGrid);

      // Hedefe ulaşıldı mı?
      if (targetCell.isEnd) {
        setScore(s => s + 15);
        setFlashState('correct');
        setTimeout(() => setFlashState(null), 300);
        generateMaze(); // Yeni bölüm
      }
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
        localStorage.setItem('highScore_KarincaYardimi', score.toString());
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
    return 'bg-emerald-100/40 dark:bg-emerald-900/40';
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
      
      <div className="select-none touch-none flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto mt-16 sm:mt-0 relative">
        {/* Header */}
        <div className="select-none touch-none flex justify-between items-center w-full mb-4 sm:mb-8 pb-4 border-b border-emerald-900/20 dark:border-emerald-100/20 z-10">
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-100">Karınca Yardımı</h1>
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

        {/* Content */}
        <div className="select-none touch-none flex-1 w-full flex flex-col items-center justify-center relative">
          {gameState === 'idle' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md z-10 p-6 bg-white/40 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/50 dark:border-slate-700 shadow-xl">
              <div className="select-none touch-none text-6xl mb-6">🐜</div>
              <h2 className="select-none touch-none text-2xl font-bold text-slate-900 dark:text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                Karıncayı <strong>Yemeğe (🍎)</strong> ulaştırmak için karelere tıklayarak (komşu hücrelere ilerleyerek) engellere takılmadan en kısa yolu çizin!
              </p>
              <button
                onPointerDownCapture={startGame}
                className="select-none touch-none w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="select-none touch-none w-full flex flex-col items-center animate-fade-in">
              <div className="select-none touch-none bg-white/50 dark:bg-slate-900/50 p-3 sm:p-6 rounded-3xl border border-white/50 dark:border-slate-700 shadow-xl backdrop-blur-md">
                <div 
                  className="select-none touch-none grid gap-1 sm:gap-2"
                  style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
                >
                  {grid.map((row, rIdx) => 
                    row.map((cell, cIdx) => (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        onPointerDownCapture={() => handleCellClick(rIdx, cIdx)}
                        className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-3xl sm:text-4xl rounded-xl transition-all cursor-pointer border-2 select-none
                          ${cell.isWall ? 'bg-slate-800 border-slate-900 shadow-inner' : 
                            cell.isPath ? 'bg-emerald-400 border-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 
                            'bg-white/60 dark:bg-slate-700/60 border-white/40 dark:border-slate-600 hover:bg-emerald-200 dark:hover:bg-emerald-800'
                          }
                        `}
                      >
                        {cell.isStart && !cell.isPath && '🐜'}
                        {cell.isPath && !cell.isStart && !cell.isEnd && <div className="select-none touch-none w-4 h-4 bg-emerald-900/30 dark:bg-emerald-100/50 rounded-full"></div>}
                        {cell.isPath && cell.isStart && '🐜'}
                        {cell.isEnd && '🍎'}
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="select-none touch-none mt-6 text-emerald-800 dark:text-emerald-200 font-semibold tracking-wide">
                Yanındaki karelere tıklayarak ilerle
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md z-10 p-8 bg-white/40 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/50 dark:border-slate-700 shadow-xl">
              <div className="select-none touch-none text-7xl mb-6">🏆</div>
              <h2 className="select-none touch-none text-4xl font-bold text-slate-900 dark:text-white mb-4">Süre Bitti!</h2>
              {isNewRecord && (
                <div className="select-none touch-none mb-4 text-2xl font-black text-yellow-500 animate-bounce">
                  🏆 Yeni Rekor!
                </div>
              )}
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-xl">
                Toplam Skorunuz: <span className="select-none touch-none text-4xl font-black text-emerald-600 dark:text-emerald-400 ml-2 block mt-2">{score}</span>
              </p>
              <button
                onPointerDownCapture={startGame}
                className="select-none touch-none w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
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

export default KarincaYardimi;

