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
  if (window.matchMedia('(pointer: coarse)').matches) return; /* tilt/spotlight is a mouse-only nicety — skip on touch */

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
   MARINE FIELD  (Canvas 2D)
   ───────────────────────────────────────────────────────
   A small school of procedurally-drawn fish swims with
   light boids behaviour (separation / alignment / cohesion),
   bubbles rise with a buoyant wobble, and fine plankton dust
   drifts in the background. A few CV-style bounding boxes
   sparsely "track" a nearby fish — a nod to the detection
   work, kept secondary to the marine motif.

   On cursor approach, fish startle and scatter outward
   (a real shoaling response) rather than being attracted —
   then drift back into loose schooling once the cursor moves
   away. Everything renders in the site's single accent hue.
═══════════════════════════════════════════════════════ */
(function initParticles(){
  const canvas = document.getElementById('marine-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ── mouse coords — cached rect so scroll doesn't break coords ── */
  const mouse = { x: -9999, y: -9999, active: false };
  let canvasRect = { left: 0, top: 0 };

  function updateRect(){ canvasRect = canvas.getBoundingClientRect(); }

  window.addEventListener('resize', () => { resize(); });
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
  window.addEventListener('touchend', () => { mouse.active = false; });
  document.addEventListener('mouseleave', () => { mouse.active = false; });

  /* ── FISH ── boids-lite: separation + alignment + cohesion ── */
  const FISH_COUNT = reduced ? 0 : 9;
  const fish = [];

  function makeFish(){
    const x = Math.random() * W, y = Math.random() * H;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.35 + Math.random() * 0.25;
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: 9 + Math.random() * 7,        /* body length, px */
      wob: Math.random() * Math.PI * 2,  /* swim-undulation phase */
      alpha: 0.4 + Math.random() * 0.3,
      scatter: 0                          /* 0–1, startle intensity */
    };
  }

  function initFish(){
    fish.length = 0;
    for (let i = 0; i < FISH_COUNT; i++) fish.push(makeFish());
  }

  function stepFish(t){
    const VIEW = 70;      /* px — radius fish react to neighbours within */
    const SEP_R = 26;     /* px — personal space before separation kicks in */
    const MAX_SPD = 0.9;
    const STARTLE_R = 110; /* px — cursor radius that triggers a startle */

    fish.forEach(f=>{
      let sepX=0, sepY=0, aliX=0, aliY=0, cohX=0, cohY=0, n=0;
      fish.forEach(o=>{
        if (o===f) return;
        const dx=f.x-o.x, dy=f.y-o.y, d=Math.hypot(dx,dy);
        if (d < VIEW && d > 0.001){
          n++;
          aliX += o.vx; aliY += o.vy;
          cohX += o.x;  cohY += o.y;
          if (d < SEP_R){ sepX += dx/d; sepY += dy/d; }
        }
      });
      if (n>0){
        aliX/=n; aliY/=n; cohX = cohX/n - f.x; cohY = cohY/n - f.y;
        f.vx += aliX*0.012 + cohX*0.0006 + sepX*0.05;
        f.vy += aliY*0.012 + cohY*0.0006 + sepY*0.05;
      }

      /* startle: scatter away from the cursor, then relax back */
      const mdx = f.x - mouse.x, mdy = f.y - mouse.y, mdist = Math.hypot(mdx,mdy);
      if (mouse.active && mdist < STARTLE_R && mdist > 0.001){
        const k = (1 - mdist/STARTLE_R);
        f.vx += (mdx/mdist) * k * 1.1;
        f.vy += (mdy/mdist) * k * 1.1;
        f.scatter = Math.min(1, f.scatter + k*0.4);
      } else {
        f.scatter *= 0.96;
      }

      /* swim undulation — tiny lateral wobble perpendicular to heading */
      f.wob += 0.12 + f.scatter*0.15;
      const heading = Math.atan2(f.vy, f.vx);
      const wobAmt = Math.sin(f.wob) * 0.18;
      f.vx += Math.cos(heading + Math.PI/2) * wobAmt * 0.05;
      f.vy += Math.sin(heading + Math.PI/2) * wobAmt * 0.05;

      /* speed clamp + gentle base cruise so fish never fully stop */
      const spd = Math.hypot(f.vx,f.vy) || 0.001;
      const target = Math.min(MAX_SPD, Math.max(0.28, spd));
      f.vx = (f.vx/spd) * target;
      f.vy = (f.vy/spd) * target;

      f.x += f.vx; f.y += f.vy;

      /* soft wrap with margin, so fish "swim back in" rather than vanish */
      const m = 24;
      if (f.x < -m) f.x = W + m; if (f.x > W + m) f.x = -m;
      if (f.y < -m) f.y = H + m; if (f.y > H + m) f.y = -m;
    });
  }

  function drawFish(f, c){
    const heading = Math.atan2(f.vy, f.vx);
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(heading);
    ctx.globalAlpha = f.alpha;
    ctx.fillStyle = `rgb(${c})`;
    const L = f.len, Wd = L*0.42;
    /* body: simple tapered ellipse via bezier */
    ctx.beginPath();
    ctx.moveTo(L*0.55, 0);
    ctx.quadraticCurveTo(L*0.15, -Wd,  -L*0.5, -Wd*0.35);
    ctx.quadraticCurveTo(L*0.15,  Wd,   L*0.55, 0);
    ctx.fill();
    /* tail fin */
    const tailWag = Math.sin(f.wob*1.6) * Wd*0.32;
    ctx.beginPath();
    ctx.moveTo(-L*0.48, 0);
    ctx.lineTo(-L*0.82, -Wd*0.5 + tailWag);
    ctx.lineTo(-L*0.82,  Wd*0.5 + tailWag);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /* ── BUBBLES ── rise with buoyant wobble ── */
  const BUBBLE_COUNT = reduced ? 0 : 16;
  const bubbles = [];

  function makeBubble(){
    return {
      x: Math.random()*W,
      y: H + Math.random()*60,
      r: 1.2 + Math.random()*3.2,
      speed: 0.18 + Math.random()*0.5,
      wob: Math.random()*Math.PI*2,
      wobSpeed: 0.01 + Math.random()*0.02,
      alpha: 0.12 + Math.random()*0.22
    };
  }
  function initBubbles(){
    bubbles.length = 0;
    for (let i=0;i<BUBBLE_COUNT;i++){
      const b = makeBubble();
      b.y = Math.random()*H; /* scatter initial Y so they don't all start at the bottom */
      bubbles.push(b);
    }
  }
  function stepBubbles(){
    bubbles.forEach(b=>{
      b.wob += b.wobSpeed;
      b.y -= b.speed;
      b.x += Math.sin(b.wob) * 0.4;
      if (b.y < -10){ Object.assign(b, makeBubble()); b.y = H + 10; }
    });
  }
  function drawBubble(b, c){
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(${c},${b.alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /* ── PLANKTON DUST ── slow ambient drift ── */
  const DUST_COUNT = reduced ? 0 : 36;
  const dust = [];
  function makeDust(){
    return {
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-0.5)*0.06, vy: (Math.random()-0.5)*0.06,
      r: 0.6 + Math.random()*1.1,
      alpha: 0.08 + Math.random()*0.16
    };
  }
  function initDust(){
    dust.length = 0;
    for (let i=0;i<DUST_COUNT;i++) dust.push(makeDust());
  }
  function stepDust(){
    dust.forEach(d=>{
      d.x += d.vx; d.y += d.vy;
      if (d.x<0) d.x=W; if (d.x>W) d.x=0;
      if (d.y<0) d.y=H; if (d.y>H) d.y=0;
    });
  }
  function drawDust(d, c){
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(${c},${d.alpha})`;
    ctx.fill();
  }

  /* ── CV BOUNDING BOXES ── sparse, occasionally "locks onto" a fish ── */
  const BBOX_COUNT = reduced ? 0 : 3;
  const bboxes = [];
  function makeBbox(){
    return { targetIdx: Math.floor(Math.random()*Math.max(1,fish.length)), life: 0, dwell: 90 + Math.random()*120, locked:false };
  }
  function initBboxes(){
    bboxes.length=0;
    for (let i=0;i<BBOX_COUNT;i++) bboxes.push(makeBbox());
  }
  function stepDrawBboxes(c){
    if (!fish.length) return;
    bboxes.forEach(b=>{
      b.life++;
      if (b.life > b.dwell){
        b.life = 0; b.dwell = 90 + Math.random()*150;
        b.targetIdx = Math.floor(Math.random()*fish.length);
      }
      const f = fish[b.targetIdx];
      if (!f) return;
      const s = f.len * 2.1;
      const fadeIn = Math.min(1, b.life/20);
      const fadeOut = Math.min(1, (b.dwell-b.life)/20);
      const a = 0.22 * Math.min(fadeIn, fadeOut);
      if (a <= 0.005) return;
      const arm = s*0.22, lw = 1;
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.strokeStyle = `rgba(${c},${a})`;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(-s+arm,-s); ctx.lineTo(-s,-s); ctx.lineTo(-s,-s+arm);
      ctx.moveTo( s-arm,-s); ctx.lineTo( s,-s); ctx.lineTo( s,-s+arm);
      ctx.moveTo( s-arm, s); ctx.lineTo( s, s); ctx.lineTo( s, s-arm);
      ctx.moveTo(-s+arm, s); ctx.lineTo(-s, s); ctx.lineTo(-s, s-arm);
      ctx.stroke();
      ctx.restore();
    });
  }

  /* ── animation loop ── */
  function frame(t){
    ctx.clearRect(0,0,W,H);
    const c = accentRGB();

    stepDust();  dust.forEach(d=>drawDust(d,c));
    stepBubbles(); bubbles.forEach(b=>drawBubble(b,c));
    stepFish(t); fish.forEach(f=>drawFish(f,c));
    stepDrawBboxes(c);

    requestAnimationFrame(frame);
  }

  function initAll(){
    resize();
    initFish();
    initBubbles();
    initDust();
    initBboxes();
  }

  initAll();
  updateRect();
  if (reduced){
    /* Single static-ish frame for reduced motion — draw once, no rAF loop */
    const c = accentRGB();
    dust.forEach(d=>drawDust(d,c));
    return;
  }
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

/* ═══════════════════════════════════════════════════════
   SCROLL-DRIVEN DEPTH EFFECTS
   ───────────────────────────────────────────────────────
   One rAF-throttled scroll listener drives three continuous
   (not one-shot) effects, all themed around descending
   through ocean depth as the page scrolls:

   1. Depth-tint  — body::before wash darkens/deepens with
      overall scroll progress down the page (--depth, 0–1).
   2. Surfacing   — each .about-text paragraph sharpens from
      blurred/dim to fully clear as it crosses the reading
      band of the viewport (--surface per-paragraph, 0–1).
   3. Dive gauge  — the education timeline's accent line
      fills in proportionally to scroll progress through that
      section, like a depth gauge (--dive-progress, 0–1).
═══════════════════════════════════════════════════════ */
(function initScrollDepthEffects(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return; /* CSS already provides static fallback values */

  const aboutParas = document.querySelectorAll('.about-text p');
  const diveTrack   = document.getElementById('diveTimeline');
  const diveBar     = document.getElementById('diveProgress');

  function clamp01(v){ return Math.max(0, Math.min(1, v)); }

  function update(){
    const vh = window.innerHeight;
    const docH = document.documentElement.scrollHeight - vh;

    /* 1. Depth tint — overall page scroll progress, eased so it
          deepens faster in the back half of the page. */
    const pageProgress = docH > 0 ? clamp01(window.scrollY / docH) : 0;
    document.body.style.setProperty('--depth', String(Math.pow(pageProgress, 0.7).toFixed(3)));

    /* 2. Surfacing paragraphs — each one tracks its own position
          through a "reading band" (roughly the middle 60% of the
          viewport), independent of the others. */
    aboutParas.forEach(p=>{
      const r = p.getBoundingClientRect();
      const bandTop = vh * 0.85;   /* paragraph starts revealing here */
      const bandBottom = vh * 0.35; /* fully revealed by here */
      const center = r.top + r.height/2;
      let t;
      if (center >= bandTop) t = 0;
      else if (center <= bandBottom) t = 1;
      else t = (bandTop - center) / (bandTop - bandBottom);
      p.style.setProperty('--surface', t.toFixed(3));
    });

    /* 3. Dive gauge — fills from 0 to 1 as the timeline section
          scrolls through the viewport. */
    if (diveTrack && diveBar){
      const r = diveTrack.getBoundingClientRect();
      const start = vh * 0.8;             /* begin filling */
      const end   = r.height * 0.15;       /* fully filled with a little headroom */
      let t;
      const traveled = start - r.top;
      const total = (r.height) - end + start;
      t = clamp01(traveled / Math.max(1, total));
      diveTrack.style.setProperty('--dive-progress', t.toFixed(3));
    }
  }

  let ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(()=>{ update(); ticking = false; });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update(); /* run once on load so above-the-fold state is correct immediately */
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