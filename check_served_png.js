import http from 'http';
import zlib from 'zlib';

http.get('http://localhost:8080/src/assets/Primaria/B2/B2-estola-base.png', (res) => {
  let chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const buf = Buffer.concat(chunks);
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
    
    let opaqueCount = 0;
    let transparentCount = 0;
    for (let i = 0; i < decompressed.length; i += 4) {
      const a = decompressed[i + 3];
      if (a > 10) {
        opaqueCount++;
      } else {
        transparentCount++;
      }
    }
    console.log('Served PNG transparency check:');
    console.log('Opaque pixels:', opaqueCount);
    console.log('Transparent pixels:', transparentCount);
  });
}).on('error', (err) => {
  console.error(err);
});
