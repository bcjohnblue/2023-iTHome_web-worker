export class CustomSlider extends HTMLElement {
  constructor() {
    super();
    this.id = this.getAttribute('id') || '';
    this.value = parseFloat(this.getAttribute('value')) || 0;
    this.min = parseFloat(this.getAttribute('min')) || 0;
    this.max = parseFloat(this.getAttribute('max')) || 100;
    this.step = parseFloat(this.getAttribute('step')) || 1;

    // 创建 Shadow DOM
    this.root = this.attachShadow({ mode: 'open' });

    this.create();
  }

  create() {
    // 创建一个输入范围元素
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.value = this.value;
    slider.min = this.min;
    slider.max = this.max;
    slider.step = this.step;

    // 将样式应用到输入范围元素
    slider.style.width = '100%';

    // 监听输入范围变化事件
    slider.addEventListener('input', (e) => {
      try {
        this.value = +slider.value;
        this.dispatchEvent(
          new CustomEvent('change', { detail: +slider.value })
        );
      } catch (error) {
        console.error(error);
      }
    });

    // 将输入范围元素添加到 Shadow DOM 中
    this.root.appendChild(slider);
  }
}

// 定义 custom-slider 元素
customElements.define('custom-slider', CustomSlider);
