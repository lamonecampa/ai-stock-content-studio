const $ = (id) => document.getElementById(id);

document.querySelectorAll(".tab").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x => x.classList.toggle("active", x === btn));
  document.querySelectorAll(".panel").forEach(x => x.classList.toggle("active", x.id === `panel-${btn.dataset.tab}`));
}));

function buildPrompt() {
  const concept = $("concept").value.trim();
  if (!concept) { alert("Masukkan konsep produk terlebih dahulu."); $("concept").focus(); return; }
  const category = $("category").value;
  const style = $("style").value;
  const composition = $("composition").value;
  const ratio = $("ratio").value;
  const resolution = $("resolution").value;
  const background = $("background").value.trim() || "a refined studio environment that complements the subject";
  const props = $("props").value.trim() || "minimal supporting props, only when they improve context";
  return `You are an expert commercial art director, product photographer, and AI image-prompt engineer.

Create one original, commercially useful stock image based on this concept:
${concept}

CATEGORY: ${category}
VISUAL STYLE: ${style}
COMPOSITION: ${composition}
BACKGROUND: ${background}
SUPPORTING ELEMENTS: ${props}
ASPECT RATIO: ${ratio}
TARGET FINAL RESOLUTION: ${resolution}

CREATIVE DIRECTION
Create a visually distinctive, polished image with a clear focal point and strong commercial usability. Infer the appropriate subject design, materials, palette, lighting, camera angle, depth of field, and art direction from the concept. Avoid generic execution. For a series, vary framing, camera angle, prop placement, and background meaningfully.

REALISM AND CONSTRUCTION
When depicting physical products, use believable proportions, manufacturable construction, coherent joints and components, realistic material behavior, and consistent light direction. For glass, show plausible thickness, refraction, transparency, and reflections. For bottles with atomizers, ensure the neck, collar, cap, nozzle, and sprayer align and connect plausibly.

QUALITY
High-end ${style.toLowerCase()}; crisp primary subject; realistic textures; accurate color; controlled highlights; natural shadows; coherent reflections; clean edges; professional commercial composition; useful negative space where appropriate.

AVOID
Distorted geometry, malformed objects, duplicated or floating components, impossible reflections, inconsistent shadows, fused props, melted textures, random text, gibberish lettering, unintended labels, watermarks, logos, brand names, copyrighted characters, artist signatures, excessive decoration, plastic-looking materials, oversharpening, and visible AI artifacts.

STOCK-SUBMISSION INTENT
No visible text, logo, watermark, or unintended branding. Make the result suitable for legitimate commercial licensing. Do not imitate a specific brand, protected design, or named artist.

TECHNICAL TARGET
Preferred aspect ratio ${ratio}; final export target ${resolution}; JPEG with embedded sRGB profile. Image generation dimensions and final export dimensions are separate. Verify actual pixel dimensions and color profile after export. Upscaling does not guarantee recovery of genuine detail.

AFTER GENERATION
Critically inspect the result. Report visible defects and distinguish pass, needs review, and fail. Do not claim pixel-level inspection unless the full-resolution file was inspected. Prepare an accurate English stock title, 25–40 relevant English keywords ordered by importance, a suggested category, and a reminder to mark “Created using generative AI tools” during Adobe Stock upload when applicable. Never guarantee acceptance by Adobe Stock.`;
}

$("generate").addEventListener("click", () => {
  const prompt = buildPrompt();
  if (!prompt) return;
  $("promptOutput").value = prompt;
  $("promptWrap").classList.remove("hidden");
  $("promptWrap").scrollIntoView({behavior:"smooth", block:"start"});
});
$("copyPrompt").addEventListener("click", async () => {
  await navigator.clipboard.writeText($("promptOutput").value);
  $("copyPrompt").textContent = "Copied!";
  setTimeout(() => $("copyPrompt").textContent = "Copy prompt", 1400);
});
$("clear").addEventListener("click", () => {
  ["concept","background","props"].forEach(id => $(id).value = "");
  $("promptWrap").classList.add("hidden");
});

