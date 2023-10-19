import {
  findStarsWithWorker,
  findStarsWithoutWorker
} from './execution/index.mjs';
import { loadImageOnCanvas } from './helper.mjs';
import { renderTime } from './render.mjs';

window.onload = async () => {
  const imageUrl =
    'https://img3.wallspic.com/crops/9/8/3/8/4/148389/148389-tian_kong-yin_he_xi-kong_jian-tian_wen_xue-qi_fen-7680x4320.jpg';
  await loadImageOnCanvas(imageUrl);

  console.log('Image is ready');
  const loadingDOM = document.querySelector('.loading');
  loadingDOM.style.display = 'none';
  findStarsWithoutWorker(0);
};

document.querySelector('script#opencv').addEventListener('load', () => {
  console.log('OpenCV.js is ready');
  cv['onRuntimeInitialized'] = () => {
    findStarsWithoutWorker(0);
  };
});

document.querySelector('#slider').addEventListener('change', async (e) => {
  try {
    const start = performance.now();

    const checkbox = document.querySelector('#use-worker');
    const isUsingWorker = checkbox.checked;
    const percent = e.detail;

    if (isUsingWorker) {
      await findStarsWithWorker(percent);
    } else {
      findStarsWithoutWorker(percent);
    }

    const end = performance.now();
    renderTime(end - start);
  } catch (error) {
    console.error(error);
  }
});
