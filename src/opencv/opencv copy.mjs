const toSize = (percent) => {
  return percent / 5;
};

const toOdd = (value) => {
  value = Math.round(value);
  return value % 2 == 0 ? value + 1 : value;
};

export const gaussianBlur = async (percent = 0) => {
  console.log('blur', cv);

  const inputMat = cv.imread('canvasInput');
  console.log('inputMat', inputMat.$$);
  // console.log('json', JSON.stringify(src.$$));

  if (!percent) return;
  const size = toOdd(toSize(percent));

  console.time();
  let outputMat = new cv.Mat();
  let ksize = new cv.Size(size, size);
  // let anchor = new cv.Point(-1, -1);

  // cv.blur(src, dst, ksize, anchor, cv.BORDER_DEFAULT);
  cv.GaussianBlur(inputMat, outputMat, ksize, 0, 0, cv.BORDER_DEFAULT);

  // cv.boxFilter(src, dst, -1, ksize, anchor, true, cv.BORDER_DEFAULT)
  cv.imshow('canvasOutput', outputMat);

  inputMat.delete();
  outputMat.delete();

  console.timeEnd();

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

export const blur = async (percent = 0) => {
  console.log('blur', cv);

  const src = cv.imread('canvasInput');
  console.log('src', src.$$);
  // console.log('json', JSON.stringify(src.$$));

  if (!percent) return;
  const size = toSize(percent);

  console.time();
  let dst = new cv.Mat();
  let ksize = new cv.Size(size, size);
  let anchor = new cv.Point(-1, -1);
  cv.blur(src, dst, ksize, anchor, cv.BORDER_DEFAULT);
  // cv.boxFilter(src, dst, -1, ksize, anchor, true, cv.BORDER_DEFAULT)
  cv.imshow('canvasOutput', dst);
  src.delete();
  dst.delete();
  console.timeEnd();

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
