import fs from 'fs';

// Simple PNG chunk reader to inspect transparency or alpha values
function checkPngTransparency(path) {
  try {
    const buf = fs.readFileSync(path);
    // Find IDAT chunk or check color type in IHDR
    // IHDR starts at offset 12, length 13.
    // Offset 12 + 8 = 20 is the color type byte.
    // Color type 6 is RGBA (has alpha channel).
    // Color type 2 is RGB (no alpha channel).
    const colorType = buf[25];
    console.log(`${path} Color Type: ${colorType} (${colorType === 6 ? 'RGBA' : colorType === 2 ? 'RGB' : 'Other'})`);
  } catch (e) {
    console.error(e);
  }
}

checkPngTransparency('src/assets/Primaria/B1/B1-estola-base.png');
checkPngTransparency('src/assets/Primaria/B2/B2-estola-base.png');
checkPngTransparency('src/assets/Primaria/B3/B3-estola-base.png');
