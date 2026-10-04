import React, { useState, useEffect, useCallback } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface CiftleriBulProps {
  onClose?: () => void;
}

const SYMBOLS = ['🍎', '🍌', '🍒', '🍇', '🍉', '🍓', '🥑', '🍍'];

const CiftleriBul: React.FC<CiftleriBulProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  
  // Stopwatch based score (lower is better)
  const [bestTime, setBestTime] = useState(() => {
    const saved = localStorage.getItem('bestTime_CiftleriBul');
    return saved ? parseInt(saved, 10) : null;
  });
  
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const startNewRound = useCallback(() => {
    const deck = [...SYMBOLS, ...SYMBOLS];
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    setCards(deck.map((symbol, idx) => ({
      id: idx,
      symbol,
      isFlipped: false,
      isMatched: false
    })));
    setFlippedIndices([]);
    setIsChecking(false);
  }, []);

  const startGame = () => {
    setTimeElapsed(0);
    setIsNewRecord(false);
    startNewRound();
    setGameState('playing');
  };

  const handleCardClick = (index: number) => {
    if (gameState !== 'playing' || isChecking) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setIsChecking(true);
      const [firstIdx, secondIdx] = newFlippedIndices;
      
      if (newCards[firstIdx].symbol === newCards[secondIdx].symbol) {
        // Eşleşti
        setTimeout(() => {
          setCards(prev => {
            const matched = [...prev];
            matched[firstIdx].isMatched = true;
            matched[secondIdx].isMatched = true;
            return matched;
          });
          setFlippedIndices([]);
          setIsChecking(false);
          
          // Oyun bitti mi kontrol et
          setCards(prev => {
            if (prev.every(c => c.isMatched)) {
              setGameState('finished');
            }
            return prev;
          });
        }, 500);
      } else {
        // Eşleşmedi
        setTimeout(() => {
          setCards(prev => {
            const unmatched = [...prev];
            unmatched[firstIdx].isFlipped = false;
            unmatched[secondIdx].isFlipped = false;
            return unmatched;
          });
          setFlippedIndices([]);
          setIsChecking(false);
        }, 1000);
      }
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
        localStorage.setItem('bestTime_CiftleriBul', timeElapsed.toString());
      } else {
        setIsNewRecord(false);
      }
    } else if (gameState === 'idle') {
      setIsNewRecord(false);
    }
  }, [gameState, timeElapsed, bestTime]);

  return (
    <div className="select-none touch-none fixed inset-0 z-50 flex flex-col bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-y-auto transition-colors duration-300">
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
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Çiftleri Bul</h1>
          <div className="select-none touch-none flex gap-2 sm:gap-4">
            <div className="select-none touch-none flex flex-col items-center bg-blue-500/10 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-blue-500/20">
              <span className="select-none touch-none text-[10px] sm:text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">Geçen Süre</span>
              <span className="select-none touch-none text-xl sm:text-2xl font-black text-blue-900 dark:text-blue-100">
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
              <div className="select-none touch-none w-24 h-24 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-indigo-500/30">
                <span className="select-none touch-none text-4xl font-black">🃏</span>
              </div>
              <h2 className="select-none touch-none text-2xl font-bold text-slate-900 dark:text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                Kapalı kartlara tıklayarak altındaki sembolleri görün. Aynı olanları eşleştirerek tüm tabloyu en kısa sürede temizleyin!
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
            <div className="select-none touch-none grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-sm sm:max-w-md p-3 sm:p-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg animate-fade-in">
              {cards.map((card, index) => (
                <button
                  key={card.id}
                  onPointerDownCapture={() => handleCardClick(index)}
                  className={`aspect-square rounded-xl sm:rounded-2xl flex items-center justify-center text-3xl sm:text-4xl transition-all duration-300 transform perspective-1000 ${
                    card.isFlipped || card.isMatched 
                      ? 'bg-white dark:bg-slate-700 shadow-inner rotate-y-180' 
                      : 'bg-indigo-500 shadow-md hover:bg-indigo-400 active:scale-95'
                  } ${card.isMatched ? 'opacity-50' : 'opacity-100'}`}
                >
                  <div className={`transition-opacity duration-300 ${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'}`}>
                    {card.symbol}
                  </div>
                </button>
              ))}
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

export default CiftleriBul;

