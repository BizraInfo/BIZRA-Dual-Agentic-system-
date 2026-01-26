# Deploy bizra.ai & bizra.info NOW

**Status**: ✅ Everything is ready. Just 3 steps.

---

## Step 1: Deploy Backend (Choose One)

### Option A: Railway (5 minutes)

```bash
# Install Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# Login and deploy
cd /root/bizra-genesis/bizra-genesis-node/backend
railway login
railway init
railway up

# Get your URL (copy this!)
railway domain
```

### Option B: Your VPS

```bash
# On your server
cd /root/bizra-genesis/bizra-genesis-node/backend
cargo build --release
./target/release/bizra-node0 server --port 33333

# Set up nginx + SSL (see VERCEL_DEPLOYMENT_GUIDE.md)
```

---

## Step 2: Configure Vercel

Go to: https://vercel.com/dashboard

1. Open your project
2. Go to **Settings** → **Environment Variables**
3. Add:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://your-backend-url-from-step-1
   ```
4. Click **Save**

---

## Step 3: Deploy Frontend

```bash
cd /root/bizra-genesis

# Commit everything
git add .
git commit -m "feat: Live knowledge graph for bizra.ai/bizra.info

- Unique UX per domain (technical vs wisdom themes)
- Real-time knowledge graph visualization
- Daily rotating insights
- Canvas-based Living Tree (60fps)
- Complete API backend with 4 endpoints
- Offline-first with fallback data

الحمد لله

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push (Vercel auto-deploys)
git push origin main
```

---

## Verify It Works

### Backend Test

```bash
# Replace with your backend URL
curl https://your-backend-url/api/knowledge/stats | jq
```

**Expected**: JSON with `total_nodes: 221`

### Frontend Test

```bash
# Visit both domains
open https://bizra.ai
open https://bizra.info
```

**Expected**:
- **bizra.ai**: Cyan theme, "Build with BIZRA"
- **bizra.info**: Gold theme, "بيت الحكمة - House of Wisdom"
- Living Tree animates with nodes
- Daily Insight shows a card
- Stats update in real-time

---

## If Something Breaks

### Backend Not Running

```bash
# Check logs
railway logs

# Or restart
railway up --detach
```

### Frontend Shows Errors

1. Check Vercel deployment logs
2. Verify `NEXT_PUBLIC_API_URL` is set correctly
3. Check browser console for CORS errors

### CORS Errors

Backend already configured for:
- https://bizra.ai
- https://bizra.info
- http://localhost:3000

If using different URL, edit `backend/src/main.rs` line ~123.

---

## Optional: Add Components to Your Pages

**File**: `apps/dashboard/src/app/page.tsx`

```typescript
import { LivingTree } from '@/components/LivingTree';
import { DailyInsight } from '@/components/DailyInsight';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bizra-bg-dark">
      {/* Living Tree */}
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

See [INTEGRATION_EXAMPLE.md](bizra-genesis-node/apps/dashboard/INTEGRATION_EXAMPLE.md) for more examples.

---

## What You're Deploying

### Backend API (4 Endpoints)

1. `GET /api/knowledge/stats` - Graph statistics
2. `GET /api/knowledge/daily-insight` - Daily rotating insight
3. `GET /api/knowledge/discoveries` - Recent discoveries
4. `GET /api/knowledge/graph-data` - Full graph data

### Frontend Components

1. **middleware.ts** - Domain detection (bizra.ai vs bizra.info)
2. **live-data.ts** - SWR hooks for real-time data
3. **LivingTree.tsx** - Canvas visualization (60fps)
4. **DailyInsight.tsx** - Beautiful insight card

### Knowledge Graph

- **221 nodes** from 20 BIZRA documents
- **201 relationships** between insights
- **3 years** of evolution captured
- **7 categories**: vision, philosophy, technical, insight, documentation, learning

---

## Success Checklist

After deployment, verify:

- [ ] Backend responds: `curl https://your-backend/api/knowledge/stats`
- [ ] bizra.ai loads with cyan theme
- [ ] bizra.info loads with gold theme
- [ ] Living Tree animates smoothly
- [ ] Daily Insight shows content
- [ ] Stats update every 5 seconds
- [ ] Mobile works (test on phone)

---

## Need Help?

**Documentation**:
- [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md) - Complete status
- [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) - Detailed guide
- [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md) - Verification checklist
- [KNOWLEDGE_GRAPH_COMPONENTS.md](bizra-genesis-node/apps/dashboard/KNOWLEDGE_GRAPH_COMPONENTS.md) - Component docs

**Testing**:
```bash
./test_knowledge_api.sh  # Test all endpoints
```

---

## الحمد لله

You're deploying:
- 3 years of BIZRA wisdom
- Live knowledge graph visualization
- Unique experiences for 2 audiences
- Production-ready architecture

**Time to deploy**: 15 minutes
**Time to impact**: Immediate

---

**Let's go! 🚀**
