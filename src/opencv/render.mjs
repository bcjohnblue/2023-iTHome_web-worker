export const renderTime = (time) => {
  const timeDOM = document.querySelector('.time');
  timeDOM.innerText = `運算時間： ${Math.round(time)} ms`;
}