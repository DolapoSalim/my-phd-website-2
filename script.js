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

/* INTERSECTION OBSERVER */
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');io.unobserve(e.target);}});
},{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.fi,.tl-item,.pub,.news-item,.proj-item').forEach(el=>io.observe(el));

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
    /* Use the hero section's actual pixel dimensions */
    const hero = document.getElementById('hero');
    W = canvas.width  = hero ? hero.offsetWidth  : window.innerWidth;
    H = canvas.height = hero ? hero.offsetHeight : window.innerHeight;
  }

  /* ── accent colour — single teal, two shades for dark/light ── */
  function accentRGB(){
    return document.documentElement.getAttribute('data-theme') === 'light'
      ? '42,122,111'    /* dark teal for light bg */
      : '168,197,190';  /* muted teal-white for dark bg */
  }

  /* ── particle shapes: dot, ring, bbox (corner brackets) ── */
  const SHAPES = ['dot','dot','dot','ring','ring','bbox'];

  /* ── mouse: world coords, always current ── */
  const mouse = { x: -9999, y: -9999, active: false };

  window.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = true;
  });
  window.addEventListener('touchmove', e => {
    if (!e.touches.length) return;
    const r = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - r.left;
    mouse.y = e.touches[0].clientY - r.top;
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
  const ATTRACT_R = 180;   /* px — radius mouse influences */
  const ATTRACT_F = 0.06;  /* pull strength (fraction of distance per frame) */
  const RETURN_F  = 0.018; /* spring back to home */
  const DAMPING   = 0.90;

  function frame(){
    ctx.clearRect(0, 0, W, H);
    const c = accentRGB();

    for (const p of pts){

      /* ── 1. Mouse attraction ── */
      if (mouse.active){
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < ATTRACT_R && d > 1){
          /* Linear falloff: full pull at cursor, zero at edge of radius */
          const t = 1 - d / ATTRACT_R;
          p.vx += (dx / d) * ATTRACT_F * t;
          p.vy += (dy / d) * ATTRACT_F * t;
        }
      }

      /* ── 2. Spring back toward home (ox,oy) when mouse is away ── */
      p.vx += (p.ox - p.x) * RETURN_F;
      p.vy += (p.oy - p.y) * RETURN_F;

      /* ── 3. Dampen + integrate ── */
      p.vx *= DAMPING;
      p.vy *= DAMPING;
      p.x  += p.vx;
      p.y  += p.vy;
      p.angle += p.spin;

      /* ── 4. If wrapped, reset home to new position ── */
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
  requestAnimationFrame(frame);
})();

/* PROJECTS LIST */
(function initProjects(){
  const PROJECTS=[
    {name:'Filadentification',year:'2024',desc:'AI-powered species identification pipeline for marine organisms. Combines image classification models with taxonomic matching for rapid field identification.',tags:['Python','YOLO','Computer Vision'],icon:'🔬',url:'https://github.com/DolapoSalim'},
    {name:'EcoQuad',year:'2024',desc:'Quadrat-based ecological survey tool with automated species counting via computer vision. Designed for benthic monitoring and streamlining field data collection.',tags:['Python','OpenCV','Ecology'],icon:'🌿',url:'https://github.com/DolapoSalim'},
    {name:'YOLO-label-Converter',year:'2023',desc:'Converts annotation formats (COCO, Pascal VOC, CSV) to YOLO-compatible labels. Supports batch processing and custom class remapping for detection training pipelines.',tags:['Python','Annotation','YOLO'],icon:'⚙',url:'https://github.com/DolapoSalim'},
    {name:'Voting-Ensemble-Model',year:'2024',desc:'Hard and soft voting ensemble framework combining multiple classifiers. Improves species prediction accuracy and robustness on imbalanced marine biodiversity datasets.',tags:['Python','Machine Learning','Ensemble'],icon:'🤖',url:'https://github.com/DolapoSalim'},
    {name:'Hierarchical-Clustering-Dendrogram',year:'2023',desc:'R-based hierarchical clustering and dendrogram visualisation for ecological community analysis, biodiversity grouping, and habitat similarity studies.',tags:['R','Statistics','Ecology'],icon:'📊',url:'https://github.com/DolapoSalim'},
    {name:'PyObis',year:'2024',desc:'Python wrapper for the OBIS (Ocean Biodiversity Information System) API. Fetch, filter, and analyse global marine species occurrence data programmatically.',tags:['Python','API','Biodiversity'],icon:'🌊',url:'https://github.com/DolapoSalim'},
    {name:'SMR-with-Python',year:'2023',desc:'Standard Metabolic Rate analysis pipeline in Python: data ingestion, outlier detection, Q10 temperature coefficient calculation, and automated PDF reporting for respirometry experiments.',tags:['Python','Data Analysis','Physiology'],icon:'📈',url:'https://github.com/DolapoSalim'},
    {name:'OCR-Analysis-of-ChatGPT-Chat',year:'2024',desc:'OCR pipeline extracting and analysing text from exported ChatGPT conversation screenshots, enabling topic mining, keyword frequency analysis, and AI usage pattern exploration.',tags:['Python','OCR','NLP'],icon:'📝',url:'https://github.com/DolapoSalim'},
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
        <div class="proj-title"><span class="proj-icon">${proj.icon}</span>${proj.name}</div>
        <div class="proj-desc">${proj.desc}</div>
        <div class="proj-tags">${proj.tags.map(t=>`<span class="ptag">${t}</span>`).join('')}</div>
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
    fb.textContent='✓ Opening your email client…';
    fb.style.display='block';
  });
})();