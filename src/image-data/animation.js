let toRight = true;
const animationDOM = document.querySelector('.animation');

export const startAnimation = () => {
  const match = animationDOM.style.transform.match(/\d+/) || 0;
  const lastX = Number(match[0]) || 0;
  const STEP = 5;

  if (lastX <= 0) {
    toRight = true;
  } else if (lastX > window.innerWidth / 2) {
    toRight = false;
  }

  if (toRight) {
    animationDOM.style.transform = `translateX(${lastX + STEP}px)`;
  } else {
    animationDOM.style.transform = `translateX(${lastX - STEP}px)`;
  }

  requestAnimationFrame(startAnimation);
};
// export const startAnimation = () => {
//   let toRight = true;

//   setInterval(() => {
//     const animationDOM = document.querySelector('.animation');

//     const match = animationDOM.style.transform.match(/\d+/) || 0;
//     const lastX = Number(match[0]) || 0;
//     const STEP = 3;

//     if (lastX <= 0) {
//       toRight = true;
//     } else if (lastX > window.innerWidth / 2) {
//       toRight = false;
//     }

//     if (toRight) {
//       animationDOM.style.transform = `translateX(${lastX + STEP}px)`;
//     } else {
//       animationDOM.style.transform = `translateX(${lastX - STEP}px)`;
//     }
//   }, 10);
// };
