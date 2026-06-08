import fs from 'fs';
import zlib from 'zlib';

function checkRowPixels(path, targetY) {
  try {
    const buf = fs.readFileSync(path);
    let pos = 8;
    let idatBuffers = [];
    let width = 0, height = 0;
    while (pos < buf.length) {
      const length = buf.readUInt32BE(pos);
      const type = buf.toString('ascii', pos + 4, pos + 8);
      const data = buf.subarray(pos + 8, pos + 8 + length);
      if (type === 'IDAT') {
        idatBuffers.push(data);
      }
      pos += 12 + length;
    }
    const idatBuf = Buffer.concat(idatBuffers);
    const decompressed = zlib.inflateSync(idatBuf);
    
    console.log(`${path} at Y=${targetY}:`);
    for (let x = 0; x < width; x += 20) {
      const offset = targetY * (width * 4 + 1) + 1 + x * 4;
      const r = decompressed[offset];
      const g = decompressed[offset+1];
      const b = decompressed[offset+2];
      const a = decompressed[offset+3];
      if (a > 10) {
        console.log(`Pixel X=${x}: R=${r} G=${g} B=${b} A=${a}`);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

checkRowPixels('src/assets/Primaria/B2/B2-estola-base.png', 500);
checkRowPixels('src/assets/Primaria/B3/B3-estola-base.png', 500);
