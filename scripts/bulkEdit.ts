import * as fs from 'fs';
import * as path from 'path';

const gameDir = path.resolve(__dirname, '..', 'src', 'games');

function replaceOnClick(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const onClickRegex = /onClick=\{([^}]+)\}/g;
  // replace with onPointerDownCapture and wrap handler to preventDefault & stopPropagation
  content = content.replace(onClickRegex, (match, handler) => {
    const newHandler = `(e) => { e.preventDefault(); e.stopPropagation(); (${handler})(e); }`;
    return `onPointerDownCapture={${newHandler}}`;
  });
  // also replace any plain onClick={(e)=>...} without braces
  const onClickSimple = /onClick=\((e\s*:\s*[^)]+)\s*=>\s*([^}]+)\)/g;
  content = content.replace(onClickSimple, (m, eParam, body) => {
    const newBody = `e.preventDefault(); e.stopPropagation(); ${body}`;
    return `onPointerDownCapture={(${eParam}) => { ${newBody} }}`;
  });
  // ensure root containers have select-none and touch-none (add to className if missing)
  const classRegex = /className=\"([^\"]*)\"/g;
  content = content.replace(classRegex, (m, classes) => {
    let newClasses = classes;
    if (!classes.includes('select-none')) newClasses += ' select-none';
    if (!classes.includes('touch-none')) newClasses += ' touch-none';
    return `className="${newClasses}"`;
  });
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated ${filePath}`);
}

fs.readdirSync(gameDir).forEach(file => {
  if (file.endsWith('.tsx')) {
    replaceOnClick(path.join(gameDir, file));
  }
});
