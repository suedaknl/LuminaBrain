import React, { useState, useEffect, useCallback } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface LetterBubble {
  id: number;
  letter: string;
  isClicked: boolean;
  top: number;
  left: number;
}

interface WordBubblesProps {
  onClose?: () => void;
}

const WORDS = [
  'ELMA', 'KALEM', 'KİTAP', 'MANTIK', 'BELLEK', 
  'DİKKAT', 'BEYİN', 'HAFIZA', 'ESNEK', 'HIZLI',
  'ZEKA', 'ODAK', 'MANTAR', 'TABLO', 'KAVRAM'
];

const WordBubbles: React.FC<WordBubblesProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_WordBubbles') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [targetWord, setTargetWord] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [bubbles, setBubbles] = useState<LetterBubble[]>([]);
  const [errorFlash, setErrorFlash] = useState(false);
  const [successFlash, setSuccessFlash] = useState(false);

  const startNewWord = useCallback(() => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTargetWord(word);
    setCurrentWordIndex(0);

    const letters = word.split('');
    
    // Grid sistemi (3 satır, 4 sütun) oluşturarak balonların çakışmasını önle
    const rows = 3;
    const cols = 4;
    const cells: {r: number, c: number}[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({ r, c });
      }
    }
    
    // Hücreleri karıştır
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    const newBubbles: LetterBubble[] = letters.map((letter, idx) => {
      const cell = cells[idx];
      // Grid hücresinin içinde rastgele küçük bir sapma ekle
      const top = 15 + (cell.r * (70 / rows)) + Math.random() * 5; 
      const left = 10 + (cell.c * (80 / cols)) + Math.random() * 5;
      
      return {
        id: idx,
        letter,
        isClicked: false,
        top,
        left
      };
    });

    setBubbles(newBubbles);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    startNewWord();
    setGameState('playing');
  };

  const handleBubbleClick = (bubble: LetterBubble) => {
    if (gameState !== 'playing' || bubble.isClicked) return;

    const expectedLetter = targetWord[currentWordIndex];

    if (bubble.letter === expectedLetter) {
      // Doğru harf
      setScore(prev => prev + 5);
      
      setBubbles(prev => prev.map(b => b.id === bubble.id ? { ...b, isClicked: true } : b));
      
      if (currentWordIndex + 1 === targetWord.length) {
        // Kelime tamamlandı
        setScore(prev => prev + 20); // Bonus
        setSuccessFlash(true);
        setTimeout(() => setSuccessFlash(false), 300);
        setTimeout(startNewWord, 400);
      } else {
        setCurrentWordIndex(prev => prev + 1);
      }
    } else {
      // Yanlış harf
      setScore(prev => Math.max(0, prev - 5));
      setErrorFlash(true);
      setTimeout(() => setErrorFlash(false), 300);
    }
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
        localStorage.setItem('highScore_WordBubbles', score.toString());
      } else {
        setIsNewRecord(false);
      }
    } else if (gameState === 'idle') {
      setIsNewRecord(false);
    }
  }, [gameState, score, highScore]);

  const getBackgroundClass = () => {
    if (successFlash) return 'bg-green-500/30 dark:bg-green-600/30';
    return 'bg-white/40 dark:bg-slate-800/40';
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col backdrop-blur-xl border border-white/20 p-4 sm:p-8 font-sans overflow-y-auto transition-colors duration-300 ${getBackgroundClass()}`}>
      {onClose && (
        <button
          onPointerDownCapture={onClose}
          className="select-none touch-none absolute top-6 left-6 flex items-center gap-2 text-slate-800 dark:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50 transition font-semibold bg-white/30 dark:bg-slate-800/50 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm z-20"
        >
          ← Ana Menüye Dön
        </button>
      )}
      
      <div className="select-none touch-none flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto mt-16 sm:mt-0 relative">
        {/* Header Area */}
        <div className="select-none touch-none flex justify-between items-center w-full mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-300/30 dark:border-slate-500/30 z-10">
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Kelime Baloncukları</h1>
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
            <div className="select-none touch-none flex flex-col items-center bg-yellow-500/10 px-3 py-1 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md border border-yellow-500/20 hidden sm:flex">
              <span className="select-none touch-none text-[10px] sm:text-xs font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-wider mb-1">En İyi</span>
              <span className="select-none touch-none text-xl sm:text-2xl font-black text-yellow-900 dark:text-yellow-100">{highScore}</span>
            </div>
          </div>
        </div>

        {/* Game Content Area */}
        <div className="select-none touch-none flex-1 w-full flex flex-col items-center justify-center relative">
          {gameState === 'idle' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md z-10">
              <div className="select-none touch-none w-24 h-24 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-sky-500/30">
                <span className="select-none touch-none text-5xl">💬</span>
              </div>
              <h2 className="select-none touch-none text-2xl font-bold text-slate-900 dark:text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                Ekranda beliren hedef kelimeyi oluşturmak için etrafta uçuşan harf baloncuklarına <strong>doğru sırayla</strong> tıklayın!
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
            <div className="select-none touch-none absolute inset-0 w-full h-full flex flex-col items-center p-4">
              {/* Hedef Kelime Gösterimi */}
              <div className="select-none touch-none mb-6 flex gap-2">
                {targetWord.split('').map((char, idx) => (
                  <div 
                    key={idx}
                    className={`w-10 h-14 sm:w-12 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl font-black rounded-lg sm:rounded-xl border-b-4 transition-all duration-300 ${
                      idx < currentWordIndex 
                        ? 'bg-green-500 border-green-700 text-white shadow-lg scale-110' 
                        : idx === currentWordIndex
                          ? 'bg-white/80 dark:bg-slate-700/80 border-indigo-500 text-slate-800 dark:text-white shadow-md animate-pulse'
                          : 'bg-white/40 dark:bg-slate-800/40 border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {idx < currentWordIndex ? char : '?'}
                  </div>
                ))}
              </div>

              {/* Baloncuklar Alanı */}
              <div className={`flex-1 w-full relative bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-slate-700 shadow-inner overflow-hidden ${errorFlash ? 'animate-shake' : ''}`}>
                
                {/* Hata Durumunda Ortada Kırmızı Çarpı Çıkart */}
                {errorFlash && (
                  <div className="select-none touch-none absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <span className="select-none touch-none text-9xl opacity-80 drop-shadow-2xl">❌</span>
                  </div>
                )}

                {bubbles.map(bubble => (
                  !bubble.isClicked && (
                    <button
                      key={bubble.id}
                      onPointerDownCapture={() => handleBubbleClick(bubble)}
                      className={`absolute w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-sky-400 to-indigo-500 text-white rounded-full shadow-lg flex items-center justify-center text-3xl font-black border-4 border-white/30 hover:scale-110 active:scale-90 transition-transform ${errorFlash ? 'scale-95 opacity-80 bg-red-500 from-red-500 to-red-600' : 'animate-bounce-slow'}`}
                      style={{ 
                        top: `${bubble.top}%`, 
                        left: `${bubble.left}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div className="select-none touch-none absolute top-2 left-2 w-4 h-4 bg-white/40 rounded-full blur-[1px]"></div>
                      {bubble.letter}
                    </button>
                  )
                ))}
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md z-10">
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

export default WordBubbles;

