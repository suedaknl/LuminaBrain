import React, { useState, useEffect, useCallback } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

type Rule = 'BLUE' | 'RED' | 'EVEN' | 'ODD';

interface Option {
  id: number;
  value: number;
  color: 'blue' | 'red';
}

interface ZihinVitesiProps {
  onClose?: () => void;
}

const ZihinVitesi: React.FC<ZihinVitesiProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_ZihinVitesi') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [rule, setRule] = useState<Rule>('EVEN');
  const [options, setOptions] = useState<Option[]>([]);
  const [flashState, setFlashState] = useState<'correct' | 'wrong' | null>(null);

  const generateRound = useCallback(() => {
    const rules: Rule[] = ['BLUE', 'RED', 'EVEN', 'ODD'];
    const currentRule = rules[Math.floor(Math.random() * rules.length)];
    setRule(currentRule);

    // Seçenekleri oluştur
    // Öyle iki seçenek oluşturmalıyız ki, biri kurala uysun, diğeri uymasın.
    let correctOption: Option;
    let wrongOption: Option;

    const randomValue = (isEven: boolean) => {
      const v = Math.floor(Math.random() * 9) + 1; // 1-9
      if ((v % 2 === 0) === isEven) return v;
      return v < 9 ? v + 1 : v - 1;
    };

    if (currentRule === 'BLUE') {
      correctOption = { id: 1, value: randomValue(Math.random() > 0.5), color: 'blue' };
      wrongOption = { id: 2, value: randomValue(Math.random() > 0.5), color: 'red' };
    } else if (currentRule === 'RED') {
      correctOption = { id: 1, value: randomValue(Math.random() > 0.5), color: 'red' };
      wrongOption = { id: 2, value: randomValue(Math.random() > 0.5), color: 'blue' };
    } else if (currentRule === 'EVEN') {
      correctOption = { id: 1, value: randomValue(true), color: Math.random() > 0.5 ? 'blue' : 'red' };
      wrongOption = { id: 2, value: randomValue(false), color: Math.random() > 0.5 ? 'blue' : 'red' };
    } else {
      // ODD
      correctOption = { id: 1, value: randomValue(false), color: Math.random() > 0.5 ? 'blue' : 'red' };
      wrongOption = { id: 2, value: randomValue(true), color: Math.random() > 0.5 ? 'blue' : 'red' };
    }

    const shuffled = [correctOption, wrongOption].sort(() => Math.random() - 0.5);
    setOptions(shuffled);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    generateRound();
    setGameState('playing');
  };

  const checkAnswer = (opt: Option) => {
    let isCorrect = false;
    if (rule === 'BLUE' && opt.color === 'blue') isCorrect = true;
    if (rule === 'RED' && opt.color === 'red') isCorrect = true;
    if (rule === 'EVEN' && opt.value % 2 === 0) isCorrect = true;
    if (rule === 'ODD' && opt.value % 2 !== 0) isCorrect = true;

    if (isCorrect) {
      setScore(s => s + 10);
      setFlashState('correct');
    } else {
      setScore(s => Math.max(0, s - 5));
      setFlashState('wrong');
    }
    
    setTimeout(() => setFlashState(null), 300);
    generateRound();
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
        localStorage.setItem('highScore_ZihinVitesi', score.toString());
      } else {
        setIsNewRecord(false);
      }
    } else if (gameState === 'idle') {
      setIsNewRecord(false);
    }
  }, [gameState, score, highScore]);

  const getBackgroundClass = () => {
    if (flashState === 'correct') return 'bg-green-500/30 dark:bg-green-600/30';
    if (flashState === 'wrong') return 'bg-red-500/30 dark:bg-red-600/30 animate-shake';
    return 'bg-purple-500/20 dark:bg-purple-900/30';
  };

  const getRuleText = () => {
    switch(rule) {
      case 'BLUE': return 'MAVİ Olanı Seç';
      case 'RED': return 'KIRMIZI Olanı Seç';
      case 'EVEN': return 'ÇİFT Sayıyı Seç';
      case 'ODD': return 'TEK Sayıyı Seç';
    }
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
        <div className="select-none touch-none flex justify-between items-center w-full mb-4 sm:mb-8 pb-4 border-b border-purple-500/30 dark:border-purple-500/30 z-10">
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Zihin Vitesi</h1>
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
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md z-10 p-6 bg-white/40 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/50 dark:border-slate-700">
              <div className="select-none touch-none text-6xl mb-6">⚙️</div>
              <h2 className="select-none touch-none text-2xl font-bold text-slate-900 dark:text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                Ekranda beliren <strong>KURALA</strong> göre doğru seçeneği bulun. Kurallar aniden değişebilir, hızlıca adapte olun!
              </p>
              <button
                onPointerDownCapture={startGame}
                className="select-none touch-none w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="select-none touch-none w-full flex flex-col items-center animate-fade-in">
              <div className="select-none touch-none mb-12 text-center">
                <div className="select-none touch-none text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Geçerli Kural</div>
                <h2 
                  key={rule}
                  className="select-none touch-none text-3xl sm:text-5xl font-black text-slate-900 dark:text-white bg-white/50 dark:bg-slate-900/50 px-8 py-4 rounded-2xl border border-white/50 shadow-sm inline-block animate-fade-in animate-bounce"
                >
                  {getRuleText()}
                </h2>
              </div>
              
              <div className="select-none touch-none flex gap-6 sm:gap-12">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    onPointerDownCapture={() => checkAnswer(opt)}
                    className={`w-32 h-32 sm:w-48 sm:h-48 rounded-3xl flex items-center justify-center text-6xl sm:text-8xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all border-4 ${opt.color === 'blue' ? 'bg-blue-500 text-white border-blue-400 shadow-blue-500/50' : 'bg-red-500 text-white border-red-400 shadow-red-500/50'}`}
                  >
                    {opt.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md z-10 p-8 bg-white/40 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/50 dark:border-slate-700">
              <div className="select-none touch-none text-7xl mb-6">🏆</div>
              <h2 className="select-none touch-none text-4xl font-bold text-slate-900 dark:text-white mb-4">Süre Bitti!</h2>
              {isNewRecord && (
                <div className="select-none touch-none mb-4 text-2xl font-black text-yellow-500 animate-bounce">
                  🏆 Yeni Rekor!
                </div>
              )}
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-xl">
                Toplam Skorunuz: <span className="select-none touch-none text-4xl font-black text-purple-600 dark:text-purple-400 ml-2 block mt-2">{score}</span>
              </p>
              <button
                onPointerDownCapture={startGame}
                className="select-none touch-none w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
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

export default ZihinVitesi;

