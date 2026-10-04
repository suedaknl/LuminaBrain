import React, { useState, useEffect, useRef } from 'react';

type GameState = 'idle' | 'showing' | 'waiting' | 'finished';

const FOODS = [
  { id: 1, emoji: '🍔', name: 'Burger' },
  { id: 2, emoji: '🍟', name: 'Patates' },
  { id: 3, emoji: '🥤', name: 'Kola' },
  { id: 4, emoji: '🍦', name: 'Dondurma' },
  { id: 5, emoji: '🍕', name: 'Pizza' },
  { id: 6, emoji: '🍩', name: 'Donut' },
  { id: 7, emoji: '🌭', name: 'Sosisli' },
  { id: 8, emoji: '🌮', name: 'Tako' },
  { id: 9, emoji: '🥗', name: 'Salata' }
];

interface ServisHafizasiProps {
  onClose?: () => void;
}

const ServisHafizasi: React.FC<ServisHafizasiProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_ServisHafizasi') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [level, setLevel] = useState(1);
  const [order, setOrder] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [flash, setFlash] = useState<'red' | 'green' | null>(null);
  
  const timeoutRefs = useRef<number[]>([]);

  const clearTimeouts = () => {
    timeoutRefs.current.forEach(t => window.clearTimeout(t));
    timeoutRefs.current = [];
  };

  const startLevel = (currentLevel: number) => {
    clearTimeouts();
    setPlayerInput([]);
    setFlash(null);

    const orderLength = Math.min(3 + Math.floor((currentLevel - 1) / 2), 7);
    const newOrder: number[] = [];
    for (let i = 0; i < orderLength; i++) {
      const randomFood = FOODS[Math.floor(Math.random() * FOODS.length)];
      newOrder.push(randomFood.id);
    }
    
    setOrder(newOrder);
    setGameState('showing');

    const showTime = Math.max(1500, 4000 - currentLevel * 200);
    const t = window.setTimeout(() => {
      setGameState('waiting');
    }, showTime);
    timeoutRefs.current.push(t);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    setLevel(1);
    startLevel(1);
  };

  const handleFoodClick = (foodId: number) => {
    if (gameState !== 'waiting') return;

    const newPlayerInput = [...playerInput, foodId];
    const currentIndex = playerInput.length;
    
    if (order[currentIndex] === foodId) {
      // Doğru seçim
      setPlayerInput(newPlayerInput);
      setScore(s => s + 5);

      if (newPlayerInput.length === order.length) {
        // Sipariş tamamlandı
        setScore(s => s + 20);
        setFlash('green');
        setLevel(l => l + 1);
        const t = window.setTimeout(() => startLevel(level + 1), 1000);
        timeoutRefs.current.push(t);
      }
    } else {
      // Yanlış seçim
      setScore(s => Math.max(0, s - 15));
      setFlash('red');
      
      const t = window.setTimeout(() => startLevel(Math.max(1, level - 1)), 1000);
      timeoutRefs.current.push(t);
    }
  };

  useEffect(() => {
    let timer: number;
    if ((gameState === 'showing' || gameState === 'waiting') && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && gameState !== 'idle' && gameState !== 'finished') {
      setGameState('finished');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'finished') {
      if (score > highScore) {
        setHighScore(score);
        setIsNewRecord(true);
        localStorage.setItem('highScore_ServisHafizasi', score.toString());
      }
    }
  }, [gameState, score, highScore]);

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  return (
    <div className="select-none touch-none fixed inset-0 z-50 flex flex-col backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-hidden transition-colors duration-150 bg-slate-800/60 dark:bg-slate-900/60 select-none">
      {onClose && (
        <button
          onPointerDownCapture={(e) => { e.stopPropagation(); onClose(); }}
          className="select-none touch-none absolute top-6 left-6 flex items-center gap-2 text-slate-800 dark:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50 transition font-semibold bg-white/30 dark:bg-slate-800/50 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm z-20"
        >
          ← Ana Menüye Dön
        </button>
      )}
      
      <div className="select-none touch-none flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto mt-16 sm:mt-0 relative">
        <div className="select-none touch-none flex justify-between items-center w-full mb-4 sm:mb-6 pb-4 border-b border-slate-400/30 dark:border-slate-500/30 z-10">
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-white">Servis Hafızası</h1>
          <div className="select-none touch-none flex gap-2 sm:gap-4">
            <div className="select-none touch-none flex flex-col items-center bg-blue-500/20 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-blue-500/30">
              <span className="select-none touch-none text-[10px] sm:text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Süre</span>
              <span className={`text-xl sm:text-2xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-blue-100'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="select-none touch-none flex flex-col items-center bg-green-500/20 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-green-500/30">
              <span className="select-none touch-none text-[10px] sm:text-xs font-bold text-green-200 uppercase tracking-wider mb-1">Skor</span>
              <span className={`text-xl sm:text-2xl font-black text-green-100`}>{score}</span>
            </div>
          </div>
        </div>

        <div className="select-none touch-none flex-1 w-full flex flex-col items-center relative overflow-hidden">
          {gameState === 'idle' && score === 0 && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700 z-10 mt-10">
              <div className="select-none touch-none text-6xl mb-6">📝</div>
              <h2 className="select-none touch-none text-2xl font-bold text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-300 mb-8 text-lg leading-relaxed">
                Müşterilerin sipariş ettiği yemekleri ekranda kısa süre göreceksin. Gizlendikten sonra tepsiyi TAM olarak aynı sırayla hazırla!
              </p>
              <button
                onPointerDownCapture={(e) => { e.stopPropagation(); startGame(); }}
                className="select-none touch-none w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {(gameState === 'showing' || gameState === 'waiting' || flash) && (
            <div className={`w-full h-full flex flex-col items-center justify-center relative rounded-3xl border border-white/10 shadow-inner transition-colors duration-150 p-6 ${
              flash === 'red' ? 'bg-red-500/40' : flash === 'green' ? 'bg-emerald-500/40' : 'bg-slate-900/30'
            }`}>
              
              <div className="select-none touch-none h-32 mb-8 flex items-center justify-center w-full max-w-2xl bg-black/20 rounded-2xl border-2 border-white/10 shadow-inner relative">
                {gameState === 'showing' ? (
                  <div className="select-none touch-none flex gap-4 animate-fade-in flex-wrap justify-center p-4">
                    {order.map((id, index) => (
                      <div key={index} className="select-none touch-none text-5xl animate-bounce" style={{ animationDelay: `${index * 0.1}s` }}>
                        {FOODS.find(f => f.id === id)?.emoji}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="select-none touch-none flex gap-4 flex-wrap justify-center p-4">
                    {order.map((_, index) => (
                      <div key={index} className="select-none touch-none w-16 h-16 rounded-xl bg-white/10 border-2 border-dashed border-white/20 flex items-center justify-center text-4xl">
                        {playerInput[index] ? FOODS.find(f => f.id === playerInput[index])?.emoji : '?'}
                      </div>
                    ))}
                  </div>
                )}
                <div className="select-none touch-none absolute -top-4 bg-orange-500 px-4 py-1 rounded-full text-sm font-bold text-orange-950 uppercase tracking-widest shadow-lg">
                  {gameState === 'showing' ? 'Siparişi Ezberle!' : 'Tepsiyi Hazırla!'}
                </div>
              </div>
              
              {/* Menu Options */}
              <div className={`grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4 max-w-3xl transition-opacity duration-300 ${gameState === 'showing' ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
                {FOODS.map(food => (
                  <button
                    key={food.id}
                    onPointerDownCapture={() => handleFoodClick(food.id)}
                    className="select-none touch-none flex flex-col items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 p-4 rounded-2xl transition-all duration-200 active:scale-95 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  >
                    <span className="select-none touch-none text-4xl sm:text-5xl">{food.emoji}</span>
                    <span className="select-none touch-none text-xs sm:text-sm font-bold text-white/80">{food.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700 absolute z-20 mt-10">
              <div className="select-none touch-none text-7xl mb-6">⏰</div>
              <h2 className="select-none touch-none text-4xl font-bold text-white mb-4">Mesai Bitti!</h2>
              {isNewRecord && (
                <div className="select-none touch-none mb-4 text-2xl font-black text-yellow-400 animate-bounce">
                  🏆 Yeni Rekor!
                </div>
              )}
              <p className="select-none touch-none text-slate-300 mb-8 text-xl">
                Toplam Skorunuz: <span className="select-none touch-none text-4xl font-black text-orange-400 ml-2 block mt-2">{score}</span>
              </p>
              <button
                onPointerDownCapture={(e) => { e.stopPropagation(); startGame(); }}
                className="select-none touch-none w-full bg-white hover:bg-slate-200 text-slate-900 font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Yeniden Başla
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServisHafizasi;

