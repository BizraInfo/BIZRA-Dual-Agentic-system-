# Vercel Deployment Guide for bizra.ai & bizra.info

**Date**: 2026-01-13
**Status**: Ready to Deploy

---

## Overview

This guide covers deploying both domains to Vercel with a separate backend API server.

```
Vercel (Frontend)          Backend Server (Rust API)
┌─────────────────┐        ┌──────────────────────┐
│  bizra.ai       │───────>│  api.bizra.ai        │
│  bizra.info     │  CORS  │  Port 33333          │
└─────────────────┘        └──────────────────────┘
    Git Push                    Deploy Separately
    Auto-Deploy                 (VPS/Railway/Fly)
```

---

## Part 1: Frontend Deployment (Vercel)

### Step 1: Push Code to GitHub

```bash
cd /root/bizra-genesis

# Stage all changes
git add bizra-genesis-node/apps/dashboard/src/middleware.ts
git add bizra-genesis-node/apps/dashboard/src/lib/live-data.ts
git add bizra-genesis-node/apps/dashboard/src/components/LivingTree.tsx
git add bizra-genesis-node/apps/dashboard/src/components/DailyInsight.tsx
git add BACKEND_API_IMPLEMENTATION_COMPLETE.md
git add DOMAIN_UPDATE_IMPLEMENTATION_SUMMARY.md
git add DEPLOYMENT_QUICK_REFERENCE.md

# Commit
git commit -m "feat: Add live knowledge graph integration for bizra.ai and bizra.info

- Implemented 4 backend API endpoints for knowledge graph data
- Created LivingTree visualization component (Canvas, 60fps)
- Created DailyInsight card component with daily rotation
- Added domain-aware middleware for unique UX per domain
- Integrated SWR hooks for real-time data fetching
- CORS configured for both domains
- Complete documentation and deployment guides

Closes #<issue-number> (if applicable)
"

# Push to trigger Vercel deployment
git push origin main
```

### Step 2: Configure Vercel Environment Variables

Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

**Add these variables**:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://api.bizra.ai` | Production |
| `NEXT_PUBLIC_API_URL` | `http://localhost:33333` | Development |

**Important**: Don't include trailing slash in API URL.

### Step 3: Configure Custom Domains

In Vercel Dashboard → Domains:

1. **Add bizra.ai**
   - Click "Add Domain"
   - Enter: `bizra.ai`
   - Follow DNS setup instructions

2. **Add bizra.info**
   - Click "Add Domain"
   - Enter: `bizra.info`
   - Follow DNS setup instructions

Both domains will deploy from the same repository but show different UX via middleware.

### Step 4: Verify Vercel Deployment

After push, Vercel will:
- ✅ Build Next.js app
- ✅ Deploy to both domains
- ✅ Apply environment variables
- ✅ Enable automatic HTTPS

**Check deployment**:
- Visit https://bizra.ai
- Visit https://bizra.info
- Components should load (with fallback data initially)

---

## Part 2: Backend API Deployment

### Option A: Deploy to Railway.app (Recommended)

**Why Railway**: Native Rust support, automatic SSL, easy setup.

#### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub

#### 2. Create New Project
```bash
cd /root/bizra-genesis

# Create railway.toml
cat > railway.toml <<EOF
[build]
builder = "nixpacks"
buildCommand = "cd bizra-genesis-node/backend && cargo build --release"

[deploy]
startCommand = "cd bizra-genesis-node/backend && ./target/release/apiserver"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
EOF
```

#### 3. Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set API_PORT=33333
railway variables set NODE_ENV=production
railway variables set CORS_ORIGINS="https://bizra.ai,https://bizra.info"

# Deploy
railway up
```

#### 4. Get Railway Domain
Railway will give you a domain like: `your-app.railway.app`

#### 5. Add Custom Domain (Optional)
- In Railway dashboard → Settings → Domains
- Add: `api.bizra.ai`
- Update DNS: Add CNAME record pointing to Railway domain

---

### Option B: Deploy to Fly.io

#### 1. Install Fly CLI
```bash
curl -L https://fly.io/install.sh | sh
```

#### 2. Create Fly App
```bash
cd /root/bizra-genesis/bizra-genesis-node/backend

