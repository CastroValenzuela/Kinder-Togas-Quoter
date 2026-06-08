import fs from 'fs';

function readPngDimensions(path) {
  try {
    const buf = fs.readFileSync(path);
    const width = buf.readInt32BE(16);
    const height = buf.readInt32BE(20);
    return { width, height };
  } catch(e) {
    return null;
  }
}

function readJpgDimensions(path) {
  try {
    const buf = fs.readFileSync(path);
    let i = 2; // skip FFD8
    while (i < buf.length - 8) {
      if (buf[i] === 0xFF) {
        const marker = buf[i + 1];
        if (marker === 0xC0 || marker === 0xC2) {
          const height = buf.readUInt16BE(i + 5);
          const width = buf.readUInt16BE(i + 7);
          return { width, height };
        }
        const length = buf.readUInt16BE(i + 2);
        i += 2 + length;
      } else {
        i++;
      }
    }
  } catch(e) {
    return null;
  }
  return null;
}

console.log('B1 Base:', readJpgDimensions('src/assets/Primaria/B1/B1-Base.jpg'));
console.log('B1 Mask:', readPngDimensions('src/assets/Primaria/B1/B1-estola-base.png'));
console.log('B2 Base:', readJpgDimensions('src/assets/Primaria/B2/B2.jpg'));
console.log('B2 Mask:', readPngDimensions('src/assets/Primaria/B2/B2-estola-base.png'));
console.log('B3 Base:', readJpgDimensions('src/assets/Primaria/B3/B3.jpg'));
console.log('B3 Mask:', readPngDimensions('src/assets/Primaria/B3/B3-estola-base.png'));
