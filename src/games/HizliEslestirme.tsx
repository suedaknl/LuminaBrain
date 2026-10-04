import React, { useState, useEffect, useCallback, useRef } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface HizliEslestirmeProps {
  onClose?: () => void;
}

const SYMBOLS = ['🔴', '🔵', '🟢', '🟡', '🟠', '🟣', '⭐', '💎', '🔺', '🔻'];

function pickRandom<T>(arr: T[], exclude?: T): T {
  let pick: T;
  do {
    pick = arr[Math.floor(Math.random() * arr.length)];
  } while (arr.length > 1 && pick === exclude);
  return pick;
}

const HizliEslestirme: React.FC<HizliEslestirmeProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore] = useState(() =>
    parseInt(localStorage.getItem('highScore_HizliEslestirme') || '0', 10)
  );
  const [highScoreState, setHighScoreState] = useState(highScore);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  // The symbol the user must match
  const [currentSymbol, setCurrentSymbol] = useState('');
  // Previous symbol shown (to detect same/different)
  const prevSymbol = useRef('');
  // Options presented to the user
  const [options, setOptions] = useState<string[]>([]);
  // Flash state
  const [flash, setFlash] = useState<'green' | 'red' | null>(null);
  // Animate the symbol when it changes
  const [symbolKey, setSymbolKey] = useState(0);
  const [symbolAnimating, setSymbolAnimating] = useState(false);

  const generateRound = useCallback((prevSym?: string) => {
    const newSymbol = pickRandom(SYMBOLS, prevSym);
    prevSymbol.current = newSymbol;

    // Build 4 options: always include newSymbol, fill rest with random
    const optionSet = new Set<string>([newSymbol]);
    while (optionSet.size < 4) {
      optionSet.add(pickRandom(SYMBOLS));
    }
    const shuffled = Array.from(optionSet).sort(() => Math.random() - 0.5);

    setCurrentSymbol(newSymbol);
    setOptions(shuffled);
    // Trigger bounce animation
    setSymbolKey(k => k + 1);
    setSymbolAnimating(true);
    setTimeout(() => setSymbolAnimating(false), 400);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    setGameState('playing');
    generateRound();
  };

  const handleOption = (sym: string) => {
    if (gameState !== 'playing') return;
    if (sym === currentSymbol) {
      setScore(s => s + 10);
      setFlash('green');
      setTimeout(() => setFlash(null), 150);
      generateRound(currentSymbol);
    } else {
      setScore(s => Math.max(0, s - 5));
      setFlash('red');
      setTimeout(() => setFlash(null), 150);
    }
  };

  // Timer
  useEffect(() => {
    let t: number;
    if (gameState === 'playing' && timeLeft > 0) {
      t = window.setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft <= 0 && gameState === 'playing') {
      setGameState('finished');
    }
    return () => clearInterval(t);
  }, [gameState, timeLeft]);

  // High score
  useEffect(() => {
    if (gameState === 'finished') {
      if (score > highScoreState) {
        setHighScoreState(score);
        setIsNewRecord(true);
        localStorage.setItem('highScore_HizliEslestirme', score.toString());
      }
    }
  }, [gameState, score, highScoreState]);

  const bgClass = flash === 'green'
    ? 'bg-emerald-500/30'
    : flash === 'red'
    ? 'bg-red-500/30'
    : 'bg-white/40 dark:bg-slate-800/40';

  return (
    <div
      className={`select-none touch-none fixed inset-0 z-50 flex flex-col backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-hidden transition-colors duration-150 ${bgClass}`}
    >
      {onClose && (
        <button
          onPointerDown={e => { e.stopPropagation(); onClose(); }}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-800 dark:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50 transition font-semibold bg-white/30 dark:bg-slate-800/50 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm z-20"
        >
          ← Ana Menüye Dön
        </button>
      )}

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xl mx-auto mt-16 sm:mt-0">
        {/* Header */}
        <div className="flex justify-between items-center w-full mb-6 pb-4 border-b border-slate-400/30 dark:border-slate-500/30">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Hızlı Eşleştirme</h1>
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
          </div>
        </div>

        {/* Idle screen */}
        {gameState === 'idle' && (
          <div className="text-center animate-fade-in w-full max-w-md">
            <div className="text-6xl mb-6">⚡</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Nasıl Oynanır?</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
              Üstte büyük bir sembol görünür. Aşağıdaki 4 seçenekten <strong>aynısını</strong> hızlıca bul ve bas!
            </p>
            <button
              onPointerDown={e => { e.stopPropagation(); startGame(); }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 text-xl"
            >
              Oyuna Başla
            </button>
          </div>
        )}

        {/* Playing screen */}
        {gameState === 'playing' && (
          <div className="flex flex-col items-center w-full gap-8">
            {/* Target symbol with bounce animation on change */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Eşleştir</span>
              <div
                key={symbolKey}
                className={`text-8xl sm:text-9xl transition-transform duration-300 ${symbolAnimating ? 'animate-bounce scale-125' : 'scale-100'}`}
                style={{ filter: symbolAnimating ? 'drop-shadow(0 0 20px rgba(99,102,241,0.7))' : 'none' }}
              >
                {currentSymbol}
              </div>
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-sm">
              {options.map((sym, idx) => (
                <button
                  key={idx}
                  onPointerDown={e => { e.stopPropagation(); handleOption(sym); }}
                  className="aspect-square bg-white/20 dark:bg-slate-800/40 hover:bg-white/40 dark:hover:bg-slate-700/60 active:scale-90 transition-all duration-100 rounded-2xl border border-white/30 dark:border-slate-600 text-5xl sm:text-6xl flex items-center justify-center shadow-md backdrop-blur-sm"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Finished screen */}
        {gameState === 'finished' && (
          <div className="text-center animate-fade-in w-full max-w-md">
            <div className="text-7xl mb-6">🏆</div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Süre Bitti!</h2>
            {isNewRecord && (
              <div className="mb-4 text-2xl font-black text-yellow-500 animate-bounce">🏆 Yeni Rekor!</div>
            )}
            <p className="text-slate-700 dark:text-slate-300 mb-8 text-xl">
              Toplam Skorunuz:{' '}
              <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 ml-2 block mt-2">{score}</span>
            </p>
            <button
              onPointerDown={e => { e.stopPropagation(); startGame(); }}
              className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
            >
              Tekrar Oyna
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HizliEslestirme;
