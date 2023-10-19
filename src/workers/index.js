// importScripts('https://docs.opencv.org/3.4.0/opencv.js');
// importScripts('../constants/index.js');

// const blur = (payload) => {
//   console.time();

//   const src = cv.imread(payload.src);

//   let dst = new cv.Mat();
//   let ksize = new cv.Size(10, 10);
//   let anchor = new cv.Point(-1, -1);
//   cv.blur(src, dst, ksize, anchor, cv.BORDER_DEFAULT);
//   // cv.boxFilter(src, dst, -1, ksize, anchor, true, cv.BORDER_DEFAULT)
//   cv.imshow('canvasOutput', dst);

//   src.delete();
//   dst.delete();
//   console.timeEnd();
// };

self.onmessage = (e) => {
  self.postMessage(e.data);
};

// https://developer.mozilla.org/en-US/docs/Web/API/Worker/message_event
// onmessage = (e) => {
//   console.log('onmessage', e.data);
//   // const number = e.data;
//   // self.postMessage(result);

//   if (!e.data || !e.data.event) {
//     console.error('e.data or e.data.event is undefined');
//     return;
//   }

//   const { event, payload } = e.data;
//   switch (event) {
//     case WORKER_EVENTS.BLUR:
//       // blur(payload);
//       break;
//     default:
//       break;
//   }
// };

// self.addEventListener('message', (e) => {
//   console.log('addEventListener1', e.data);
// });

// self.addEventListener('message', (e) => {
//   console.log('addEventListener2', e.data);
// });