# Login to Fly
fly auth login

# Create app
fly launch --no-deploy

# Set app name when prompted: bizra-api
```

#### 3. Create fly.toml
```toml
app = "bizra-api"
primary_region = "iad"

[build]
  [build.args]
    RUST_VERSION = "1.75"

[env]
  API_PORT = "8080"
  NODE_ENV = "production"
  CORS_ORIGINS = "https://bizra.ai,https://bizra.info"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1

[[http_service.checks]]
  grace_period = "30s"
  interval = "15s"
  method = "GET"
  timeout = "5s"
  path = "/health"

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

#### 4. Deploy
```bash
fly deploy
```

#### 5. Get Fly Domain
Your API will be at: `bizra-api.fly.dev`

---

### Option C: Deploy to VPS (DigitalOcean/Linode/Hetzner)

#### 1. Create Droplet/VPS
- Choose Ubuntu 22.04
- At least 1GB RAM
- Add SSH key

#### 2. Install Dependencies
```bash
# SSH into server
ssh root@your-server-ip

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install system dependencies
apt update
apt install -y build-essential pkg-config libssl-dev git
```

#### 3. Clone and Build
```bash
# Clone repository
git clone https://github.com/your-username/bizra-genesis.git
cd bizra-genesis

# Build backend
cd bizra-genesis-node/backend
cargo build --release
```

#### 4. Create Systemd Service
```bash
cat > /etc/systemd/system/bizra-api.service <<EOF
[Unit]
Description=BIZRA API Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/bizra-genesis/bizra-genesis-node/backend
Environment="API_PORT=33333"
Environment="NODE_ENV=production"
Environment="CORS_ORIGINS=https://bizra.ai,https://bizra.info"
ExecStart=/root/bizra-genesis/bizra-genesis-node/backend/target/release/apiserver
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl enable bizra-api
systemctl start bizra-api
systemctl status bizra-api
```

#### 5. Setup Nginx Reverse Proxy
```bash
# Install nginx
apt install -y nginx certbot python3-certbot-nginx

# Create nginx config
cat > /etc/nginx/sites-available/bizra-api <<EOF
server {
    listen 80;
    server_name api.bizra.ai;

    location / {
        proxy_pass http://localhost:33333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/bizra-api /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Get SSL certificate
certbot --nginx -d api.bizra.ai
```

---

## Part 3: DNS Configuration

### For api.bizra.ai

**If using Railway/Fly.io**:
- Type: CNAME
- Name: `api`
- Value: `your-app.railway.app` (or `bizra-api.fly.dev`)

**If using VPS**:
- Type: A
- Name: `api`
- Value: `your.server.ip.address`

### For bizra.ai and bizra.info

These are already configured in Vercel. Just ensure:
- Type: CNAME
- Name: `@` (or blank for root)
- Value: `cname.vercel-dns.com` (Vercel will provide)

---

## Part 4: Update Frontend API URL

After backend is deployed, update Vercel environment variables:

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Edit `NEXT_PUBLIC_API_URL`
3. Change from placeholder to actual backend URL:
   - Railway: `https://your-app.railway.app`
   - Fly.io: `https://bizra-api.fly.dev`
   - VPS: `https://api.bizra.ai`

4. **Redeploy frontend** (Vercel → Deployments → Redeploy)

---

## Part 5: Verification

### Test Backend API
```bash
# Check health
curl https://api.bizra.ai/health

# Test knowledge endpoints
curl https://api.bizra.ai/api/knowledge/stats
curl https://api.bizra.ai/api/knowledge/daily-insight
curl https://api.bizra.ai/api/knowledge/discoveries
curl https://api.bizra.ai/api/knowledge/graph-data
```

### Test Frontend Integration

