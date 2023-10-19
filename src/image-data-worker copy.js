const worker = new Worker('workers/image-data-worker.js');

/**
 * @param {string} imageUrl
 * @param {object} options
 */
const makeImageBoundaryTransparent = (imageUrl, option) => {
  return new Promise((resolve, reject) => {
    try {
      const time = {};

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.src = imageUrl;
      img.crossOrigin = 'Anonymous';
      img.onload = async () => {
        const width = img.width;
        const height = img.height;

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        worker.postMessage({ imageData, option }, [imageData.data.buffer]);

        worker.onmessage = (e) => {
          const { newImageData, newImageDataTime } = e.data;
          ctx.putImageData(newImageData, 0, 0);
          time.newImageDataTime = Math.round(newImageDataTime);

          const start = performance.now();
          const newImageUrl = canvas.toDataURL();
          const end = performance.now();
          time.canvasToDataURL = Math.round(end - start);

          resolve({ newImageUrl, time });
        };
      };

      img.onerror = (error) => {
        reject(error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

document.querySelector('.start').addEventListener('click', async (e) => {
  const imageUrl =
    'https://upload.wikimedia.org/wikipedia/commons/c/cc/Nacreous_clouds_Antarctica.jpg';
  const boundingOpacity =
    document.querySelector('.bounding-opacity').value || 0.5;
  const boundingRatio = document.querySelector('.bounding-ratio').value || 0.05;

  const start = performance.now();
  const { newImageUrl, time } = await makeImageBoundaryTransparent(imageUrl, {
    boundingOpacity,
    boundingRatio
  });
  const end = performance.now();
  time.total = Math.round(end - start);
  console.log('time', time);

  document.querySelector(
    '.image-data-time'
  ).textContent = `操作圖片像素 (ImageData)： ${time.newImageDataTime} ms`;
  document.querySelector(
    '.canvas-time'
  ).textContent = `將 canvas 轉換為 url (canvas.toDataURL)： ${time.canvasToDataURL} ms`;
  document.querySelector(
    '.total-time'
  ).textContent = `總耗時： ${time.total} ms`;

  const img = document.querySelector('.result');
  img.src = newImageUrl;
});

let toRight = true;
setInterval(() => {
  const animationDOM = document.querySelector('.animation');

  const match = animationDOM.style.transform.match(/\d+/) || 0;
  const lastX = Number(match[0]) || 0;
  const STEP = 2;

  if (lastX <= 0) {
    toRight = true;
  } else if (lastX > window.innerWidth / 2) {
    toRight = false;
  }

  if (toRight) {
    animationDOM.style.transform = `translateX(${lastX + STEP}px)`;
  } else {
    animationDOM.style.transform = `translateX(${lastX - STEP}px)`;
  }
}, 10);
