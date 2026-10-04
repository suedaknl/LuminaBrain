import React, { useState, useEffect } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface Cycle {
  id: number;
  steps: string[];
}

const CYCLES: Cycle[] = [
  { id: 1, steps: ['Tohum', 'Filiz', 'Fidan', 'Ağaç'] },
  { id: 2, steps: ['Yumurta', 'Tırtıl', 'Koza', 'Kelebek'] },
  { id: 3, steps: ['Yumurta', 'İribaş', 'Yavru Kurbağa', 'Kurbağa'] },
  { id: 4, steps: ['Bebek', 'Yürümeye Başlayan', 'Çocuk', 'Yetişkin'] },
  { id: 5, steps: ['Buharlaşma', 'Bulut', 'Yağmur', 'Okyanus'] },
  { id: 6, steps: ['Magma', 'Soğuma', 'Püskürük Kayaç', 'Aşınma'] },
  { id: 7, steps: ['Hece', 'Kelime', 'Cümle', 'Paragraf'] },
  { id: 8, steps: ['Dakika', 'Saat', 'Gün', 'Hafta'] }
];

interface OrganikSiraProps {
  onClose?: () => void;
}

const OrganikSira: React.FC<OrganikSiraProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_OrganikSira') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const [currentCycle, setCurrentCycle] = useState<Cycle | null>(null);
  const [shuffledSteps, setShuffledSteps] = useState<string[]>([]);
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const [flash, setFlash] = useState<'red' | 'green' | null>(null);

  const startNextCycle = () => {
    const cycle = CYCLES[Math.floor(Math.random() * CYCLES.length)];
    setCurrentCycle(cycle);
    // Shuffle
    const shuffled = [...cycle.steps].sort(() => Math.random() - 0.5);
    setShuffledSteps(shuffled);
    setSelectedSteps([]);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    startNextCycle();
    setGameState('playing');
  };

  const handleStepClick = (step: string) => {
    if (gameState !== 'playing' || !currentCycle) return;
    if (selectedSteps.includes(step)) return; // Already selected

    const nextExpectedIndex = selectedSteps.length;
    const isCorrect = currentCycle.steps[nextExpectedIndex] === step;

    if (isCorrect) {
      const newSelected = [...selectedSteps, step];
      setSelectedSteps(newSelected);
      setScore(s => s + 5);
      
      if (newSelected.length === currentCycle.steps.length) {
        // Completed the cycle
        setScore(s => s + 15);
        setFlash('green');
        setTimeout(() => setFlash(null), 300);
        setTimeout(() => {
          startNextCycle();
        }, 400);
      }
    } else {
      // Wrong step
      setScore(s => s - 10);
      setFlash('red');
      setTimeout(() => setFlash(null), 300);
      
      // Reset current cycle progress to try again
      setTimeout(() => {
        setSelectedSteps([]);
      }, 300);
    }
  };

  // Timer
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
        localStorage.setItem('highScore_OrganikSira', score.toString());
      }
    }
  }, [gameState, score, highScore]);

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
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-white">Organik Sıra</h1>
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
          {gameState === 'idle' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700 z-10 mt-10">
              <div className="select-none touch-none text-6xl mb-6">🌱</div>
              <h2 className="select-none touch-none text-2xl font-bold text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-300 mb-8 text-lg leading-relaxed">
                Ekranda karışık halde verilen yaşam döngüsü veya mantık aşamalarını doğru büyüme/zaman sırasına göre tıklayarak diz.
              </p>
              <button
                onPointerDownCapture={(e) => { e.stopPropagation(); startGame(); }}
                className="select-none touch-none w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {gameState === 'playing' && currentCycle && (
            <div className={`w-full h-full flex flex-col items-center justify-center rounded-3xl border border-white/10 shadow-inner transition-colors duration-150 p-6 ${
              flash === 'red' ? 'bg-red-500/40' : flash === 'green' ? 'bg-emerald-500/40' : 'bg-slate-900/30'
            }`}>
              
              <h3 className="select-none touch-none text-xl sm:text-2xl text-white/80 font-semibold mb-12">
                Aşamaları Sıraya Diz
              </h3>

              {/* Slots representing the correct order */}
              <div className="select-none touch-none flex gap-4 mb-16 flex-wrap justify-center">
                {currentCycle.steps.map((_, i) => {
                  const isFilled = i < selectedSteps.length;
                  return (
                    <div 
                      key={i} 
                      className={`flex items-center justify-center w-24 sm:w-32 h-24 sm:h-32 rounded-2xl border-2 transition-all duration-300 ${
                        isFilled 
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100 scale-105 shadow-[0_0_15px_rgba(52,211,153,0.3)]' 
                          : 'border-white/10 bg-black/20 text-white/30 border-dashed'
                      }`}
                    >
                      <span className="select-none touch-none font-bold text-sm sm:text-lg text-center px-2">
                        {isFilled ? selectedSteps[i] : (i + 1)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Shuffled choices */}
              <div className="select-none touch-none flex gap-4 flex-wrap justify-center max-w-2xl">
                {shuffledSteps.map((step, i) => {
                  const isSelected = selectedSteps.includes(step);
                  return (
                    <button
                      key={i}
                      onPointerDownCapture={() => handleStepClick(step)}
                      disabled={isSelected}
                      className={`px-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg ${
                        isSelected 
                          ? 'bg-slate-800 text-slate-600 opacity-50 scale-95 border border-white/5 cursor-not-allowed'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 active:scale-95'
                      }`}
                    >
                      {step}
                    </button>
                  );
                })}
              </div>

            </div>
          )}

          {gameState === 'finished' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700 absolute z-20 mt-10">
              <div className="select-none touch-none text-7xl mb-6">⏰</div>
              <h2 className="select-none touch-none text-4xl font-bold text-white mb-4">Süre Bitti!</h2>
              {isNewRecord && (
                <div className="select-none touch-none mb-4 text-2xl font-black text-yellow-400 animate-bounce">
                  🏆 Yeni Rekor!
                </div>
              )}
              <p className="select-none touch-none text-slate-300 mb-8 text-xl">
                Toplam Skorunuz: <span className="select-none touch-none text-4xl font-black text-emerald-400 ml-2 block mt-2">{score}</span>
              </p>
              <button
                onPointerDownCapture={(e) => { e.stopPropagation(); startGame(); }}
                className="select-none touch-none w-full bg-white hover:bg-slate-200 text-slate-900 font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
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

export default OrganikSira;

