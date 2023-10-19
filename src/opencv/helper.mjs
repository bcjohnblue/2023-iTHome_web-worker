export async function loadImage(url) {
  return new Promise((resolve, reject) => {
    try {
      const image = new Image();
      image.src = url;
      image.crossOrigin = 'Anonymous';

      image.onerror = reject;
      image.onload = () => {
        resolve(image);
      };
    } catch (error) {
      reject(error);
    }
  });
}

export function drawImageInTheCenterOnCanvas(image, canvas) {
  const ctx = canvas.getContext('2d');
  const ratio = window.devicePixelRatio || 1;

  // get the scale
  // let scale_factor = Math.max(
  //   canvas.width / image.width,
  //   canvas.height / image.height
  // );
  let scale_factor = Math.max(
    canvas.width / ratio / image.width,
    canvas.height / ratio / image.height
  );

  // Lets get the new width and height based on the scale factor
  // let newWidth = image.width;
  let newWidth = image.width * scale_factor;
  // let newHeight = image.height;
  let newHeight = image.height * scale_factor;

  // get the top left position of the image
  // in order to center the image within the canvas
  let x = canvas.width / ratio / 2 - newWidth / 2;
  let y = canvas.height / ratio / 2 - newHeight / 2;

  ctx.drawImage(image, x, y, newWidth, newHeight);
}

export function transformToHDCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;

  const w = +getComputedStyle(canvas)
    .getPropertyValue('width')
    .match(/\d/g)
    .join('');
  const h = +getComputedStyle(canvas)
    .getPropertyValue('height')
    .match(/\d/g)
    .join('');

  // 實際渲染像素
  canvas.width = w * ratio;
  canvas.height = h * ratio;

  // 控制顯示大小
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
  return canvas;
}

export const loadImageOnCanvas = async (url) => {
  let canvas = document.querySelector('#canvasInput');
  canvas = transformToHDCanvas(canvas);
  console.log('canvas', canvas);

  const image = await loadImage(url);
  drawImageInTheCenterOnCanvas(image, canvas);
};

export const matToImageData = (mat) => {
  return new ImageData(new Uint8ClampedArray(mat.data), mat.cols, mat.rows);
};
