import http from 'http';

http.get('http://localhost:8080/src/assets/Primaria/B2/B2-estola-base.png', (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  let chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const body = Buffer.concat(chunks);
    console.log('Body length:', body.length);
    console.log('First 20 bytes:', body.subarray(0, 20).toString('hex'));
    console.log('Is HTML:', body.toString('utf8', 0, 50).includes('<!DOCTYPE html>') || body.toString('utf8', 0, 50).includes('<html'));
  });
}).on('error', (err) => {
  console.error(err);
});
