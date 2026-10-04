const fs = require('fs');
const path = require('path');

const gamesDir = path.join('c:/Users/sueda/Desktop/lumosity-clone/src/games');

const filesToUpdate = [
  'StroopTest.tsx',
  'QuickMath.tsx',
  'MemoryMatrix.tsx',
  'WordMemory.tsx',
  'SpeedMatch.tsx',
  'ArrowFocus.tsx'
];

for (const file of filesToUpdate) {
  const filePath = path.join(gamesDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - not found`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  const compName = file.replace('.tsx', '');
  
  // 1. Add states
  if (!content.includes('const [highScore, setHighScore]')) {
    content = content.replace(
      /const \[score, setScore\] = useState\(0\);/,
      `const [score, setScore] = useState(0);\n  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore_${compName}') || '0', 10));\n  const [isNewRecord, setIsNewRecord] = useState(false);`
    );
  }
  
  // 2. Add useEffect for high score
  if (!content.includes('setIsNewRecord(')) {
    // find the return statement to insert just before it
    content = content.replace(
      /\s*return \(\s*<div className="fixed inset-0/,
      `\n\n  useEffect(() => {\n    if (gameState === 'finished') {\n      if (score > highScore) {\n        setHighScore(score);\n        setIsNewRecord(true);\n        localStorage.setItem('highScore_${compName}', score.toString());\n      } else {\n        setIsNewRecord(false);\n      }\n    } else if (gameState === 'idle') {\n      setIsNewRecord(false);\n    }\n  }, [gameState, score, highScore]);\n\n  return (\n    <div className="fixed inset-0`
    );
  }
  
  // 3. UI Header
  if (!content.includes('En İyi')) {
    content = content.replace(
      /<span className="text-2xl font-black text-green-900 dark:text-green-100">\{score\}<\/span>\n\s*<\/div>\n\s*<\/div>/,
      `<span className="text-2xl font-black text-green-900 dark:text-green-100">{score}</span>\n            </div>\n            <div className="flex flex-col items-center bg-yellow-500/10 px-4 py-2 rounded-xl backdrop-blur-md border border-yellow-500/20 hidden sm:flex">\n              <span className="text-xs font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-wider mb-1">En İyi</span>\n              <span className="text-2xl font-black text-yellow-900 dark:text-yellow-100">{highScore}</span>\n            </div>\n          </div>`
    );
  }
  
  // 4. UI Finish Screen
  if (!content.includes('Yeni Rekor!')) {
    content = content.replace(
      /<h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Süre Bitti!<\/h2>/,
      `<h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Süre Bitti!</h2>\n              {isNewRecord && (\n                <div className="mb-4 text-2xl font-black text-yellow-500 animate-bounce">\n                  🏆 Yeni Rekor!\n                </div>\n              )}`
    );
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}
