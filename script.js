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
(function initMarineParticles(){
  const canvas=document.getElementById('hero-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');

  const TYPES=[
    {sym:'🐟',minS:14,maxS:26,op:0.75,sp:1.1},
    {sym:'🐠',minS:12,maxS:22,op:0.7,sp:1.0},
    {sym:'🐡',minS:10,maxS:20,op:0.65,sp:0.8},
    {sym:'🦑',minS:10,maxS:18,op:0.6,sp:0.7},
    {sym:'🦀',minS:10,maxS:16,op:0.6,sp:0.6},
    {sym:'🌿',minS:12,maxS:20,op:0.4,sp:0.4},
    {sym:'bubble',minS:4,maxS:14,op:0.45,sp:1.3,isBubble:true},
    {sym:'bubble',minS:2,maxS:8,op:0.3,sp:1.5,isBubble:true},
    {sym:'dot',minS:3,maxS:7,op:0.5,sp:1.4,isBubble:true},
  ];

  const TOTAL=60, REPEL_R=140, REPEL_F=5200, DAMPING=0.87, WANDER=0.02, BUOYANCY=-0.013;
  let W=0,H=0;
  const particles=[];
  /* Raw mouse — updated from DOM events */
  const rawMouse={x:-9999,y:-9999,active:false};
  /* Lerped mouse — updated every frame */
  const mouse={x:0,y:0};

  function rand(a,b){return a+Math.random()*(b-a);}
  function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}

  function spawn(){
    const t=pick(TYPES);
    return{x:rand(0,W),y:rand(0,H),vx:rand(-0.4,0.4)*t.sp,vy:rand(-0.5,0.1)*t.sp,
      size:rand(t.minS,t.maxS),type:t,opacity:t.op*rand(0.7,1.0),
      angle:rand(0,Math.PI*2),spin:rand(-0.008,0.008),
      wobble:rand(0,Math.PI*2),wobbleSpeed:rand(0.015,0.04)};
  }

  function resize(){
    W=canvas.width=canvas.offsetWidth||window.innerWidth;
    H=canvas.height=canvas.offsetHeight||window.innerHeight;
  }

  function init(){
    resize();
    particles.length=0;
    for(let i=0;i<TOTAL;i++) particles.push(spawn());
    mouse.x=W/2; mouse.y=H/2;
  }

  window.addEventListener('resize',resize);

  /* Track mouse anywhere on page */
  window.addEventListener('mousemove',e=>{
    const r=canvas.getBoundingClientRect();
    rawMouse.x=e.clientX-r.left;
    rawMouse.y=e.clientY-r.top;
    rawMouse.active=true;
  });
  window.addEventListener('touchmove',e=>{
    if(!e.touches.length)return;
    const r=canvas.getBoundingClientRect();
    rawMouse.x=e.touches[0].clientX-r.left;
    rawMouse.y=e.touches[0].clientY-r.top;
    rawMouse.active=true;
  },{passive:true});
  window.addEventListener('touchend',()=>{rawMouse.active=false;});
  window.addEventListener('mouseleave',()=>{rawMouse.active=false;});

  function drawBubble(p){
    const isDark=document.documentElement.getAttribute('data-theme')!=='light';
    const c=isDark?'160,200,190':'0,100,90';
    ctx.save();
    ctx.globalAlpha=p.opacity;
    /* outer ring */
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.size/2,0,Math.PI*2);
    ctx.strokeStyle=`rgba(${c},0.65)`;
    ctx.lineWidth=p.type.sym==='dot'?p.size/2:1;
    if(p.type.sym==='dot'){ctx.fillStyle=`rgba(${c},0.5)`;ctx.fill();}
    else ctx.stroke();
    /* highlight */
    if(p.type.sym!=='dot'){
      ctx.beginPath();
      ctx.arc(p.x-p.size*0.15,p.y-p.size*0.15,p.size*0.17,0,Math.PI*2);
      ctx.fillStyle=`rgba(${c},0.38)`;ctx.fill();
    }
    ctx.restore();
  }

  function drawEmoji(p){
    ctx.save();
    ctx.globalAlpha=p.opacity;
    ctx.translate(p.x,p.y);
    const canFlip=(p.type.sym==='🐟'||p.type.sym==='🐠'||p.type.sym==='🐡');
    const flip=canFlip?(p.vx<0?1:-1):1;
    ctx.scale(flip,1);
    ctx.rotate(Math.sin(p.wobble)*0.1+p.angle);
    ctx.font=p.size+'px serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(p.type.sym,0,0);
    ctx.restore();
  }

  function frame(){
    ctx.clearRect(0,0,W,H);

    /* Lerp mouse toward raw for smooth feel */
    mouse.x+=(rawMouse.x-mouse.x)*0.09;
    mouse.y+=(rawMouse.y-mouse.y)*0.09;

    for(const p of particles){
      /* Repulsion */
      if(rawMouse.active){
        const dx=p.x-mouse.x, dy=p.y-mouse.y;
        const d2=dx*dx+dy*dy, rr=REPEL_R*REPEL_R;
        if(d2<rr&&d2>1){
          const d=Math.sqrt(d2);
          const force=REPEL_F/(d2*0.55+1);
          p.vx+=(dx/d)*force*0.001;
          p.vy+=(dy/d)*force*0.001;
        }
      }
      /* Buoyancy + wander */
      p.vy+=BUOYANCY;
      p.vx+=(Math.random()-0.5)*WANDER;
      p.vy+=(Math.random()-0.5)*WANDER*0.5;
      /* Speed cap */
      const spd=Math.sqrt(p.vx*p.vx+p.vy*p.vy);
      const maxSpd=2.8*p.type.sp;
      if(spd>maxSpd){p.vx*=maxSpd/spd;p.vy*=maxSpd/spd;}
      /* Integrate */
      p.vx*=DAMPING; p.vy*=DAMPING;
      p.x+=p.vx; p.y+=p.vy;
      p.wobble+=p.wobbleSpeed; p.angle+=p.spin;
      /* Wrap */
      const m=p.size*2;
      if(p.x<-m)p.x=W+m; if(p.x>W+m)p.x=-m;
      if(p.y<-m)p.y=H+m; if(p.y>H+m)p.y=-m;
      /* Draw */
      if(p.type.isBubble)drawBubble(p);
      else drawEmoji(p);
    }
    requestAnimationFrame(frame);
  }

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
    window.location.href=`mailto:dolaposalim@gmail.com?subject=${encodeURIComponent('Message from '+n)}&body=${encodeURIComponent('From: '+n+'\nEmail: '+em+'\n\n'+m)}`;
    const fb=document.getElementById('cfMsg');
    fb.textContent='Opening your email client…';
    fb.style.display='block';
  });
})();