function titleCase(s) { return s.trim().replace(/\s+/g," ").replace(/\b\w/g, c => c.toUpperCase()); }
$("makeMeta").addEventListener("click", () => {
  const desc = $("metaDescription").value.trim();
  if (!desc) { alert("Masukkan deskripsi gambar."); return; }
  const words = desc.toLowerCase().match(/[a-z0-9-]+/g) || [];
  const stop = new Set(["with","and","the","for","from","that","this","into","over","under","yang","dan","dengan","untuk","dari","pada","atau","di"]);
  const unique = [...new Set(words.filter(w => w.length > 2 && !stop.has(w)))];
  const base = ["photography","commercial","stock","background","copy space","design","advertising"];
  const keywords = [...unique, ...base].slice(0,40);
  $("metaTitle").value = titleCase(desc).slice(0,180);
  $("metaKeywords").value = keywords.join(", ");
  $("metadataOutput").classList.remove("hidden");
});
$("copyMeta").addEventListener("click", async () => {
  await navigator.clipboard.writeText(`Title: ${$("metaTitle").value}\nKeywords: ${$("metaKeywords").value}`);
  $("copyMeta").textContent = "Copied!";
  setTimeout(() => $("copyMeta").textContent = "Copy metadata", 1400);
});

const checks = [
  "Tidak ada artefak AI yang terlihat pada pemeriksaan ukuran penuh",
  "Bentuk, anatomi, sambungan, dan proporsi objek masuk akal",
  "Pantulan, bayangan, dan arah cahaya konsisten",
  "Tidak ada teks acak, logo, watermark, atau branding tak disengaja",
  "Tidak melanggar hak cipta, merek dagang, atau hak pihak ketiga",
  "Komposisi memiliki nilai komersial dan tidak terlalu mirip aset lain",
  "Title dan keyword akurat serta sesuai isi gambar",
  "Disclosure generative AI akan dipilih saat upload jika berlaku"
];
$("qcChecks").innerHTML = checks.map((x,i)=>`<label class="check-item"><input type="checkbox"><span>${x}</span></label>`).join("");

$("imageFile").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const mp = img.width * img.height / 1e6;
    const typeOk = file.type === "image/jpeg";
    const sizeOk = file.size <= 45 * 1024 * 1024;
    const mpOk = mp >= 4 && mp <= 100;
    $("qcResult").innerHTML = `<b>${file.name}</b><div class="qc-stats">
      <div class="stat"><b>${img.width} × ${img.height}</b><span>Pixel dimensions</span></div>
      <div class="stat"><b>${mp.toFixed(2)} MP</b><span>${mpOk ? "Within 4–100 MP range" : "Outside 4–100 MP range"}</span></div>
      <div class="stat"><b>${(file.size/1048576).toFixed(2)} MB</b><span>${sizeOk ? "Below 45 MB" : "Over 45 MB"}</span></div>
    </div><p class="note">Format: ${file.type || "unknown"} · ${typeOk ? "JPEG format" : "Not JPEG"} · sRGB profile is not verified by this browser check.</p>
    <p class="note">Technical quick check: ${mpOk && sizeOk && typeOk ? "Basic dimensions, size, and format look acceptable." : "One or more basic technical checks need attention."}</p>`;
    $("qcResult").classList.remove("hidden");
    URL.revokeObjectURL(url);
  };
  img.onerror = () => { $("qcResult").textContent = "File tidak dapat dibaca sebagai gambar."; $("qcResult").classList.remove("hidden"); };
  img.src = url;
});

const events = [
  ["10 Nov 2026","Hari Pahlawan Indonesia","Konsep memorial, pendidikan sejarah, keberanian, dan komunitas."],
  ["25 Nov 2026","Hari Guru Indonesia","Guru, ruang kelas, pembelajaran, apresiasi pendidik."],
  ["26 Nov 2026","Thanksgiving (AS)","Food styling, autumn table, family gathering, gratitude."],
  ["Desember 2026","Christmas season","Gift packaging, festive interiors, winter food, seasonal backgrounds."],
  ["31 Des 2026","New Year's Eve","Celebration, countdown concepts, party decor, fresh-start themes."],
  ["1 Jan 2027","New Year's Day","Planning, goals, wellness, calendar and business concepts."],
  ["Februari 2027","Valentine's season","Love, gifting, floral product styling, romantic backgrounds."],
  ["Ramadan 2027 · estimasi","Ramadan & Eid preparation","Hospitality, food, family, decor, greetings. Verify official dates."],
  ["8 Mar 2027","International Women's Day","Women in business, leadership, education, empowerment."],
  ["22 Apr 2027","Earth Day","Sustainability, renewable energy, conservation, nature."]
];
$("eventList").innerHTML = events.map(e=>`<article class="event-card"><div class="event-date">${e[0]}</div><h3>${e[1]}</h3><p>${e[2]}</p></article>`).join("");
