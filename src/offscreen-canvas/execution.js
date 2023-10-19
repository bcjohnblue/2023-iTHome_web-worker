const worker = new Worker('workers/image-data-worker.js');
const offscreenCanvasWorker = new Worker('workers/offscreen-canvas-worker.js');

/**
 * 使用 worker (OffscreenCanvas)
 * @param {string} imageUrl
 * @param {object} options
 */
export const makeImageBoundaryTransparentWithOffScreenCanvasWorker = (
  imageUrl,
  option
) => {
  return new Promise((resolve, reject) => {
    try {
      const time = {};
      let start = 0;
      let end = 0;

      const canvas = document.createElement('canvas');
      canvas.className = 'result';

      const offscreen = canvas.transferControlToOffscreen();

      start = performance.now();
      offscreenCanvasWorker.postMessage(
        { canvas: offscreen, imageUrl, option },
        [offscreen]
      );
      offscreenCanvasWorker.onmessage = (e) => {
        end = performance.now();
        time.worker = Math.round(end - start);

        const { time: timeFromWorker } = e.data;
        resolve({
          canvas,
          time: {
            ...time,
            ...timeFromWorker
          }
        });
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 使用 worker
 * @param {string} imageUrl
 * @param {object} options
 */
export const makeImageBoundaryTransparentWithWorker = (imageUrl, option) => {
  return new Promise((resolve, reject) => {
    try {
      const time = {};
      let start = 0;
      let end = 0;

      const canvas = document.createElement('canvas');
      canvas.className = 'result';
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.src = imageUrl;
      img.crossOrigin = 'Anonymous';

      start = performance.now();
      img.onload = async () => {
        end = performance.now();
        time.onloadImage = Math.round(end - start);

        const width = img.width;
        const height = img.height;

        canvas.width = width;
        canvas.height = height;

        start = performance.now();
        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        end = performance.now();
        time.getImageData = Math.round(end - start);

        start = performance.now();
        worker.postMessage({ imageData, option }, [imageData.data.buffer]);
        worker.onmessage = (e) => {
          end = performance.now();
          time.worker = Math.round(end - start);

          const { newImageData, newImageDataTime } = e.data;
          time.imageDataTime = Math.round(newImageDataTime);

          start = performance.now();
          ctx.putImageData(newImageData, 0, 0);
          end = performance.now();
          time.putImageData = Math.round(end - start);

          resolve({ canvas, time });
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

/**
 * 不使用 worker
 * @param {string} imageUrl
 * @param {object} options
 */
export const makeImageBoundaryTransparent = (imageUrl, option) => {
  /**
   * @param {number} boundingOpacity 透明度 - 0 ~ 1
   * @param {number} boundingRatio 外圍寬度比例 - 0 ~ 0.5
   */
  const { boundingOpacity, boundingRatio } = option;

  return new Promise((resolve, reject) => {
    try {
      const time = {};
      let start = 0;
      let end = 0;

      const canvas = document.createElement('canvas');
      canvas.className = 'result';
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.src = imageUrl;
      img.crossOrigin = 'Anonymous';

      start = performance.now();
      img.onload = () => {
        end = performance.now();
        time.onloadImage = Math.round(end - start);

        const width = img.width;
        const height = img.height;
        const xBorderWidth = width * boundingRatio; // 外圍寬度
        const yBorderWidth = height * boundingRatio; // 外圍寬度

        canvas.width = width;
        canvas.height = height;

        start = performance.now();
        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        end = performance.now();
        time.getImageData = Math.round(end - start);

        const data = imageData.data;

        start = performance.now();
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;

            // 判斷是否為外圍區域
            if (
              x < xBorderWidth ||
              x >= width - xBorderWidth ||
              y < yBorderWidth ||
              y >= height - yBorderWidth
            ) {
              const FULL_ALPHA_VALUE = 255;
              data[index + 3] = boundingOpacity * FULL_ALPHA_VALUE; // 設置透明度
            }
          }
        }
        end = performance.now();
        time.imageDataTime = Math.round(end - start);

        start = performance.now();
        ctx.putImageData(imageData, 0, 0);
        end = performance.now();
        time.putImageData = Math.round(end - start);

        resolve({ canvas, time });
      };

      img.onerror = (error) => {
        reject(error);
      };
    } catch (error) {
      reject(error);
    }
  });
};
