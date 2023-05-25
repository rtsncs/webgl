const vertexShaderTxt =
  `precision mediump float;

attribute vec2 vertPosition;

void main() {
    gl_Position = vec4(vertPosition, 0.0, 1.0);
}
`;

const fragmentShaderTxt =
  `precision mediump float;

uniform vec3 color;

void main() {
    gl_FragColor = vec4(color, 1.);
}
`;

const mat4 = glMatrix.mat4;

const Triangle = function() {
  const btn = document.querySelector('button');
  const canvas = document.getElementById("canvas");
  const gl = canvas.getContext("webgl");

  if (!gl) {
    alert('no webgl');
  }

  gl.clearColor(0.5, 0.5, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, vertexShaderTxt);
  gl.shaderSource(fragmentShader, fragmentShaderTxt);

  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader));
  }
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(fragmentShader));
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);

  gl.validateProgram(program);
  gl.useProgram(program);
  const colorLocation = gl.getUniformLocation(program, "color");
  gl.uniform3f(colorLocation, Math.random(), Math.random(), Math.random());

  let triangleVert = [
    0.0, 0.0,
    -0.5, 0.0,
    -0.25, 0.5,
    0.25, 0.5,
    0.5, 0.0,
    0.25, -0.5,
    -0.25, -0.5,
    -0.5, 0.0,
  ];

  const triangleVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVert), gl.STATIC_DRAW);

  const posAttrLocation = gl.getAttribLocation(program, 'vertPosition');
  // const colorAttrLocation = gl.getAttribLocation(program, 'vertColor');
  gl.vertexAttribPointer(posAttrLocation, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
  // gl.vertexAttribPointer(colorAttrLocation, 3, gl.FLOAT, gl.FALSE, 5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);

  gl.enableVertexAttribArray(posAttrLocation);
  // gl.enableVertexAttribArray(colorAttrLocation);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, 8);

  btn.addEventListener("click", () => {
    gl.uniform3f(colorLocation, Math.random(), Math.random(), Math.random());
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 8);
  });
} 