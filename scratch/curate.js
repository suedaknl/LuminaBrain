const fs = require('fs');

const content = fs.readFileSync('src/data/gamesData.ts', 'utf-8');

// I will extract everything up to `export const games = [` and then re-write the array.
// But it's easier to just parse it as JS if possible, but it's TS.
// Let's do a regex to extract objects.
const objects = [];
const regex = /{\s*id:\s*'([^']+)'[\s\S]*?},(?=\s*{|\s*\])/g;
let match;
while ((match = regex.exec(content)) !== null) {
  objects.push({ id: match[1], text: match[0] });
}

const activeKeep = [
  'lost-in-migration', 'balloon-pop', 'ciftleri-bul', 'denge-denklemi',
  'digit-span', 'dot-tap', 'gizli-yol', 'harf-avi', 'assist-ant',
  'korsan-gecidi', 'memory-matrix', 'merge-game', 'renk-cemberi',
  'schulte-table', 'sekme', 'speed-match', 'color-match',
  'thought-train', 'splitting-seeds', 'word-bubbles', 'word-memory',
  'star-search', 'brain-shift'
];

const passiveKeep = [
  'chalkboard-challenge', 'raindrops', 'penguin-pursuit',
  'organic-order', 'feel-the-beat', 'memory-serves', 'contextual'
];

const keepIds = new Set([...activeKeep, ...passiveKeep]);
const keptObjects = objects.filter(obj => keepIds.has(obj.id));

if (keptObjects.length !== 30) {
  console.log("Error: Expected 30, got " + keptObjects.length);
  // print missing ids
  const found = new Set(keptObjects.map(o => o.id));
  const missing = [...keepIds].filter(id => !found.has(id));
  console.log("Missing:", missing);
}

const beforeGames = content.split(/export const games.*=/)[0];
const newContent = beforeGames + 'export const games: Game[] = [\n' + keptObjects.map(o => '  ' + o.text).join('\n') + '\n]\n';

fs.writeFileSync('src/data/gamesData.ts', newContent);
console.log("Wrote 30 games to gamesData.ts");
