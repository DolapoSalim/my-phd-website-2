'use strict';

/* THEME */
(function(){
  const html=document.documentElement,btn=document.getElementById('themeBtn');
  const saved=localStorage.getItem('ods-theme')||'dark';
  html.setAttribute('data-theme',saved);
  btn.textContent=saved==='dark'?'☀ Light':'☾ Dark';
  btn.addEventListener('click',()=>{
    const next=html.getAttribute('data-theme')==='dark'?'light':'dark';
    html.setAttribute('data-theme',next);
    localStorage.setItem('ods-theme',next);
    btn.textContent=next==='dark'?'☀ Light':'☾ Dark';
  });
})();

/* HAMBURGER */
(function(){
  const hbg=document.getElementById('hbg'),mob=document.getElementById('mobNav');
  if(!hbg||!mob)return;
  hbg.addEventListener('click',()=>{hbg.classList.toggle('open');mob.classList.toggle('open');});
  mob.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{hbg.classList.remove('open');mob.classList.remove('open');}));
})();

/* ═══════════════════════════════════════════════════════
   HERO NAME — per-letter reveal + shine sweep
   Splits "Olatoye / Dolapo Salim" into spans so each
   character animates in on load, then a gold shine
   sweeps across the whole name once everything has landed.
═══════════════════════════════════════════════════════ */
(function initHeroName(){
  const nameEl = document.querySelector('.hero-name');
  if (!nameEl) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Wrap each character of every text node in a span, preserving
     existing markup (the <em> around "Dolapo Salim" and the <br>). */
  function splitChars(root){
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    let n;
    while ((n = walker.nextNode())) textNodes.push(n);

    let globalIndex = 0;
    textNodes.forEach(node => {
      const text = node.textContent;
      const frag = document.createDocumentFragment();
      for (const ch of text){
        if (ch === ' '){
          frag.appendChild(document.createTextNode('\u00A0'));
          continue;
        }
        const span = document.createElement('span');
        span.className = 'hn-char';
        span.textContent = ch;
        span.style.transitionDelay = `${globalIndex * 28}ms`;
        frag.appendChild(span);
        globalIndex++;
      }
      node.parentNode.replaceChild(frag, node);
    });
    return globalIndex; /* total animated chars, used to time the shine */
  }

  if (reduced){
    /* Skip the staged reveal entirely — just wrap in shine for a static look */
    nameEl.classList.add('hn-ready');
    return;
  }

  const charCount = splitChars(nameEl);

  /* Wrap the whole name in a shine layer AFTER chars exist, so the
     shine gradient sweeps over the already-revealed glyphs.
     Double rAF ensures the browser has committed the initial
     (pre-transition) styles before we flip the class — otherwise
     the transition can be skipped and chars just "pop" in. */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      nameEl.classList.add('hn-ready');
    });
  });

  /* Apply the shine sweep once the stagger reveal has finished. */
  const revealTime = 700 + charCount * 28; /* matches CSS transition + stagger */
  window.setTimeout(() => {
    const shine = document.createElement('span');
    shine.className = 'hn-shine';
    /* Move all current children into the shine wrapper */
    while (nameEl.firstChild) shine.appendChild(nameEl.firstChild);
    nameEl.appendChild(shine);
  }, revealTime + 80);
})();

