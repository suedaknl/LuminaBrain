import React, { useState, useEffect } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

const QUESTIONS = [
  { text: "Şiddetli yağmur yüzünden nehrin suları hızla ___ ve çevredeki yolları kapattı.", options: ["yükseldi", "alçaldı", "buharlaştı"], answer: "yükseldi" },
  { text: "Yeni aldığı bitkiye hiç su vermediği için bitki kısa sürede ___.", options: ["soldu", "yeşerdi", "boy attı"], answer: "soldu" },
  { text: "Havalar soğumaya başladığında göçmen kuşlar güneye doğru ___.", options: ["uçarlar", "uyurlar", "şarkı söylerler"], answer: "uçarlar" },
  { text: "Bütün gece hiç uyumadığı için sabah toplantısında sürekli ___.", options: ["esniyordu", "gülüyordu", "koşuyordu"], answer: "esniyordu" },
  { text: "Çocuk buzda kayıp düştüğünde dizini ___.", options: ["kanattı", "okşadı", "güçlendirdi"], answer: "kanattı" },
  { text: "Sıcak fırına eldivensiz dokununca parmaklarını ___.", options: ["yaktı", "ısıttı", "dondurdu"], answer: "yaktı" },
  { text: "Sınava çok iyi hazırlandığı için tüm soruları kolayca ___.", options: ["çözdü", "unuttu", "sildi"], answer: "çözdü" },
  { text: "Hırsızı gören köpek yüksek sesle ___ başladı.", options: ["havlamaya", "miyavlamaya", "uyumaya"], answer: "havlamaya" },
  { text: "Güneş doğduğunda sokak lambaları otomatik olarak ___.", options: ["söndü", "yandı", "kırıldı"], answer: "söndü" },
  { text: "O kadar hızlı koştu ki yarışın sonunda nefes nefese ___.", options: ["kaldı", "uyudu", "yemek yedi"], answer: "kaldı" }
];

interface BaglamDedektifiProps {
  onClose?: () => void;
}

const BaglamDedektifi: React.FC<BaglamDedektifiProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_BaglamDedektifi') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [flash, setFlash] = useState<'red' | 'green' | null>(null);

  const loadQuestion = () => {
    // Pick a random question to avoid repeating the exact sequence
    const qIdx = Math.floor(Math.random() * QUESTIONS.length);
    setQuestionIndex(qIdx);
    
    // Shuffle options
    const opts = [...QUESTIONS[qIdx].options].sort(() => Math.random() - 0.5);
    setCurrentOptions(opts);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    loadQuestion();
    setGameState('playing');
  };

  const handleOptionClick = (option: string) => {
    if (gameState !== 'playing') return;

    const correct = QUESTIONS[questionIndex].answer;
    
    if (option === correct) {
      setScore(s => s + 10);
      setFlash('green');
      setTimeout(() => setFlash(null), 300);
      setTimeout(() => loadQuestion(), 300);
    } else {
      setScore(s => Math.max(0, s - 5));
      setFlash('red');
      setTimeout(() => setFlash(null), 300);
    }
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
        localStorage.setItem('highScore_BaglamDedektifi', score.toString());
      }
    }
  }, [gameState, score, highScore]);

  const currentQ = QUESTIONS[questionIndex];

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
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-white">Bağlam Dedektifi</h1>
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
              <div className="select-none touch-none text-6xl mb-6">🔍</div>
              <h2 className="select-none touch-none text-2xl font-bold text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-300 mb-8 text-lg leading-relaxed">
                Ekranda beliren cümledeki boşluğu mantıksal çıkarım yaparak doğru kelimeyle tamamla!
              </p>
              <button
                onPointerDownCapture={(e) => { e.stopPropagation(); startGame(); }}
                className="select-none touch-none w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {gameState === 'playing' && currentQ && (
            <div className={`w-full h-full flex flex-col items-center justify-center rounded-3xl border border-white/10 shadow-inner transition-colors duration-150 p-4 sm:p-8 ${
              flash === 'red' ? 'bg-red-500/40' : flash === 'green' ? 'bg-emerald-500/40' : 'bg-slate-900/30'
            }`}>
              
              <div className="select-none touch-none bg-white/10 border border-white/20 p-8 sm:p-12 rounded-3xl backdrop-blur-md shadow-2xl mb-12 w-full max-w-2xl text-center">
                <p className="select-none touch-none text-2xl sm:text-3xl font-medium text-white leading-relaxed">
                  {currentQ.text.split('___').map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className="select-none touch-none inline-block border-b-4 border-indigo-400 w-24 mx-2"></span>
                      )}
                    </React.Fragment>
                  ))}
                </p>
              </div>

              <div className="select-none touch-none flex flex-col sm:flex-row gap-4 w-full max-w-2xl justify-center">
                {currentOptions.map((opt, i) => (
                  <button
                    key={i}
                    onPointerDownCapture={() => handleOptionClick(opt)}
                    className="select-none touch-none flex-1 bg-indigo-900/50 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-100 font-bold text-xl py-6 px-6 rounded-2xl transition-all duration-200 active:scale-95 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                  >
                    {opt}
                  </button>
                ))}
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
                Toplam Skorunuz: <span className="select-none touch-none text-4xl font-black text-indigo-400 ml-2 block mt-2">{score}</span>
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

export default BaglamDedektifi;

