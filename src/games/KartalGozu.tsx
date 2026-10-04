import React, { useState, useEffect } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

const EMOJIS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🥝', '🥥', '🍍', '🥭', '🍑', '🍋', '🍐', '🍏', '🍊', '🍅', '🍆', '🥑', '🥦', '🥬', '🌶️', '🌽', '🥕', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🥞', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊'];

interface Item {
  id: number;
  emoji: string;
  found: boolean; // when found, we hide it with animation
}

interface KartalGozuProps {
  onClose?: () => void;
}

const KartalGozu: React.FC<KartalGozuProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() =>
    parseInt(localStorage.getItem('highScore_KartalGozu') || '0', 10)
  );
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const [level, setLevel] = useState(1);
  const [target, setTarget] = useState<string>('');
  const [items, setItems] = useState<Item[]>([]);
  const [flash, setFlash] = useState<'red' | 'green' | null>(null);

  const generateLevel = (currentLevel: number) => {
    const pool = [...EMOJIS].sort(() => Math.random() - 0.5);
    const targetEmoji = pool[0];
    setTarget(targetEmoji);

    // Grid size grows with level: 4 → 5 → 6 → 7
    let gridSize = 4;
    if (currentLevel > 3) gridSize = 5;
    if (currentLevel > 8) gridSize = 6;
    if (currentLevel > 15) gridSize = 7;

    const totalItems = gridSize * gridSize;
    const newItems: Item[] = [];

    // Guarantee target appears exactly once
    newItems.push({ id: 0, emoji: targetEmoji, found: false });

    for (let i = 1; i < totalItems; i++) {
      // Pick a decoy that is different from target
      let decoy: string;
      do {
        decoy = pool[1 + Math.floor(Math.random() * (pool.length - 1))];
      } while (decoy === targetEmoji);
      newItems.push({ id: i, emoji: decoy, found: false });
    }

    setItems(newItems.sort(() => Math.random() - 0.5));
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    setLevel(1);
    generateLevel(1);
    setGameState('playing');
  };

  const handleItemClick = (e: React.PointerEvent, id: number, emoji: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (gameState !== 'playing') return;

    if (emoji === target) {
      // Mark it as found (fade out) then load next level after 250ms
      setItems(prev => prev.map(it => it.id === id ? { ...it, found: true } : it));
      setScore(s => s + 15);
      setFlash('green');
      setTimeout(() => setFlash(null), 150);

      const nextLevel = level + 1;
      setLevel(nextLevel);
      setTimeout(() => generateLevel(nextLevel), 300);
    } else {
      setScore(s => Math.max(0, s - 5));
      setFlash('red');
      setTimeout(() => setFlash(null), 150);
    }
  };

  useEffect(() => {
    let timer: number;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && gameState === 'playing') {
      setGameState('finished');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'finished') {
      if (score > highScore) {
        setHighScore(score);
        setIsNewRecord(true);
        localStorage.setItem('highScore_KartalGozu', score.toString());
      }
    }
  }, [gameState, score, highScore]);

  const gridCols = items.length > 0 ? Math.round(Math.sqrt(items.length)) : 4;

  return (
    <div
      className="select-none touch-none fixed inset-0 z-50 flex flex-col backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-hidden transition-colors duration-150 bg-slate-800/60 dark:bg-slate-900/60"
      style={{ userSelect: 'none' }}
    >
      {onClose && (
        <button
          onPointerDown={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-6 left-6 flex items-center gap-2 text-white hover:bg-white/20 transition font-semibold bg-white/10 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-sm z-20"
        >
          ← Ana Menüye Dön
        </button>
      )}

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto mt-16 sm:mt-0 relative">
        {/* Header */}
        <div className="flex justify-between items-center w-full mb-4 sm:mb-6 pb-4 border-b border-slate-400/30 z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Kartal Gözü</h1>
          <div className="flex gap-2 sm:gap-4">
            <div className="flex flex-col items-center bg-blue-500/20 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-blue-500/30">
              <span className="text-[10px] sm:text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Süre</span>
              <span className={`text-xl sm:text-2xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-blue-100'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="flex flex-col items-center bg-green-500/20 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-green-500/30">
              <span className="text-[10px] sm:text-xs font-bold text-green-200 uppercase tracking-wider mb-1">Skor</span>
              <span className="text-xl sm:text-2xl font-black text-green-100">{score}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col items-center relative overflow-hidden">
          {/* Idle */}
          {gameState === 'idle' && (
            <div className="text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700 z-10 mt-10">
              <div className="text-6xl mb-6">🦅</div>
              <h2 className="text-2xl font-bold text-white mb-3">Nasıl Oynanır?</h2>
              <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                Üstte gösterilen hedef emojisini aşağıdaki kutucuklar arasından en hızlı şekilde bul ve tıkla!
              </p>
              <button
                onPointerDown={(e) => { e.stopPropagation(); startGame(); }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {/* Playing */}
          {gameState === 'playing' && (
            <div
              className={`w-full flex flex-col items-center rounded-3xl border border-white/10 shadow-inner transition-colors duration-150 p-4 sm:p-6 ${
                flash === 'red' ? 'bg-red-500/40' : flash === 'green' ? 'bg-emerald-500/40' : 'bg-slate-900/30'
              }`}
            >
              {/* Target display */}
              <div className="bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-md border border-white/20 flex flex-col items-center gap-1 mb-5 shadow-lg w-full">
                <span className="text-white/70 font-bold uppercase tracking-widest text-xs">Hedefi Bul</span>
                <span className="text-6xl sm:text-7xl drop-shadow-md">{target}</span>
              </div>

              {/* Grid */}
              <div
                className="grid gap-2 sm:gap-3 w-full"
                style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
              >
                {items.map(item => (
                  <button
                    key={item.id}
                    onPointerDown={(e) => handleItemClick(e, item.id, item.emoji)}
                    className={`aspect-square bg-white/5 hover:bg-white/15 active:scale-90 transition-all duration-200 cursor-pointer flex items-center justify-center rounded-xl sm:rounded-2xl border border-white/10 text-2xl sm:text-3xl shadow-sm overflow-hidden ${
                      item.found ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'
                    }`}
                    aria-label={item.emoji}
                    style={{ touchAction: 'none' }}
                  >
                    {item.found ? null : item.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Finished */}
          {gameState === 'finished' && (
            <div className="text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700 absolute z-20 mt-10">
              <div className="text-7xl mb-6">⏰</div>
              <h2 className="text-4xl font-bold text-white mb-4">Süre Bitti!</h2>
              {isNewRecord && (
                <div className="mb-4 text-2xl font-black text-yellow-400 animate-bounce">🏆 Yeni Rekor!</div>
              )}
              <p className="text-slate-300 mb-8 text-xl">
                Toplam Skorunuz:{' '}
                <span className="text-4xl font-black text-indigo-400 ml-2 block mt-2">{score}</span>
              </p>
              <button
                onPointerDown={(e) => { e.stopPropagation(); startGame(); }}
                className="w-full bg-white hover:bg-slate-200 text-slate-900 font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
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

export default KartalGozu;
