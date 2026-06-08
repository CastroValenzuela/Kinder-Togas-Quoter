import fs from 'fs';
import zlib from 'zlib';

function findOpaqueBoundingBox(path) {
  try {
    const buf = fs.readFileSync(path);
    let pos = 8;
    let idatBuffers = [];
    let width = 0, height = 0;
    while (pos < buf.length) {
      const length = buf.readUInt32BE(pos);
      const type = buf.toString('ascii', pos + 4, pos + 8);
      const data = buf.subarray(pos + 8, pos + 8 + length);
      if (type === 'IHDR') {
        width = data.readUInt32BE(0);
        height = data.readUInt32BE(4);
      } else if (type === 'IDAT') {
        idatBuffers.push(data);
      }
      pos += 12 + length;
    }
    const idatBuf = Buffer.concat(idatBuffers);
    const decompressed = zlib.inflateSync(idatBuf);
    
    let minX = width, maxX = 0, minY = height, maxY = 0;
    let opaqueCount = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // scanline has 1 filter byte at start
        const offset = y * (width * 4 + 1) + 1 + x * 4;
        const a = decompressed[offset + 3];
        if (a > 10) {
          opaqueCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    console.log(`${path}:`);
    console.log('Dimensions:', width, 'x', height);
    console.log('Opaque Pixels Bounding Box:');
    console.log(`X: [${minX}, ${maxX}]`);
    console.log(`Y: [${minY}, ${maxY}]`);
  } catch (e) {
    console.error(e);
  }
}

findOpaqueBoundingBox('src/assets/Primaria/B1/B1-estola-base.png');
findOpaqueBoundingBox('src/assets/Primaria/B2/B2-estola-base.png');
findOpaqueBoundingBox('src/assets/Primaria/B3/B3-estola-base.png');
