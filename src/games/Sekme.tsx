import React, { useState, useEffect, useRef } from 'react';

type GameState = 'idle' | 'playing' | 'finished';

interface Brick {
  id: number;
  x: number; // percentage left
  y: number; // percentage top
  width: number;
  height: number;
  active: boolean;
  color: string;
}

interface SekmeProps {
  onClose?: () => void;
}

const BRICK_ROWS = 4;
const BRICK_COLS = 6;
const BRICK_COLORS = ['bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500'];

const Sekme: React.FC<SekmeProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_Sekme') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [flash, setFlash] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  
  // Physics states
  const ballRef = useRef({ x: 50, y: 80, vx: 30, vy: -30, size: 1.5 }); // size in % (radius approx)
  const paddleRef = useRef({ x: 50, width: 20, y: 90, height: 2 });
  const bricksRef = useRef<Brick[]>([]);
  
  const reqRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  
  // Force render for animation frames
  const [, setFrame] = useState(0);

  const initBricks = () => {
    const bricks: Brick[] = [];
    const w = 14;
    const h = 5;
    const gapX = 2;
    const gapY = 2;
    const startX = (100 - (BRICK_COLS * w + (BRICK_COLS - 1) * gapX)) / 2;
    const startY = 10;
    
    let id = 0;
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          id: id++,
          x: startX + c * (w + gapX),
          y: startY + r * (h + gapY),
          width: w,
          height: h,
          active: true,
          color: BRICK_COLORS[r % BRICK_COLORS.length]
        });
      }
    }
    bricksRef.current = bricks;
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsNewRecord(false);
    
    // Reset positions
    ballRef.current = { x: 50, y: 80, vx: 40, vy: -40, size: 1.5 }; 
    paddleRef.current = { x: 50, width: 25, y: 90, height: 2 };
    
    initBricks();
    
    setGameState('playing');
    isPlayingRef.current = true;
  };

  const updatePhysics = (time: number) => {
    if (!isPlayingRef.current) return;
    
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1); // cap dt at 0.1s to prevent huge jumps
    lastTimeRef.current = time;

    const ball = ballRef.current;
    const paddle = paddleRef.current;
    const bricks = bricksRef.current;
    
    let nextX = ball.x + ball.vx * dt;
    let nextY = ball.y + ball.vy * dt;

    // Wall bounces with radius included
    if (nextX - ball.size <= 0) { nextX = ball.size; ball.vx *= -1; }
    if (nextX + ball.size >= 100) { nextX = 100 - ball.size; ball.vx *= -1; }
    if (nextY - ball.size <= 0) { nextY = ball.size; ball.vy *= -1; }
    
    // Paddle bounce
    if (ball.vy > 0 && nextY + ball.size >= paddle.y && ball.y + ball.size < paddle.y + paddle.height) {
      if (nextX >= paddle.x - paddle.width / 2 && nextX <= paddle.x + paddle.width / 2) {
        nextY = paddle.y - ball.size;
        ball.vy *= -1;
        // Spin
        const hitPoint = (nextX - paddle.x) / (paddle.width / 2);
        ball.vx = ball.vx * 0.5 + hitPoint * 40; 
      }
    }
    
    // Bottom death
    if (nextY - ball.size > 105) {
      setScore(s => Math.max(0, s - 15));
      setFlash(true);
      setTimeout(() => setFlash(false), 300);
      
      // Reset ball to center
      nextX = 50;
      nextY = 80;
      ball.vy = -40;
      ball.vx = (Math.random() - 0.5) * 40;
    }

    // Brick collisions
    let hitBrick = false;
    for (const b of bricks) {
      if (!b.active) continue;
      // Simple AABB collision
      if (
        nextX + ball.size >= b.x && 
        nextX - ball.size <= b.x + b.width &&
        nextY + ball.size >= b.y &&
        nextY - ball.size <= b.y + b.height
      ) {
        b.active = false;
        hitBrick = true;
        
        // Determine bounce direction
        const overlapLeft = (nextX + ball.size) - b.x;
        const overlapRight = (b.x + b.width) - (nextX - ball.size);
        const overlapTop = (nextY + ball.size) - b.y;
        const overlapBottom = (b.y + b.height) - (nextY - ball.size);
        
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        if (minOverlap === overlapTop || minOverlap === overlapBottom) {
          ball.vy *= -1;
        } else {
          ball.vx *= -1;
        }
        
        setScore(s => s + 10);
        ball.vx *= 1.02; // speed up slightly
        ball.vy *= 1.02;
        break; // only hit one brick per frame to prevent weirdness
      }
    }
    
    // Check win condition (all bricks broken)
    if (hitBrick && bricks.every(b => !b.active)) {
      // Level complete, spawn more
      setScore(s => s + 50);
      initBricks();
      ball.vy = -40;
      ball.vx = (Math.random() - 0.5) * 40;
    }

    ball.x = nextX;
    ball.y = nextY;

    setFrame(f => f + 1);

    if (gameState === 'playing') {
      reqRef.current = requestAnimationFrame(updatePhysics);
    }
  };

  useEffect(() => {
    if (gameState === 'playing') {
      lastTimeRef.current = performance.now();
      reqRef.current = requestAnimationFrame(updatePhysics);
    }
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [gameState]);

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
        localStorage.setItem('highScore_Sekme', score.toString());
      }
    }
  }, [gameState, score, highScore]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (gameState !== 'playing' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPos = ((e.clientX - rect.left) / rect.width) * 100;
    paddleRef.current.x = Math.max(paddleRef.current.width / 2, Math.min(100 - paddleRef.current.width / 2, xPos));
  };

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
          <h1 className="select-none touch-none text-xl sm:text-2xl font-bold text-white">Tuğla Kırıcı (Sekme)</h1>
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

        <div className="select-none touch-none flex-1 w-full flex flex-col items-center relative overflow-hidden">
          {gameState === 'idle' && (
            <div className="select-none touch-none text-center animate-fade-in w-full max-w-md p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700 z-10 mt-10">
              <div className="select-none touch-none text-6xl mb-6">🧱</div>
              <h2 className="select-none touch-none text-2xl font-bold text-white mb-3">Nasıl Oynanır?</h2>
              <p className="select-none touch-none text-slate-300 mb-8 text-lg leading-relaxed">
                Platformu kaydırarak topu sektir ve yukarıdaki tüm tuğlaları kır. Topu aşağı düşürürsen ceza alırsın!
              </p>
              <button
                onPointerDownCapture={(e) => { e.stopPropagation(); startGame(); }}
                className="select-none touch-none w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg active:scale-95 text-xl"
              >
                Oyuna Başla
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div 
              className={`w-full h-full max-w-3xl border border-white/20 rounded-3xl overflow-hidden relative touch-none cursor-crosshair shadow-inner transition-colors duration-75 ${flash ? 'bg-red-500/40' : 'bg-slate-900/40'}`}
              ref={containerRef}
              onPointerMove={handlePointerMove}
              onPointerDown={handlePointerMove}
            >
              {/* Bricks */}
              {bricksRef.current.map(b => b.active && (
                <div 
                  key={b.id}
                  className={`absolute rounded shadow-sm border border-white/20 ${b.color}`}
                  style={{ 
                    left: `${b.x}%`, 
                    top: `${b.y}%`, 
                    width: `${b.width}%`, 
                    height: `${b.height}%` 
                  }}
                />
              ))}

              {/* Ball */}
              <div 
                className="select-none touch-none absolute bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                style={{ 
                  left: `${ballRef.current.x}%`, 
                  top: `${ballRef.current.y}%`,
                  width: `${ballRef.current.size * 2}%`, // simplified CSS width
                  height: `${ballRef.current.size * 2}%`,
                  marginLeft: `-${ballRef.current.size}%`,
                  marginTop: `-${ballRef.current.size}%`,
                  aspectRatio: '1/1'
                }}
              />

              {/* Paddle */}
              <div 
                className="select-none touch-none absolute bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)] border border-indigo-200"
                style={{ 
                  left: `${paddleRef.current.x}%`, 
                  top: `${paddleRef.current.y}%`, 
                  width: `${paddleRef.current.width}%`, 
                  height: `${paddleRef.current.height}%`,
                  transform: 'translateX(-50%)' 
                }}
              />
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

export default Sekme;

