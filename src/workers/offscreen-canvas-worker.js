// 200ms
const imageToBitmap = async (img) => {
  return createImageBitmap(img);
};

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
const makeImageBoundaryTransparentInWorker = async ({
  canvas,
  bitmap,
  option
}) => {
  const time = {};
  let start = 0;
  let end = 0;

  const ctx = canvas.getContext('2d');

  const width = bitmap.width;
  const height = bitmap.height;
  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  start = performance.now();
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

  return {
    time
  };
};

const fetchImageBlob = async (imageUrl) => {
  const response = await fetch(imageUrl);
  const imageBlob = await response.blob();
  return imageBlob;
};

self.onmessage = async (e) => {
  const { canvas, imageUrl, option } = e.data;

  const time = {};
  let start = 0;
  let end = 0;

  start = performance.now();
  const imageBlob = await fetchImageBlob(imageUrl);
  end = performance.now();
  time.fetchImageBlob = Math.round(end - start);

  start = performance.now();
  const bitmap = await imageToBitmap(imageBlob);
  end = performance.now();
  time.createBitmap = Math.round(end - start);

  const { time: timeFromImage } = await makeImageBoundaryTransparentInWorker({
    canvas,
    bitmap,
    option
  });
  self.postMessage({
    time: {
      ...time,
      ...timeFromImage
    }
  });
};
