const ALLOWED_ORIGINS = new Set([
  "https://lamonecampa.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000"
]);

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...corsHeaders(origin) }
  });
}
async function verifyTurnstile(token, secret, ip) {
  if (!secret) return {ok:false, reason:"Turnstile belum dikonfigurasi pada backend."};
  if (!token) return {ok:false, reason:"Verifikasi keamanan belum dilakukan."};
  const body = new URLSearchParams({secret, response:token});
  if (ip) body.set("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {method:"POST", body});
  if (!response.ok) return {ok:false, reason:"Layanan verifikasi keamanan tidak tersedia."};
  const result = await response.json();
  return {ok:!!result.success, reason:"Verifikasi keamanan gagal."};
}
function imageSize(ratio) {
  return ({ "1:1":"1024x1024", "4:5":"1024x1280", "3:4":"1024x1360", "9:16":"1024x1792", "16:9":"1536x1024" })[ratio] || "1024x1536";
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (!ALLOWED_ORIGINS.has(origin)) return new Response("Origin tidak diizinkan.", {status:403});
    if (request.method === "OPTIONS") return new Response(null, {status:204, headers:corsHeaders(origin)});
    if (request.method !== "POST") return json({error:"Gunakan POST."},405,origin);
    if (!env.OPENAI_API_KEY) return json({error:"Backend belum dikonfigurasi: OPENAI_API_KEY belum tersedia."},503,origin);
    const length = Number(request.headers.get("Content-Length") || 0);
    if (length > 20000) return json({error:"Request terlalu besar."},413,origin);
    let input;
    try { input = await request.json(); } catch { return json({error:"JSON request tidak valid."},400,origin); }
    const prompt = typeof input.prompt === "string" ? input.prompt.trim() : "";
    const ratio = typeof input.ratio === "string" ? input.ratio : "4:5";
    const quality = input.quality === "medium" ? "medium" : "high";
    if (prompt.length < 30 || prompt.length > 12000) return json({error:"Prompt harus berisi 30–12.000 karakter."},400,origin);
    if (!["1:1","4:5","3:4","9:16","16:9"].includes(ratio)) return json({error:"Rasio gambar tidak didukung."},400,origin);
    const ip = request.headers.get("CF-Connecting-IP") || "";
    const captcha = await verifyTurnstile(input.turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
    if (!captcha.ok) return json({error:captcha.reason},403,origin);
    try {
      const upstream = await fetch("https://api.openai.com/v1/images/generations", {
        method:"POST",
        headers:{"Authorization":"Bearer "+env.OPENAI_API_KEY,"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"gpt-image-2.5-flare",
          prompt,
          size:imageSize(ratio),
          quality,
          output_format:"jpeg",
          output_compression:90,
          n:1
        })
      });
      const data = await upstream.json();
      if (!upstream.ok) {
        const message = data?.error?.message || "OpenAI image generation gagal.";
        return json({error:message.slice(0,500)},upstream.status>=500?502:upstream.status,origin);
      }
      const encoded = data?.data?.[0]?.b64_json;
      if (!encoded) return json({error:"OpenAI tidak mengembalikan file gambar."},502,origin);
      return json({image:"data:image/jpeg;base64,"+encoded, revisedPrompt:data?.data?.[0]?.revised_prompt || null, model:"gpt-image-2.5-flare"},200,origin);
    } catch (error) {
      return json({error:"Tidak dapat menghubungi layanan image generation. Coba lagi nanti."},502,origin);
    }
  }
};
