# AI Stock Content Studio

GitHub Pages workspace for stock contributors with prompt planning, metadata drafts, image QC, non-generative Photo Lab, and a **Trend-to-Image Generator** powered by the OpenAI Images API through a secure Cloudflare Worker.

## Trend-to-Image Generator

- Click **Buat gambar** on a trend/event card to create an event-specific image brief.
- Choose Instagram, TikTok, Facebook, YouTube, or stock-image mode.
- Choose 1:1, 4:5, 3:4, 9:16, or 16:9 output.
- Generate a real image using OpenAI `gpt-image-2.5-flare`.
- Preview the result, upload a transparent PNG/WebP logo, position and resize it, then export the composite PNG.
- Copy a basic caption and hashtags for social platforms.
- Image generation is a paid API operation. Every generation may incur OpenAI usage charges.
- Generated images are not automatically submitted to any social platform or stock marketplace.

## Secure architecture

The GitHub Pages frontend does **not** contain the OpenAI API key. It calls a Cloudflare Worker proxy. The Worker stores `OPENAI_API_KEY` and `TURNSTILE_SECRET_KEY` as server-side secrets and verifies Cloudflare Turnstile before calling OpenAI.

### Deploy the backend

1. Create a Cloudflare account and install Wrangler locally: `npm install -g wrangler`.
2. From the repository root, run `cd worker` and `wrangler login`.
3. Set the OpenAI secret: `wrangler secret put OPENAI_API_KEY`, then paste your OpenAI API key into the terminal prompt.
4. Create a Cloudflare Turnstile widget for the hostname `lamonecampa.github.io`.
5. Set the Turnstile secret: `wrangler secret put TURNSTILE_SECRET_KEY`.
6. Deploy: `wrangler deploy`. The Worker URL is shown in the deployment output.
7. Open `assets/js/config.js` and set `imageApiUrl` to the root Worker URL (no `/generate` path) and `turnstileSiteKey` to the public Turnstile site key.
8. Commit the config update and wait for GitHub Pages to redeploy.

### Protect API usage

- Configure a Cloudflare rate-limiting rule for the Worker hostname. A conservative starting point is 5 requests per 10 minutes per IP; tune it to actual usage.
- Monitor OpenAI usage and set an appropriate budget/usage alert in the OpenAI Platform.
- Never publish API keys in GitHub, frontend JavaScript, HTML, or browser storage.
- The Worker allows the GitHub Pages origin and local development origins only. Update its allowlist deliberately if the deployment domain changes.
- Turnstile reduces automated abuse but is not a complete authentication or billing quota system. For a private multi-user service, add account authentication and durable per-user quotas.

## Important content notes

- Social content and stock content are different workflows. Generated assets are AI-generated and must not be represented as non-AI photography.
- For Adobe Stock, follow current generative-AI disclosure and content requirements. This tool does not guarantee acceptance.
- The logo overlay is applied in the browser after generation. Keep a copy of the unbranded original for other uses.
- Captions and hashtags are simple drafts, not live trend analytics or proof of trend demand.
- Text inside generated images is intentionally discouraged because image models can render text inaccurately. Add typography manually in a design editor when needed.

## Photo Lab

- Add multiple local images in one batch.
- Basic checks for pixel dimensions, megapixels, file size, and file type.
- Select Adobe Stock, Shutterstock, or combined technical checks.
- Per-image adjustments: brightness, contrast, saturation, warmth, and restrained sharpening.
- Preview corrections before export.
- Export one photo or the full batch as JPEG quality 95.
- Original files are never overwritten; processing happens in the browser.
- No AI reconstruction, object replacement, face modification, or generative fill.

## Official references

- [OpenAI Image Generation API](https://developers.openai.com/api/docs/guides/image-generation)
- [OpenAI Create Image API reference](https://developers.openai.com/api/reference/resources/images/methods/generate)
- [Cloudflare Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Cloudflare Turnstile documentation](https://developers.cloudflare.com/turnstile/)
- [Adobe Stock photo technical and legal requirements](https://helpx.adobe.com/stock/contributor/submit-your-content/submit-photos/technical-legal-requirements-photo-submission.html)
- [Shutterstock photo and video quality requirements](https://submit.shutterstock.com/help/en/articles/10594682-photo-and-video-quality-requirements)

## Deploy GitHub Pages

Use **Settings → Pages → Deploy from a branch → main → /(root)**.

## Run locally

Serve the repository root over HTTP (for example, `python -m http.server 8000`). The Worker CORS allowlist includes `localhost:8000` and `127.0.0.1:8000`.
