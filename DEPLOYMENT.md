# Deployment Guide

## Prerequisites

- GitHub account with the repository already set up ✅
- Vercel account (free tier is fine)
- Vercel CLI installed ✅

## Step 1: Install Vercel CLI (Already Installed ✅)

```bash
npm install -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate via email or GitHub.

## Step 3: Deploy to Vercel

From the `kanban-board` directory:

```bash
vercel
```

The CLI will ask:

1. **Set up and deploy?** → Yes
2. **Which scope?** → Select your account
3. **Link to existing project?** → No
4. **Project name?** → ai-agent-kanban-board (or your choice)
5. **Directory?** → ./ (current directory)
6. **Override settings?** → No

The app will be deployed and you'll receive a URL like:
`https://ai-agent-kanban-board.vercel.app`

## Step 4: Production Deployment

For production deployment:

```bash
vercel --prod
```

## Step 5: Connect GitHub (Automatic Deployments)

Option A: **Via Vercel Dashboard** (Recommended)
1. Go to https://vercel.com/dashboard
2. Click "Import Project"
3. Connect your GitHub account
4. Select the `ai-agent-kanban-board` repository
5. Click "Import"
6. Vercel will auto-detect Next.js settings
7. Click "Deploy"

From now on, every push to `master` will auto-deploy!

Option B: **Via CLI**
```bash
vercel link
vercel --prod
```

## Important Notes

### Google Tasks Integration

The board uses `../skills/gmail/token.json` for local development. For production:

1. **Option A: Disable Google Tasks sync** (simplest)
   - Remove the Google Tasks integration API routes
   - Use the board as a standalone app

2. **Option B: Set up OAuth for production**
   - Store credentials as Vercel environment variables
   - Update `lib/google-tasks.ts` to use env vars instead of token file

### Environment Variables (If needed)

Set in Vercel Dashboard → Project Settings → Environment Variables:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

## Troubleshooting

### Build Errors
- Make sure all dependencies are in `package.json`
- Check that TypeScript types are correct
- Ensure `.gitignore` doesn't exclude necessary files

### Data Persistence
- Current version uses local JSON storage in `/data`
- For production, consider:
  - Vercel KV (Redis)
  - Vercel Postgres
  - External database (Supabase, PlanetScale, etc.)

## Useful Commands

```bash
# Check deployment logs
vercel logs

# View current deployments
vercel ls

# Remove a deployment
vercel rm <deployment-url>

# Open project in Vercel dashboard
vercel inspect
```

## Next Steps

1. Set up a custom domain (optional)
2. Configure environment variables
3. Set up database for persistent storage
4. Configure Google Tasks OAuth for production

---

**Current Status:**
- ✅ Repository created on GitHub
- ⏳ Awaiting Vercel login and deployment
