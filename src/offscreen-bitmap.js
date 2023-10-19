const worker = new Worker('workers/offscreen-bitmap.js');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('bitmaprenderer');

worker.addEventListener('message', (e) => {
  const { bitmap } = e.data;
  context.transferFromImageBitmap(bitmap);
});

document.querySelector('button').addEventListener('click', () => {
  worker.postMessage('create-canvas');
});
