# 🌐 BIZRA Domain Strategy: Live Implementation Plan

**Status**: Both domains publicly deployed
**Current**: Shared Next.js dashboard on Vercel
**Goal**: Unique UX/UI per domain + Live data integration

---

## 🎯 Current State Analysis

### Deployed Infrastructure
✅ **bizra.ai** - Live on Vercel
✅ **bizra.info** - Live on Vercel
✅ **API**: `https://api.bizra.ai`
✅ **WebSocket**: `wss://ws.bizra.ai`
✅ **Dashboard**: Next.js with onboarding flow
✅ **Backend**: Rust server (port 9091)

### Existing Features
- **Onboarding flow** with invitation codes
- **Covenant system** with axioms
- **Multi-language support** (i18n ready)
- **Sacred geometry backgrounds**
- **Agent selection** (PAT agents)
- **Lazy loading** for performance

### Missing Components
❌ Domain-specific routing (bizra.ai vs bizra.info)
❌ Live knowledge graph data connection
❌ Real-time WebSocket integration
❌ Unique onboarding per domain
❌ Living Tree visualization
❌ Discovery Engine integration
❌ Daily insights feed

---

## 🚀 Implementation Strategy

### Phase 1: Domain Differentiation (Week 1)

#### 1.1 Create Domain Detection Middleware

**File**: `bizra-genesis-node/apps/dashboard/src/middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Determine domain type
  const isTechnical = hostname.includes('bizra.ai');
  const isPublic = hostname.includes('bizra.info');

  // Set domain context cookie
  const response = NextResponse.next();
  response.cookies.set('bizra-domain', isTechnical ? 'ai' : 'info');

  // Redirect to appropriate onboarding
  if (request.nextUrl.pathname === '/onboarding') {
    if (isTechnical) {
      return NextResponse.rewrite(new URL('/onboarding/technical', request.url));
    } else {
      return NextResponse.rewrite(new URL('/onboarding/seeker', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/onboarding/:path*', '/'],
};
```

#### 1.2 Create Domain-Specific Onboarding

**bizra.ai** (Technical Path):
```
/app/onboarding/technical/
├── page.tsx           # "The Question" - What are you building?
├── foundation/
│   └── page.tsx       # Show the tech stack (Rust + WASM + FATE)
├── discovery/
│   └── page.tsx       # First API call - Discover a pattern
└── playground/
    └── page.tsx       # API key generation + docs
```

**bizra.info** (Seeker Path):
```
/app/onboarding/seeker/
├── page.tsx           # "The Story" - Bismillah revelation
├── roots/
│   └── page.tsx       # Animated tree growing from Quran
├── path/
│   └── page.tsx       # Choose learning interest
└── house/
    └── page.tsx       # 3D House of Wisdom tour
```

---

### Phase 2: Live Data Integration (Week 2)

#### 2.1 WebSocket Real-Time Connection

**File**: `bizra-genesis-node/apps/dashboard/src/lib/websocket.ts`

```typescript
import { useEffect, useState, useCallback } from 'react';

type MessageType =
  | 'insight_added'
  | 'pattern_discovered'
  | 'graph_updated'
  | 'metrics_update';

interface WebSocketMessage {
  type: MessageType;
  payload: any;
  timestamp: string;
}

export function useWebSocket(url: string = process.env.NEXT_PUBLIC_WS_URL!) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('📡 Connected to BIZRA live data');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      setMessages(prev => [message, ...prev].slice(0, 100)); // Keep last 100
    };

    ws.onclose = () => {
      console.log('📡 Disconnected from BIZRA');
      setConnected(false);
      // Auto-reconnect after 3s
      setTimeout(() => setSocket(new WebSocket(url)), 3000);
    };

    setSocket(ws);

    return () => ws.close();
  }, [url]);

  const send = useCallback((type: MessageType, payload: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, payload, timestamp: new Date().toISOString() }));
    }
  }, [socket]);

  return { connected, messages, send };
}
```

