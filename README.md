# AI Stock Content Studio

Static GitHub Pages workspace for stock contributors. Includes prompt planning, metadata drafts, basic image QC, and **Photo Lab**, a non-generative batch photo correction workflow.

## Photo Lab v2.0

- Add multiple local images in one batch.
- Basic checks for pixel dimensions, megapixels, file size, and file type.
- Select Adobe Stock, Shutterstock, or combined technical checks.
- Per-image adjustments: brightness, contrast, saturation, warmth, and restrained sharpening.
- Preview corrections before export.
- Export one photo or the full batch as JPEG quality 95.
- Original files are never overwritten; processing happens in the browser.
- No image-generation API, AI reconstruction, object replacement, face modification, or generative fill.

## Important limitations

- Technical checks are not an acceptance guarantee. Marketplace moderation also evaluates focus, noise, artifacts, composition, commercial value, releases, trademarks, copyright, and other legal requirements.
- Blur, noise, dust, banding, and AI artifacts still require inspection at 100% zoom. This app does not claim to classify them reliably.
- ICC/sRGB profile verification is not implemented. Canvas export creates a new JPEG and may remove EXIF/IPTC metadata. Keep the original and restore metadata/keywords in your normal submission workflow.
- Browser support for TIFF varies. If a TIFF cannot be decoded by the browser, convert it with a trusted desktop photo editor before loading.
- The Adobe Stock technical ceiling is 100 MP and 45 MB; both platforms have a 4 MP minimum. Shutterstock's accepted formats include JPEG and TIFF, and sRGB is recommended. Check current official documentation because requirements can change.
- Corrections are deliberately conservative. Excessive sharpening, saturation, or contrast can introduce artifacts and increase rejection risk.
- A compliant file is not automatically commercially useful or accepted.

## Official references

- [Adobe Stock photo technical and legal requirements](https://helpx.adobe.com/stock/contributor/submit-your-content/submit-photos/technical-legal-requirements-photo-submission.html)
- [Adobe Stock quality and technical standards](https://helpx.adobe.com/stock/contributor/content-moderation/quality-technical-standards-reasons-content-refusal.html)
- [Shutterstock photo and video quality requirements](https://submit.shutterstock.com/help/en/articles/10594682-photo-and-video-quality-requirements)
- [Shutterstock technical requirements for images](https://submit.shutterstock.com/help/en/articles/10617390-what-are-the-technical-requirements-for-images)

## Deploy to GitHub Pages

1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select branch `main` and folder `/ (root)`.
4. Save and wait for the Pages deployment to finish.

## Run locally

Open `index.html` in a modern browser. Local processing uses browser APIs; no image upload endpoint or backend is required.
