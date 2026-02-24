# Pre-Deployment Checklist

**Date**: 2026-01-13
**Purpose**: Ensure everything is ready before deploying to production

---

## Backend Implementation ✅

- [x] API endpoints created (`/api/knowledge/*`)
- [x] CORS configured for both domains
- [x] Knowledge graph JSON file exists
- [x] Handler functions implemented
- [x] Routes registered in main.rs
- [x] Test script created (`test_knowledge_api.sh`)
- [x] Documentation complete

**Status**: ✅ **READY TO DEPLOY**

---

## Frontend Implementation ✅

- [x] Middleware created (`middleware.ts`)
- [x] Live data hooks created (`live-data.ts`)
- [x] LivingTree component created
- [x] DailyInsight component created
- [x] Fallback data provided
- [x] SWR configured with refresh intervals

**Status**: ✅ **READY TO DEPLOY**

---

## Integration Tasks ⏳

### Add Components to Homepage

**File to modify**: `bizra-genesis-node/apps/dashboard/src/app/page.tsx`

Add imports and use the components:

```typescript
import { LivingTree } from '@/components/LivingTree';
import { DailyInsight } from '@/components/DailyInsight';
import { getDomainType } from '@/lib/live-data';

export default function HomePage() {
  const domain = getDomainType();

  return (
    <div className="min-h-screen bg-bizra-bg-dark">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          {domain === 'ai' ? 'Build with BIZRA' : 'بيت الحكمة'}
        </h1>
      </section>

      {/* Living Tree Visualization */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          The Growing Tree of Knowledge
        </h2>
        <div className="h-[600px]">
          <LivingTree />
        </div>
      </section>

      {/* Daily Insight */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Today's Insight
        </h2>
        <DailyInsight />
      </section>
    </div>
  );
}
```

**Action Required**: ⏳ User needs to integrate components into desired pages

---

## Environment Setup ⏳

### Development Environment

- [x] Components created with fallback data
- [ ] Test locally with mock API
- [ ] Verify middleware routing works

### Production Environment (Vercel)

- [ ] Set `NEXT_PUBLIC_API_URL` environment variable
- [ ] Configure custom domains (bizra.ai, bizra.info)
- [ ] Verify DNS records

### Backend Server

- [ ] Choose deployment platform (Railway/Fly/VPS)
- [ ] Deploy backend API
- [ ] Configure SSL certificate
- [ ] Copy knowledge graph JSON to server

---

## Testing Checklist ⏳

### Local Testing

```bash
# Test backend locally
cd bizra-genesis-node/backend
cargo run --release

# In another terminal, run test script
cd /root/bizra-genesis
./test_knowledge_api.sh
```

**Expected**: All 4 endpoints return HTTP 200

### Frontend Local Testing

```bash
cd bizra-genesis-node/apps/dashboard

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:33333" > .env.local

# Start dev server
npm run dev

# Visit http://localhost:3000
# Verify components render with fallback data
```

### Production Testing (After Deployment)

- [ ] Visit https://bizra.ai
  - [ ] Living Tree renders
  - [ ] Daily Insight shows
  - [ ] Cyan theme active
  - [ ] Stats update every 5s

- [ ] Visit https://bizra.info
  - [ ] Living Tree renders
  - [ ] Daily Insight shows
  - [ ] Gold theme active
  - [ ] Stats update every 5s

- [ ] Check browser console for errors
- [ ] Check Network tab for API calls
- [ ] Verify CORS headers present

---

## Git Commit Checklist ⏳

Before pushing to trigger Vercel deployment:

```bash
cd /root/bizra-genesis

# Check what's staged
git status

# Files that should be committed:
# - bizra-genesis-node/apps/dashboard/src/middleware.ts
# - bizra-genesis-node/apps/dashboard/src/lib/live-data.ts
# - bizra-genesis-node/apps/dashboard/src/components/LivingTree.tsx
# - bizra-genesis-node/apps/dashboard/src/components/DailyInsight.tsx
# - bizra-genesis-node/backend/src/api/knowledge.rs
# - bizra-genesis-node/backend/src/main.rs
# - knowledge_graph_output/insights/bizra_insights_graph.json
# - Documentation files (*.md)

# Verify changes
git diff

# Commit with descriptive message
git commit -m "feat: Live knowledge graph integration for bizra.ai/bizra.info"

# Push to trigger Vercel deployment
git push origin main
```

**Action Required**: ⏳ Review and commit changes

---

## DNS Configuration Checklist ⏳

### For Vercel (Frontend)

