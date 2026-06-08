import fs from 'fs';
import zlib from 'zlib';

function checkPngPixels(path) {
  try {
    const buf = fs.readFileSync(path);
    // Parse PNG signature
    if (buf.readUInt32BE(0) !== 0x89504E47) {
      console.log('Not a PNG');
      return;
    }
    
    let pos = 8;
    let idatBuffers = [];
    let width = 0, height = 0, colorType = 0;
    
    while (pos < buf.length) {
      const length = buf.readUInt32BE(pos);
      const type = buf.toString('ascii', pos + 4, pos + 8);
      const data = buf.subarray(pos + 8, pos + 8 + length);
      
      if (type === 'IHDR') {
        width = data.readUInt32BE(0);
        height = data.readUInt32BE(4);
        colorType = data[9];
      } else if (type === 'IDAT') {
        idatBuffers.push(data);
      } else if (type === 'IEND') {
        break;
      }
      pos += 12 + length;
    }
    
    const idatBuf = Buffer.concat(idatBuffers);
    const decompressed = zlib.inflateSync(idatBuf);
    
    // Each scanline starts with a filter byte (1 byte) followed by pixel data.
    // For RGBA (colorType 6), each pixel is 4 bytes (R, G, B, A).
    // Let's check the alpha values of the first 10 pixels on the first scanline!
    let alphas = [];
    for (let x = 0; x < 20; x++) {
      const offset = 1 + x * 4; // skip filter byte at index 0
      const r = decompressed[offset];
      const g = decompressed[offset + 1];
      const b = decompressed[offset + 2];
      const a = decompressed[offset + 3];
      alphas.push({ r, g, b, a });
    }
    console.log(`${path}:`);
    console.log('Dimensions:', width, 'x', height);
    console.log('Color Type:', colorType);
    console.log('First 20 pixels RGBA:', alphas);
  } catch (e) {
    console.error('Error reading', path, ':', e.message);
  }
}

checkPngPixels('src/assets/Primaria/B1/B1-estola-base.png');
checkPngPixels('src/assets/Primaria/B2/B2-estola-base.png');
checkPngPixels('src/assets/Primaria/B3/B3/B3-estola-base.png');
