// Public frontend configuration. Safe to expose in the browser.
// Configure these after deploying the Cloudflare Worker and creating Turnstile keys.
// Never put OPENAI_API_KEY or TURNSTILE_SECRET_KEY in this file.
window.STOCK_STUDIO_CONFIG = {
  imageApiUrl: "", // Paste your Worker URL, e.g. https://ai-stock-content-studio-image-api.<subdomain>.workers.dev
  turnstileSiteKey: "" // Paste the public Cloudflare Turnstile site key
};