#### 2.2 Live Knowledge Graph Data Fetcher

**File**: `bizra-genesis-node/apps/dashboard/src/lib/live-data.ts`

```typescript
import useSWR from 'swr';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface GraphStats {
  total_nodes: number;
  total_relationships: number;
  quranic_verses: number;
  hadith_count: number;
  insights: number;
  last_updated: string;
}

interface DailyInsight {
  id: string;
  category: 'vision' | 'philosophy' | 'technical' | 'learning';
  header: string;
  content: string;
  arabic?: string;
  source: string;
  confidence: number;
}

interface PatternDiscovery {
  id: string;
  type: 'mathematical' | 'linguistic' | 'scientific';
  description: string;
  evidence: string[];
  significance: number;
  discovered_at: string;
}

// Fetch live graph statistics
export function useGraphStats() {
  return useSWR<GraphStats>(
    `${API_URL}/knowledge/stats`,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch graph stats');
      return res.json();
    },
    { refreshInterval: 5000 } // Update every 5 seconds
  );
}

// Fetch daily insight
export function useDailyInsight() {
  return useSWR<DailyInsight>(
    `${API_URL}/knowledge/daily-insight`,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch daily insight');
      return res.json();
    },
    { refreshInterval: 3600000 } // Update every hour
  );
}

// Fetch recent discoveries
export function useRecentDiscoveries(limit: number = 10) {
  return useSWR<PatternDiscovery[]>(
    `${API_URL}/knowledge/discoveries?limit=${limit}`,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch discoveries');
      return res.json();
    },
    { refreshInterval: 10000 } // Update every 10 seconds
  );
}

// Fetch graph data for visualization
export function useGraphData() {
  return useSWR(
    `${API_URL}/knowledge/graph`,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch graph data');
      return res.json();
    },
    { refreshInterval: 30000 } // Update every 30 seconds
  );
}
```

---

### Phase 3: Unique UI Components (Week 3-4)

#### 3.1 Living Tree Component

**File**: `bizra-genesis-node/apps/dashboard/src/components/LivingTree.tsx`

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useGraphStats } from '@/lib/live-data';

interface TreeNode {
  x: number;
  y: number;
  size: number;
  category: string;
  label?: string;
}

export function LivingTree() {
  const { data: stats, isLoading } = useGraphStats();
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!stats) return;

    // Generate tree structure based on actual data
    const generateTree = () => {
      const tree: TreeNode[] = [];

      // Root: Quran (center bottom)
      tree.push({ x: 400, y: 550, size: 30, category: 'quran', label: 'القرآن' });

      // First branches: Hadith
      tree.push({ x: 300, y: 450, size: 20, category: 'hadith' });
      tree.push({ x: 500, y: 450, size: 20, category: 'hadith' });

      // Upper branches: Insights (grow with actual data)
      const insightCount = Math.min(stats.insights, 50); // Cap visual nodes
      for (let i = 0; i < insightCount; i++) {
        const angle = (i / insightCount) * Math.PI - Math.PI / 2;
        const radius = 150 + Math.random() * 100;
        tree.push({
          x: 400 + Math.cos(angle) * radius,
          y: 350 - Math.sin(angle) * radius,
          size: 5 + Math.random() * 5,
          category: 'insight'
        });
      }

      return tree;
    };

    setNodes(generateTree());
  }, [stats]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections (branches)
    ctx.strokeStyle = 'rgba(252, 191, 73, 0.3)';
    ctx.lineWidth = 2;

    for (let i = 1; i < nodes.length; i++) {
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      ctx.lineTo(nodes[i].x, nodes[i].y);
      ctx.stroke();
    }

    // Draw nodes
    nodes.forEach(node => {
      const colors = {
        quran: '#fcbf49',
        hadith: '#4ecdc4',
        insight: '#aa96da'
      };

      ctx.fillStyle = colors[node.category as keyof typeof colors] || '#666';
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      ctx.fill();

      if (node.label) {
        ctx.fillStyle = '#fff';
        ctx.font = '16px Amiri';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + node.size + 20);
      }
    });
  }, [nodes]);

  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center">
      <div className="text-bizra-accent">Loading the tree...</div>
    </div>;
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
      />

      {/* Live stats overlay */}
      <motion.div
        className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 border border-bizra-accent/30"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-bizra-gold animate-pulse" />
            <span className="text-bizra-text-secondary">Live Data</span>
          </div>
          <div className="text-bizra-accent font-bold text-2xl">
            {stats?.total_nodes.toLocaleString()}
          </div>
          <div className="text-bizra-text-secondary text-xs">
            Nodes in House of Wisdom
          </div>
        </div>
      </motion.div>
    </div>
  );
}
```

#### 3.2 Daily Insight Card

**File**: `bizra-genesis-node/apps/dashboard/src/components/DailyInsight.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import { useDailyInsight } from '@/lib/live-data';
import { Sparkles, Share2, Bookmark } from 'lucide-react';