/* INTERSECTION OBSERVER */
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');io.unobserve(e.target);}});
},{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.fi,.tl-item,.pub,.news-item,.proj-item').forEach(el=>io.observe(el));

/* ═══════════════════════════════════════════════════════
   SECTION TITLES — word-by-word reveal on scroll
   Splits each <h2 class="sec-title"> into word spans and
   reveals them with a staggered tilt-up as the section
   enters the viewport (separate observer so the per-word
   stagger delay doesn't collide with the .fi fade timing).
═══════════════════════════════════════════════════════ */
(function initSectionTitles(){
  const titles = document.querySelectorAll('.sec-title');
  if (!titles.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  titles.forEach(title=>{
    /* Split into words while preserving any <br> tags in the markup
       (e.g. "Marine Biologist<br>& AI Researcher") — textContent alone
       would flatten the line break, so walk childNodes instead. */
    const original = Array.from(title.childNodes);
    title.innerHTML = '';
    let wordIndex = 0;

    original.forEach(node=>{
      if (node.nodeType === Node.TEXT_NODE){
        const words = node.textContent.trim().split(/\s+/).filter(Boolean);
        words.forEach(w=>{
          const span=document.createElement('span');
          span.className='st-word';
          span.textContent=w;
          span.style.transitionDelay = reduced?'0ms':`${wordIndex*70}ms`;
          title.appendChild(span);
          title.appendChild(document.createTextNode(' '));
          wordIndex++;
        });
      } else {
        /* <br> or any other element — keep as-is */
        title.appendChild(node.cloneNode(true));
      }
    });

    /* Drop a trailing space text node, if the title ended on one */
    if (title.lastChild && title.lastChild.nodeType === Node.TEXT_NODE){
      title.removeChild(title.lastChild);
    }

    if (reduced){ title.classList.add('st-ready'); }
  });

  if (reduced) return;

  const titleIO=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('st-ready');
        titleIO.unobserve(e.target);
      }
    });
  },{threshold:0.3,rootMargin:'0px 0px -60px 0px'});
  titles.forEach(t=>titleIO.observe(t));
})();

