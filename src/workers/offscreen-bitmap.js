self.onmessage = () => {
  const offscreen = new OffscreenCanvas(256, 256);
  const context = offscreen.getContext('2d');

  context.fillStyle = '#FF0000';
  context.fillRect(0, 0, offscreen.width, offscreen.height);

  const bitmap = offscreen.transferToImageBitmap();

  self.postMessage({ bitmap }, [bitmap]);
};
