const toSize = (percent) => {
  return percent / 5;
};

const toOdd = (value) => {
  value = Math.round(value);
  return value % 2 == 0 ? value + 1 : value;
};

const toThreshold = (percent) => {
  const scale = 0.1;
  return -1 * scale * 255 * (percent / 100) + 200;
};

export const gaussianBlur = (percent = 0) => {
  console.log('gaussianBlur', cv);

  // console.log('inputMat', inputMat.$$);
  // console.log('json', JSON.stringify(src.$$));

  if (!percent) return;
  // 假设 img 是原始图像
  const img = cv.imread('canvasInput'); // 假设这是原始图像

  // 将图像转换为灰度
  const grayImg = new cv.Mat();
  cv.cvtColor(img, grayImg, cv.COLOR_RGBA2GRAY);

  // 对灰度图像进行二值化
  const thresholdImg = new cv.Mat();
  const threshold = toThreshold(percent)
  cv.threshold(grayImg, thresholdImg, threshold, 255, cv.THRESH_BINARY);

  // 进行形态学运算（膨胀和腐蚀）以改进二值图像
  const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(3, 3));
  cv.dilate(thresholdImg, thresholdImg, kernel, new cv.Point(-1, -1), 1);
  cv.erode(thresholdImg, thresholdImg, kernel, new cv.Point(-1, -1), 1);

  // 查找轮廓
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(
    thresholdImg,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE
  );

  // 将轮廓内部的区域填充为黑色
  const meanColor = cv.mean(img);
  console.log(meanColor);
  console.log(new cv.Scalar(0, 0, 0, 255));
  const resultImg = img.clone(); // 创建一个副本以保持原始图像不变
  cv.drawContours(
    resultImg,
    contours,
    -1,
    meanColor,
    // new cv.Scalar(0, 0, 0, 255),
    cv.FILLED
  );

  // 在浏览器中显示结果图像
  cv.imshow('canvasOutput', resultImg);

  // 释放内存
  img.delete();
  grayImg.delete();
  thresholdImg.delete();
  kernel.delete();
  contours.delete();
  hierarchy.delete();
  resultImg.delete();
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
