(() => {
  const $ = id => document.getElementById(id);
  const cfg = window.STOCK_STUDIO_CONFIG || {};
  let selectedEvent = null, lastPrompt = "", image = null, logo = null, captchaWidget = null, captchaToken = "";
  const status = (message, kind="info") => { const el=$("tg-status"); el.textContent=message; el.dataset.kind=kind; };
  const platformNames = {instagram:"Instagram",tiktok:"TikTok",facebook:"Facebook",youtube:"YouTube",stock:"Stock image"};
  const sizeMap = {"1:1":"1024 × 1024","4:5":"1024 × 1280","3:4":"1024 × 1360","9:16":"1024 × 1792","16:9":"1536 × 1024"};
  function buildPrompt(title, description) {
    const platform=$("tg-platform").value, ratio=$("tg-ratio").value, extra=$("tg-extra").value.trim();
    const stock=platform==="stock";
    return [
      "Create one polished, original, premium-quality visual asset for a content creator.",
      "EVENT OR TREND: "+title+".",
      "CONTEXT: "+description+".",
      "TARGET PLATFORM: "+platformNames[platform]+". ASPECT RATIO: "+ratio+".",
      "ART DIRECTION: Build a contemporary, memorable visual concept that feels current but not generic. Use a strong focal subject, professional composition, intentional color palette, realistic lighting, refined textures, and clear visual hierarchy. Make the cultural and seasonal details appropriate to the event and avoid stereotypes.",
      "LAYOUT: Compose for the selected aspect ratio. Keep a clean, uncluttered safe area for a manually added creator logo. Do not draw any logo, watermark, signature, badge, or brand identity. Leave useful negative space for optional typography to be added later.",
      "TEXT POLICY: Do not render words, letters, numbers, slogans, dates, captions, or pseudo-text inside the image. All copy will be added separately after generation.",
      stock ? "STOCK MODE: Create a licensable visual concept without text, logos, trademarks, copyrighted characters, or identifiable protected designs. This is AI-generated content and must be disclosed as such where required." : "SOCIAL MODE: Create an eye-catching social visual that reads clearly on a mobile screen. Keep important subjects away from crop-sensitive edges. No platform logos or UI mockups.",
      extra ? "ADDITIONAL CREATIVE DIRECTION: "+extra : "",
      "QUALITY CONTROL: anatomically and physically plausible objects, coherent shadows and reflections, no duplicated elements, no malformed details, no visual artifacts, no unintended branding. Avoid imitating any living artist or specific commercial campaign.",
      "Deliver the image only, without a frame or mockup."
    ].filter(Boolean).join("\n\n");
  }
  function getCaptchaToken() {
    if (!cfg.turnstileSiteKey) throw new Error("Cloudflare Turnstile belum dikonfigurasi. Isi turnstileSiteKey pada assets/js/config.js.");
    if (!window.turnstile) throw new Error("Turnstile belum termuat. Periksa koneksi internet lalu muat ulang halaman.");
    if (captchaWidget === null) {
      captchaWidget = window.turnstile.render("#tg-captcha", {
        sitekey:cfg.turnstileSiteKey,
        callback:t=>{captchaToken=t;},
        "expired-callback":()=>{captchaToken="";},
        "error-callback":()=>{captchaToken="";status("Verifikasi keamanan gagal. Muat ulang verifikasi.", "error");}
      });
      $("tg-captcha-wrap").classList.remove("hidden");
      throw new Error("Selesaikan verifikasi keamanan, lalu klik Generate image sekali lagi.");
    }
    if (!captchaToken) throw new Error("Selesaikan verifikasi keamanan terlebih dahulu.");
    return captchaToken;
  }
  function drawComposite() {
    if (!image) return;
    const canvas=$("tg-canvas"), ctx=canvas.getContext("2d");
    canvas.width=image.naturalWidth; canvas.height=image.naturalHeight;
    ctx.drawImage(image,0,0,canvas.width,canvas.height);
    if (logo) {
      const pct=Number($("tg-logo-size").value)/100;
      const maxW=canvas.width*pct, maxH=canvas.height*pct;
      const scale=Math.min(maxW/logo.width,maxH/logo.height);
      const w=logo.width*scale,h=logo.height*scale,pad=Math.round(canvas.width*.035);
      const pos=$("tg-logo-position").value;
      const x=pos.endsWith("right")?canvas.width-w-pad:pad;
      const y=pos.startsWith("bottom")?canvas.height-h-pad:pad;
      ctx.drawImage(logo,x,y,w,h);
    }
  }
  function createCaption() {
    if (!selectedEvent) return "";
    const title=selectedEvent.title, desc=selectedEvent.description;
    const tags=title.toLowerCase().replace(/[^a-z0-9 ]/g,"").split(/\s+/).filter(Boolean).map(x=>"#"+x).join(" ");
    const general= $("tg-platform").value==="stock" ? "" : "\n\n"+tags+" #kontenvisual #inspirasi #indonesia";
    return title+"\n"+desc+general;
  }
  async function generate() {
    if (!cfg.imageApiUrl) { status("Backend belum terhubung. Deploy Cloudflare Worker, lalu isi imageApiUrl di assets/js/config.js.", "error"); return; }
    let token;
    try { token=getCaptchaToken(); } catch(e) { status(e.message,"warning"); return; }
    const title=selectedEvent?.title || $("tg-extra").value.trim();
    const description=selectedEvent?.description || "Original seasonal and editorial visual concept";
    if (!title) { status("Pilih tombol Buat gambar pada salah satu event atau isi arahan visual.","warning"); return; }
    lastPrompt=buildPrompt(title,description);
    const btn=$("tg-generate"),again=$("tg-regenerate");
    btn.disabled=true;again.disabled=true;btn.textContent="Sedang membuat gambar…";
    $("tg-result").classList.add("hidden");
    status("Mengirim brief ke OpenAI Image. Proses dapat memerlukan waktu hingga sekitar dua menit.","info");
    try {
      const response=await fetch(cfg.imageApiUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:lastPrompt,ratio:$("tg-ratio").value,quality:$("tg-quality").value,turnstileToken:token})});
      const data=await response.json();
      if (!response.ok) throw new Error(data.error || "Image generation gagal ("+response.status+").");
      image=new Image();
      image.onload=()=>{
        drawComposite();
        $("tg-result-meta").textContent=(data.model||"OpenAI Image")+" · "+sizeMap[$("tg-ratio").value];
        $("tg-result").classList.remove("hidden");
        status("Gambar berhasil dibuat. Periksa hasilnya, tambahkan logo bila perlu, lalu unduh.","success");
        $("tg-result").scrollIntoView({behavior:"smooth",block:"start"});
      };
      image.onerror=()=>{status("Gambar diterima tetapi gagal ditampilkan. Coba generate ulang.","error");};
      image.src=data.image;
      captchaToken=""; if(window.turnstile && captchaWidget!==null) window.turnstile.reset(captchaWidget);
    } catch(e) {
      status(e.message || "Terjadi kesalahan saat membuat gambar.","error");
      captchaToken=""; if(window.turnstile && captchaWidget!==null) window.turnstile.reset(captchaWidget);
    } finally {
      btn.disabled=false;again.disabled=false;btn.textContent="✦ Generate image";
    }
  }
  document.addEventListener("click",e=>{
    const btn=e.target.closest("[data-generate-event]");
    if(!btn)return;
    selectedEvent={title:btn.dataset.generateEvent,description:btn.dataset.eventDescription};
    $("tg-extra").value="";
    $("tg-generate").scrollIntoView({behavior:"smooth",block:"center"});
    status("Brief terpilih: "+selectedEvent.title+". Atur platform dan rasio, lalu klik Generate image.","success");
  });
  $("tg-generate").addEventListener("click",generate);
  $("tg-regenerate").addEventListener("click",generate);
  $("tg-logo").addEventListener("change",e=>{
    const file=e.target.files?.[0]; if(!file)return;
    if(!["image/png","image/webp"].includes(file.type)){status("Logo harus PNG transparan atau WebP.","warning");return;}
    const url=URL.createObjectURL(file), next=new Image();
    next.onload=()=>{logo=next;drawComposite();URL.revokeObjectURL(url);status("Logo ditambahkan. Atur posisi dan ukuran sebelum mengunduh.","success");};
    next.onerror=()=>{URL.revokeObjectURL(url);status("Logo tidak dapat dibaca.","error");};next.src=url;
  });
  ["tg-logo-position","tg-logo-size"].forEach(id=>$(id).addEventListener("input",drawComposite));
  $("tg-download").addEventListener("click",()=>{
    if(!$("tg-canvas").width)return;
    $("tg-canvas").toBlob(blob=>{
      if(!blob){status("Gagal mengekspor gambar.","error");return;}
      const url=URL.createObjectURL(blob),a=document.createElement("a");
      a.href=url;a.download="trend-to-image-"+(selectedEvent?.title||"visual").toLowerCase().replace(/[^a-z0-9]+/g,"-")+".png";
      a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
    },"image/png");
  });
  $("tg-caption-copy").addEventListener("click",async()=>{
    const caption=createCaption();
    try{await navigator.clipboard.writeText(caption);status("Caption dan hashtag disalin.","success");}
    catch{status("Clipboard tidak tersedia pada browser ini.","warning");}
  });
})();
