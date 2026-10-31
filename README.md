# AI Stock Content Studio

Static website starter for planning AI-generated commercial stock imagery.

## Features (v1.0)
- Multi-category prompt generator
- Prompt copy-to-clipboard
- Basic English title and keyword draft helper
- Local image technical check (dimensions, megapixels, file size, format)
- Manual visual quality checklist
- Starter trend themes and seasonal/event planner
- Responsive layout for desktop and mobile

## Deploy to GitHub Pages
1. Create a GitHub repository, for example `ai-stock-content-studio`.
2. Upload all files and folders from this project. Keep `index.html` in the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then save.
6. Wait for GitHub Pages to publish the site.

## Run locally
Open `index.html` in a modern browser. For clipboard support and best local behavior, use a local static server or GitHub Pages.

## Important limitations
- This is a static front-end. It does not call an image-generation API.
- The generated prompt must be copied into ChatGPT or another image-generation tool.
- Metadata generation is a simple draft helper, not keyword-volume research.
- Image QC reads pixel dimensions, megapixels, file size, and MIME type in the browser. It does not verify embedded ICC/sRGB profile, visual defects, legal rights, or Adobe Stock acceptance.
- Event data is a starter list. Verify dates, observances, market relevance, and official calendars before producing assets.
- Adobe Stock requirements can change. Check current contributor documentation before submission.

## Suggested next versions
- v1.1: searchable prompt templates and editable event calendar
- v1.2: ICC profile inspection and richer visual QC workflow
- v2.0: persistent local project library and batch metadata export
- v3.0: optional external trend/keyword data integrations

## License
Choose a license before public distribution. If unsure, keep the repository private until you decide.
