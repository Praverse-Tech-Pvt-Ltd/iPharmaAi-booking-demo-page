// Hand-rolled WebGL2 port of Lightfall.tsx (OGL-based React component).
// mouseInteraction is hardcoded false for this app, so all pointer-tracking
// code from the original is intentionally omitted.
(function () {
  'use strict';

  var MAX_COLORS = 8;

  function hexToRGB(hex) {
    var c = hex.replace('#', '').padEnd(6, '0');
    return [
      parseInt(c.slice(0, 2), 16) / 255,
      parseInt(c.slice(2, 4), 16) / 255,
      parseInt(c.slice(4, 6), 16) / 255,
    ];
  }

  function prepColors(input) {
    var base = (input && input.length ? input : ['#A6C8FF', '#5227FF', '#FF9FFC']).slice(0, MAX_COLORS);
    var count = base.length;
    var arr = [];
    for (var i = 0; i < MAX_COLORS; i++) arr.push(hexToRGB(base[Math.min(i, base.length - 1)]));
    return { arr: arr, count: count };
  }

  var VERTEX_SRC = [
    '#version 300 es',
    'in vec2 position;',
    'in vec2 uv;',
    'out vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = vec4(position, 0.0, 1.0);',
    '}',
  ].join('\n');

  var FRAGMENT_SRC = [
    '#version 300 es',
    'precision highp float;',
    '',
    'uniform vec3  iResolution;',
    'uniform float iTime;',
    '',
    'uniform vec3  uColor0;',
    'uniform vec3  uColor1;',
    'uniform vec3  uColor2;',
    'uniform vec3  uColor3;',
    'uniform vec3  uColor4;',
    'uniform vec3  uColor5;',
    'uniform vec3  uColor6;',
    'uniform vec3  uColor7;',
    'uniform int   uColorCount;',
    '',
    'uniform vec3  uBgColor;',
    'uniform float uSpeed;',
    'uniform int   uStreakCount;',
    'uniform float uStreakWidth;',
    'uniform float uStreakLength;',
    'uniform float uGlow;',
    'uniform float uDensity;',
    'uniform float uTwinkle;',
    'uniform float uZoom;',
    'uniform float uBgGlow;',
    'uniform float uOpacity;',
    '',
    'in vec2 vUv;',
    'out vec4 fragColor;',
    '',
    'vec3 palette(float h) {',
    '  int count = uColorCount;',
    '  if (count < 1) count = 1;',
    '  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));',
    '  if (idx <= 0) return uColor0;',
    '  if (idx == 1) return uColor1;',
    '  if (idx == 2) return uColor2;',
    '  if (idx == 3) return uColor3;',
    '  if (idx == 4) return uColor4;',
    '  if (idx == 5) return uColor5;',
    '  if (idx == 6) return uColor6;',
    '  return uColor7;',
    '}',
    '',
    'vec3 tanhv(vec3 x) {',
    '  vec3 e = exp(-2.0 * x);',
    '  return (1.0 - e) / (1.0 + e);',
    '}',
    '',
    'vec2 sceneC(vec2 frag, vec2 r) {',
    '  vec2 P = (frag + frag - r) / r.x;',
    '  float z = 0.0;',
    '  float d = 1e3;',
    '  vec4 O = vec4(0.0);',
    '  for (int k = 0; k < 39; k++) {',
    '    if (d <= 1e-4) break;',
    '    O = z * normalize(vec4(P, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;',
    '    d = 1.0 - sqrt(length(O * O));',
    '    z += d;',
    '  }',
    '  return vec2(O.x, atan(O.z, O.y));',
    '}',
    '',
    'void mainImage(out vec4 o, vec2 C) {',
    '  vec2 r = iResolution.xy;',
    '  vec2 uv0 = (C + C - r) / r.x;',
    '  float T = 0.1 * iTime * uSpeed + 9.0;',
    '  float angRings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));',
    '  vec2 Y = vec2(5e-3, 6.28318530718 / angRings);',
    '',
    '  vec2 c0 = sceneC(C, r);',
    '  vec2 cdx = sceneC(C + vec2(1.0, 0.0), r);',
    '  vec2 cdy = sceneC(C + vec2(0.0, 1.0), r);',
    '  vec2 dCx = cdx - c0;',
    '  vec2 dCy = cdy - c0;',
    '  dCx.y -= 6.28318530718 * floor(dCx.y / 6.28318530718 + 0.5);',
    '  dCy.y -= 6.28318530718 * floor(dCy.y / 6.28318530718 + 0.5);',
    '  vec2 fw = abs(dCx) + abs(dCy);',
    '  C = c0;',
    '',
    '  vec2 P = vec2(2.0, 1.0) * uv0 - (r / r.x) * vec2(0.0, 1.0);',
    '  vec4 O = vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(P, P) + 6.0), 0.0);',
    '',
    '  float zr = 5e-4 * uStreakWidth;',
    '  vec2 rr = vec2(max(length(fw), 1e-5));',
    '  float tail = 19.0 / max(uStreakLength, 0.05);',
    '',
    '  for (int m = 0; m < 16; m++) {',
    '    if (m >= uStreakCount) break;',
    '    float jf = float(m) + 1.0;',
    '    float ic = fract(sin(dot(vec2(jf, floor(C.x / Y.x + 0.5)), vec2(7.0, 11.0)) * 73.0));',
    '    vec2 Pp = C - (T + T * ic) * vec2(0.0, 1.0);',
    '    Pp -= floor(Pp / Y + 0.5) * Y;',
    '    float h = fract(8663.0 * ic);',
    '    vec3 col = palette(h);',
    '    float weight = mix(1.5, 1.0 + sin(T + 7.0 * h + 4.0), uTwinkle);',
    '    vec2 inner = vec2(length(max(Pp, vec2(-1.0, 0.0))), length(Pp) - zr) - zr;',
    '    vec2 sm = vec2(1.0) - smoothstep(-rr, rr, inner);',
    '    O.rgb += dot(sm, vec2(exp(tail * Pp.y), 3.0)) * col * weight;',
    '    C.x += Y.x / 8.0;',
    '  }',
    '',
    '  vec3 colr = sqrt(tanhv(max(O.rgb * uGlow - vec3(0.04, 0.08, 0.02), 0.0)));',
    '  float luma = max(colr.r, max(colr.g, colr.b));',
    '  o = vec4(colr, luma * uOpacity);',
    '}',
    '',
    'void main() {',
    '  vec4 color;',
    '  mainImage(color, vUv * iResolution.xy);',
    '  fragColor = color;',
    '}',
  ].join('\n');

  var THEMES = {
    light: { colors: ['#1b6b8c', '#0e4a65', '#2a8aaa'], glow: 1.0 },
    dark: { colors: ['#3b9ec0', '#1b6b8c', '#2a8aaa'], glow: 0.85 },
  };

  function Lightfall(container, opts) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    container.appendChild(this.canvas);

    this.gl = this.canvas.getContext('webgl2', { alpha: true, antialias: true });
    if (!this.gl) return; // No WebGL2 support — background simply won't render.

    this.dpr = window.devicePixelRatio || 1;
    this._compile();
    this._initGeometry();

    var theme = opts && opts.isDarkInitial ? THEMES.dark : THEMES.light;
    this._setUniformDefaults(theme);

    var self = this;
    this._resize();
    this.resizeObserver = new ResizeObserver(function () { self._resize(); });
    this.resizeObserver.observe(container);

    this._raf = requestAnimationFrame(function loop(t) {
      self._raf = requestAnimationFrame(loop);
      self.gl.uniform1f(self.uniforms.iTime, t * 0.001);
      self._render();
    });
  }

  Lightfall.prototype._compile = function () {
    var gl = this.gl;

    function compileShader(type, src) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Lightfall shader compile error:', gl.getShaderInfoLog(shader));
      }
      return shader;
    }

    var vertexShader = compileShader(gl.VERTEX_SHADER, VERTEX_SRC);
    var fragmentShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SRC);

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Lightfall program link error:', gl.getProgramInfoLog(program));
    }
    this.program = program;

    this.uniforms = {
      iResolution: gl.getUniformLocation(program, 'iResolution'),
      iTime: gl.getUniformLocation(program, 'iTime'),
      uColor0: gl.getUniformLocation(program, 'uColor0'),
      uColor1: gl.getUniformLocation(program, 'uColor1'),
      uColor2: gl.getUniformLocation(program, 'uColor2'),
      uColor3: gl.getUniformLocation(program, 'uColor3'),
      uColor4: gl.getUniformLocation(program, 'uColor4'),
      uColor5: gl.getUniformLocation(program, 'uColor5'),
      uColor6: gl.getUniformLocation(program, 'uColor6'),
      uColor7: gl.getUniformLocation(program, 'uColor7'),
      uColorCount: gl.getUniformLocation(program, 'uColorCount'),
      uBgColor: gl.getUniformLocation(program, 'uBgColor'),
      uSpeed: gl.getUniformLocation(program, 'uSpeed'),
      uStreakCount: gl.getUniformLocation(program, 'uStreakCount'),
      uStreakWidth: gl.getUniformLocation(program, 'uStreakWidth'),
      uStreakLength: gl.getUniformLocation(program, 'uStreakLength'),
      uGlow: gl.getUniformLocation(program, 'uGlow'),
      uDensity: gl.getUniformLocation(program, 'uDensity'),
      uTwinkle: gl.getUniformLocation(program, 'uTwinkle'),
      uZoom: gl.getUniformLocation(program, 'uZoom'),
      uBgGlow: gl.getUniformLocation(program, 'uBgGlow'),
      uOpacity: gl.getUniformLocation(program, 'uOpacity'),
    };

    this.positionLoc = gl.getAttribLocation(program, 'position');
    this.uvLoc = gl.getAttribLocation(program, 'uv');
  };

  Lightfall.prototype._initGeometry = function () {
    var gl = this.gl;
    // OGL's Triangle geometry: an oversized triangle covering clip space.
    var positions = new Float32Array([-1, -1, 3, -1, -1, 3]);
    var uvs = new Float32Array([0, 0, 2, 0, 0, 2]);

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    this.uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
  };

  Lightfall.prototype._setUniformDefaults = function (theme) {
    var gl = this.gl;
    gl.useProgram(this.program);

    var prepped = prepColors(theme.colors);
    var keys = ['uColor0', 'uColor1', 'uColor2', 'uColor3', 'uColor4', 'uColor5', 'uColor6', 'uColor7'];
    for (var i = 0; i < keys.length; i++) {
      gl.uniform3fv(this.uniforms[keys[i]], prepped.arr[i]);
    }
    gl.uniform1i(this.uniforms.uColorCount, prepped.count);
    gl.uniform3fv(this.uniforms.uBgColor, hexToRGB('#0d1623'));

    gl.uniform1f(this.uniforms.uSpeed, 0.4);
    gl.uniform1i(this.uniforms.uStreakCount, 1);
    gl.uniform1f(this.uniforms.uStreakWidth, 0.7);
    gl.uniform1f(this.uniforms.uStreakLength, 1.6);
    gl.uniform1f(this.uniforms.uGlow, theme.glow);
    gl.uniform1f(this.uniforms.uDensity, 0.5);
    gl.uniform1f(this.uniforms.uTwinkle, 0);
    gl.uniform1f(this.uniforms.uZoom, 2.5);
    gl.uniform1f(this.uniforms.uBgGlow, 0);
    gl.uniform1f(this.uniforms.uOpacity, 1);
  };

  Lightfall.prototype.setTheme = function (isDark) {
    var theme = isDark ? THEMES.dark : THEMES.light;
    var gl = this.gl;
    gl.useProgram(this.program);
    var prepped = prepColors(theme.colors);
    var keys = ['uColor0', 'uColor1', 'uColor2', 'uColor3', 'uColor4', 'uColor5', 'uColor6', 'uColor7'];
    for (var i = 0; i < keys.length; i++) {
      gl.uniform3fv(this.uniforms[keys[i]], prepped.arr[i]);
    }
    gl.uniform1i(this.uniforms.uColorCount, prepped.count);
    gl.uniform1f(this.uniforms.uGlow, theme.glow);
  };

  Lightfall.prototype._resize = function () {
    var rect = this.container.getBoundingClientRect();
    var width = Math.max(1, Math.round(rect.width * this.dpr));
    var height = Math.max(1, Math.round(rect.height * this.dpr));
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
    this.gl.useProgram(this.program);
    this.gl.uniform3f(this.uniforms.iResolution, width, height, 1);
  };

  Lightfall.prototype._render = function () {
    var gl = this.gl;
    gl.useProgram(this.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.enableVertexAttribArray(this.positionLoc);
    gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.enableVertexAttribArray(this.uvLoc);
    gl.vertexAttribPointer(this.uvLoc, 2, gl.FLOAT, false, 0, 0);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // Bootstrap.
  document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('lightfall-container');
    if (!container) return;
    var instance = new Lightfall(container, {
      isDarkInitial: document.documentElement.classList.contains('dark'),
    });
    window.addEventListener('themechange', function (e) {
      if (instance.gl) instance.setTheme(e.detail.dark);
    });
  });
})();
