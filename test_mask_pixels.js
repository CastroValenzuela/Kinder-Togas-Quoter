import fs from 'fs';
import zlib from 'zlib';

function testMaskPixels(path) {
  try {
    const buf = fs.readFileSync(path);
    let pos = 8;
    let idatBuffers = [];
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
    
    // Check alpha values of all pixels
    let opaqueCount = 0;
    let transparentCount = 0;
    for (let i = 0; i < decompressed.length; i += 4) {
      // For RGBA, alpha is the 4th byte
      const a = decompressed[i + 3];
      if (a > 10) {
        opaqueCount++;
      } else {
        transparentCount++;
      }
    }
    console.log(`${path}:`);
    console.log('Opaque pixels (>10 alpha):', opaqueCount);
    console.log('Transparent pixels (<=10 alpha):', transparentCount);
  } catch (e) {
    console.error(e);
  }
}

testMaskPixels('src/assets/Primaria/B1/B1-estola-base.png');
testMaskPixels('src/assets/Primaria/B2/B2-estola-base.png');
testMaskPixels('src/assets/Primaria/B3/B3-estola-base.png');
