export const renderTime = (time, className) => {
  const type = document.querySelector(`.${className}`).textContent;

  document.querySelector('.time-title').textContent = `運算時間： ${type}`;
  document.querySelector(
    '.loadImage-time'
  ).textContent = `載入圖片 (img.onload)： ${time.onloadImage || 0} ms`;
  document.querySelector(
    '.fetchImageBlob-time'
  ).textContent = `fetch 圖片blob (fetchImageBlob)： ${
    time.fetchImageBlob || 0
  } ms`;
  document.querySelector(
    '.createBitmap-time'
  ).textContent = `創建圖片 bitmap (createImageBitmap)： ${
    time.createBitmap || 0
  } ms`;
  document.querySelector(
    '.imageData-time'
  ).textContent = `操作圖片像素 (ImageData)： ${time.imageDataTime || 0} ms`;
  document.querySelector(
    '.getImageData-time'
  ).textContent = `取得圖片像素 (getImageData)： ${time.getImageData || 0} ms`;
  document.querySelector(
    '.putImageData-time'
  ).textContent = `更新圖片像素 (putImageData)： ${time.putImageData || 0} ms`;
  document.querySelector(
    '.worker-time'
  ).textContent = `worker 傳遞資料 (worker.postMessage)： ${time.worker || 0} ms`;

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
