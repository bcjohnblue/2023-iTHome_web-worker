const worker = new SharedWorker('workers/shared-worker.js');

// window.onload = () => {
//   worker.port.addEventListener('message', (e) => {
//     document.querySelector('.result').textContent = e.data;
//   });

//   worker.port.start();
// };

worker.port.onmessage = (e) => {
  document.querySelector('.result').textContent = e.data;
};

Array.from(document.querySelectorAll('button')).forEach((button) => {
  button.addEventListener('click', (e) => {
    const { className } = e.target;

    switch (className) {
      case 'plus':
        worker.port.postMessage(1);
        break;
      case 'minus':
        worker.port.postMessage(-1);
        break;
      default:
        break;
    }
  });
});
