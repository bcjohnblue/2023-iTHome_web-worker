/* eslint-disable no-restricted-globals */
self.onmessage = (e) => {
  console.log('worker', e.data);
  self.postMessage(e.data);
};
