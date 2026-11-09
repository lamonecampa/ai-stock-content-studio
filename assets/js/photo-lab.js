(() => {
  const $ = id => document.getElementById(id);
  const state = { files: [], selected: -1, urls: new Map() };
  const defaults = {brightness:0,contrast:0,saturation:0,warmth:0,sharpness:0};
  let settings = {...defaults};
  const controls = Object.keys(defaults);
  const supported = file => /^image\/(jpeg|png|webp|tiff)$/i.test(file.type) || /\.(jpe?g|png|webp|tiff?)$/i.test(file.name);
  const mp = (w,h) => w*h/1e6;
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function imageFrom(file){return createImageBitmap(file,{imageOrientation:'from-image'}).catch(()=>createImageBitmap(file))}
  function getLimits(){const p=$('pl-platform').value;return p==='adobe'||p==='both'?{min:4,max:100}:{min:4,max:Infinity}}
  function inspect(d){
    const {min,max}=getLimits(),m=mp(d.w,d.h),issues=[];
    if(m<min)issues.push('Resolusi di bawah 4 MP');
    if(m>max)issues.push('Melebihi batas 100 MP Adobe Stock');
    if(!/^image\/jpeg$/i.test(d.file.type)&&!/\.jpe?g$/i.test(d.file.name))issues.push('Format bukan JPEG; ekspor JPEG untuk alur submission yang paling kompatibel');
    if(d.file.size>45*1024*1024&&$('pl-platform').value!=='shutterstock')issues.push('Ukuran file melebihi 45 MB Adobe Stock');
    return {issues,m,type:issues.some(x=>x.includes('di bawah')||x.includes('Melebihi')||x.includes('melebihi 45'))?'fail':issues.length?'review':'pass'};
  }
  async function addFiles(list){
    for(const file of list){if(!supported(file))continue;try{
      const bitmap=await imageFrom(file);
      const d={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),file,bitmap,w:bitmap.width,h:bitmap.height,settings:{...defaults}};
      state.files.push(d);state.selected=state.files.length-1;
    }catch(e){console.warn('Format tidak dapat dibaca browser:',file.name,e)}}
    render();
  }
  function render(){
    $('pl-count').textContent=state.files.length+' foto';
    if(!state.files.length){$('pl-list').innerHTML='<div class="pl-empty">Belum ada foto. Pilih banyak file sekaligus untuk mulai pemeriksaan.</div>';$('pl-editor').classList.add('pl-hidden');return}
    $('pl-list').innerHTML='<div class="pl-grid">'+state.files.map((d,i)=>{
      const r=inspect(d);let url=state.urls.get(d.id);if(!url){url=URL.createObjectURL(d.file);state.urls.set(d.id,url)}
      return '<article class="pl-item '+(i===state.selected?'selected':'')+'"><img class="pl-thumb" src="'+url+'" alt=""><div class="pl-item-body"><div class="pl-name">'+escapeHtml(d.file.name)+'</div><div class="pl-meta">'+d.w+' × '+d.h+' · '+r.m.toFixed(1)+' MP</div><div class="pl-meta">'+(d.file.size/1048576).toFixed(2)+' MB</div><span class="pl-status '+r.type+'">'+(r.type==='pass'?'LOLOS CEK DASAR':r.type==='fail'?'GAGAL CEK DASAR':'PERLU REVIEW')+'</span><div class="pl-actions" style="margin-top:8px"><button class="secondary pl-small" data-open="'+i+'">Pilih</button><button class="secondary pl-small" data-remove="'+i+'">Hapus</button></div></div></article>';
    }).join('')+'</div>';
    $('pl-list').querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{state.selected=+b.dataset.open;render()});
    $('pl-list').querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{const i=+b.dataset.remove,d=state.files[i];d.bitmap.close?.();const u=state.urls.get(d.id);if(u)URL.revokeObjectURL(u);state.urls.delete(d.id);state.files.splice(i,1);if(state.selected>=state.files.length)state.selected=state.files.length-1;render()});
    renderEditor();
  }
  function renderEditor(){
    const d=state.files[state.selected];if(!d){$('pl-editor').classList.add('pl-hidden');return}
    $('pl-editor').classList.remove('pl-hidden');settings={...d.settings};
    $('pl-filename').textContent=d.file.name;
    const r=inspect(d);
    $('pl-metrics').innerHTML='<div class="pl-metric"><b>'+d.w+' × '+d.h+'</b><span>Dimensi piksel</span></div><div class="pl-metric"><b>'+r.m.toFixed(2)+' MP</b><span>Megapiksel</span></div><div class="pl-metric"><b>'+(d.file.size/1048576).toFixed(2)+' MB</b><span>Ukuran asli</span></div><div class="pl-metric"><b>'+escapeHtml(d.file.type||'unknown')+'</b><span>MIME type</span></div>';
    $('pl-issues').innerHTML=(r.issues.length?r.issues.map(x=>'<li>'+escapeHtml(x)+'</li>').join(''):'<li>Dimensi dan ukuran memenuhi pemeriksaan dasar terpilih.</li>')+'<li>Periksa fokus, noise, exposure, banding, debu sensor, komposisi, logo, dan hak penggunaan secara visual.</li>';
    controls.forEach(k=>{$('pl-'+k).value=settings[k];$('pl-'+k+'-v').textContent=settings[k]});
    drawPreview();
  }
  function drawPreview(){
    const d=state.files[state.selected];if(!d)return;
    const c=$('pl-canvas'),max=1400,scale=Math.min(1,max/Math.max(d.w,d.h));
    c.width=Math.max(1,Math.round(d.w*scale));c.height=Math.max(1,Math.round(d.h*scale));
    const ctx=c.getContext('2d',{willReadFrequently:true});
    ctx.filter='brightness('+(100+settings.brightness)+'%) contrast('+(100+settings.contrast)+'%) saturate('+(100+settings.saturation)+'%) sepia('+(Math.max(0,settings.warmth)/200)+') hue-rotate('+(-settings.warmth/3)+'deg)';
    ctx.drawImage(d.bitmap,0,0,c.width,c.height);ctx.filter='none';
    if(settings.sharpness>0){
      const amount=settings.sharpness/100,img=ctx.getImageData(0,0,c.width,c.height),src=new Uint8ClampedArray(img.data),w=c.width,h=c.height;
      for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const p=(y*w+x)*4;for(let ch=0;ch<3;ch++){const v=src[p+ch]*(1+4*amount)-amount*(src[p-4+ch]+src[p+4+ch]+src[p-w*4+ch]+src[p+w*4+ch]);img.data[p+ch]=Math.max(0,Math.min(255,v))}}
      ctx.putImageData(img,0,0);
    }
    const resultUrl=c.toDataURL('image/jpeg',0.92);
    $('pl-preview').src=resultUrl;
    $('pl-compare-result').src=resultUrl;
    $('pl-compare-original').src=state.urls.get(d.id);
  }
  function bind(){
    controls.forEach(k=>$('pl-'+k).addEventListener('input',e=>{settings[k]=+e.target.value;const d=state.files[state.selected];if(d)d.settings[k]=settings[k];$('pl-'+k+'-v').textContent=settings[k];drawPreview()}));
    $('pl-platform').onchange=render;
    $('pl-reset').onclick=()=>{settings={...defaults};const d=state.files[state.selected];if(d)d.settings={...defaults};renderEditor()};
    $('pl-files').addEventListener('change',e=>addFiles(e.target.files));
    $('pl-clear').onclick=()=>{state.files.forEach(d=>{d.bitmap.close?.();const u=state.urls.get(d.id);if(u)URL.revokeObjectURL(u)});state.files=[];state.urls.clear();state.selected=-1;render()};
    $('pl-export-one').onclick=async()=>{const d=state.files[state.selected];if(d)try{download(await exportOne(d),d.file.name)}catch(e){alert(e.message)}};
    $('pl-export-all').onclick=async()=>{if(!state.files.length)return;const b=$('pl-export-all');b.disabled=true;b.textContent='Memproses...';for(const d of state.files){try{download(await exportOne(d),d.file.name);await new Promise(r=>setTimeout(r,350))}catch(e){console.error(e)}}b.disabled=false;b.textContent='Ekspor semua foto'};
  }
  async function exportOne(d){
    const s=d.settings||defaults,c=document.createElement('canvas');c.width=d.w;c.height=d.h;
    const ctx=c.getContext('2d');
    ctx.filter='brightness('+(100+s.brightness)+'%) contrast('+(100+s.contrast)+'%) saturate('+(100+s.saturation)+'%) sepia('+(Math.max(0,s.warmth)/200)+') hue-rotate('+(-s.warmth/3)+'deg)';
    ctx.drawImage(d.bitmap,0,0,d.w,d.h);ctx.filter='none';
    if(s.sharpness>0){const amount=s.sharpness/100,img=ctx.getImageData(0,0,d.w,d.h),src=new Uint8ClampedArray(img.data),w=d.w,h=d.h;for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const p=(y*w+x)*4;for(let ch=0;ch<3;ch++){const v=src[p+ch]*(1+4*amount)-amount*(src[p-4+ch]+src[p+4+ch]+src[p-w*4+ch]+src[p+w*4+ch]);img.data[p+ch]=Math.max(0,Math.min(255,v))}}ctx.putImageData(img,0,0)}
    const blob=await new Promise(resolve=>c.toBlob(resolve,'image/jpeg',0.95));if(!blob)throw new Error('Gagal mengekspor '+d.file.name);return blob;
  }
  function download(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name.replace(/\.[^.]+$/,'')+'_stock-ready.jpg';a.click();setTimeout(()=>URL.revokeObjectURL(url),4000)}
  bind();
  document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{if(btn.dataset.tab==='photo-lab')render()}));
  render();
})();