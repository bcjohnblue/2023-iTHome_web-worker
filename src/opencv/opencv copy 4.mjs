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

  // 将图像转换为灰度图像
  cv.cvtColor(inputMat, grayMat, cv.COLOR_RGBA2GRAY);

  // 设置阈值，将亮度高于该阈值的像素设为背景色
  const thresholdValue = 200;

  // 创建一个掩码（mask），将星星部分设置为背景色（0）
  const maskMat = new cv.Mat();
  cv.threshold(grayMat, maskMat, thresholdValue, 255, cv.THRESH_BINARY);

  // 创建一个与原始图像相同大小的 Mat 对象，用于存储星星部分
  const stars = new cv.Mat();
  inputMat.copyTo(stars, maskMat);

  // 将星星部分设为背景色（可以根据需要修改背景色）
  stars.setTo([0, 0, 0, 255], maskMat);

  // 将星星部分设为背景色，并进行高斯模糊
  // cv.GaussianBlur(stars, stars, new cv.Size(11, 11), 10, 10);

  // 创建一个 Mat 对象用于存储最终结果
  const result = new cv.Mat();
  inputMat.copyTo(result);

  // 将原始图像中的非星星部分与处理后的星星部分进行组合
  stars.copyTo(result, maskMat);

  // 显示处理后的图像
  cv.imshow('canvasOutput', result);

  // 释放内存
  inputMat.delete();
  grayMat.delete();
  maskMat.delete();
  stars.delete();
  result.delete();
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
