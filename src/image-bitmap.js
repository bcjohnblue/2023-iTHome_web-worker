/**
 * Make the image boundary transparent
 * @param {string} imageUrl
 * @param {object} options
 * @return {string} an image url whose boundary is transparent
 */
const makeImageBoundaryTransparent = (imageUrl, option) => {
  /**
   * @param {number} boundingOpacity 透明度 - 0 ~ 1
   * @param {number} boundingRatio 外圍寬度比例 - 0 ~ 1
   */
  const { boundingOpacity = 0.5, boundingRatio = 0.1 } = option;
  console.log('boundingOpacity', boundingOpacity, boundingRatio);

  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.src = imageUrl;
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const xBorderWidth = width * boundingRatio; // 外圍寬度
        const yBorderWidth = height * boundingRatio; // 外圍寬度

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
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

        ctx.putImageData(imageData, 0, 0);

        resolve(canvas.toDataURL());
      };

      img.onerror = (error) => {
        reject(error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

document.querySelector('.start').addEventListener('click', async () => {
  const imageUrl =
    'https://upload.wikimedia.org/wikipedia/commons/c/cc/Nacreous_clouds_Antarctica.jpg';
  const boundingOpacity =
    document.querySelector('.bounding-opacity').value || 0.5;
  const boundingRatio = document.querySelector('.bounding-ratio').value || 0.05;

  const start = performance.now();
  const newImageUrl = await makeImageBoundaryTransparent(imageUrl, {
    boundingOpacity,
    boundingRatio
  });
  const end = performance.now();
  console.log('總耗時：', `${end - start} ms`);
  document.querySelector('.time').textContent = `總耗時： ${end - start} ms`;

  const img = document.querySelector('.result');
  img.src = newImageUrl;
});
