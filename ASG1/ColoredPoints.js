// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    //gl_PointSize = 10.0;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5.0;
let g_seletcedType = POINT;
let g_seletcedSegment = 10;

function addActionsForHtmlUI() {
  // Button events (shape type)
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes(); };
  
  document.getElementById('pointButton').onclick = function() { g_seletcedType = POINT };
  document.getElementById('triangleButton').onclick = function() { g_seletcedType = TRIANGLE };
  document.getElementById('circleButton').onclick = function() { g_seletcedType = CIRCLE };

  // Color slider events
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value / 100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value / 100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value / 100; });
  
  // Slider events
  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
  document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_seletcedSegment = this.value; });

  // Show reference image
  document.getElementById('showRefButton').onclick = function() {
    document.getElementById('refImage').style.display = 'block';
  }

  // Recreate the reference image
  document.getElementById('recreateButton').onclick = function() {
    drawReferenceTriangles();
  }
}

function drawReferenceTriangles() {
  // Body
  gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);
  drawTriangle([
    -0.1, 0.0,
    0.5, 0.0,
    0.2, 0.5
  ]);
  // Red Chest
  gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);
  drawTriangle([
    0.15, 0.178571,
    0.25, 0.178571,
    0.25, 0.107143
  ]);
  // Neck
  gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);
  drawTriangle([
    0.35, 0.214286,
    0.35, 0.357143,
    0.5, 0.214286
  ]);
  // Head
  drawTriangle([
    0.4, 0.285714,
    0.7, 0.285714,
    0.4, 0.55
  ]);
  // Left bicep
  drawTriangle([
    0.1, 0.5,
    0.3, 0.5,
    0.2, 0.714286
  ]);
  // Left forearm
  drawTriangle([
    0.27, 0.63,
    0.14, 0.785714,
    0.4, 0.857143
  ]);
  // Left hand
  drawTriangle([
    0.4, 0.857143,
    0.35, 0.9642857,
    0.55, 0.8928571
  ]);
  // Right bicep
  drawTriangle([
    0.6, 0.0357143,
    0.6, -0.285714,
    0.45, -0.0357143
  ]);
  // Right forearm
  drawTriangle([
    0.5, -0.25,
    0.7, -0.285714,
    0.5, -0.5
  ]);
  // Right hand
  drawTriangle([
    0.4, -0.4642857,
    0.55, -0.535714,
    0.3, -0.642857
  ]);
  // Lower abdomen
  drawTriangle([
    -0.1, 0.214286,
    -0.2, -0.107143,
    0, -0.107143
  ]);
  // Hip
  drawTriangle([
    -0.3, 0,
    -0.3, -0.142857,
    -0.1, -0.214286
  ]);
  // Left thigh
  drawTriangle([
    -0.3, 0,
    -0.3, -0.142857,
    -0.8, -0.428571
  ]);
}

function main() {
  // Set up canvas and gl variables
  setupWebGL();
  //Set up GLSL shaders and connect variables to GLSL
  connectVariablesToGLSL();

  // Set up actions for HTML UI
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  // canvas.onmousemove = click;
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) click(ev); };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = []; // The array for the position of a mouse press

function click(ev) {
  // Extract the event click and return it in WebGL coordinates
  let [x, y] = convertCoordinatesEventToGL(ev);

  // Create and store a new point object
  let point;
  if (g_seletcedType == POINT) {
    point = new Point();
  }
  else if (g_seletcedType == TRIANGLE) {
    point = new Triangle();
  }
  else if (g_seletcedType == CIRCLE) {
    point = new Circle();
    point.segments = g_seletcedSegment;
  }

  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  // // Store the coordinates to g_points array
  // g_points.push([x, y]);

  //  // Store the color to g_colors array
  // g_colors.push(g_selectedColor.slice());

  // // Store the size to g_sizes array
  // g_sizes.push(g_selectedSize);

  // Store the coordinates to g_points array
  // if (x >= 0.0 && y >= 0.0) {      // First quadrant
  //   g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  // } else if (x < 0.0 && y < 0.0) { // Third quadrant
  //   g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  // } else {                         // Others
  //   g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  // }

  // Draw every shape that is supposed to be drawn
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}

function renderAllShapes() {
  var startTime = performance.now();
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //var len = g_points.length;
  var len = g_shapesList.length;
  
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log('Failed to get the storage location of ' + htmlID);
    return;
  }
  htmlElm.innerHTML = text;
}
