import React, { useState, useEffect, useCallback } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface WordMemoryProps {
  onClose?: () => void;
}

const WORD_LIST = [
  'KALEM', 'ELMA', 'MASA', 'KİTAP', 'TELEFON', 'BİLGİSAYAR', 
  'BULUT', 'GÜNEŞ', 'YILDIZ', 'KEDİ', 'KÖPEK', 'ARABA', 
  'DENİZ', 'ORMAN', 'ÇİÇEK', 'KUŞ', 'EV', 'KAPI', 'PENCERE',
  'DEFTER', 'SİLGİ', 'ÇANTA', 'GÖZLÜK', 'SAAT', 'KAHVE',
  'ÇAY', 'BARDAK', 'TABAK', 'KAŞIK', 'ÇATAL', 'AYNA', 'TARAK',
  'GÖMLEK', 'KAZAK', 'PANTOLON', 'AYAKKABI', 'ŞAPKA', 'ATKI'
];

const WordMemory: React.FC<WordMemoryProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_WordMemory') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const generateNextWord = useCallback((currentHistory: string[]) => {
    // %50 ihtimalle yeni kelime, %50 ihtimalle daha önce çıkmış kelime (eğer varsa)
    const shouldPickNew = Math.random() > 0.4 || currentHistory.length === 0;
    
    let nextWord = '';
    if (shouldPickNew) {
      const available = WORD_LIST.filter(w => !currentHistory.includes(w));
      if (available.length > 0) {
        nextWord = available[Math.floor(Math.random() * available.length)];
      } else {
        // Eğer tüm kelimeler çıktıysa mecburen eski kelimelerden seç
        nextWord = currentHistory[Math.floor(Math.random() * currentHistory.length)];
      }
    } else {
      nextWord = currentHistory[Math.floor(Math.random() * currentHistory.length)];
    }
    
    setCurrentWord(nextWord);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setHistory([]);
    setGameState('playing');
    generateNextWord([]);
  };

  const handleAnswer = (answer: 'NEW' | 'SEEN') => {
    if (gameState !== 'playing' || !currentWord) return;

    const isSeen = history.includes(currentWord);
    const isCorrect = (answer === 'SEEN' && isSeen) || (answer === 'NEW' && !isSeen);

    if (isCorrect) {
      setScore(prev => prev + 10);
    } else {
      setScore(prev => Math.max(0, prev - 5));
    }

    // Kelimeyi geçmişe ekle (eğer yoksa)
    const newHistory = isSeen ? history : [...history, currentWord];
    setHistory(newHistory);
    generateNextWord(newHistory);
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
        localStorage.setItem('highScore_WordMemory', score.toString());
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
          <h1 className="select-none touch-none text-2xl font-bold text-slate-900 dark:text-white">Kelime Hafızası</h1>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="select-none touch-none text-2xl font-bold text-slate-900 dark:text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                Ekrana gelen kelimeyi oyun boyunca ilk defa görüyorsanız <strong>"YENİ KELİME"</strong>, daha önce çıktıysa <strong>"DAHA ÖNCE GÖRDÜM"</strong> butonuna basın.
              </p>
              <button
                onPointerDownCapture={startGame}
                className="select-none touch-none w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {gameState === 'playing' && currentWord && (
            <div className="select-none touch-none w-full flex flex-col items-center">
              <div className="select-none touch-none flex items-center justify-center h-48 w-full max-w-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-3xl mb-10 border border-slate-200 dark:border-slate-700 shadow-xl">
                <span className="select-none touch-none text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-widest text-slate-800 dark:text-white drop-shadow-md">
                  {currentWord}
                </span>
              </div>
              
              <div className="select-none touch-none flex gap-4 sm:gap-6 w-full max-w-xl">
                <button
                  onPointerDownCapture={() => handleAnswer('NEW')}
                  className="select-none touch-none flex-1 h-20 sm:h-24 rounded-2xl bg-white/70 dark:bg-slate-800/70 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 border-2 border-transparent hover:border-indigo-400 dark:hover:border-indigo-500 flex items-center justify-center text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 backdrop-blur-md"
                >
                  YENİ KELİME
                </button>
                <button
                  onPointerDownCapture={() => handleAnswer('SEEN')}
                  className="select-none touch-none flex-1 h-20 sm:h-24 rounded-2xl bg-white/70 dark:bg-slate-800/70 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 border-2 border-transparent hover:border-indigo-400 dark:hover:border-indigo-500 flex items-center justify-center text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 backdrop-blur-md text-center leading-tight px-2"
                >
                  DAHA ÖNCE<br/>GÖRDÜM
                </button>
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

export default WordMemory;

