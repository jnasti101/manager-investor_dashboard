# Deployment Guide

## Production Database Setup

Your application currently uses a local Prisma Postgres database. For production on Vercel, you need a cloud-hosted PostgreSQL database.

### Step 1: Choose a Database Provider

**Neon (Recommended)**
- Free tier: 10 GB storage, unlimited connections
- Website: https://neon.tech
- Serverless PostgreSQL with auto-scaling

**Supabase**
- Free tier: 500 MB database, unlimited API requests
- Website: https://supabase.com
- PostgreSQL + additional features (auth, storage, etc.)

**Railway**
- $5 free credit (with credit card)
- Website: https://railway.app
- Simple PostgreSQL hosting

### Step 2: Create Your Database

1. Sign up for your chosen provider
2. Create a new PostgreSQL database
3. Copy the connection string (should look like: `postgresql://user:password@host:5432/dbname`)

### Step 3: Run Migrations on Production Database

From your project directory:

```bash
./scripts/migrate-production.sh
```

Or manually:

```bash
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

### Step 4: Configure Vercel Environment Variables

Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

1. **DATABASE_URL**
   - Value: Your production database connection string
   - Environment: Production, Preview, Development

2. **AUTH_SECRET**
   - Value: Copy from your local `.env` file
   - Environment: Production, Preview, Development

3. **NEXTAUTH_URL**
   - Value: Your production URL (e.g., `https://your-app.vercel.app`)
   - Environment: Production only
   - For Preview: `https://your-app-git-$VERCEL_GIT_COMMIT_REF.vercel.app`

### Step 5: Redeploy

After setting environment variables:

```bash
git commit -m "Add deployment docs" --allow-empty
git push
```

Or use Vercel dashboard: Deployments → ... → Redeploy

## Creating Your First User

Once deployed, you need to create a user account:

1. Go to: `https://your-app.vercel.app/signup`
2. Register with email/password
3. The first user created will have investor/client role

## Troubleshooting

### Authentication Not Working
- Verify `AUTH_SECRET` is set in Vercel
- Verify `NEXTAUTH_URL` matches your deployment URL
- Check Vercel logs: Deployments → Your Deployment → Logs

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check if your database provider requires IP whitelisting (Vercel uses dynamic IPs)
- Most serverless providers (Neon, Supabase) don't require IP whitelisting

### Migrations Failed
- Ensure your production database is empty before first migration
- Or manually reset: `DATABASE_URL="..." npx prisma migrate reset` (WARNING: deletes all data)

## Local Development vs Production

**Local (.env file):**
```env
DATABASE_URL="prisma+postgres://localhost:51213/..."
AUTH_SECRET="nT6EoNpMmEgHPa8QsmSdAsQZu1izL3UmgDYqB9LnkWo="
NEXTAUTH_URL="http://localhost:3000"
```

**Production (Vercel env vars):**
- DATABASE_URL: Your cloud database URL
- AUTH_SECRET: Same as local (or generate new with `openssl rand -base64 32`)
- NEXTAUTH_URL: Your Vercel app URL

## Security Notes

- Never commit `.env` files to git (already in `.gitignore`)
- Rotate `AUTH_SECRET` if it's ever exposed
- Use strong passwords for database users
- Enable SSL for database connections in production
