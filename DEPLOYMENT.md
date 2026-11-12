# Deployment

1. Push the project to GitHub.
2. Create a hosting project from the repository (Vercel, Netlify or another Vite-compatible host).
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the hosting environment.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Configure SPA fallback so application routes resolve to `index.html`.
7. Add the deployed site URL to Supabase Auth redirect URL settings.

Never expose service-role keys in frontend environment variables. Deploy payment webhooks and privileged operations as server-side functions only.
