import React, { useState, useEffect, useCallback } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

const COLORS = [
  { name: 'KIRMIZI', hex: '#ef4444' }, // text-red-500 equivalent
  { name: 'MAVİ', hex: '#3b82f6' },    // text-blue-500
  { name: 'YEŞİL', hex: '#22c55e' },   // text-green-500
  { name: 'SARI', hex: '#eab308' },    // text-yellow-500
  { name: 'MOR', hex: '#a855f7' },     // text-purple-500
  { name: 'SİYAH', hex: '#1f2937' }    // text-gray-800
];

interface StroopTestProps {
  onClose?: () => void;
}

const StroopTest: React.FC<StroopTestProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_StroopTest') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  
  const [word, setWord] = useState(COLORS[0]);
  const [color, setColor] = useState(COLORS[0]);

  const generateNewRound = useCallback(() => {
    const randomWord = COLORS[Math.floor(Math.random() * COLORS.length)];
    let randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    // %70 ihtimalle kelimenin rengiyle metni farklı olsun (Stroop etkisi)
    if (Math.random() > 0.3) {
        while(randomColor.hex === randomWord.hex) {
            randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        }
    }

    setWord(randomWord);
    setColor(randomColor);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameState('playing');
    generateNewRound();
  };

  const handleColorSelect = (selectedHex: string) => {
    if (gameState !== 'playing') return;

    if (selectedHex === color.hex) {
      setScore(prev => prev + 10);
    } else {
      setScore(prev => Math.max(0, prev - 5)); // Yanlış cevapta puan düşer, ama negatif olmaz
    }
    generateNewRound();
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
        localStorage.setItem('highScore_StroopTest', score.toString());
      } else {
        setIsNewRecord(false);
      }
    } else if (gameState === 'idle') {
      setIsNewRecord(false);
    }
  }, [gameState, score, highScore]);

  return (
    <div className="select-none touch-none fixed inset-0 z-50 flex flex-col bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-y-auto">
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
        <div className="select-none touch-none flex justify-between items-center w-full mb-10 pb-6 border-b border-slate-300/30 dark:border-slate-500/30">
          <h1 className="select-none touch-none text-2xl font-bold text-slate-900 dark:text-white">Renk Tuzağı</h1>
          <div className="select-none touch-none flex gap-4">
            <div className="select-none touch-none flex flex-col items-center bg-blue-500/10 px-4 py-2 rounded-xl backdrop-blur-md border border-blue-500/20">
              <span className="select-none touch-none text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">Süre</span>
              <span className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-blue-900 dark:text-blue-100'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="select-none touch-none flex flex-col items-center bg-green-500/10 px-4 py-2 rounded-xl backdrop-blur-md border border-green-500/20">
              <span className="select-none touch-none text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider mb-1">Skor</span>
              <span className="select-none touch-none text-2xl font-black text-green-900 dark:text-green-100">{score}</span>
            </div>
            <div className="select-none touch-none flex flex-col items-center bg-yellow-500/10 px-4 py-2 rounded-xl backdrop-blur-md border border-yellow-500/20 hidden sm:flex">
              <span className="select-none touch-none text-xs font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-wider mb-1">En İyi</span>
              <span className="select-none touch-none text-2xl font-black text-yellow-900 dark:text-yellow-100">{highScore}</span>
            </div>
          </div>
        </div>

        {/* Game Content Area */}
        <div className="select-none touch-none flex flex-col items-center justify-center min-h-[350px] w-full">
          {gameState === 'idle' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md">
              <div className="select-none touch-none w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-indigo-500/30">
                <svg className="select-none touch-none w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="select-none touch-none text-2xl font-bold text-slate-900 dark:text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                Ekranda yazan kelimeyi <strong>değil</strong>, kelimenin <strong>hangi renkte</strong> yazıldığını bul ve aşağıdaki butonlardan seç.
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
            <div className="select-none touch-none w-full flex flex-col items-center">
              <div className="select-none touch-none flex items-center justify-center h-48 w-full max-w-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-3xl mb-10 border border-slate-200 dark:border-slate-700 shadow-xl">
                <span 
                  className="select-none touch-none text-6xl sm:text-7xl md:text-8xl font-black uppercase tracking-widest drop-shadow-md transition-colors duration-150"
                  style={{ color: color.hex }}
                >
                  {word.name}
                </span>
              </div>
              
              <div className="select-none touch-none grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-xl">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    onPointerDownCapture={() => handleColorSelect(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className="select-none touch-none h-20 sm:h-24 rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 border-2 border-transparent hover:border-white/50 focus:outline-none focus:ring-4 focus:ring-indigo-200 backdrop-blur-md opacity-90 hover:opacity-100"
                    aria-label={`${c.name} rengini seç`}
                  />
                ))}
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md">
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

export default StroopTest;

