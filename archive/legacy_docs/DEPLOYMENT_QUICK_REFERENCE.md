# 🚀 Deployment Quick Reference

**Last Updated**: 2026-01-13

---

## Start Backend (1 command)

```bash
cd /root/bizra-genesis/bizra-genesis-node/backend && \
export API_PORT=33333 && \
export CORS_ORIGINS="https://bizra.ai,https://bizra.info,http://localhost:3000" && \
cargo run --release
```

**Expected Output**:
```
BIZRA Node0 API Server v1.0.0
Starting API server on 0.0.0.0:33333
Health endpoint: http://0.0.0.0:33333/health
```

---

## Test Backend (1 command)

```bash
cd /root/bizra-genesis && ./test_knowledge_api.sh
```

**Expected**: All 4 endpoints return HTTP 200

---

## Start Frontend (2 commands)

```bash
cd /root/bizra-genesis/bizra-genesis-node/apps/dashboard
npm run dev
```

**Expected**: Server running on http://localhost:3000

---

## Deploy to Production (1 command)

```bash
cd /root/bizra-genesis && \
git add . && \
git commit -m "feat: Live knowledge graph integration" && \
git push origin main
```

**Expected**: Vercel auto-deploys to bizra.ai and bizra.info

---

## Quick Test Endpoints

```bash
# Stats
curl http://localhost:33333/api/knowledge/stats | jq

# Daily Insight
curl http://localhost:33333/api/knowledge/daily-insight | jq

# Discoveries
curl http://localhost:33333/api/knowledge/discoveries | jq

# Graph Data
curl http://localhost:33333/api/knowledge/graph-data | jq
```

---

## Files to Check

### Frontend
- ✅ `bizra-genesis-node/apps/dashboard/src/middleware.ts`
- ✅ `bizra-genesis-node/apps/dashboard/src/lib/live-data.ts`
- ✅ `bizra-genesis-node/apps/dashboard/src/components/LivingTree.tsx`
- ✅ `bizra-genesis-node/apps/dashboard/src/components/DailyInsight.tsx`

### Backend
- ✅ `bizra-genesis-node/backend/src/api/knowledge.rs`
- ✅ `bizra-genesis-node/backend/src/main.rs`

### Documentation
- 📖 `DOMAIN_UPDATE_IMPLEMENTATION_SUMMARY.md` - Complete overview
- 📖 `BACKEND_API_IMPLEMENTATION_COMPLETE.md` - Backend details
- 📖 `QUICK_START_DOMAINS.md` - Deployment guide

---

## Verify Live Deployment

### bizra.ai
- [ ] Visit https://bizra.ai
- [ ] Check Living Tree renders
- [ ] Check Daily Insight appears
- [ ] Check cyan theme (technical)

### bizra.info
- [ ] Visit https://bizra.info
- [ ] Check Living Tree renders
- [ ] Check Daily Insight appears
- [ ] Check gold theme (wisdom)

---

## Troubleshooting

### Backend won't start
```bash
# Check if port is in use
lsof -i :33333

# Kill existing process if needed
kill -9 <PID>
```

### Frontend can't connect to API
```bash
# Check .env.local has correct API URL
cat bizra-genesis-node/apps/dashboard/.env.local

# Should be:
NEXT_PUBLIC_API_URL=http://localhost:33333
```

### CORS errors
```bash
# Verify CORS_ORIGINS includes your domain
echo $CORS_ORIGINS

# Should include both domains
```

---

## الحمد لله

**Everything is ready to deploy!**
