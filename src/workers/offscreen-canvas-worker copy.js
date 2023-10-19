const makeImageDataTransparent = (imageData, option) => {
  const { boundingOpacity, boundingRatio } = option;

  const width = imageData.width;
  const height = imageData.height;
  const xBorderWidth = width * boundingRatio; // 外圍寬度
  const yBorderWidth = height * boundingRatio; // 外圍寬度

  const data = imageData.data;

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

  return imageData;
};

/**
 * @param {OffscreenCanvas} canvas
 * @param {object} options
 */
const makeImageBoundaryTransparentInWorker = ({ canvas, option }) => {
  return new Promise((resolve, reject) => {
    try {
      const time = {};
      let start = 0;
      let end = 0;

      // const img = new Image();
      // img.src = imageUrl;
      // img.crossOrigin = 'Anonymous';

      start = performance.now();
      // img.onload = async () => {
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
      const newImageData = makeImageDataTransparent(imageData, option);
      end = performance.now();
      time.imageDataTime = Math.round(end - start);

      start = performance.now();
      ctx.putImageData(newImageData, 0, 0);
      end = performance.now();
      time.putImageData = Math.round(end - start);

      resolve({ time });
      // };

      img.onerror = (error) => {
        reject(error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

self.onmessage = async (e) => {
  const { canvas, option } = e.data;

  const { time } = await makeImageBoundaryTransparentInWorker({
    canvas,
    option
  });
  self.postMessage({ time });
};
