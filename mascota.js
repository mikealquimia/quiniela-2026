// mascota.js — Pitaya Mundialista
// Videos: agregar/quitar entradas en el array VIDEOS
// Si el archivo termina en .webm, se usa <video> directo (canal alpha real)
// Si es .mp4, se usa canvas con chroma key en tiempo real
(function () {
  const VIDEOS = [
    'mascota.mp4',
    //'mascota2.mp4',
    //'mascota3.mp4',
    'mascota4.webm',   // ← este tiene alpha real, no necesita canvas
  ];

  let current = 0;
  let animId  = null;
  let frameN  = 0;
  let bgR = 255, bgG = 255, bgB = 255;
  let bgMode  = 'white';

  // ── Elementos base ──
  const wrap = document.createElement('div');
  wrap.className = 'mascota-wrap';
  document.body.appendChild(wrap);

  // ── Modo WEBM: <video> con alpha nativo ──
  let videoEl   = null;
  let canvasEl  = null;
  let ctx       = null;

  function clearWrap() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    wrap.innerHTML = '';
    videoEl = null; canvasEl = null; ctx = null;
  }

  function loadWebm(src) {
    clearWrap();
    const v = document.createElement('video');
    v.src       = src;
    v.autoplay  = true;
    v.loop      = false;
    v.muted     = true;
    v.playsInline = true;
    v.style.width = '100%';
    v.style.display = 'block';
    v.addEventListener('ended', nextVideo);
    v.play().catch(() => document.addEventListener('click', () => v.play(), { once: true }));
    wrap.appendChild(v);
    videoEl = v;
  }

  // ── Modo MP4: canvas + chroma key ──
  function sampleBorder(data, w, h) {
    let tr=0,tg=0,tb=0,n=0; const step=6;
    for(let x=0;x<w;x+=step){
      let i=x*4; tr+=data[i];tg+=data[i+1];tb+=data[i+2];n++;
      i=((h-1)*w+x)*4; tr+=data[i];tg+=data[i+1];tb+=data[i+2];n++;
    }
    for(let y=8;y<h-8;y+=step){
      let i=y*w*4; tr+=data[i];tg+=data[i+1];tb+=data[i+2];n++;
      i=(y*w+w-1)*4; tr+=data[i];tg+=data[i+1];tb+=data[i+2];n++;
    }
    bgR=tr/n; bgG=tg/n; bgB=tb/n;
    if(bgR>200&&bgG>200&&bgB>200) bgMode='white';
    else if(bgG>bgR*1.35&&bgG>bgB*1.35&&bgG>80) bgMode='green';
    else bgMode=bgR>bgG*1.1?'white':'transition';
  }

  function removeBackground(data) {
    for(let i=0;i<data.length;i+=4){
      const r=data[i],g=data[i+1],b=data[i+2];
      if(bgMode==='white'||bgMode==='transition'){
        const mn=Math.min(r,g,b);
        if(mn>200) data[i+3]=mn>240?0:Math.round((240-mn)/40*255);
        continue;
      }
      const rn=r/255,gn=g/255,bn=b/255;
      const maxC=Math.max(rn,gn,bn),minC=Math.min(rn,gn,bn),delta=maxC-minC;
      if(maxC<0.15) continue;
      const S=maxC>0.002?delta/maxC:0;
      let H=0;
      if(delta>0.002){
        if(maxC===rn)      H=((gn-bn)/delta*60+360)%360;
        else if(maxC===gn) H=(bn-rn)/delta*60+120;
        else               H=(rn-gn)/delta*60+240;
      }
      if(H<85||H>160||S<0.25) continue;
      const dr=r-bgR,dg=g-bgG,db=b-bgB;
      const dist=Math.sqrt(dr*dr+dg*dg+db*db);
      if(dist<65) data[i+3]=dist<38?0:Math.round((65-dist)/27*255);
    }
  }

  function tick() {
    if(!videoEl||videoEl.paused||videoEl.ended) return;
    if(videoEl.readyState<2){ animId=requestAnimationFrame(tick); return; }
    ctx.drawImage(videoEl,0,0,canvasEl.width,canvasEl.height);
    const frame=ctx.getImageData(0,0,canvasEl.width,canvasEl.height);
    if(frameN===0||frameN%8===0) sampleBorder(frame.data,canvasEl.width,canvasEl.height);
    frameN++;
    removeBackground(frame.data);
    ctx.putImageData(frame,0,0);
    animId=requestAnimationFrame(tick);
  }

  function loadMp4(src) {
    clearWrap();
    frameN=0; bgR=255;bgG=255;bgB=255;bgMode='white';
    const v=document.createElement('video');
    v.src=src; v.muted=true; v.playsInline=true; v.crossOrigin='anonymous';
    v.style.display='none';
    const c=document.createElement('canvas');
    c.style.width='100%'; c.style.display='block';
    wrap.appendChild(c); wrap.appendChild(v);
    videoEl=v; canvasEl=c; ctx=c.getContext('2d',{willReadFrequently:true});
    v.addEventListener('loadedmetadata',()=>{ c.width=v.videoWidth; c.height=v.videoHeight; });
    v.addEventListener('canplay',()=>{ if(frameN>0)return; ctx.drawImage(v,0,0,c.width,c.height); const f=ctx.getImageData(0,0,c.width,c.height); sampleBorder(f.data,c.width,c.height); });
    v.addEventListener('play',()=>{ if(animId)cancelAnimationFrame(animId); tick(); });
    v.addEventListener('ended',nextVideo);
    v.play().catch(()=>document.addEventListener('click',()=>v.play(),{once:true}));
  }

  function nextVideo() {
    current=(current+1)%VIDEOS.length;
    loadVideo(current);
  }

  function loadVideo(index) {
    const src=VIDEOS[index];
    if(src.endsWith('.webm')) loadWebm(src);
    else loadMp4(src);
  }

  loadVideo(current);
})();