**Visit bizra.ai**:
- [ ] Living Tree renders and animates
- [ ] Daily Insight card appears
- [ ] Stats update in real-time
- [ ] Cyan theme (technical)
- [ ] No CORS errors in console

**Visit bizra.info**:
- [ ] Living Tree renders and animates
- [ ] Daily Insight card appears
- [ ] Stats update in real-time
- [ ] Gold theme (wisdom)
- [ ] No CORS errors in console

---

## Part 6: Copy Knowledge Graph Data to Backend Server

The backend needs access to the insights graph JSON file.

### If using Railway/Fly.io
Add the file to your repository:
```bash
cd /root/bizra-genesis

# Ensure knowledge graph is committed
git add knowledge_graph_output/insights/bizra_insights_graph.json
git commit -m "Add insights knowledge graph data"
git push
```

Railway/Fly will include it in deployment.

### If using VPS
Copy the file to your server:
```bash
# From your local machine
scp -r knowledge_graph_output root@your-server-ip:/root/bizra-genesis/
```

---

## Troubleshooting

### CORS Errors

**Check backend CORS configuration**:
```bash
# On server
echo $CORS_ORIGINS
# Should output: https://bizra.ai,https://bizra.info
```

**Restart backend** after changing CORS:
```bash
# Railway/Fly
railway restart  # or fly deploy

# VPS
systemctl restart bizra-api
```

### API Returns 404

**Check routes are registered**:
```bash
# Test direct endpoint
curl https://api.bizra.ai/api/knowledge/stats

# If 404, check main.rs has:
# .merge(Router::new().nest("/api/knowledge", knowledge_router()))
```

### Knowledge Graph File Not Found

**Check file exists on server**:
```bash
# Railway/Fly: Check build logs
railway logs  # or fly logs

# VPS: Check file
ls -la /root/bizra-genesis/knowledge_graph_output/insights/
```

**Update path in code if needed**:
File: `bizra-genesis-node/backend/src/api/knowledge.rs:121`

---

## Performance Optimization (Post-Deployment)

### Enable Caching

Add to nginx config (VPS only):
```nginx
location /api/knowledge/ {
    proxy_pass http://localhost:33333;
    proxy_cache_valid 200 5m;  # Cache for 5 minutes
    add_header X-Cache-Status $upstream_cache_status;
}
```

### Add Redis Caching (Optional)

For Railway/Fly:
1. Add Redis plugin/service
2. Update backend to cache graph in Redis
3. Reduce disk reads

---

## Monitoring

### Railway/Fly.io
- Built-in monitoring dashboard
- Automatic metrics and logs
- Alerts for downtime

### VPS
```bash
# Check service status
systemctl status bizra-api

# View logs
journalctl -u bizra-api -f

# Monitor resource usage
htop
```

---

## Rollback Procedure

### Frontend (Vercel)
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

### Backend (Railway/Fly)
```bash
railway rollback  # or fly releases rollback
```

### Backend (VPS)
```bash
cd /root/bizra-genesis
git checkout <previous-commit-hash>
cd bizra-genesis-node/backend
cargo build --release
systemctl restart bizra-api
```

---

## Cost Estimate

### Vercel (Frontend)
- **Free tier**: Likely sufficient
- **Pro**: $20/month if needed

### Backend Options
- **Railway**: ~$5-10/month (pay-as-you-go)
- **Fly.io**: ~$5/month (256MB RAM)
- **VPS**: $5-10/month (DigitalOcean/Hetzner)

**Total estimated cost**: $5-20/month

---

## الحمد لله

Your deployment is ready! Follow the steps above to get both domains live with the knowledge graph integration.

**Next Steps**:
1. ✅ Push frontend code to trigger Vercel deployment
2. ✅ Deploy backend to Railway/Fly/VPS
3. ✅ Update DNS records
4. ✅ Update Vercel environment variables
5. ✅ Test both domains
6. ✅ Monitor and optimize

**Support**: If issues arise, check logs and the troubleshooting section above.
