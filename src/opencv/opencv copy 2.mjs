const toSize = (percent) => {
  return percent / 5;
};

const toOdd = (value) => {
  value = Math.round(value);
  return value % 2 == 0 ? value + 1 : value;
};

export const gaussianBlur = (percent = 0) => {
  console.log('gaussianBlur', cv);


  // console.log('inputMat', inputMat.$$);
  // console.log('json', JSON.stringify(src.$$));

  if (!percent) return;
  const inputMat = cv.imread('canvasInput');
  const grayMat = new cv.Mat();
  const binaryMat = new cv.Mat();
  const outputMat = new cv.Mat();

  // 转换为灰度图像
  // const grayMat = new cv.Mat();
  cv.cvtColor(inputMat, grayMat, cv.COLOR_RGBA2GRAY);

  // // Apply adaptive threshold to detect bright spots
  // const maxValue = 255;
  // // const maxValue = new cv.Scalar(255, 255, 255, 255);
  // const blockSize = 3;
  // // const blockSize = 11;
  // const C = 2;
  // cv.adaptiveThreshold(
  //   grayMat,
  //   binaryMat,
  //   maxValue,
  //   // cv.ADAPTIVE_THRESH_GAUSSIAN_C,
  //   cv.ADAPTIVE_THRESH_MEAN_C,
  //   cv.THRESH_BINARY,
  //   blockSize,
  //   C
  // );

  // threshold
  cv.threshold(grayMat, binaryMat, 150, 255, cv.THRESH_BINARY);

  // Invert the binary image to mark bright spots
  cv.bitwise_not(binaryMat, binaryMat);

  // Apply a morphological operation (opening) to remove noise
  // const kernel = new cv.Mat(5, 5, cv.CV_8U, 1);
  // let M = cv.Mat.ones(1, 1, cv.CV_8U);
  // cv.morphologyEx(binaryMat, binaryMat, cv.MORPH_OPEN, M);
  // M.delete();

  // cv.threshold(binaryMat, binaryMat, 254, 255, cv.THRESH_BINARY);

  // Invert the binary image again to get the final result
  // cv.bitwise_not(binaryMat, binaryMat);

  // Bitwise AND with the original image to remove bright spots
  // cv.bitwise_and(inputMat, inputMat, outputMat, binaryMat);
  cv.bitwise_and(inputMat, inputMat, outputMat, binaryMat);

  const invMat = new cv.Mat();
  cv.bitwise_not(outputMat, invMat);
  console.log('invMat', invMat)

  // let adaptiveMat = new cv.Mat();
  // const size = toOdd(toSize(percent));
  // let ksize = new cv.Size(size, size);
  // let anchor = new cv.Point(-1, -1);

  // cv.adaptiveThreshold(
  //   grayMat,
  //   adaptiveMat,
  //   200,
  //   cv.ADAPTIVE_THRESH_GAUSSIAN_C,
  //   cv.THRESH_BINARY,
  //   3,
  //   2
  // );

  // 使用 Sobel 进行边缘检测
  // const ddepth = cv.CV_16S; // 输出图像的深度
  // const dx = 1; // x 方向上的导数阶数
  // const dy = 1; // y 方向上的导数阶数
  // const ksize = 3; // Sobel 核的大小
  // cv.Sobel(outputMat, outputMat, ddepth, dx, dy, ksize);
  // cv.normalize(outputMat, outputMat, 0, 255, cv.NORM_MINMAX, cv.CV_8U);

  
  // const size = toOdd(toSize(percent));
  // let ksize = new cv.Size(size, size);
  // cv.GaussianBlur(inputMat, outputMat, ksize, 0, 0, cv.BORDER_DEFAULT);

  // cv.boxFilter(src, dst, -1, ksize, anchor, true, cv.BORDER_DEFAULT)

  cv.imshow('canvasOutput', invMat);

  inputMat.delete();
  outputMat.delete();
  // kernel.delete();

  // if (window.Worker) {
  //   const worker = new Worker('./workers/index.js');

  //   // worker.onmessage = (e) => {
  //   //   const result = e.data;
  //   //   console.log('Result is...', result);
  //   // };
  //   // worker.onerror = (e) => {
  //   //   console.log('error');
  //   // };
  //   const message = {
  //     event: WORKER_EVENTS.BLUR,
  //     payload: {
  //       src: {
  //         a: '1'
  //       }
  //       // src: 'canvasInput'
  //     }
  //   };
  //   worker.postMessage(message);
  // }
};

export const blur = (percent = 0) => {
  console.log('blur', cv);

  const src = cv.imread('canvasInput');
  console.log('src', src.$$);
  // console.log('json', JSON.stringify(src.$$));

  if (!percent) return;
  const size = toSize(percent);

  let dst = new cv.Mat();
  let ksize = new cv.Size(size, size);
  let anchor = new cv.Point(-1, -1);
  // cv.blur(src, dst, ksize, anchor, cv.BORDER_DEFAULT);
  // cv.boxFilter(src, dst, -1, ksize, anchor, true, cv.BORDER_DEFAULT)
  cv.imshow('canvasOutput', dst);
  src.delete();
  dst.delete();

  // if (window.Worker) {
  //   const worker = new Worker('./workers/index.js');

  //   // worker.onmessage = (e) => {
  //   //   const result = e.data;
  //   //   console.log('Result is...', result);
  //   // };
  //   // worker.onerror = (e) => {
  //   //   console.log('error');
  //   // };
  //   const message = {
  //     event: WORKER_EVENTS.BLUR,
  //     payload: {
  //       src: {
  //         a: '1'
  //       }
  //       // src: 'canvasInput'
  //     }
  //   };
  //   worker.postMessage(message);
  // }
};
