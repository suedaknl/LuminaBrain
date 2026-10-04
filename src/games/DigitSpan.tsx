import React, { useState, useEffect, useRef } from 'react';

type GameState = 'idle' | 'showing' | 'typing' | 'finished';

interface DigitSpanProps {
  onClose?: () => void;
}

const DigitSpan: React.FC<DigitSpanProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_DigitSpan') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [digitCount, setDigitCount] = useState(2);
  const [currentSequence, setCurrentSequence] = useState('');
  const [userInput, setUserInput] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [flashState, setFlashState] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startNewRound = (length: number) => {
    // Rastgele 'length' basamaklı sayı üret
    let seq = '';
    for (let i = 0; i < length; i++) {
      seq += Math.floor(Math.random() * 10).toString();
    }
    setCurrentSequence(seq);
    setUserInput('');
    setGameState('showing');

    // Uzunluğa göre ekranda tutma süresi (her rakam için 0.8 saniye)
    const showTime = length * 800;
    setTimeout(() => {
      setGameState(curr => curr === 'showing' ? 'typing' : curr);
    }, showTime);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setDigitCount(2);
    setCorrectAnswers(0);
    setIsNewRecord(false);
    startNewRound(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameState !== 'typing') return;

    if (userInput === currentSequence) {
      setScore(prev => prev + 10);
      const newCorrect = correctAnswers + 1;
      setCorrectAnswers(newCorrect);
      
      setFlashState('correct');
      setTimeout(() => setFlashState(null), 400);

      // Her 2 doğruda bir seviye artsın
      if (newCorrect % 2 === 0) {
        setDigitCount(prev => prev + 1);
        startNewRound(digitCount + 1);
      } else {
        startNewRound(digitCount);
      }
    } else {
      setScore(prev => prev - 5);
      setFlashState('wrong');
      setTimeout(() => setFlashState(null), 400);
      startNewRound(digitCount); // aynı zorlukta yeni sayı
    }
  };

  useEffect(() => {
    if (gameState === 'typing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState]);

  useEffect(() => {
    let timer: number;
    if (gameState === 'typing' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'typing') {
      setGameState('finished');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'finished') {
      if (score > highScore) {
        setHighScore(score);
        setIsNewRecord(true);
        localStorage.setItem('highScore_DigitSpan', score.toString());
      } else {
        setIsNewRecord(false);
      }
    } else if (gameState === 'idle') {
      setIsNewRecord(false);
    }
  }, [gameState, score, highScore]);

  const getBackgroundClass = () => {
    if (flashState === 'correct') return 'bg-green-500/30 dark:bg-green-600/30';
    if (flashState === 'wrong') return 'bg-yellow-500/30 dark:bg-orange-500/30';
    return 'bg-white/40 dark:bg-slate-800/40';
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-y-auto transition-colors duration-300 ${getBackgroundClass()}`}>
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
          <h1 className="select-none touch-none text-2xl font-bold text-slate-900 dark:text-white">Sayı Hafızası</h1>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <h2 className="select-none touch-none text-2xl font-bold text-slate-900 dark:text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                Ekranda kısa süreliğine beliren sayıları ezberleyin ve kaybolduklarında aynı sırayla tuşlayın. Giderek zorlaşacak!
              </p>
              <button
                onPointerDownCapture={startGame}
                className="select-none touch-none w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {gameState === 'showing' && (
            <div className="select-none touch-none w-full flex flex-col items-center animate-fade-in">
              <div className="select-none touch-none mb-4 text-slate-600 dark:text-slate-400 font-bold">
                Sayıyı Ezberle! ({digitCount} basamaklı)
              </div>
              <div className="select-none touch-none flex items-center justify-center h-48 w-full max-w-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden px-4">
                <span className="select-none touch-none text-4xl sm:text-6xl font-black text-slate-800 dark:text-white tracking-widest drop-shadow-md break-all text-center">
                  {currentSequence}
                </span>
              </div>
            </div>
          )}

          {gameState === 'typing' && (
            <form onSubmit={handleSubmit} className="select-none touch-none w-full flex flex-col items-center animate-fade-in">
              <div className="select-none touch-none mb-4 text-slate-600 dark:text-slate-400 font-bold">
                Aklında tuttuğun sayıyı gir:
              </div>
              <input
                ref={inputRef}
                type="number"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="select-none touch-none w-full max-w-xl h-32 text-center text-4xl sm:text-6xl font-black bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-3xl mb-8 border-2 border-indigo-300 dark:border-indigo-500/50 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 shadow-xl text-slate-800 dark:text-white tracking-widest"
                placeholder="?"
                autoComplete="off"
              />
              <button
                type="submit"
                className="select-none touch-none w-full max-w-xl h-20 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center text-2xl font-bold text-white backdrop-blur-md"
              >
                ONAYLA
              </button>
            </form>
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

export default DigitSpan;

