# Troubleshooting Guide

## Common Issues and Solutions

### Issue: PostCSS Plugin Error
**Error Message:**
```
Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
```

**Solution:**
This has already been fixed! The project uses Tailwind CSS v4 which requires `@tailwindcss/postcss`. This is already installed and configured correctly in:
- [postcss.config.mjs](postcss.config.mjs) - Uses `@tailwindcss/postcss`
- [app/globals.css](app/globals.css) - Uses `@import "tailwindcss"`

If you still see this error:
```bash
npm install @tailwindcss/postcss
rm -rf .next
npm run dev
```

### Issue: Port Already in Use
**Error Message:**
```
Port 3000 is in use
```

**Solution:**
```bash
# Kill the process using port 3000
pkill -f "next dev"

# Or use a different port
npm run dev -- -p 3001
```

### Issue: Module Not Found
**Error Message:**
```
Module not found: Can't resolve 'xyz'
```

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript Errors
**Error Message:**
```
Type 'X' is not assignable to type 'Y'
```

**Solution:**
Check your TypeScript version:
```bash
npm list typescript
```

If needed, ensure types are installed:
```bash
npm install --save-dev @types/react @types/node
```

### Issue: Build Fails on Vercel
**Error Message:**
```
Build failed
```

**Solution:**
1. Test build locally first:
```bash
npm run build
```

2. Check the build logs in Vercel dashboard
3. Ensure all environment variables are set in Vercel
4. Make sure `package.json` has all dependencies

### Issue: Charts Not Rendering
**Symptom:** Dashboard shows but charts are blank

**Solution:**
Recharts requires client-side rendering. Ensure chart components have:
```tsx
'use client'
```

at the top of the file. All chart components already have this.

### Issue: Styles Not Loading
**Symptom:** Page loads but looks unstyled

**Solution:**
1. Check that [app/globals.css](app/globals.css) is imported in [app/layout.tsx](app/layout.tsx)
2. Clear Next.js cache:
```bash
rm -rf .next
npm run dev
```

### Issue: Hot Reload Not Working
**Symptom:** Changes don't appear without manual refresh

**Solution:**
```bash
# Restart dev server
pkill -f "next dev"
npm run dev
```

## Development Tips

### Clear All Caches
```bash
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

### Check for Errors
```bash
# Run type checking
npx tsc --noEmit

# Run linter (once ESLint is configured)
npm run lint
```

### Debug Mode
Add to [next.config.ts](next.config.ts):
```typescript
const nextConfig: NextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}
```

## Browser Issues

### Issue: Layout Broken in Safari
**Solution:**
Test in Chrome first. If it works in Chrome but not Safari, check:
- CSS Grid/Flexbox compatibility
- Webkit prefixes might be needed

### Issue: Charts Broken in Mobile
**Solution:**
Charts are responsive by default with `ResponsiveContainer`. Test with:
- Chrome DevTools mobile view
- Real device testing

## Performance Issues

### Issue: Slow Page Load
**Solutions:**
1. Check Vercel Analytics for bottlenecks
2. Optimize images (use Next.js Image component)
3. Enable caching for API routes
4. Consider lazy loading for charts

### Issue: High Memory Usage
**Solution:**
```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run dev
```

## Database Issues (Future)

When you add a database:

### Issue: Database Connection Fails
**Solution:**
1. Check DATABASE_URL environment variable
2. Verify database is running
3. Check firewall/security group settings
4. Ensure SSL/TLS is configured correctly

## Need More Help?

1. Check [Next.js Documentation](https://nextjs.org/docs)
2. Check [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
3. Check [Recharts Documentation](https://recharts.org/)
4. Check GitHub Issues for this project

## Quick Fixes Summary

```bash
# The nuclear option - fixes most issues
pkill -f "next dev"
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

## Reporting Issues

When reporting issues, include:
1. Error message (full stack trace)
2. Browser and version
3. Node version (`node --version`)
4. Steps to reproduce
5. Screenshots if applicable
