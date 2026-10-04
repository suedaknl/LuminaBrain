import React, { useState, useEffect, useCallback } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface DengeDenklemiProps {
  onClose?: () => void;
}

const DengeDenklemi: React.FC<DengeDenklemiProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_DengeDenklemi') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [equation, setEquation] = useState<{ left: string, right: string, answer: number, options: number[] } | null>(null);
  const [shake, setShake] = useState(false); // For wrong answer animation

  const [wrongOption, setWrongOption] = useState<number | null>(null);

  const generateEquation = useCallback(() => {
    // Generate a simple equation like A + B = C + D, where one is missing
    const operators = ['+', '-'];
    const opLeft = operators[Math.floor(Math.random() * operators.length)];
    const opRight = operators[Math.floor(Math.random() * operators.length)];
    
    let a, b, c, d;
    if (Math.random() > 0.5) {
        // A + B = C (d is empty)
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * 20) + 1;
        const leftTotal = opLeft === '+' ? a + b : Math.max(a, b) - Math.min(a, b);
        if (opLeft === '-') {
            a = Math.max(a, b);
            b = a - leftTotal;
        }
        c = leftTotal;
        
        // Hide one part
        const hidePart = Math.floor(Math.random() * 3);
        let answer = 0;
        let leftStr = '', rightStr = `${c}`;
        
        if (hidePart === 0) {
            answer = a;
            leftStr = `? ${opLeft} ${b}`;
        } else if (hidePart === 1) {
            answer = b;
            leftStr = `${a} ${opLeft} ?`;
        } else {
            answer = c;
            leftStr = `${a} ${opLeft} ${b}`;
            rightStr = '?';
        }
        
        return { left: leftStr, right: rightStr, answer };
    } else {
        // A + B = C + D
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * 20) + 1;
        const total = opLeft === '+' ? a + b : Math.max(a, b) - Math.min(a, b);
        if (opLeft === '-') {
            a = Math.max(a, b);
            b = a - total;
        }
        
        c = Math.floor(Math.random() * total);
        d = total - c;
        if (opRight === '-') {
            c = total + d;
        }

        const hidePart = Math.floor(Math.random() * 4);
        let answer = 0;
        let leftStr = `${a} ${opLeft} ${b}`;
        let rightStr = `${c} ${opRight} ${d}`;
        
        if (hidePart === 0) {
            answer = a; leftStr = `? ${opLeft} ${b}`;
        } else if (hidePart === 1) {
            answer = b; leftStr = `${a} ${opLeft} ?`;
        } else if (hidePart === 2) {
            answer = c; rightStr = `? ${opRight} ${d}`;
        } else {
            answer = d; rightStr = `${c} ${opRight} ?`;
        }

        return { left: leftStr, right: rightStr, answer };
    }
  }, []);

  const generateOptions = (answer: number) => {
    const options = new Set<number>();
    options.add(answer);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 11) - 5; // -5 to +5
      if (offset !== 0 && answer + offset >= 0) {
        options.add(answer + offset);
      }
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
  };

  const nextQuestion = useCallback(() => {
    const { left, right, answer } = generateEquation();
    setEquation({ left, right, answer, options: generateOptions(answer) });
  }, [generateEquation]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    setGameState('playing');
    setWrongOption(null);
    nextQuestion();
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
        localStorage.setItem('highScore_DengeDenklemi', score.toString());
      }
    }
  }, [gameState, score, highScore]);

  const handleAnswer = (option: number) => {
    if (gameState !== 'playing' || !equation) return;
    
    if (option === equation.answer) {
      setScore(s => s + 10);
      setWrongOption(null);
      nextQuestion();
    } else {
      setShake(true);
      setWrongOption(option);
      setTimeout(() => {
        setShake(false);
        setWrongOption(null);
      }, 500);
      setScore(s => s - 5);
    }
  };

  return (
    <div className="select-none touch-none fixed inset-0 z-50 flex flex-col backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-hidden transition-colors duration-150 bg-slate-800/60 dark:bg-slate-900/60">
      {onClose && (
        <button
          onPointerDownCapture={onClose}
          className="select-none touch-none absolute top-6 left-6 flex items-center gap-2 text-slate-800 dark:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50 transition font-semibold bg-white/30 dark:bg-slate-800/50 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm z-20"
        >
          ← Ana Menüye Dön
        </button>
      )}
      
      <div className="select-none touch-none flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto mt-16 sm:mt-0 relative">
        <div className="select-none touch-none flex justify-between items-center w-full mb-4 sm:mb-6 pb-4 border-b border-slate-400/30 dark:border-slate-500/30 z-10">
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-white">Denge Denklemi</h1>
          <div className="select-none touch-none flex gap-2 sm:gap-4">
            <div className="select-none touch-none flex flex-col items-center bg-blue-500/20 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-blue-500/30">
              <span className="select-none touch-none text-[10px] sm:text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Süre</span>
              <span className={`text-xl sm:text-2xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-blue-100'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="select-none touch-none flex flex-col items-center bg-green-500/20 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-green-500/30">
              <span className="select-none touch-none text-[10px] sm:text-xs font-bold text-green-200 uppercase tracking-wider mb-1">Skor</span>
              <span className={`text-xl sm:text-2xl font-black ${score < 0 ? 'text-red-300' : 'text-green-100'}`}>{score}</span>
            </div>
          </div>
        </div>

        <div className="select-none touch-none flex-1 w-full flex flex-col items-center justify-center relative">
          {gameState === 'idle' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700">
              <div className="select-none touch-none text-6xl mb-6">⚖️</div>
              <h2 className="select-none touch-none text-2xl font-bold text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-300 mb-8 text-lg leading-relaxed">
                Teraziyi dengede tutmak için eksik olan sayıyı en hızlı şekilde bul. Yanlış cevaplar puan kaybettirir!
              </p>
              <button
                onPointerDownCapture={startGame}
                className="select-none touch-none w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {gameState === 'playing' && equation && (
            <div className={`w-full max-w-2xl flex flex-col items-center ${shake ? 'animate-shake' : ''}`}>
              {/* Seesaw Visual */}
              <div className="select-none touch-none w-full mb-12 relative flex justify-center items-end h-40">
                <div className="select-none touch-none absolute w-full h-2 bg-slate-400 rounded-full bottom-0 left-0"></div>
                <div className="select-none touch-none w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px] border-b-slate-500 absolute -bottom-[30px]"></div>
                
                <div className="select-none touch-none absolute left-[10%] bottom-4 bg-indigo-500/30 border-2 border-indigo-400 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-xl w-[35%] flex justify-center">
                  <span className="select-none touch-none text-3xl sm:text-4xl font-black text-white">{equation.left}</span>
                </div>
                
                <div className="select-none touch-none absolute right-[10%] bottom-4 bg-teal-500/30 border-2 border-teal-400 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-xl w-[35%] flex justify-center">
                  <span className="select-none touch-none text-3xl sm:text-4xl font-black text-white">{equation.right}</span>
                </div>
              </div>
              
              {/* Options */}
              <div className="select-none touch-none grid grid-cols-2 gap-4 w-full max-w-md mt-16">
                {equation.options.map((opt, i) => {
                  const isWrong = wrongOption === opt;
                  return (
                    <button
                      key={i}
                      onPointerDownCapture={() => handleAnswer(opt)}
                      className={`${isWrong ? 'bg-red-500/80 border-red-500 scale-95' : 'bg-white/10 hover:bg-white/20 border-white/20'} active:scale-95 text-white border font-bold py-4 sm:py-6 rounded-2xl text-2xl sm:text-3xl transition-all duration-150 backdrop-blur-md shadow-lg`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700 absolute z-20">
              <div className="select-none touch-none text-7xl mb-6">⏰</div>
              <h2 className="select-none touch-none text-4xl font-bold text-white mb-4">Süre Bitti!</h2>
              {isNewRecord && (
                <div className="select-none touch-none mb-4 text-2xl font-black text-yellow-400 animate-bounce">
                  🏆 Yeni Rekor!
                </div>
              )}
              <p className="select-none touch-none text-slate-300 mb-8 text-xl">
                Toplam Skorunuz: <span className="select-none touch-none text-4xl font-black text-indigo-400 ml-2 block mt-2">{score}</span>
              </p>
              <button
                onPointerDownCapture={startGame}
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

export default DengeDenklemi;

