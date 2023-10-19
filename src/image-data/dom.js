export const renderTime = (time) => {
  document.querySelector(
    '.loadImage-time'
  ).textContent = `載入圖片 (img.onload)： ${time.onloadImage} ms`;
  document.querySelector(
    '.imageData-time'
  ).textContent = `操作圖片像素 (ImageData)： ${time.imageDataTime} ms`;
  document.querySelector(
    '.getImageData-time'
  ).textContent = `取得圖片像素 (getImageData)： ${time.getImageData} ms`;
  document.querySelector(
    '.putImageData-time'
  ).textContent = `更新圖片像素 (putImageData)： ${time.putImageData} ms`;

  document.querySelector(
    '.total-time'
  ).textContent = `總耗時： ${time.total} ms`;
};

export const renderCanvas = (canvas) => {
  const resultContainer = document.querySelector('.result-container');
  if (document.querySelector('canvas')) {
    resultContainer.removeChild(document.querySelector('canvas'));
  }
  resultContainer.appendChild(canvas);
};