**bizra.ai**:
- Type: CNAME
- Name: `@` or blank
- Value: `cname.vercel-dns.com` (Vercel provides)
- TTL: 300

**bizra.info**:
- Type: CNAME
- Name: `@` or blank
- Value: `cname.vercel-dns.com` (Vercel provides)
- TTL: 300

### For Backend API

**api.bizra.ai** (or api.bizra.info):
- **If using Railway/Fly**:
  - Type: CNAME
  - Name: `api`
  - Value: `<your-app>.railway.app` or `<app>.fly.dev`
  - TTL: 300

- **If using VPS**:
  - Type: A
  - Name: `api`
  - Value: `<server-ip-address>`
  - TTL: 300

**Action Required**: ⏳ Configure DNS records

---

## Security Checklist ⏳

### Backend Security

- [x] CORS restricted to specific domains
- [ ] Rate limiting configured (optional but recommended)
- [ ] SSL/TLS enabled (automatic with Railway/Fly/Certbot)
- [ ] Environment variables set (not hardcoded)
- [ ] No sensitive data in logs

### Frontend Security

- [x] API URL in environment variable (not hardcoded)
- [x] Client-side validation for user inputs
- [ ] Content Security Policy headers (optional)
- [ ] HTTPS enforced (automatic with Vercel)

---

## Performance Checklist ⏳

### Backend Performance

- [x] JSON file loading optimized
- [ ] Consider in-memory caching (optional optimization)
- [ ] Monitor response times (< 50ms target)
- [ ] Check server resources (CPU, RAM)

### Frontend Performance

- [x] Fallback data provides instant loading
- [x] SWR caching reduces API calls
- [x] Canvas rendering for 60fps
- [ ] Monitor bundle size (< 500KB target)
- [ ] Test on mobile devices

---

## Monitoring Setup (Post-Deployment) ⏳

### Backend Monitoring

- [ ] Set up logging (already has tracing::error)
- [ ] Monitor API response times
- [ ] Track error rates
- [ ] Set up alerts for downtime

### Frontend Monitoring

- [ ] Enable Vercel Analytics (optional)
- [ ] Monitor Core Web Vitals
- [ ] Track user engagement
- [ ] Set up error tracking (Sentry, etc.)

---

## Rollback Plan ⏳

### If Deployment Fails

**Frontend (Vercel)**:
1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "Promote to Production"

**Backend**:
1. Revert git commit: `git revert HEAD`
2. Rebuild and redeploy
3. Or rollback via Railway/Fly CLI

**Action Required**: ⏳ Document specific rollback procedures for your setup

---

## Cost Tracking ⏳

### Expected Monthly Costs

**Vercel** (Frontend):
- Free tier: $0
- Pro tier (if needed): $20

**Backend**:
- Railway: $5-10/month
- Fly.io: $5/month
- VPS (DigitalOcean): $5-10/month

**Total**: $5-20/month

**Action Required**: ⏳ Set up billing alerts

---

## Documentation Review ✅

- [x] `BACKEND_API_IMPLEMENTATION_COMPLETE.md` - Complete
- [x] `DOMAIN_UPDATE_IMPLEMENTATION_SUMMARY.md` - Complete
- [x] `DEPLOYMENT_QUICK_REFERENCE.md` - Complete
- [x] `VERCEL_DEPLOYMENT_GUIDE.md` - Complete
- [x] `QUICK_START_DOMAINS.md` - Updated
- [x] `PRE_DEPLOYMENT_CHECKLIST.md` - This file

**Status**: ✅ **COMPLETE**

---

## Final Sign-Off

### Before Deploying to Production

Review this checklist and confirm:

- [ ] All backend endpoints tested locally
- [ ] All frontend components tested locally
- [ ] Environment variables configured
- [ ] DNS records ready
- [ ] Backend deployment platform chosen
- [ ] Rollback plan documented
- [ ] Team notified of deployment

### Deployment Day Steps

1. **Morning**: Deploy backend first
   - Test API endpoints
   - Verify knowledge graph loads
   - Check CORS headers

2. **Afternoon**: Deploy frontend
   - Push to git
   - Monitor Vercel build
   - Test both domains

3. **Evening**: Monitor and optimize
   - Check error logs
   - Monitor response times
   - Gather user feedback

---

## الحمد لله

**You're ready to deploy!**

All implementation is complete. Follow the deployment guides and this checklist to ensure a smooth launch.

**Next Action**: Choose your backend deployment platform and follow the corresponding section in `VERCEL_DEPLOYMENT_GUIDE.md`.
