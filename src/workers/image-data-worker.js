const makeImageDataTransparent = (imageData, option) => {
  const { boundingOpacity, boundingRatio } = option;

  return new Promise((resolve, reject) => {
    try {
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

      resolve(imageData);
    } catch (error) {
      reject(error);
    }
  });
};

self.onmessage = async (e) => {
  const { imageData, option } = e.data;

  const start = performance.now();
  const newImageData = await makeImageDataTransparent(imageData, option);
  const end = performance.now();

  self.postMessage({ newImageData, newImageDataTime: end - start }, [
    newImageData.data.buffer
  ]);
};
