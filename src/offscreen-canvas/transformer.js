/**
 * @see [convert image into blob using javascript](https://stackoverflow.com/a/42508185/10090927)
 */
export const imageToBlob = async (img) => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const width = img.width;
      const height = img.height;
      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        resolve(blob);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// 200ms
export const imageToBitmap = async (img) => {
  return createImageBitmap(img, 0, 0, img.width, img.height);
};
