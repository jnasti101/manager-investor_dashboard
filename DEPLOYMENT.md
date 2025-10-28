# Deployment Guide

## Deploy to Vercel (Recommended)

### Option 1: Via Vercel Dashboard (Easiest)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Real Estate Dashboard"
   git branch -M main
   git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"
   - Done! Your app will be live in 2-3 minutes

### Option 2: Via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Login to your Vercel account
   - Select "yes" to deploy
   - Choose your deployment settings
   - Done!

## Custom Domain

1. In Vercel dashboard, go to your project
2. Click "Settings" > "Domains"
3. Add your custom domain
4. Update your DNS records as instructed
5. Wait for SSL certificate to provision (automatic)

## Environment Variables (For Production)

When you implement real authentication and database:

1. Go to Vercel dashboard > Your Project > Settings > Environment Variables
2. Add:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Random secret for NextAuth
   - `NEXTAUTH_URL`: Your production URL

## Post-Deployment Checklist

- [ ] Test login page
- [ ] Test investor dashboard
- [ ] Test manager dashboard
- [ ] Verify all charts load correctly
- [ ] Check mobile responsiveness
- [ ] Update README with production URL
- [ ] Set up custom domain (optional)

## Monitoring

Vercel provides:
- Automatic HTTPS
- Global CDN
- Analytics (on paid plans)
- Deployment logs
- Performance insights

## Troubleshooting

**Build fails?**
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Make sure TypeScript has no errors: `npm run build` locally

**404 on refresh?**
- Vercel handles this automatically with Next.js
- No extra configuration needed

**Slow load times?**
- Enable Vercel Analytics to identify bottlenecks
- Consider upgrading to Vercel Pro for better performance

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` triggers automatic deployment
- Preview deployments for pull requests
- Instant rollbacks if needed

## Cost

- Free tier: Generous limits for personal projects
- Hobby: $0/month (perfect for MVP)
- Pro: $20/month (team collaboration)