export function DailyInsight() {
  const { data: insight, isLoading } = useDailyInsight();

  if (isLoading || !insight) {
    return <div className="animate-pulse bg-bizra-secondary rounded-lg h-64" />;
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-bizra-secondary to-bizra-primary rounded-lg p-6 border border-bizra-accent/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-bizra-gold" />
          <span className="text-bizra-text-secondary text-sm">Daily Insight</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-lg transition">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition">
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>

      {insight.arabic && (
        <div className="text-right mb-4 text-2xl font-amiri text-bizra-gold leading-relaxed">
          {insight.arabic}
        </div>
      )}

      <h3 className="text-xl font-bold text-bizra-accent mb-3">
        {insight.header}
      </h3>

      <p className="text-bizra-text-primary leading-relaxed mb-4">
        {insight.content}
      </p>

      <div className="flex items-center justify-between text-sm text-bizra-text-secondary">
        <span>Source: {insight.source}</span>
        <span className="flex items-center gap-1">
          Confidence:
          <span className="text-bizra-gold">{(insight.confidence * 100).toFixed(0)}%</span>
        </span>
      </div>
    </motion.div>
  );
}
```

---

### Phase 4: Backend API Endpoints (Week 5)

#### 4.1 Live Data API Routes

**File**: `bizra-genesis-node/backend/src/api/live_data.rs`

```rust
use axum::{
    extract::State,
    Json,
    response::sse::{Event, Sse},
};
use futures::stream::{self, Stream};
use serde::{Deserialize, Serialize};
use std::convert::Infallible;
use std::time::Duration;
use tokio_stream::StreamExt as _;

#[derive(Serialize)]
pub struct GraphStats {
    total_nodes: usize,
    total_relationships: usize,
    quranic_verses: usize,
    hadith_count: usize,
    insights: usize,
    last_updated: String,
}

#[derive(Serialize, Deserialize)]
pub struct DailyInsight {
    id: String,
    category: String,
    header: String,
    content: String,
    arabic: Option<String>,
    source: String,
    confidence: f64,
}

/// GET /api/knowledge/stats
pub async fn get_graph_stats(
    State(app_state): State<AppState>,
) -> Json<GraphStats> {
    // Load from knowledge graph (connect to Neo4j or read from cached JSON)
    let graph_data = load_insights_graph();

    Json(GraphStats {
        total_nodes: graph_data.nodes.len(),
        total_relationships: graph_data.relationships.len(),
        quranic_verses: 6236,
        hadith_count: 34178,
        insights: graph_data.nodes.iter()
            .filter(|n| n.properties.get("category").map(|c| c == "insight").unwrap_or(false))
            .count(),
        last_updated: chrono::Utc::now().to_rfc3339(),
    })
}

