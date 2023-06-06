const vertexShaderTxt =
  `precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertColor;

varying vec3 fragColor;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
    fragColor = vertColor;
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}
`;

const fragmentShaderTxt =
  `precision mediump float;

varying vec3 fragColor;

void main() {
    gl_FragColor = vec4(fragColor, 1.);
}
`;

const mat4 = glMatrix.mat4;

class World {
  #gl;
  #canvas;
  #program;
  #vertexBuffer;
  #colorBuffer;
  #indexBuffer;

  // gets the canvas, setups webgl context
  constructor(id, backgroundColor = [0.5, 0.4, 0.7]) {
    this.#canvas = document.getElementById(id);
    this.#gl = this.#canvas.getContext("webgl");
    this.#program = this.#gl.createProgram();

    this.#gl.enable(this.#gl.DEPTH_TEST);
    this.#gl.enable(this.#gl.CULL_FACE);
    this.set_background(backgroundColor);
  }

  // sets the background color
  set_background(backgroundColor) {
    this.#gl.clearColor(...backgroundColor, 1.0);
    this.#gl.clear(this.#gl.COLOR_BUFFER_BIT, this.#gl.DEPTH_BUFFER_BIT);
  }

  // creates and compiles shader of given type
  loadShader(shaderTxt, type) {
    let shader = null;
    if (type == 'VERTEX') {
      shader = this.#gl.createShader(this.#gl.VERTEX_SHADER);
    } else if (type == 'FRAGMENT') {
      shader = this.#gl.createShader(this.#gl.FRAGMENT_SHADER);
    }
    this.#gl.shaderSource(shader, shaderTxt);
    this.#gl.compileShader(shader);
    this.#gl.attachShader(this.#program, shader);
  }

  // loads shaders and links the shader program
  prepareShaders() {
    this.loadShader(vertexShaderTxt, 'VERTEX');
    this.loadShader(fragmentShaderTxt, 'FRAGMENT');
    this.#gl.linkProgram(this.#program);
  }

  // setups buffers and attrib pointers
  loadObject(vertices, colors, indices) {
    this.#vertexBuffer = this.#gl.createBuffer();
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#vertexBuffer);
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(vertices), this.#gl.STATIC_DRAW);
    const posAttrLocation = this.#gl.getAttribLocation(this.#program, 'vertPosition');
    this.#gl.vertexAttribPointer(posAttrLocation, 3, this.#gl.FLOAT, this.#gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);

    this.#indexBuffer = this.#gl.createBuffer();
    this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, this.#indexBuffer);
    this.#gl.bufferData(this.#gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.#gl.STATIC_DRAW);

    this.#colorBuffer = this.#gl.createBuffer();
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#colorBuffer);
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(colors), this.#gl.STATIC_DRAW);
    const colorAttrLocation = this.#gl.getAttribLocation(this.#program, 'vertColor');
    this.#gl.vertexAttribPointer(colorAttrLocation, 3, this.#gl.FLOAT, this.#gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);

    this.#gl.enableVertexAttribArray(posAttrLocation);
    this.#gl.enableVertexAttribArray(colorAttrLocation);
  }

