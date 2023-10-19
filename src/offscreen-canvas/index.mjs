import { startAnimation } from './animation.js';
import { renderCanvas, renderTime } from './dom.js';
import {
  makeImageBoundaryTransparent,
  makeImageBoundaryTransparentWithOffScreenCanvasWorker,
  makeImageBoundaryTransparentWithWorker
} from './execution.js';

startAnimation();

const mapClassNameToFunction = {
  'worker-offscreen-canvas':
    makeImageBoundaryTransparentWithOffScreenCanvasWorker,
  worker: makeImageBoundaryTransparentWithWorker,
  'no-worker': makeImageBoundaryTransparent
};

Array.from(document.querySelectorAll('button')).forEach((button) => {
  button.addEventListener('click', async (e) => {
    const originImg = document.querySelector('.origin');
    const imageUrl = originImg.src;

    const result = document.querySelector('canvas.result');
    if (result) {
      result.remove();
    }

    const { className } = e.target;
    const boundingOpacity =
      document.querySelector('.bounding-opacity').value || 0.5;
    const boundingRatio =
      document.querySelector('.bounding-ratio').value || 0.05;

    const fn = mapClassNameToFunction[className];

    const start = performance.now();
    const { canvas, time } = await fn(imageUrl, {
      boundingOpacity,
      boundingRatio
    });
    renderCanvas(canvas);
    const end = performance.now();
    time.total = Math.round(end - start);

    renderTime(time, className);
  });
});
