# GitHub Pages Deployment Setup

This document explains the GitHub Pages deployment configuration for the ACKI.live blockchain explorer.

## Files Created

### 1. `.github/workflows/deploy.yml`
GitHub Actions workflow that:
- Triggers on push to `main` branch or manual dispatch
- Builds the Angular app with production configuration
- Deploys to GitHub Pages
- Uses Node.js 20 LTS for stability

### 2. `src/.nojekyll`
Empty file that tells GitHub Pages not to process the site with Jekyll. This is important for Angular apps because Jekyll ignores files/folders starting with underscore, which Angular uses for generated files.

### 3. `src/404.html`
Custom 404 page that handles Angular routing on GitHub Pages. When users refresh a page or navigate directly to a route, GitHub Pages will serve this 404 page, which then redirects to the correct Angular route.

## Files Modified

### 1. `angular.json`
Added `.nojekyll` and `404.html` to the assets array so they're copied to the dist folder during build:
```json
"assets": [
  "src/favicon.ico", 
  "src/assets",
  "src/.nojekyll",
  "src/404.html"
]
```

### 2. `src/index.html`
Added a redirect script in the `<head>` section to support Angular routing on GitHub Pages. This script saves the current URL in sessionStorage before the 404 page loads.

### 3. `README.md`
Added deployment instructions for GitHub Pages.

## How It Works

1. **Build Process**:
   - GitHub Actions checks out the code
   - Installs dependencies with `npm ci`
   - Builds the app with `--base-href /acki.live/` to ensure assets load correctly
   - Uploads build artifacts to GitHub Pages

2. **Routing Solution**:
   - When a user visits a non-root URL (e.g., `/acki.live/blocks`), GitHub Pages returns 404.html
   - The 404.html includes the same Angular app with a redirect script
   - The script reads the saved URL from sessionStorage and uses `history.replaceState()` to navigate to the correct route
   - Angular router then displays the correct page

3. **Asset Handling**:
   - `.nojekyll` prevents GitHub Pages from ignoring Angular's built files
   - `--base-href` ensures all assets (CSS, JS) are loaded from the correct path

## Setup Instructions

1. **In GitHub Repository Settings**:
   - Navigate to Settings → Pages
   - Under "Build and deployment", select "Source: GitHub Actions"

2. **Deploy**:
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

3. **Access the Site**:
   - After the workflow completes, visit: `https://<your-username>.github.io/acki.live/`
   - Check the Actions tab to monitor deployment progress

## Customization

### Change Repository Name
If your repository name is different from "acki.live", update:

1. `.github/workflows/deploy.yml`:
   ```yaml
   run: npm run build -- --configuration production --base-href /<your-repo-name>/
   ```

2. `src/index.html` and `src/404.html`:
   ```html
   <base href="/<your-repo-name>/">
   ```

### Custom Domain
To use a custom domain:

1. Add a `CNAME` file to `src/` containing your domain name
2. Add it to angular.json assets:
   ```json
   "assets": [..., "src/CNAME"]
   ```
3. Configure DNS settings in your domain registrar
4. Update `<base href="/">` in index.html and 404.html

## Troubleshooting

**404 on Refresh**: Make sure both `index.html` and `404.html` have the redirect scripts.

**Assets Not Loading**: Verify `--base-href` matches your repository name in the workflow file.

**Workflow Fails**: Check the Actions tab for detailed error logs. Common issues:
- Node version mismatch (workflow uses Node 20)
- Build errors (test locally with `npm run build`)
- Missing permissions (ensure Pages write permission is enabled)

**CORS Issues**: The GraphQL endpoint uses `Content-Type: text/plain` to avoid CORS preflight requests. This is already configured in `blockchain.service.ts`.
