const worker = new Worker('workers/module-worker.js', {
  type: 'module'
});

worker.postMessage([1, 2]);
