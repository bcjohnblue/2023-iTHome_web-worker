// const one = document.getElementById('one').getContext('bitmaprenderer');
// const two = document.getElementById('two').getContext('bitmaprenderer');

// const offscreen = new OffscreenCanvas(256, 256);
// const gl = offscreen.getContext('webgl');

// gl.clearColor(0.0, 0.0, 0.0, 1.0); // 指定清空canvas的颜色
// gl.clear(gl.COLOR_BUFFER_BIT); // 清空canvas

// // Perform some drawing for the first canvas using the gl context
// const bitmapOne = offscreen.transferToImageBitmap();
// one.transferFromImageBitmap(bitmapOne);

// // Perform some more drawing for the second canvas
// const bitmapTwo = offscreen.transferToImageBitmap();
// two.transferFromImageBitmap(bitmapTwo);

// document.querySelector('button').addEventListener('click', () => {
//   const canvas1 = document
//     .getElementById('canvas-one')
//     .getContext('bitmaprenderer');
//   const canvas2 = document
//     .getElementById('canvas-two')
//     .getContext('bitmaprenderer');

//   const offscreen = new OffscreenCanvas(256, 256);
//   const gl = offscreen.getContext('webgl');

//   gl.clearColor(0.0, 0.0, 0.0, 1.0); // 指定清空canvas的颜色
//   gl.clear(gl.COLOR_BUFFER_BIT); // 清空canvas

//   // Perform some drawing for the first canvas using the gl context
//   const bitmapOne = offscreen.transferToImageBitmap();
//   canvas1.transferFromImageBitmap(bitmapOne);

//   // Perform some more drawing for the second canvas
//   const bitmapTwo = offscreen.transferToImageBitmap();
//   console.log('bitmapTwo', bitmapTwo);
//   canvas2.transferFromImageBitmap(bitmapTwo);
// });

const main = () => {
  // Configure the canvas to use WebGL
  //
  var gl;
  // var canvas = document.getElementById('canvas-one');
  const offscreen = new OffscreenCanvas(256, 256);
  // const gl = offscreen.getContext('webgl');

  try {
    gl = offscreen.getContext('webgl');
  } catch (e) {
    throw new Error('no WebGL found');
  }
  // console.log('gl', gl);

  // gl.clearColor(0.0, 0.0, 0.0, 1.0); // 指定清空canvas的颜色
  // gl.clear(gl.COLOR_BUFFER_BIT); // 清空canvas

  // const bitmapOne = offscreen.transferToImageBitmap();
  // canvas.getContext('bitmaprenderer').transferFromImageBitmap(bitmapOne);

  // const bitmapTwo = offscreen.transferToImageBitmap();
  // document
  //   .getElementById('canvas-two')
  //   .getContext('bitmaprenderer')
  //   .transferFromImageBitmap(bitmapTwo);
  // // const two = document.getElementById('canvas-two');
  // // const ctx2 = two.getContext('2d');
  // // ctx2.drawImage(gl.canvas, 0, 0, gl.canvas.width, gl.canvas.height);

  // return;

  // Copy an array of data points forming a triangle to the
  // graphics hardware
  //
  var vertices = [
    -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5
  ];
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Create a simple vertex shader
  //
  var vertCode =
    'attribute vec2 coordinates;' +
    'void main(void) {' +
    '  gl_Position = vec4(coordinates, 0.0, 1.0);' +
    '}';

  var vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vertCode);
  gl.compileShader(vertShader);
  if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(vertShader));

  // Create a simple fragment shader
  //
  var fragCode =
    'void main(void) {' + '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);' + '}';

  var fragCode1 =
    'void main(void) {' + '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);' + '}';

  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragCode);
  gl.compileShader(fragShader);
  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(fragShader));

  // Put the vertex shader and fragment shader together into
  // a complete program
  //
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(shaderProgram));

  // Everything we need has now been copied to the graphics
  // hardware, so we can start drawing

  // Clear the drawing surface
  //
  gl.clearColor(0.0, 0.7, 0.0, 0.75);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell WebGL which shader program to use
  //
  gl.useProgram(shaderProgram);

  // Tell WebGL that the data from the array of triangle
  // coordinates that we've already copied to the graphics
  // hardware should be fed to the vertex shader as the
  // parameter "coordinates"
  //
  var coordinatesVar = gl.getAttribLocation(shaderProgram, 'coordinates');
  gl.enableVertexAttribArray(coordinatesVar);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(coordinatesVar, 2, gl.FLOAT, false, 0, 0);

  // Now we can tell WebGL to draw the 3 points that make
  // up the triangle
  //
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  const one = document.getElementById('one').getContext('bitmaprenderer');
  const two = document.getElementById('two').getContext('bitmaprenderer');

  // Perform some drawing for the first canvas using the gl context
  const bitmapOne = offscreen.transferToImageBitmap();
  one.transferFromImageBitmap(bitmapOne);

  // Perform some more drawing for the second canvas
  const bitmapTwo = offscreen.transferToImageBitmap();
  two.transferFromImageBitmap(bitmapTwo);
};

// main();

const offscreenCanvas = new OffscreenCanvas(256, 256);
const gl = offscreenCanvas.getContext('webgl');

gl.clearColor(0.0, 0.0, 0.0, 1.0); // 指定清空canvas的颜色
gl.clear(gl.COLOR_BUFFER_BIT); // 清空canvas

const ctx1 = document.getElementById('one').getContext('2d');
const ctx2 = document.getElementById('two').getContext('2d');

ctx1.drawImage(gl.canvas, 0, 0, gl.canvas.width, gl.canvas.height);
ctx2.drawImage(gl.canvas, 0, 0, gl.canvas.width, gl.canvas.height);
