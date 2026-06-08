import fs from 'fs';
import zlib from 'zlib';

function findRgbBbox(path) {
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
    let nonZeroRgbCount = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const offset = y * (width * 4 + 1) + 1 + x * 4;
        const r = decompressed[offset];
        const g = decompressed[offset + 1];
        const b = decompressed[offset + 2];
        
        // Exclude the very top-left x=0, y=0 pixel if it's white background
        if (x === 0 && y === 0) continue;
        
        // Also let's check if the pixel is non-zero and not pure white if that's background
        if (r > 0 || g > 0 || b > 0) {
          // If it's a solid white background exported at the edge, let's ignore it if it's at the very borders
          if (r === 255 && g === 255 && b === 255 && (x === 0 || y === 0 || x === width - 1 || y === height - 1)) {
            continue;
          }
          
          nonZeroRgbCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    
    console.log(`${path}:`);
    console.log(`Dimensions: ${width}x${height}`);
    console.log(`Non-zero RGB Pixels Bounding Box (ignoring outer borders):`);
    console.log(`X: [${minX}, ${maxX}]`);
    console.log(`Y: [${minY}, ${maxY}]`);
    console.log(`Count: ${nonZeroRgbCount}`);
  } catch (e) {
    console.error(e);
  }
}

findRgbBbox('src/assets/Primaria/B1/B1-estola-base.png');
findRgbBbox('src/assets/Primaria/B2/B2-estola-base.png');
findRgbBbox('src/assets/Primaria/B3/B3-estola-base.png');
