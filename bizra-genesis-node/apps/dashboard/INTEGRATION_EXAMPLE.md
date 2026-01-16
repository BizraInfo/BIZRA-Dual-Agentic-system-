# Integration Example: Adding Knowledge Graph Components

## Option 1: Add to Main Homepage (page.tsx)

**File**: `src/app/page.tsx`

```typescript
import { BizraHero } from "@/components/hero/bizra-hero"
import { GenesisSection } from "@/components/sections/genesis-section"
import { ProtocolSection } from "@/components/sections/protocol-section"
import { FooterSection } from "@/components/sections/footer-section"

// NEW IMPORTS
import { LivingTree } from "@/components/LivingTree"
import { DailyInsight } from "@/components/DailyInsight"

export default function Page() {
  return (
    <main>
      <BizraHero />
      <GenesisSection />

      {/* NEW: Living Tree Section */}
      <section className="container mx-auto px-4 py-16 bg-bizra-bg-dark">
        <h2 className="text-3xl font-bold text-center mb-8 text-bizra-accent">
          🌳 The Growing Tree of Knowledge
        </h2>
        <p className="text-center text-bizra-text-secondary mb-8 max-w-2xl mx-auto">
          Watch BIZRA's knowledge graph grow in real-time, rooted in Quranic wisdom
        </p>
        <div className="h-[600px] mb-8">
          <LivingTree />
        </div>
      </section>

      {/* NEW: Daily Insight Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-bizra-gold">
          💡 Today's Insight
        </h2>
        <p className="text-center text-bizra-text-secondary mb-8 max-w-2xl mx-auto">
          A daily wisdom from 3 years of BIZRA evolution
        </p>
        <div className="max-w-4xl mx-auto">
          <DailyInsight />
        </div>
      </section>

      <ProtocolSection />
      <FooterSection />
    </main>
  )
}
```

---

## Option 2: Create Dedicated Knowledge Page

**File**: `src/app/knowledge-graph/page.tsx` (create new file)

```typescript
import { LivingTree } from "@/components/LivingTree"
import { DailyInsight } from "@/components/DailyInsight"
import { getDomainType } from "@/lib/live-data"

export default function KnowledgeGraphPage() {
  const domain = getDomainType()

  return (
    <main className="min-h-screen bg-bizra-bg-dark">
      {/* Header */}
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-4">
          {domain === 'ai'
            ? '🌳 BIZRA Knowledge Graph'
            : '🌳 بيت الحكمة - House of Wisdom'}
        </h1>
        <p className="text-xl text-center text-bizra-text-secondary max-w-3xl mx-auto">
          {domain === 'ai'
            ? 'Explore the interconnected web of insights, rooted in eternal wisdom'
            : 'استكشف شبكة الحكمة المترابطة، المتجذرة في الحكمة الأبدية'}
        </p>
      </section>

      {/* Stats Overview */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-bizra-secondary rounded-lg p-6 border border-bizra-accent/20">
            <h3 className="text-bizra-text-secondary text-sm mb-2">Total Insights</h3>
            <p className="text-3xl font-bold text-bizra-accent">221</p>
          </div>
          <div className="bg-bizra-secondary rounded-lg p-6 border border-bizra-gold/20">
            <h3 className="text-bizra-text-secondary text-sm mb-2">Quranic Verses</h3>
            <p className="text-3xl font-bold text-bizra-gold">6,236</p>
          </div>
          <div className="bg-bizra-secondary rounded-lg p-6 border border-bizra-vision/20">
            <h3 className="text-bizra-text-secondary text-sm mb-2">Hadith</h3>
            <p className="text-3xl font-bold text-bizra-vision">34,178</p>
          </div>
          <div className="bg-bizra-secondary rounded-lg p-6 border border-bizra-philosophy/20">
            <h3 className="text-bizra-text-secondary text-sm mb-2">Relationships</h3>
            <p className="text-3xl font-bold text-bizra-philosophy">201</p>
          </div>
        </div>
      </section>

      {/* Living Tree */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">
          The Living Tree
        </h2>
        <p className="text-center text-bizra-text-secondary mb-8 max-w-2xl mx-auto">
          Visualization of knowledge growth, updated in real-time
        </p>
        <div className="h-[700px]">
          <LivingTree />
        </div>
      </section>

      {/* Daily Insight */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-b from-transparent to-bizra-secondary/50">
        <h2 className="text-3xl font-bold text-center mb-4">
          Daily Insight
        </h2>
        <p className="text-center text-bizra-text-secondary mb-8 max-w-2xl mx-auto">
          A new insight every day, selected from our knowledge base
        </p>
        <div className="max-w-4xl mx-auto">
          <DailyInsight />
        </div>
      </section>
    </main>
  )
}
```

Then add link to navigation:
```typescript
// In your navigation component
<Link href="/knowledge-graph">Knowledge Graph</Link>
```

---

## Option 3: Add to Existing Knowledge Page

**File**: `src/app/knowledge/page.tsx`

Add the components to the existing knowledge page by importing and rendering them in appropriate sections.

---

## Testing the Integration

### 1. Local Development

```bash
cd bizra-genesis-node/apps/dashboard

# Install dependencies (if not already)
npm install

# Start dev server
npm run dev

# Visit http://localhost:3000
```

### 2. Expected Behavior

**With Backend Running**:
- Living Tree shows real data from knowledge graph
- Daily Insight updates based on today's date
- Stats refresh every 5 seconds

**Without Backend (Fallback Mode)**:
- Components still render with fallback data
- No errors in console
- UI remains functional

### 3. Check Browser Console

Should see:
```
SWR: fetching http://localhost:33333/api/knowledge/stats
SWR: fetching http://localhost:33333/api/knowledge/daily-insight
```

If backend is offline:
```
SWR: Error fetching - using fallback data
```

---

## Domain-Specific Customization

The middleware automatically detects the domain. To customize based on domain:

```typescript
import { getDomainType } from "@/lib/live-data"

export default function Page() {
  const domain = getDomainType()

  return (
    <main>
      {/* Show different header based on domain */}
      {domain === 'ai' ? (
        <h1 className="text-bizra-accent">Build with BIZRA</h1>
      ) : (
        <h1 className="text-bizra-gold">بيت الحكمة</h1>
      )}

      {/* Components work the same on both domains */}
      <LivingTree />
      <DailyInsight />
    </main>
  )
}
```

---

## Color Classes Available

Use these Tailwind classes for consistent theming:

**bizra.ai (Technical)**:
- `text-bizra-accent` - Cyan (#00d4ff)
- `bg-bizra-bg-dark` - Dark background
- `border-bizra-accent`

**bizra.info (Wisdom)**:
- `text-bizra-gold` - Gold (#d4af37)
- `bg-bizra-secondary` - Secondary background
- `border-bizra-gold`

**Category Colors**:
- `text-bizra-vision` - Vision insights (red)
- `text-bizra-philosophy` - Philosophy (cyan)
- `text-bizra-technical` - Technical (green)
- `text-bizra-learning` - Learning (coral)

---

## Next Steps

1. Choose one of the integration options above
2. Modify the appropriate page file
3. Test locally with `npm run dev`
4. Push to git to trigger Vercel deployment

---

**الحمد لله**

The components are ready to be integrated wherever you choose!
