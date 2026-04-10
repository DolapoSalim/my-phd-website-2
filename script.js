/* ════════════════════════════════════════════════════════
   script.js  —  Olatoye Dolapo Salim personal website
   ════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────
   THEME TOGGLE
────────────────────────────────────── */
(function initTheme() {
  const html     = document.documentElement;
  const btn      = document.getElementById('themeBtn');
  const saved    = localStorage.getItem('ods-theme') || 'dark';

  html.setAttribute('data-theme', saved);
  btn.textContent = saved === 'dark' ? 'light mode' : 'dark mode';

  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ods-theme', next);
    btn.textContent = next === 'dark' ? 'light mode' : 'dark mode';
  });
})();

/* ──────────────────────────────────────
   HAMBURGER NAV
────────────────────────────────────── */
(function initNav() {
  const hbg    = document.getElementById('hbg');
  const mobNav = document.getElementById('mobNav');
  hbg.addEventListener('click', () => {
    hbg.classList.toggle('open');
    mobNav.classList.toggle('open');
  });
  mobNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    hbg.classList.remove('open');
    mobNav.classList.remove('open');
  }));
})();

/* ──────────────────────────────────────
   INTERSECTION OBSERVER  (scroll fades)
────────────────────────────────────── */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: 0.1 });

document.querySelectorAll('.fi, .tl-item, .pub, .news-item').forEach(el => io.observe(el));

