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
  // const inputMat = cv.imread('canvasInput');
  // const grayMat = new cv.Mat();
  // const binaryMat = new cv.Mat();
  // const outputMat = new cv.Mat();

  // 加载图像
  const img = cv.imread('canvasInput');

  // 创建一个 Mat 对象用于存储灰度图像
  const grayImg = new cv.Mat();

  // 将图像转换为灰度图像
  cv.cvtColor(img, grayImg, cv.COLOR_RGBA2GRAY);

  // 边缘检测
  const edges = new cv.Mat();
  cv.Canny(grayImg, edges, 50, 150);

  // 查找轮廓
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(
    edges,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE
  );

  // 找到最大轮廓（星星轮廓）
  let maxContourIndex = -1;
  let maxContourArea = 0;
  for (let i = 0; i < contours.size(); i++) {
    const contourArea = cv.contourArea(contours.get(i), false);
    if (contourArea > maxContourArea) {
      maxContourArea = contourArea;
      maxContourIndex = i;
    }
  }

  // 创建星星的蒙版，星星内部为白色，星星外部为黑色
  const starMask = new cv.Mat.zeros(grayImg.size(), cv.CV_8U);
  cv.drawContours(starMask, contours, maxContourIndex, new cv.Scalar(255), -1);

  // 创建与 img 相同大小的 Mat 对象，作为新的目标图像
  let filledImg = new cv.Mat.zeros(img.rows, img.cols, img.type());
  // 将轮廓区域填充为固定颜色（例如，绿色）
  cv.fillPoly(filledImg, contours, new cv.Scalar(0, 255, 0, 255));


  console.log('filledImg', filledImg);
  // const grayMat = new cv.Mat();
  // cv.cvtColor(filledImg, grayMat, cv.COLOR_BGR2GRAY);

  // console.log('grayMat', grayMat);
  // console.log('filledImg.type()', filledImg);
  // const outputMat = new cv.Mat();
  // cv.bitwise_and(img, img, outputMat, grayMat);

  // 计算整张图像的平均颜
  // const meanColor = cv.mean(img);
  // meanColor = meanColor.map((c) => Math.round());
  // console.log('meanColor', meanColor);
  // const matFromMeanColor = cv.matFromArray(1, 1, cv.CV_8UC4, [
  //   meanColor[0],
  //   meanColor[1],
  //   meanColor[2],
  //   meanColor[3]
  // ]);

  // 将星星内部的颜色调整为平均颜色
  cv.addWeighted(img, 1, filledImg, 0.1, 0, img);

  // 显示处理后的图像
  cv.imshow('canvasOutput', img);

  // 释放内存
  // img.delete();
  // grayImg.delete();
  // edges.delete();
  // contours.delete();
  // hierarchy.delete();
  // starMask.delete();
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
