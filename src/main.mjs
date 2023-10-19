loadImage();
console.log('main');

const main = async () => {
  let canvas = document.getElementById('canvasInput');
  canvas = transformToHDCanvas(canvas);

  const image = await loadImage();
  drawImageInTheCenterOnCanvas(image, canvas);

  console.time();
  const worker = new Worker('./workers/index.js');
  console.timeEnd();

  console.time();
  worker.postMessage('file');

  worker.onmessage = (e) => {
    console.log('Result is...', e.data);
    console.timeEnd();
  };
};

main();

window.onerror = (e) => {
  console.log('error', e);
};

const onOpenCvReady = async () => {
  setTimeout(() => {
    console.log('OpenCV.js is ready', cv);

    const src = cv.imread('canvasInput');
    console.log('src', src.$$);
    // console.log('json', JSON.stringify(src.$$));

    // console.time();
    // let dst = new cv.Mat();
    // let ksize = new cv.Size(10, 10);
    // let anchor = new cv.Point(-1, -1);
    // cv.blur(src, dst, ksize, anchor, cv.BORDER_DEFAULT);
    // // cv.boxFilter(src, dst, -1, ksize, anchor, true, cv.BORDER_DEFAULT)
    // cv.imshow('canvasOutput', dst);
    // src.delete();
    // dst.delete();
    // console.timeEnd();

    if (window.Worker) {
      const worker = new Worker('./workers/index.js');

      // worker.onmessage = (e) => {
      //   const result = e.data;
      //   console.log('Result is...', result);
      // };
      // worker.onerror = (e) => {
      //   console.log('error');
      // };
      const message = {
        event: WORKER_EVENTS.BLUR,
        payload: {
          src: {
            a: '1'
          }
          // src: 'canvasInput'
        }
      };
      worker.postMessage(message);
    }
  }, 1000);
};
