# Cloudflare R2 Video Worker

This Cloudflare Worker handles uploading videos and streaming them globally with zero bandwidth fees using Cloudflare R2.

## Quick Setup (3 Minutes)

### 1. Create your R2 Bucket in Cloudflare
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com/) > **R2 Object Storage**.
2. Click **Create bucket**.
3. Name it: `sriram-portfolio-videos` (or match the name in `wrangler.toml`).
4. Click **Create Bucket**.

### 2. Deploy this Worker
From the project root:
```powershell
npm run deploy:worker
```
*(Or inside this folder: `npx wrangler deploy`)*

When the deployment finishes, Wrangler will output your worker URL, for example:
```
https://sriram-portfolio-videos.<your-subdomain>.workers.dev
```

### 3. Connect to your Portfolio Admin Panel
1. Open your portfolio in your browser.
2. Click the admin lock icon in the footer (PIN: `121314161820`).
3. Click the **Cloudflare R2** button / tab.
4. Paste your Worker URL: `https://sriram-portfolio-videos.<your-subdomain>.workers.dev`.
5. Now, whenever you upload a video, it uploads straight to Cloudflare and every visitor worldwide can stream it!
