import fs from 'fs';
import path from 'path';

const root = process.cwd();
const src = path.join(root, 'backend', 'public', 'uploads');
const dest = path.join(root, 'public', 'uploads');

console.log('src', src);
console.log('dest', dest);

if (!fs.existsSync(src)) {
  console.log('source uploads folder does not exist, nothing to do');
  process.exit(0);
}
fs.mkdirSync(dest, { recursive: true });

const files = fs.readdirSync(src);
files.forEach(f => {
  const s = path.join(src, f);
  const d = path.join(dest, f);
  fs.copyFileSync(s, d);
  console.log('copied', f);
});

// remove src folder tree
function rmdirRecursive(p) {
  if (!fs.existsSync(p)) return;
  for (const entry of fs.readdirSync(p)) {
    const cur = path.join(p, entry);
    if (fs.lstatSync(cur).isDirectory()) rmdirRecursive(cur);
    else fs.unlinkSync(cur);
  }
  fs.rmdirSync(p);
}

rmdirRecursive(path.join(root, 'backend'));
console.log('removed inner backend folder');