  // setups uniforms, matrices and runs the main loop
  run() {
    this.#gl.useProgram(this.#program);
    const matWorldUniformLocation = this.#gl.getUniformLocation(this.#program, 'mWorld');
    const matViewUniformLocation = this.#gl.getUniformLocation(this.#program, 'mView');
    const matProjUniformLocation = this.#gl.getUniformLocation(this.#program, 'mProj');

    let worldMatrix = mat4.create();
    let viewMatrix = mat4.create();
    let projMatrix = mat4.create();
    mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

    this.#gl.uniformMatrix4fv(matWorldUniformLocation, this.#gl.FALSE, worldMatrix);
    this.#gl.uniformMatrix4fv(matViewUniformLocation, this.#gl.FALSE, viewMatrix);
    this.#gl.uniformMatrix4fv(matProjUniformLocation, this.#gl.FALSE, projMatrix);

    let rotationMatrix = new Float32Array(16);
    let translationMatrix = new Float32Array(16);
    let angle = 0;

    const loop = () => {
      angle = performance.now() / 1000 / 8 * 2 * Math.PI;
      this.#gl.clear(this.#gl.COLOR_BUFFER_BIT, this.#gl.DEPTH_BUFFER_BIT);

      mat4.fromRotation(rotationMatrix, angle, [2, 1, 0]);
      mat4.fromTranslation(translationMatrix, [-2, 1, 0]);
      mat4.mul(worldMatrix, translationMatrix, rotationMatrix);
      this.#gl.uniformMatrix4fv(matWorldUniformLocation, this.#gl.FALSE, worldMatrix);
      this.#gl.drawElements(this.#gl.TRIANGLES, boxIndices.length, this.#gl.UNSIGNED_SHORT, 0);

      rotationMatrix = new Float32Array(16);
      translationMatrix = new Float32Array(16);

      mat4.fromRotation(rotationMatrix, angle / 2, [2, 1, 0]);
      mat4.fromTranslation(translationMatrix, [2, -1, 0]);
      mat4.mul(worldMatrix, translationMatrix, rotationMatrix);
      this.#gl.uniformMatrix4fv(matWorldUniformLocation, this.#gl.FALSE, worldMatrix);
      this.#gl.drawElements(this.#gl.TRIANGLES, boxIndices.length, this.#gl.UNSIGNED_SHORT, 0);

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
}

const boxIndices =
  [
    // Top
    0, 1, 2,
    0, 2, 3,

    // Left
    5, 4, 6,
    6, 4, 7,

    // Right
    8, 9, 10,
    8, 10, 11,

    // Front
    13, 12, 14,
    15, 14, 12,

    // Back
    16, 17, 18,
    16, 18, 19,

    // Bottom
    21, 20, 22,
    22, 20, 23
  ];

function genCube(size) {
  size *= 0.5;
  const boxVertices =
    [ // X, Y, Z          
      // Top
      -size, size, -size,
      -size, size, size,
      size, size, size,
      size, size, -size,

      // Left
      -size, size, size,
      -size, -size, size,
      -size, -size, -size,
      -size, size, -size,

      // Right
      size, size, size,
      size, -size, size,
      size, -size, -size,
      size, size, -size,

      // Front
      size, size, size,
      size, -size, size,
      -size, -size, size,
      -size, size, size,

      // Back
      size, size, -size,
      size, -size, -size,
      -size, -size, -size,
      -size, size, -size,

      // Bottom
      -size, -size, -size,
      -size, -size, size,
      size, -size, size,
      size, -size, -size,
    ];
  return boxVertices;
}

const boxColors =
  [ // R, G, B
    // Top
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,

    // Left
    0.75, 0.25, 0.5,
    0.75, 0.25, 0.5,
    0.75, 0.25, 0.5,
    0.75, 0.25, 0.5,

    // Right 
    0.25, 0.25, 0.75,
    0.25, 0.25, 0.75,
    0.25, 0.25, 0.75,
    0.25, 0.25, 0.75,

    // Front
    1.0, 0.0, 0.15,
    1.0, 0.0, 0.15,
    1.0, 0.0, 0.15,
    1.0, 0.0, 0.15,

    // Back
    0.0, 1.0, 0.15,
    0.0, 1.0, 0.15,
    0.0, 1.0, 0.15,
    0.0, 1.0, 0.15,

    // Bottom
    0.5, 0.5, 1.0,
    0.5, 0.5, 1.0,
    0.5, 0.5, 1.0,
    0.5, 0.5, 1.0,
  ];

let world = new World("canvas");
world.prepareShaders();
world.loadObject(genCube(2), boxColors, boxIndices);
world.run();
