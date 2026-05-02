/* brocco.ai -fluid hero shader
   Stripe/Paper-Shaders style: fBm Simplex noise + UV warping with brand
   colors and grain. Single fullscreen quad, no dependencies, ~6KB on the
   wire. Falls back to a CSS gradient on prefers-reduced-motion or no-WebGL. */

(function () {
  const canvas = document.getElementById('fluid-canvas');
  if (!canvas) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.remove();
    return;
  }

  const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false });
  if (!gl) { canvas.remove(); return; }

  /* ───────── shaders ───────── */
  const VERT = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const FRAG = `
    precision highp float;
    uniform vec2  u_res;
    uniform float u_time;
    uniform vec2  u_mouse;

    // ── Simplex noise 2D (Ashima)
    vec3 mod289(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
    vec2 mod289(vec2 x){ return x - floor(x*(1.0/289.0))*289.0; }
    vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                         -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0))
                                + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    float fbm(vec2 p) {
      float v = 0.0; float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * snoise(p);
        p *= 2.02; a *= 0.5;
      }
      return v;
    }

    // simple hash for grain
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

    void main() {
      vec2 R = u_res;
      vec2 uv = (gl_FragCoord.xy - 0.5*R) / min(R.x, R.y);
      vec2 mouse = (u_mouse - 0.5*R) / min(R.x, R.y);

      float t = u_time * 0.13;

      // domain warp (this is the Stripe/Paper "fluid" feel)
      vec2 q = uv * 1.4;
      vec2 warp = vec2(
        fbm(q + vec2(0.0, t)),
        fbm(q + vec2(5.2, t * 0.8 + 1.3))
      ) * 0.65 + mouse * 0.18;

      vec2 r = q + warp;
      float n = fbm(r * 1.2 + t * 0.4);

      // 5 brand colors (in linear-ish)
      vec3 c0 = vec3(0.020, 0.031, 0.027);  // near black
      vec3 c1 = vec3(0.086, 0.580, 0.270);  // brand-soft  #16a34a
      vec3 c2 = vec3(0.133, 0.769, 0.369);  // brand       #22c55e
      vec3 c3 = vec3(0.020, 0.180, 0.090);  // forest deep
      vec3 c4 = vec3(0.525, 0.937, 0.674);  // mint highlight

      // mix using the noise as a "ink position"
      float k = smoothstep(-0.6, 0.6, n);
      vec3 col = mix(c0, c1, smoothstep(0.0, 0.45, k));
      col = mix(col, c2, smoothstep(0.4, 0.75, k));
      col = mix(col, c4, smoothstep(0.85, 1.0, k) * 0.7);

      // soft blob lights orbiting
      float d1 = length(r - vec2(0.6 * sin(t * 0.8), 0.4 * cos(t * 0.6)));
      float d2 = length(r + vec2(0.5 * cos(t * 0.5 + 1.2), 0.45 * sin(t * 0.7 + 0.4)));
      col += c2 * smoothstep(0.95, 0.0, d1) * 0.18;
      col += c4 * smoothstep(0.7,  0.0, d2) * 0.12;
      col = mix(col, c3, smoothstep(0.0, 1.6, length(uv) - 0.35) * 0.55);

      // film grain -hides banding on cheap displays
      float g = (hash(gl_FragCoord.xy + fract(t)) - 0.5) * 0.06;
      col += g;

      // gentle gamma
      col = pow(max(col, 0.0), vec3(0.92));

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  /* ───────── compile / link ───────── */
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('shader compile error:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { canvas.remove(); return; }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('link error:', gl.getProgramInfoLog(prog));
    canvas.remove(); return;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  1, -1, -1,  1,
    -1,  1,  1, -1,  1,  1,
  ]), gl.STATIC_DRAW);

  const a_pos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(a_pos);
  gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 0, 0);

  const u_res   = gl.getUniformLocation(prog, 'u_res');
  const u_time  = gl.getUniformLocation(prog, 'u_time');
  const u_mouse = gl.getUniformLocation(prog, 'u_mouse');

  /* ───────── resize / dpi ───────── */
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth  || canvas.parentElement.clientWidth;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight;
    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u_res, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  /* ───────── mouse follow (smoothed) ───────── */
  let mouseTarget = [canvas.width * 0.5, canvas.height * 0.5];
  let mouseCurrent = [canvas.width * 0.5, canvas.height * 0.5];
  window.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    mouseTarget[0] = (e.clientX - rect.left) * dpr;
    mouseTarget[1] = (rect.height - (e.clientY - rect.top)) * dpr;
  }, { passive: true });

  /* ───────── render loop ───────── */
  const start = performance.now();
  let visible = true;
  // pause when off-screen to save battery
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      for (const e of entries) visible = e.isIntersecting;
    }).observe(canvas);
  }

  function frame(now) {
    if (visible) {
      const t = (now - start) * 0.001;
      mouseCurrent[0] += (mouseTarget[0] - mouseCurrent[0]) * 0.06;
      mouseCurrent[1] += (mouseTarget[1] - mouseCurrent[1]) * 0.06;
      gl.uniform1f(u_time, t);
      gl.uniform2f(u_mouse, mouseCurrent[0], mouseCurrent[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