/* ═══════════════════════════════════════════════════════
   CARD SPOTLIGHT + TILT
   Publication and project cards track the cursor: a soft
   radial glow follows the pointer (via --mx/--my custom
   properties already wired in CSS) and the card tilts
   gently in 3D toward the cursor position.

   Exposed as window.initCardTilt so it can be re-run after
   the project list is injected dynamically (see below).
═══════════════════════════════════════════════════════ */
function initCardTilt(scope){
  const root = scope || document;
  const cards = root.querySelectorAll('.pub, .proj-item');
  if (!cards.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const MAX_TILT = 5;     /* degrees — kept gentle for a research site */
  const LIFT     = -4;    /* px translateY on hover */

  cards.forEach(card=>{
    if (card.dataset.tiltBound) return; /* avoid double-binding */
    card.dataset.tiltBound = '1';
    card.addEventListener('mouseenter', ()=>{
      /* No transition while actively tracking — the tilt should follow
         the cursor instantly. The CSS transition (for the snap-back)
         only kicks in once we re-add it on mouseleave. */
      card.style.transition = 'border-color var(--t) var(--ease), box-shadow var(--t) var(--ease)';
    });
    card.addEventListener('mousemove', e=>{
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);

      const cx = x / rect.width  - 0.5;
      const cy = y / rect.height - 0.5;
      const rotY =  cx * MAX_TILT * 2;
      const rotX = -cy * MAX_TILT * 2;
      card.style.transform = `translateY(${LIFT}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });
    card.addEventListener('mouseleave', ()=>{
      card.style.transition = 'border-color var(--t) var(--ease), box-shadow var(--t) var(--ease), transform 0.4s var(--ease)';
      card.style.transform = '';
    });
  });
}
initCardTilt();

/* ═══════════════════════════════════════════════════════
   MARINE PARTICLE PHYSICS  (Canvas 2D)
   Fish, bubbles, and plankton float with buoyancy.
   Mouse causes repulsion — like Anti-Gravity but marine.
   Particles are drawn on a canvas behind the hero text.
═══════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   CV-THEMED PARTICLE SYSTEM
   ───────────────────────────────────────────────────────────
   Geometric particles in the site's single accent colour:
   dots, rings, and corner-bracket "bounding-box" shapes —
   the visual language of computer vision annotation.

   Particles drift slowly. On mouse/touch move they ATTRACT
   toward the cursor (like Antigravity), then slowly drift
   back. All drawn in one muted teal tone — no colours.
═══════════════════════════════════════════════════════════ */
(function initParticles(){
  const canvas = document.getElementById('marine-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* ── sizing ── */
  let W = 0, H = 0;

  function resize(){
    const hero = document.getElementById('hero');
    W = canvas.width  = hero ? hero.offsetWidth  : window.innerWidth;
    H = canvas.height = hero ? hero.offsetHeight : window.innerHeight;
    updateRect();
  }

  /* ── accent colour — single teal, two shades for dark/light ── */
  function accentRGB(){
    return document.documentElement.getAttribute('data-theme') === 'light'
      ? '42,122,111'    /* dark teal for light bg */
      : '168,197,190';  /* muted teal-white for dark bg */
  }

  /* ── particle shapes: dot, ring, bbox (corner brackets) ── */
  const SHAPES = ['dot','dot','dot','ring','ring','bbox'];

  /* ── mouse coords — cached rect so scroll doesn't break coords ── */
  const mouse = { x: -9999, y: -9999, active: false };
  let canvasRect = { left: 0, top: 0 };

  function updateRect(){
    canvasRect = canvas.getBoundingClientRect();
  }

  /* Recompute rect on resize and scroll — NOT on every mousemove */
  window.addEventListener('resize', updateRect);
  window.addEventListener('scroll', updateRect, { passive: true });

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX - canvasRect.left;
    mouse.y = e.clientY - canvasRect.top;
    mouse.active = true;
  });
  window.addEventListener('touchmove', e => {
    if (!e.touches.length) return;
    mouse.x = e.touches[0].clientX - canvasRect.left;
    mouse.y = e.touches[0].clientY - canvasRect.top;
    mouse.active = true;
  }, { passive: true });
  window.addEventListener('touchend',  () => { mouse.active = false; });
  document.addEventListener('mouseleave', () => { mouse.active = false; });

  /* ── particle factory ── */
  function make(){
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const size  = shape === 'bbox'
      ? 18 + Math.random() * 28
      : shape === 'ring'
        ? 4  + Math.random() * 8
        : 2  + Math.random() * 3;
    const x = Math.random() * W;
    const y = Math.random() * H;
    return {
      x,  y,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      ox: x,   /* ← home X = spawn X, NOT 0 */
      oy: y,   /* ← home Y = spawn Y, NOT 0 */
      shape, size,
      alpha: 0.18 + Math.random() * 0.38,
      angle: Math.random() * Math.PI * 2,
      spin:  (Math.random() - 0.5) * 0.003,
    };
  }

  /* ── init particles after we know W and H ── */
  const COUNT = 65;
  const pts   = [];

  function init(){
    resize();
    pts.length = 0;
    for (let i = 0; i < COUNT; i++) pts.push(make());
  }

  window.addEventListener('resize', () => { resize(); });

  /* ── draw helpers ── */
  function drawDot(p, c){
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${c},${p.alpha})`;
    ctx.fill();
  }

  function drawRing(p, c){
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${c},${p.alpha})`;
    ctx.lineWidth   = 1;
    ctx.stroke();
    /* tiny centre dot */
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${c},${p.alpha * 0.7})`;
    ctx.fill();
  }

  function drawBbox(p, c){
    /* corner-bracket "bounding box" — the CV annotation symbol */
    const s  = p.size;        /* half-size of the box */
    const arm = s * 0.38;     /* length of each bracket arm */
    const lw  = 1.2;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.strokeStyle = `rgba(${c},${p.alpha})`;
    ctx.lineWidth   = lw;
    ctx.beginPath();
    /* top-left */
    ctx.moveTo(-s + arm, -s);  ctx.lineTo(-s, -s); ctx.lineTo(-s, -s + arm);
    /* top-right */
    ctx.moveTo( s - arm, -s);  ctx.lineTo( s, -s); ctx.lineTo( s, -s + arm);
    /* bottom-right */
    ctx.moveTo( s - arm,  s);  ctx.lineTo( s,  s); ctx.lineTo( s,  s - arm);
    /* bottom-left */
    ctx.moveTo(-s + arm,  s);  ctx.lineTo(-s,  s); ctx.lineTo(-s,  s - arm);
    ctx.stroke();
    /* subtle cross-hair centre */
    ctx.globalAlpha = p.alpha * 0.35;
    ctx.beginPath();
    ctx.moveTo(-4, 0); ctx.lineTo(4, 0);
    ctx.moveTo(0, -4); ctx.lineTo(0, 4);
    ctx.stroke();
    ctx.restore();
  }

  /* ── draw connecting lines between nearby particles ── */
  function drawConnections(c){
    const LINK_DIST = 90;
    ctx.lineWidth = 0.4;
    for (let i = 0; i < pts.length; i++){
      for (let j = i + 1; j < pts.length; j++){
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < LINK_DIST){
          const a = (1 - d / LINK_DIST) * 0.12;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${c},${a})`;
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
  }

  /* ── animation loop ── */
  const ATTRACT_R = 900;    /* px — radius mouse pulls particles */
  const ATTRACT_F = 1.82;   /* pull strength — strong enough to visibly move */
  const RETURN_F  = 0.0008; /* spring back to home — much weaker than attraction */
  const DAMPING   = 0.99;   /* velocity friction each frame */

  function frame(){
    ctx.clearRect(0, 0, W, H);
    const c = accentRGB();

    for (const p of pts){
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      const near = mouse.active && d < ATTRACT_R;

      /* ── 1. Mouse attraction — only when mouse is close ── */
      if (near && d > 1){
        const t = 1 - d / ATTRACT_R;   /* 1 at cursor, 0 at edge */
        p.vx += (dx / d) * ATTRACT_F * t;
        p.vy += (dy / d) * ATTRACT_F * t;
      }

      /* ── 2. Gentle home spring — reduced when mouse is nearby so
              attraction wins cleanly ── */
      const springScale = near ? 0.1 : 1.0;
      p.vx += (p.ox - p.x) * RETURN_F * springScale;
      p.vy += (p.oy - p.y) * RETURN_F * springScale;

      /* ── 3. Dampen + integrate ── */
      p.vx *= DAMPING;
      p.vy *= DAMPING;
      p.x  += p.vx;
      p.y  += p.vy;
      p.angle += p.spin;

      /* ── 4. Soft edge wrap — reset home on wrap ── */
      const pad = p.size + 4;
      if (p.x < -pad)    { p.x = W + pad; p.ox = p.x; }
      if (p.x > W + pad) { p.x = -pad;    p.ox = p.x; }
      if (p.y < -pad)    { p.y = H + pad; p.oy = p.y; }
      if (p.y > H + pad) { p.y = -pad;    p.oy = p.y; }

      /* ── 5. Draw ── */
      if      (p.shape === 'dot')  drawDot(p, c);
      else if (p.shape === 'ring') drawRing(p, c);
      else                         drawBbox(p, c);
    }

    drawConnections(c);
    requestAnimationFrame(frame);
  }

  /* Start — init must run first so W/H are set before spawning */
  init();
  updateRect();   /* cache canvas position before first mousemove */
  requestAnimationFrame(frame);
})();

/* ═══════════════════════════════════════════════════════
   WAVES BACKGROUND  (Canvas 2D, Perlin-noise wave-lines)
   ───────────────────────────────────────────────────────
   A field of horizontal lines perturbed by 2D Perlin noise
   and gently pushed by the cursor — drawn behind the CV-Demo
   section. Pure canvas, no dependencies. Matches the site's
   marine theme: literal ocean wave-lines as a section divider.
═══════════════════════════════════════════════════════ */
(function initWavesBackground(){
  const host = document.getElementById('waves-bg');
  if (!host) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── tiny seeded Perlin noise (2D) ── */
  class Grad { constructor(x,y){ this.x=x; this.y=y; } dot2(x,y){ return this.x*x + this.y*y; } }
  class Noise {
    constructor(seed){
      this.grad3=[new Grad(1,1),new Grad(-1,1),new Grad(1,-1),new Grad(-1,-1),
                  new Grad(1,0),new Grad(-1,0),new Grad(0,1),new Grad(0,-1)];
      this.p=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,
        21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,
        237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,
        111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,
        80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,
        3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,
        17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,
        129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,
        238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,
        184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,
        195,78,66,215,61,156,180];
      this.perm=new Array(512); this.gradP=new Array(512); this.seed(seed);
    }
    seed(seed){
      if (seed>0 && seed<1) seed*=65536;
      seed=Math.floor(seed);
      if (seed<256) seed |= seed<<8;
      for (let i=0;i<256;i++){
        const v = i&1 ? this.p[i]^(seed&255) : this.p[i]^((seed>>8)&255);
        this.perm[i]=this.perm[i+256]=v;
        this.gradP[i]=this.gradP[i+256]=this.grad3[v%8];
      }
    }
    fade(t){ return t*t*t*(t*(t*6-15)+10); }
    lerp(a,b,t){ return (1-t)*a + t*b; }
    perlin2(x,y){
      let X=Math.floor(x), Y=Math.floor(y);
      x-=X; y-=Y; X&=255; Y&=255;
      const n00=this.gradP[X+this.perm[Y]].dot2(x,y);
      const n01=this.gradP[X+this.perm[Y+1]].dot2(x,y-1);
      const n10=this.gradP[X+1+this.perm[Y]].dot2(x-1,y);
      const n11=this.gradP[X+1+this.perm[Y+1]].dot2(x-1,y-1);
      const u=this.fade(x);
      return this.lerp(this.lerp(n00,n10,u), this.lerp(n01,n11,u), this.fade(y));
    }
  }

  const canvas = document.createElement('canvas');
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const noise = new Noise(Math.random());

  const cfg = {
    waveSpeedX: 0.0125, waveSpeedY: 0.005,
    waveAmpX: 22, waveAmpY: 11,
    xGap: 26, yGap: 38,
    friction: 0.925, tension: 0.005,
    maxCursorMove: 80
  };

  let W=0, H=0, lines=[];
  const bounding = { left:0, top:0 };
  const mouse = { x:-9999, y:0, lx:0, ly:0, sx:0, sy:0, v:0, vs:0, a:0, set:false };

  function lineColor(){
    return document.documentElement.getAttribute('data-theme')==='light'
      ? 'rgba(42,122,111,0.16)'
      : 'rgba(168,197,190,0.14)';
  }

  function setSize(){
    const rect = host.getBoundingClientRect();
    bounding.left = rect.left; bounding.top = rect.top;
    W = canvas.width  = rect.width;
    H = canvas.height = rect.height;
  }

  function setLines(){
    lines = [];
    const oWidth = W + 200, oHeight = H + 40;
    const totalLines  = Math.ceil(oWidth  / cfg.xGap);
    const totalPoints = Math.ceil(oHeight / cfg.yGap);
    const xStart = (W - cfg.xGap*totalLines) / 2;
    const yStart = (H - cfg.yGap*totalPoints) / 2;
    for (let i=0;i<=totalLines;i++){
      const pts=[];
      for (let j=0;j<=totalPoints;j++){
        pts.push({ x:xStart+cfg.xGap*i, y:yStart+cfg.yGap*j, wave:{x:0,y:0}, cursor:{x:0,y:0,vx:0,vy:0} });
      }
      lines.push(pts);
    }
  }

  function movePoints(t){
    lines.forEach(pts=>{
      pts.forEach(p=>{
        const move = noise.perlin2((p.x + t*cfg.waveSpeedX)*0.0025, (p.y + t*cfg.waveSpeedY)*0.0018) * 12;
        p.wave.x = Math.cos(move) * cfg.waveAmpX;
        p.wave.y = Math.sin(move) * cfg.waveAmpY;

        const dx = p.x - mouse.sx, dy = p.y - mouse.sy;
        const dist = Math.hypot(dx,dy), l = Math.max(160, mouse.vs);
        if (dist < l){
          const s = 1 - dist/l;
          const f = Math.cos(dist*0.001) * s;
          p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00055;
          p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00055;
        }
        p.cursor.vx += (0 - p.cursor.x) * cfg.tension;
        p.cursor.vy += (0 - p.cursor.y) * cfg.tension;
        p.cursor.vx *= cfg.friction;
        p.cursor.vy *= cfg.friction;
        p.cursor.x += p.cursor.vx * 2;
        p.cursor.y += p.cursor.vy * 2;
        p.cursor.x = Math.min(cfg.maxCursorMove, Math.max(-cfg.maxCursorMove, p.cursor.x));
        p.cursor.y = Math.min(cfg.maxCursorMove, Math.max(-cfg.maxCursorMove, p.cursor.y));
      });
    });
  }

  function moved(p, withCursor){
    const x = p.x + p.wave.x + (withCursor ? p.cursor.x : 0);
    const y = p.y + p.wave.y + (withCursor ? p.cursor.y : 0);
    return { x: Math.round(x*10)/10, y: Math.round(y*10)/10 };
  }

  function drawLines(){
    ctx.clearRect(0,0,W,H);
    ctx.beginPath();
    ctx.strokeStyle = lineColor();
    ctx.lineWidth = 1;
    lines.forEach(points=>{
      let p1 = moved(points[0], false);
      ctx.moveTo(p1.x, p1.y);
      points.forEach((p,idx)=>{
        const isLast = idx === points.length-1;
        p1 = moved(p, !isLast);
        const p2 = moved(points[idx+1] || points[points.length-1], !isLast);
        ctx.lineTo(p1.x, p1.y);
        if (isLast) ctx.moveTo(p2.x, p2.y);
      });
    });
    ctx.stroke();
  }

  let rafId = null;
  let running = true;

  function tick(t){
    mouse.sx += (mouse.x - mouse.sx) * 0.1;
    mouse.sy += (mouse.y - mouse.sy) * 0.1;
    const dx = mouse.x - mouse.lx, dy = mouse.y - mouse.ly;
    const d = Math.hypot(dx,dy);
    mouse.v = d;
    mouse.vs += (d - mouse.vs) * 0.1;
    mouse.vs = Math.min(100, mouse.vs);
    mouse.lx = mouse.x; mouse.ly = mouse.y;
    mouse.a = Math.atan2(dy,dx);

    movePoints(t);
    drawLines();
    if (running) rafId = requestAnimationFrame(tick);
  }

  function updateMouse(x,y){
    mouse.x = x - bounding.left;
    mouse.y = y - bounding.top;
    if (!mouse.set){ mouse.sx=mouse.x; mouse.sy=mouse.y; mouse.lx=mouse.x; mouse.ly=mouse.y; mouse.set=true; }
  }

  window.addEventListener('resize', ()=>{ setSize(); setLines(); });
  window.addEventListener('mousemove', e=>updateMouse(e.clientX, e.clientY));
  window.addEventListener('touchmove', e=>{
    if (!e.touches.length) return;
    updateMouse(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive:true });

  /* Pause the loop when the section is off-screen — saves CPU on long pages */
  const sectionIO = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      running = e.isIntersecting;
      if (running && !rafId) rafId = requestAnimationFrame(tick);
    });
  }, { threshold:0 });
  sectionIO.observe(host.closest('section') || host);

  setSize();
  setLines();
  rafId = requestAnimationFrame(tick);
})();

/* ═══════════════════════════════════════════════════════
   STAT COUNT-UP
   Animates the numbers in the About section's stats block
   (Publications, EU Projects, MSc Grade, Countries) from 0
   up to their target value once scrolled into view.
═══════════════════════════════════════════════════════ */
(function initCountUp(){
  const stats = document.querySelectorAll('.stat-n[data-count]');
  if (!stats.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animate(el){
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduced || !Number.isFinite(target)){
      el.textContent = target + suffix;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    function step(now){
      if (typeof now !== 'number') now = performance.now(); /* defensive: some envs omit the rAF timestamp */
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); /* ease-out cubic */
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const statIO = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if (e.isIntersecting){
        animate(e.target);
        statIO.unobserve(e.target);
      }
    });
  }, { threshold:0.5 });
  stats.forEach(s=>statIO.observe(s));
})();

/* ═══════════════════════════════════════════════════════
   MAGNETIC HERO BUTTONS
   The hero CTA buttons (Publications / Download CV / Contact)
   gently pull toward the cursor when it's nearby, and ease
   back when it moves away — a tactile touch on the page's
   primary calls to action.
═══════════════════════════════════════════════════════ */
(function initMagneticButtons(){
  const buttons = document.querySelectorAll('.hero-ctas .btn');
  if (!buttons.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return; /* skip on touch devices */

  const PADDING = 60;     /* px beyond the button edge that still attracts */
  const STRENGTH = 3.2;   /* higher = less travel for the same cursor distance */

  buttons.forEach(btn=>{
    btn.style.willChange = 'transform';
    btn.addEventListener('mousemove', e=>{
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      btn.style.transition = 'transform 0.25s cubic-bezier(0.2,0.8,0.2,1)';
      btn.style.transform = `translate(${dx/STRENGTH}px, ${dy/STRENGTH}px)`;
    });
    btn.addEventListener('mouseleave', ()=>{
      btn.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)'; /* slight overshoot settle */
      btn.style.transform = 'translate(0,0)';
    });
  });
})();

/* PROJECTS LIST */
(function initProjects(){
  const PROJECTS=[
    {name:'EcoQuad',year:'2026',desc:'Quadrat-based ecological survey tool with automated species counting via computer vision. Designed for benthic monitoring and streamlining field data collection.',tags:['Python', 'OpenCV', 'Ecology'],url:'https://github.com/DolapoSalim'},
    {name:'GraphRAG-MarineMind',year:'2026',desc:'A deterministic Graph-RAG system for interpreting imaging-based ecological variables and environmental monitoring data',tags:['GraphRAG', 'Python', 'Machine Learning'],url:'https://github.com/DolapoSalim'},
    {name:'YOLO-label-Converter',year:'2025',desc:'Converts annotation formats (COCO, Pascal VOC, CSV) to YOLO-compatible labels. Supports batch processing and custom class remapping for detection training pipelines.',tags:['Python', 'Annotation', 'YOLO'],url:'https://github.com/DolapoSalim'},
    {name:'Voting-Ensemble-Model',year:'2025',desc:'Hard and soft voting ensemble framework combining multiple classifiers. Improves species prediction accuracy and robustness on imbalanced marine biodiversity datasets.',tags:['Python', 'Machine Learning', 'Ensemble'],url:'https://github.com/DolapoSalim'},
    {name:'Hierarchical-Clustering-Dendrogram',year:'2024',desc:'R-based hierarchical clustering and dendrogram visualisation for ecological community analysis, biodiversity grouping, and habitat similarity studies.',tags:['R', 'Statistics', 'Ecology'],url:'https://github.com/DolapoSalim'},
    {name:'PyObis',year:'2025',desc:'Python wrapper for the OBIS (Ocean Biodiversity Information System) API. Fetch, filter, and analyse global marine species occurrence data programmatically.',tags:['Python', 'API', 'Biodiversity'],url:'https://github.com/DolapoSalim'},
    {name:'OCR-Analysis-of-ChatGPT-Chat',year:'2024',desc:'OCR pipeline extracting and analysing text from exported ChatGPT conversation screenshots, enabling topic mining, keyword frequency analysis, and AI usage pattern exploration.',tags:['Python', 'OCR', 'NLP'],url:'https://github.com/DolapoSalim'},
  ];

  const list=document.getElementById('projectsList');
  if(!list)return;

  PROJECTS.forEach((proj,i)=>{
    const item=document.createElement('div');
    item.className='proj-item fi';
    item.style.transitionDelay=`${i*0.05}s`;
    item.innerHTML=`
      <div class="proj-year">${proj.year}</div>
      <div class="proj-body">
        <div class="proj-title"><span class="proj-icon"></span>${proj.name}</div>
        <div class="proj-desc">${proj.desc}</div>
        <div class="proj-tags">${proj.tags.map(t=>`<span class="ptag">•${t} </span>`).join('')}</div>
      </div>
      <a href="${proj.url}" target="_blank" class="proj-link" aria-label="View ${proj.name}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </a>`;
    list.appendChild(item);
    io.observe(item);
  });

  initCardTilt(list); /* bind spotlight + tilt to the freshly-created project cards */

  /* Enrich URLs from GitHub API silently */
  fetch('https://api.github.com/users/DolapoSalim/repos?per_page=100&type=public')
    .then(r=>r.ok?r.json():Promise.reject())
    .then(repos=>{
      const map={};
      repos.forEach(r=>{map[r.name.toLowerCase().replace(/-/g,'')]=r;});
      list.querySelectorAll('.proj-item').forEach(item=>{
        const t=item.querySelector('.proj-title');
        const a=item.querySelector('.proj-link');
        if(!t||!a)return;
        const key=t.textContent.trim().toLowerCase().replace(/[\s\-_]/g,'').replace(/[^a-z0-9]/g,'');
        const repo=map[key];
        if(repo){
          a.href=repo.html_url;
          if(repo.stargazers_count>0){
            const s=document.createElement('span');
            s.className='proj-stars';s.textContent=`★ ${repo.stargazers_count}`;
            item.querySelector('.proj-body').appendChild(s);
          }
        }
      });
    })
    .catch(()=>{});
})();

/* CONTACT */
(function(){
  const form=document.getElementById('cf');
  if(!form)return;
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const n=document.getElementById('cn').value;
    const em=document.getElementById('ce').value;
    const m=document.getElementById('cm').value;
    window.location.href=`mailto:dolapo.olatoye@phd.unipi.it?subject=${encodeURIComponent('Message from '+n)}&body=${encodeURIComponent('From: '+n+'\nEmail: '+em+'\n\n'+m)}`;
    const fb=document.getElementById('cfMsg');
    fb.textContent='Opening your email client…';
    fb.style.display='block';
  });
})();