/// GET /api/knowledge/daily-insight
pub async fn get_daily_insight() -> Json<DailyInsight> {
    // Load insights and select one based on day of year
    let graph_data = load_insights_graph();
    let day_of_year = chrono::Utc::now().ordinal() as usize;

    let vision_nodes: Vec<_> = graph_data.nodes.iter()
        .filter(|n| n.properties.get("category").map(|c| c == "vision").unwrap_or(false))
        .collect();

    let selected = &vision_nodes[day_of_year % vision_nodes.len()];

    Json(DailyInsight {
        id: selected.node_id.clone(),
        category: selected.properties.get("category").unwrap().clone(),
        header: selected.properties.get("header").unwrap().clone(),
        content: selected.properties.get("content").unwrap().clone(),
        arabic: None, // Extract if available
        source: selected.source.clone().unwrap_or_default(),
        confidence: selected.confidence,
    })
}

/// GET /api/knowledge/live-feed
/// Server-Sent Events stream for real-time updates
pub async fn live_feed() -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let stream = stream::repeat_with(|| {
        // In production, this would listen to Redis pub/sub or database triggers
        Event::default()
            .event("graph_update")
            .data(format!(r#"{{"timestamp":"{}","nodes_added":1}}"#, chrono::Utc::now().to_rfc3339()))
    })
    .map(Ok)
    .throttle(Duration::from_secs(5));

    Sse::new(stream)
}

fn load_insights_graph() -> InsightsGraph {
    // Load from file generated by extract_insights.py
    let path = "/root/bizra-genesis/knowledge_graph_output/insights/bizra_insights_graph.json";
    let content = std::fs::read_to_string(path).expect("Failed to read insights graph");
    serde_json::from_str(&content).expect("Failed to parse insights graph")
}
```

---

## 📦 Deployment Checklist

### Immediate Tasks

- [ ] Create domain-specific middleware
- [ ] Build technical onboarding flow (`/onboarding/technical`)
- [ ] Build seeker onboarding flow (`/onboarding/seeker`)
- [ ] Implement WebSocket connection hook
- [ ] Create live data API endpoints
- [ ] Build LivingTree component
- [ ] Build DailyInsight component
- [ ] Add live stats to homepage
- [ ] Deploy to Vercel with domain routing
- [ ] Test on both bizra.ai and bizra.info

### Backend Tasks

- [ ] Add `/api/knowledge/stats` endpoint
- [ ] Add `/api/knowledge/daily-insight` endpoint
- [ ] Add `/api/knowledge/discoveries` endpoint
- [ ] Add `/api/knowledge/graph` endpoint
- [ ] Implement WebSocket server
- [ ] Connect to Neo4j knowledge graph
- [ ] Set up Redis caching
- [ ] Deploy backend API

---

## 🎨 Visual Design Differentiation

### bizra.ai (Technical/Dark Theme)
```css
--primary: #1a1a2e;
--secondary: #16213e;
--accent: #00d4ff (cyan);
--background: #0a0a0a;
--text: #e0e0e0;
```

**Vibe**: Hacker terminal, code-forward, technical documentation

### bizra.info (Warm/Accessible Theme)
```css
--primary: #2a2a3e;
--secondary: #1e2a3e;
--accent: #fcbf49 (gold);
--background: #0f0f1a;
--text: #f0f0f0;
```

**Vibe**: Library, wisdom, storytelling, visual learning

---

## 🚀 Go-Live Strategy

### Week 1: Foundation
1. Set up domain routing middleware
2. Create separate onboarding flows
3. Implement live data fetching hooks

### Week 2: Visualization
1. Build LivingTree component
2. Build DailyInsight component
3. Integrate into homepage

### Week 3: Backend
1. Add live data API endpoints
2. Connect to knowledge graph
3. Set up WebSocket server

### Week 4: Polish & Launch
1. Test on both domains
2. Performance optimization
3. Mobile responsiveness
4. Deploy to production

---

**Status**: Ready for implementation
**Next**: Choose which component to build first
