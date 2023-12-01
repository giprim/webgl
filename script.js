function showError(errorText) {
  const errorBoxDiv = document.getElementById('error-box');
  const errorTextElement = document.createElement('p');
  errorTextElement.innerText = errorText;
  errorBoxDiv.appendChild(errorTextElement)
  console.log({errorText})
}

function threeD () {
  /** @type {HTMLCanvasElement | null} */
  const canvas = document.getElementById('demo-canvas');
  if (!canvas) {
    showError('Cannot get canvas reference')
    return
  }

  const gl = canvas.getContext('webgl2')
  if (!gl) {
    const isWebGl1Supported = !!canvas.getContext('webgl')
    if (isWebGl1Supported) {
      showError('this browser supports WebGL 1 but not WebGL 2 - make sure WebGl 2 is not disabled in your browser')
    }
    else showError('This browser does not support WebGL 2 - this demo will not work!')
    return;
  }

  gl.clearColor(0.08, 0.08, 0.08, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const triangleVertices = [
    // top middle
    0.0, 0.5,
    // bottom left
    -0.5, -0.5,
    // bottom right
    0.5, -0.5
  ];

  const triangleVerticesCpuBuffer = new Float32Array(triangleVertices);
  const triangleGeoBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, triangleVerticesCpuBuffer, gl.STATIC_DRAW)

  const vertexShaderSourceCode = `#version 300 es
  precision mediump float;

  in vec2 vertexPosition;

  void main() {
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
  }
  `;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSourceCode);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
    const compileError = gl.getShaderInfoLog(vertexShader);
    showError(`Failed to COMPILE vertex shader - ${compileError}`);
    return;
  }


  const fragmentShaderSourceCode = `#version 300 es
  precision mediump float;

  out vec4 outputColor;

  void main() {
    outputColor = vec4(0.294, 0.0, 0.51, 1.0);
  }
  `;

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSourceCode);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
    const compileError = gl.getShaderInfoLog(fragmentShader);
    showError(`Failed to COMPILE fragment shader - ${compileError}`);
    return;
  }

  const triangleShaderProgram = gl.createProgram();
  gl.attachShader(triangleShaderProgram, vertexShader );
  gl.attachShader(triangleShaderProgram, fragmentShader);
  gl.linkProgram(triangleShaderProgram);
  if (!gl.getProgramParameter(triangleShaderProgram, gl.LINK_STATUS)) {
    const linkError = gl.getProgramInfoLog(triangleShaderProgram);
    showError(`Failed to LINK shaders - ${linkError}`);
    return
  }

  const vertexPositionAttribLocation = gl.getAttribLocation(triangleShaderProgram, 'vertexPosition'); 
  if (vertexPositionAttribLocation < 0) {
    showError('Failed to get attrib location for vertexPosition');
    return;
  }

  // Output merger - how to merge the shaded pixel fragment with the existing output image
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
  gl.clearColor(0.08, 0.08, 0.08, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Rasterizer = which pixels are part of a triangle
  gl.viewport(0, 0, canvas.width, canvas.height);

  // set GPU program (vertex + fragment shader pair)
  gl.useProgram(triangleShaderProgram);
  gl.enableVertexAttribArray(vertexPositionAttribLocation);

  // Input assembler - how to read vertices from the GPU triangle buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
  gl.vertexAttribPointer(
    /** index: which attribute to use */
    vertexPositionAttribLocation,
    /** size: how many components in that attribute */ 
    2, 
    /** type: what is the data type stored in the GPU buffer for this   attribute? */
    gl.FLOAT,
    /** normalized: determines how to convert ints to floats, it that's what you're doing */
    false,
    /** stride: how many bytes to move forward in the buffer to find the same attribute for the next vertex */ 
    2 * Float32Array.BYTES_PER_ELEMENT,
    /** offset: how many bytes should the input assembler skip into the buffer when reading attributes */ 
    0
  )

  // Draw call (also configures primitive assembly)
  gl.drawArrays(gl.TRIANGLES, 0, 3, )

}

try {
  threeD();
} catch (error) {
  showError('Uncaught JavaScript exception: ', error)
}
