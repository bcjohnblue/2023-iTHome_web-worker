const toThreshold = (percent) => {
  const scale = 0.15;
  return -1 * scale * 255 * (percent / 100) + 200;
};

export const findStarsWithoutWorker = (percent = 0) => {
  const inputMat = cv.imread('canvasInput');

  if (!percent) {
    cv.imshow('canvasOutput', inputMat);
    inputMat.delete();
    return;
  }

  // 将图像转换为灰度
  const grayMat = new cv.Mat();
  cv.cvtColor(inputMat, grayMat, cv.COLOR_RGBA2GRAY);

  // 对灰度图像进行二值化
  const thresholdMat = new cv.Mat();
  const threshold = toThreshold(percent);
  cv.threshold(grayMat, thresholdMat, threshold, 255, cv.THRESH_BINARY);

  // 进行形态学运算（膨胀和腐蚀）以改进二值图像
  const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(5, 5));
  cv.dilate(thresholdMat, thresholdMat, kernel, new cv.Point(-1, -1), 1);
  cv.erode(thresholdMat, thresholdMat, kernel, new cv.Point(-1, -1), 1);

  // 查找轮廓
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(
    thresholdMat,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE
  );

  // 在图像上绘制检测到的圆
  const outputMat = inputMat.clone();
  for (let i = 0; i < contours.size(); ++i) {
    cv.drawContours(
      outputMat,
      contours,
      i,
      new cv.Scalar(0, 255, 0, 255),
      2,
      cv.LINE_8,
      hierarchy,
      0
    );
  }

  // 在浏览器中显示结果图像
  cv.imshow('canvasOutput', outputMat);

  // 释放内存
  inputMat.delete();
  grayMat.delete();
  thresholdMat.delete();
  kernel.delete();
  contours.delete();
  hierarchy.delete();
  outputMat.delete();
};
