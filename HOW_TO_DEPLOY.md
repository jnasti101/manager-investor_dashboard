# How to Deploy Your Real Estate Dashboard

## Quick Start (5 Minutes)

### Step 1: Push to GitHub

```bash
# 1. Initialize git
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit - Real Estate Dashboard"

# 4. Create a new repo on GitHub at: https://github.com/new
#    Name it something like: real-estate-dashboard

# 5. Connect to GitHub (replace with your repo URL)
git remote add origin git@github.com:jnasti101/real-estate-dashboard.git

# 6. Push
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in (or create account with GitHub)

2. **Click "Add New Project"**

3. **Import your GitHub repository:**
   - You'll see your repositories listed
   - Click "Import" next to `real-estate-dashboard`

4. **Configure project (use defaults):**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

5. **Click "Deploy"**

6. **Wait 2-3 minutes** ☕

7. **Done!** 🎉 Your app is live!

---

## Your Live URLs

After deployment, you'll get:

- **Production URL:** `https://your-project.vercel.app`
- **Custom domain:** You can add your own domain in Vercel settings

---

## Making Updates

Once deployed, updates are automatic:

```bash
# Make your changes to the code

# Commit and push
git add .
git commit -m "Update dashboard features"
git push

# Vercel automatically deploys! ✨
```

Every push to `main` triggers a new deployment.

---

## Alternative: Use Vercel CLI

If you prefer command line:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (first time)
vercel

# Deploy to production
vercel --prod
```

---

## Alternative: Use the Helper Script

I created a helper script for you:

```bash
# Run the deployment helper
./deploy.sh
```

This will guide you through the process step by step.

---

## Troubleshooting

### Build fails?
1. Test locally first: `npm run build`
2. Fix any errors that appear
3. Commit and push again

### Can't connect to GitHub?
Make sure you have SSH keys set up:
```bash
# Check if you have SSH keys
ls -la ~/.ssh

# If not, create one
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitHub: https://github.com/settings/keys
```

### Need help?
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

---

## Environment Variables (For Future)

When you add a database or authentication:

1. Go to your Vercel project settings
2. Click "Environment Variables"
3. Add your variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - etc.

---

## Custom Domain (Optional)

To use your own domain:

1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain (e.g., `realestate.yourdomain.com`)
4. Update your DNS records as instructed
5. SSL certificate is automatic!

---

## Preview Deployments

Every pull request gets a preview URL:
- Create a branch: `git checkout -b feature-branch`
- Make changes and push
- Create PR on GitHub
- Vercel creates preview URL automatically
- Share with stakeholders before merging!

---

## That's It!

Your Real Estate Dashboard is now live and accessible worldwide! 🌍

**Next Steps:**
- Share the URL with your users
- Add a custom domain
- Start building real features!