/* ──────────────────────────────────────
   POINT CLOUD  —  WebGL2 / WebGL1
   Key fix: mouse coordinates are computed
   in the rAF loop from a shared ref so
   they're always fresh when WebGL draws.
────────────────────────────────────── */
(function initPointCloud() {
  const canvas = document.getElementById('cloud-canvas');
  const gl     = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  const N = 700;
  const pos   = new Float32Array(N * 3);
  const sizes = new Float32Array(N);

  // Uniform sphere volume via cube-root sampling
  for (let i = 0; i < N; i++) {
    const r     = Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta) * 1.9;
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 1.1;
    pos[i * 3 + 2] = r * Math.cos(phi) * 0.75;
    sizes[i] = 0.9 + Math.random() * 2.5;
  }

  /* ---- shaders ---- */
  const vSrc = `
    attribute vec3 aPos;
    attribute float aSize;
    uniform mat4  uMVP;
    uniform float uMX;   /* mouse X  -1 .. +1 */
    uniform float uMY;   /* mouse Y  -1 .. +1 */
    uniform float uTime;
    varying float vDepth;
    void main(){
      vec3 p = aPos;
      /* gentle sinusoidal drift */
      p.x += sin(uTime * 0.00028 + aPos.y * 2.8) * 0.018;
      p.y += cos(uTime * 0.00035 + aPos.x * 2.1) * 0.012;
      /* parallax: near pts (p.z > 0) shift more with mouse */
      float pz = p.z * 0.5 + 0.5;          /* remap to 0..1 */
      p.x += uMX * pz * 0.18;
      p.y += uMY * pz * 0.12;
      vec4 clip = uMVP * vec4(p, 1.0);
      gl_Position  = clip;
      /* depth for fog: closer = higher depth value */
      vDepth = clamp((p.z + 1.0) * 0.5, 0.0, 1.0);
      gl_PointSize = aSize * (0.3 + vDepth * 1.1);
    }
  `;
  const fSrc = `
    precision mediump float;
    varying float vDepth;
    uniform vec3 uColor;
    void main(){
      vec2  uv = gl_PointCoord - 0.5;
      float d  = dot(uv, uv);
      if (d > 0.25) discard;
      float alpha = (0.25 - d) * 4.0 * (0.1 + vDepth * 0.55);
      gl_FragColor = vec4(uColor, alpha);
    }
  `;

  function mkShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, vSrc));
  gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, fSrc));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const posBuf  = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);

  const sizeBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuf);
  gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);

  const locPos   = gl.getAttribLocation(prog,  'aPos');
  const locSize  = gl.getAttribLocation(prog,  'aSize');
  const locMVP   = gl.getUniformLocation(prog, 'uMVP');
  const locMX    = gl.getUniformLocation(prog, 'uMX');
  const locMY    = gl.getUniformLocation(prog, 'uMY');
  const locTime  = gl.getUniformLocation(prog, 'uTime');
  const locColor = gl.getUniformLocation(prog, 'uColor');

  /* perspective matrix */
  function makePerspective(fov, asp, near, far) {
    const f = 1.0 / Math.tan(fov * 0.5);
    return new Float32Array([
      f / asp, 0, 0,  0,
      0,       f, 0,  0,
      0,       0, (far + near) / (near - far), -1,
      0,       0, (2 * far * near) / (near - far), 0
    ]);
  }

  /* ---- mouse state stored as normalised coords ---- */
  const mouse = { nx: 0, ny: 0 };

  window.addEventListener('mousemove', e => {
    mouse.nx =  (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.ny = -(e.clientY / window.innerHeight - 0.5) * 2;
  });
  /* touch support for mobile */
  window.addEventListener('touchmove', e => {
    if (!e.touches.length) return;
    mouse.nx =  (e.touches[0].clientX / window.innerWidth  - 0.5) * 2;
    mouse.ny = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  function render(time) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const asp = canvas.width / canvas.height;
    const mvp = makePerspective(0.52, asp, 0.1, 10.0);
    /* translate Z back so cloud is behind the viewer plane */
    mvp[14] += -2.8;

    gl.uniformMatrix4fv(locMVP, false, mvp);
    /* pass fresh mouse coords every frame — this is the fix */
    gl.uniform1f(locMX, mouse.nx);
    gl.uniform1f(locMY, mouse.ny);
    gl.uniform1f(locTime, time);

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    gl.uniform3fv(locColor, isDark ? [0.66, 0.77, 0.74] : [0.18, 0.48, 0.44]);

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.enableVertexAttribArray(locPos);
    gl.vertexAttribPointer(locPos, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuf);
    gl.enableVertexAttribArray(locSize);
    gl.vertexAttribPointer(locSize, 1, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, N);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();

/* ──────────────────────────────────────
   3D CAROUSEL
   Cylinder rotates around Y axis.
   Cards are placed with:
     rotateY(θ) translateZ(R)
   so they form a circle viewed from
   above-front — cards recede INTO the
   screen as they rotate away from front.
   perspective-origin is set high (30%)
   to give the "looking down into a drum"
   feeling.
────────────────────────────────────── */
(function initCarousel() {

  /* ---- curated project list ---- */
  const CURATED = [
    {
      name:  'Filadentification',
      desc:  'AI-powered species identification tool for marine organisms. Combines image classification and taxonomic matching to assist field researchers.',
      lang:  'Python',
      icon:  '🔬',
      url:   'https://github.com/DolapoSalim'
    },
    {
      name:  'EcoQuad',
      desc:  'Quadrat-based ecological survey tool with automated species counting using computer vision, designed for benthic monitoring.',
      lang:  'Python',
      icon:  '🌿',
      url:   'https://github.com/DolapoSalim'
    },
    {
      name:  'YOLO-label-Converter',
      desc:  'Utility to convert annotation formats (COCO, Pascal VOC, CSV) to YOLO-compatible label files for object detection training pipelines.',
      lang:  'Python',
      icon:  '⚙',
      url:   'https://github.com/DolapoSalim'
    },
    {
      name:  'Voting-Ensemble-Model',
      desc:  'Hard and soft voting ensemble framework combining multiple trained classifiers to improve species prediction accuracy and robustness.',
      lang:  'Python',
      icon:  '🤖',
      url:   'https://github.com/DolapoSalim'
    },
    {
      name:  'Hierarchical-Clustering-Dendrogram',
      desc:  'R-based hierarchical clustering and dendrogram visualisation for ecological community analysis and biodiversity grouping studies.',
      lang:  'R',
      icon:  '📊',
      url:   'https://github.com/DolapoSalim'
    },
    {
      name:  'PyObis',
      desc:  'Python wrapper for the OBIS (Ocean Biodiversity Information System) API — fetch, filter, and analyse global marine species occurrence data.',
      lang:  'Python',
      icon:  '🌊',
      url:   'https://github.com/DolapoSalim'
    },
    {
      name:  'SMR-with-Python',
      desc:  'Standard Metabolic Rate analysis pipeline in Python: data ingestion, outlier detection, Q10 calculation, and automated reporting.',
      lang:  'Python',
      icon:  '📈',
      url:   'https://github.com/DolapoSalim'
    },
    {
      name:  'OCR-Analysis-of-ChatGPT-Chat',
      desc:  'OCR pipeline that extracts and analyses text from exported ChatGPT conversation screenshots, enabling topic mining and usage analytics.',
      lang:  'Python',
      icon:  '📝',
      url:   'https://github.com/DolapoSalim'
    }
  ];

  const LANG_COLORS = {
    Python:'#3572A5', R:'#198CE7', JavaScript:'#f0d060',
    Jupyter:'#DA5B0B', HTML:'#e34c26', Shell:'#89e051',
    CSS:'#6e5494', TypeScript:'#2b7489'
  };

  /* ---- state ---- */
  let currentAngle = 0;   // current displayed angle (degrees)
  let targetAngle  = 0;   // destination angle
  let rafId        = null;
  let isDragging   = false;
  let dragStartX   = 0;
  let dragStartAngle = 0;
  const CARD_COUNT = CURATED.length;
  const STEP = 360 / CARD_COUNT;
  /* Radius chosen so cards don't overlap and give a strong 3D feel */
  const RADIUS = Math.max(460, CARD_COUNT * 58);

  const stage    = document.getElementById('carouselStage');
  const ctrls    = document.getElementById('carouselCtrls');
  const loading  = document.getElementById('repoLoading');

  /* ---- build cards ---- */
  function buildCards() {
    if (loading) loading.remove();

    stage.style.transformOrigin = `150px 180px ${-RADIUS}px`;

    CURATED.forEach((repo, i) => {
      const theta = i * STEP;          // degrees, evenly spaced
      const langClass = LANG_COLORS[repo.lang] ? `ld-${repo.lang}` : 'ld-other';

      const card = document.createElement('div');
      card.className = 'p-card';
      /* Place each card on the cylinder surface.
         rotateY(theta) spins it around the Y-axis hub,
         translateZ(RADIUS) pushes it outward to the cylinder wall. */
      card.style.transform = `rotateY(${theta}deg) translateZ(${RADIUS}px)`;

      card.innerHTML = `
        <div class="p-card-top">
          <div class="p-card-icon">${repo.icon}</div>
        </div>
        <div class="p-name">${repo.name}</div>
        <div class="p-desc">${repo.desc}</div>
        <div class="p-footer">
          <div class="p-lang">
            <span class="ld ${langClass}"></span>${repo.lang}
          </div>
          <a href="${repo.url}" target="_blank" class="p-link"
             onclick="event.stopPropagation()">
            View repo ↗
          </a>
        </div>
      `;
      stage.appendChild(card);
    });

    setAngle(0);
    ctrls.style.display = 'flex';
    bindInteraction();

    /* also try to update URLs from GitHub API in background */
    enrichFromGitHub();
  }

  /* ---- rotation math ---- */
  function setAngle(deg) {
    /* We rotate the STAGE negatively — rotating stage by -θ
       brings the card at position θ to the front */
    stage.style.transform = `rotateY(${-deg}deg)`;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateTo() {
    currentAngle = lerp(currentAngle, targetAngle, 0.1);
    setAngle(currentAngle);
    if (Math.abs(targetAngle - currentAngle) > 0.05) {
      rafId = requestAnimationFrame(animateTo);
    } else {
      currentAngle = targetAngle;
      setAngle(currentAngle);
      rafId = null;
    }
  }

  function rotateTo(deg) {
    targetAngle = deg;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(animateTo);
  }

  function stepNext() { rotateTo(targetAngle + STEP); }
  function stepPrev() { rotateTo(targetAngle - STEP); }

  /* ---- interaction binding ---- */
  function bindInteraction() {
    const viewport = document.getElementById('carouselOuter');

    /* Mouse drag */
    viewport.addEventListener('mousedown', e => {
      isDragging    = true;
      dragStartX    = e.clientX;
      dragStartAngle = targetAngle;
      /* stop animation so drag feels immediate */
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      currentAngle = targetAngle;
    });

    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      /* sensitivity: larger divisor = slower */
      targetAngle  = dragStartAngle - dx * 0.45;
      currentAngle = targetAngle;
      setAngle(currentAngle);
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    /* Touch drag */
    viewport.addEventListener('touchstart', e => {
      isDragging     = true;
      dragStartX     = e.touches[0].clientX;
      dragStartAngle = targetAngle;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      currentAngle = targetAngle;
    }, { passive: true });

    viewport.addEventListener('touchmove', e => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - dragStartX;
      targetAngle  = dragStartAngle - dx * 0.45;
      currentAngle = targetAngle;
      setAngle(currentAngle);
    }, { passive: true });

    viewport.addEventListener('touchend', () => { isDragging = false; });

    /* Arrow buttons */
    document.getElementById('cNext').addEventListener('click', stepNext);
    document.getElementById('cPrev').addEventListener('click', stepPrev);
  }

  /* ---- enrich URLs from GitHub API in background ---- */
  async function enrichFromGitHub() {
    try {
      const res   = await fetch('https://api.github.com/users/DolapoSalim/repos?per_page=100&type=public');
      if (!res.ok) return;
      const repos = await res.json();
      const map   = {};
      repos.forEach(r => { map[r.name.toLowerCase()] = r; });

      stage.querySelectorAll('.p-card').forEach(card => {
        const nameEl = card.querySelector('.p-name');
        const link   = card.querySelector('.p-link');
        if (!nameEl || !link) return;
        const key  = nameEl.textContent.trim().toLowerCase();
        /* fuzzy match: try exact, then with hyphens normalised */
        const repo = map[key]
                  || map[key.replace(/-/g, '')]
                  || map[key.replace(/ /g, '-')]
                  || map[key.replace(/ /g, '')];
        if (repo) {
          link.href = repo.html_url;
          /* update star count if present */
          const top = card.querySelector('.p-card-top');
          if (top && repo.stargazers_count > 0) {
            const stars = document.createElement('div');
            stars.className = 'p-stars';
            stars.textContent = `★ ${repo.stargazers_count}`;
            top.appendChild(stars);
          }
          /* update language dot if repo has a language */
          if (repo.language) {
            const langEl = card.querySelector('.p-lang');
            if (langEl) {
              const dot = langEl.querySelector('.ld');
              const LANG_COLORS_MAP = {
                Python:'ld-Python', R:'ld-R', JavaScript:'ld-JavaScript',
                Jupyter:'ld-Jupyter', HTML:'ld-HTML', Shell:'ld-Shell',
                CSS:'ld-CSS', TypeScript:'ld-TypeScript'
              };
              if (dot) {
                dot.className = `ld ${LANG_COLORS_MAP[repo.language] || 'ld-other'}`;
              }
              langEl.lastChild.textContent = repo.language;
            }
          }
        }
      });
    } catch (_) { /* silent fail — curated data is already there */ }
  }

  /* ---- init ---- */
  buildCards();

})();

/* ──────────────────────────────────────
   LOADING DOTS ANIMATION
────────────────────────────────────── */
(function loadingDots() {
  const el = document.getElementById('ldots');
  if (!el) return;
  let n = 0;
  const id = setInterval(() => {
    if (!document.getElementById('ldots')) { clearInterval(id); return; }
    el.textContent = '.'.repeat(n++ % 4);
  }, 380);
})();

/* ──────────────────────────────────────
   CONTACT FORM
────────────────────────────────────── */
(function initContact() {
  const form = document.getElementById('cf');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('cn').value;
    const email = document.getElementById('ce').value;
    const msg   = document.getElementById('cm').value;
    const sub   = encodeURIComponent(`Message from ${name}`);
    const body  = encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${msg}`);
    window.location.href = `mailto:dolapo.olatoye@phd.unipi.it?subject=${sub}&body=${body}`;
    const feedback = document.getElementById('cfMsg');
    feedback.textContent = '✓ Opening your email client…';
    feedback.style.display = 'block';
  });
})();