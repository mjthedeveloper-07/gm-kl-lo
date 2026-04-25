# Backtest Report Plan

## Goal
Build a **Backtest** tab on the home page that walks through the most recent **365 draws**, re-runs each of the **11 AI prediction methods** at every draw using only data available up to that point, and reports how often each method's predictions matched the actual winning result on **Last 4 (L4)** and **Last 3 (L3)** digits. This will quantify the win you saw on March 31 (L4 hit) and surface which methods are genuinely earning their "high confidence" badges.

## Why this design
- **Daily roll-forward** (per your choice) means each prediction is generated using only history up to draw N-1 — no look-ahead bias. This is the gold standard for honest backtesting.
- **L4 + L3 scoring** matches Kerala lottery prize tiers and your stated success criterion ("we got an L4 hit on March 31").
- A **tab** (not a separate route) keeps everything in one place, consistent with the current Index layout.

---

## 1. Refactor prediction generators to be pure & history-aware

**File**: `src/utils/predictionGenerator.ts`

Currently every `generate*` method reads `lotteryHistory` directly from the import — they can't be backtested as-is. We will:

- Add an **optional `history` parameter** to each of the 11 methods. When omitted, it defaults to the full `lotteryHistory` (preserving current AI Predictions tab behavior with **zero behavior change** for live predictions).
- Update `analyzeHistoricalData` the same way — accept an optional `history` slice.
- Add a new exported function:
  ```ts
  generateAllPredictionsFor(history: LotteryResult[]): PredictionSet[]
  ```
  Used by the backtest harness; the existing `generateAllPredictions()` simply delegates to it with the full history.

This is a non-breaking refactor — the AI Predictions tab will continue to render identically.

---

## 2. New backtest engine

**New file**: `src/utils/backtestEngine.ts`

Pure, deterministic, runs entirely in the browser. Exports:

```ts
interface MethodScore {
  method: string;
  confidence: "high" | "medium" | "low";
  totalDraws: number;          // draws evaluated
  predictionsPerDraw: number;  // ~5–10 numbers per method per draw
  l4Hits: number;              // any prediction's last 4 == actual last 4
  l3Hits: number;
  l4HitRate: number;
  l3HitRate: number;
  l4HitsBaseline: number;      // expected by chance: 1 - (1 - k/10000)^k
  l3HitsBaseline: number;      // expected by chance: 1 - (1 - k/1000)^k
  liftL4: number;              // actual / baseline (1.0 = no edge)
  liftL3: number;
  recentHits: Array<{
    date: string;
    lottery: string;
    actual: string;
    matched: string;
    matchType: "L4" | "L3";
  }>;
}

interface BacktestReport {
  windowSize: number;          // 365
  startDate: string;
  endDate: string;
  methodScores: MethodScore[];
  overall: {
    totalDraws: number;
    anyMethodL4Hits: number;
    anyMethodL3Hits: number;
    bestMethodForL4: string;
    bestMethodForL3: string;
  };
  timeline: Array<{
    date: string;
    lottery: string;
    methodsWithL4Hit: string[];
    methodsWithL3Hit: string[];
  }>;
}

runBacktest(windowSize?: number): BacktestReport
```

**Algorithm** (daily roll-forward, per your choice):
1. Sort `lotteryHistory` chronologically (oldest first).
2. Take the last 365 draws as the **evaluation window**. Anything older is **warm-up history** always available to methods.
3. For each draw `i` in the window:
   - Slice `history = lotteryHistory[0 .. i-1]` (everything before this draw).
   - Skip if `history.length < 50` (some complex methods need ≥50 priors).
   - Call `generateAllPredictionsFor(history)` → 11 methods × ~5 predictions each.
   - For each method, check whether **any** of its predictions matches the actual draw on L4 (and on L3). Record the match.
4. Aggregate per-method totals, compute hit-rate, baseline expectation, and lift.

**Performance**: 365 draws × 11 methods × ~5 predictions ≈ ~20k generations. Most methods are O(history.length). Expected wall-clock: **2–5 seconds**. Runs inside `useEffect` with a loading state, memoized so tab switches don't recompute.

---

## 3. New Backtest tab UI

**New component**: `src/components/BacktestReport.tsx`

Sections, top-to-bottom:

1. **Header card** — methodology in 2 sentences ("Re-runs each AI method against the last 365 draws using only the data that was available before each draw. No look-ahead.").
2. **Headline scoreboard** — 4 large stat cards:
   - Draws evaluated
   - Best method for L4 (name + hit-rate %)
   - Best method for L3 (name + hit-rate %)
   - Combined "any-method" L4 hit-rate
3. **Recent wins highlight card** — pinned at the top: pulls out the **March 31, 2026 L4 hit** and any other recent L4 hits, styled with the gold/electric-blue prestige aesthetic, last-4 digits emphasized.
4. **Method leaderboard** — sortable table, one row per method:
   - Method name + current confidence badge
   - L4 hits / 365 (with %)
   - L3 hits / 365 (with %)
   - **Lift vs. random** (color-coded: >1.5× green, 1.0–1.5× neutral, <1.0× red) — the honest "is this method actually working?" signal
   - Expand row → last 10 actual hits (date, lottery, predicted vs. actual, matched digits in gold)
5. **Hit-timeline mini chart** — horizontal bar showing, per draw across the last ~60 days, how many methods scored an L4 hit. Uses existing `recharts`.
6. **Disclaimer card** — reuses existing yellow disclaimer styling: backtest results don't guarantee future performance; lottery is random.

Visual style follows the existing prestige aesthetic (purples/golds/electric blues, large mono digits, last-4 emphasized).

---

## 4. Wire the new tab into Index

**File**: `src/pages/Index.tsx` (around lines 416–433)

- Change `<TabsList className="grid w-full grid-cols-6">` → `grid-cols-7`.
- Add `<TabsTrigger value="backtest">` with a `LineChart` icon, placed right after **Validation** so the flow reads: AI Predictions → Formulas → Validation → **Backtest** → Analysis → Patterns → History.
- Add `<TabsContent value="backtest"><BacktestReport /></TabsContent>`.
- Import `BacktestReport`.

---

## 5. Loading & memoization

- The backtest takes a few seconds, so `BacktestReport` shows a skeleton with progress copy ("Replaying 365 draws across 11 methods…") while computing.
- `useMemo` so the report computes once per page load, not on every tab switch.
- Computation runs in `useEffect` with `setTimeout(0)` so the loading UI paints first.

---

## Files touched

**New**
- `src/utils/backtestEngine.ts` — pure backtest harness
- `src/components/BacktestReport.tsx` — full report UI

**Modified**
- `src/utils/predictionGenerator.ts` — add optional `history` param to all generators (non-breaking) + new `generateAllPredictionsFor(history)` export
- `src/pages/Index.tsx` — add the 7th tab

**Untouched** — AI Predictions tab behavior, all formulas, Validation, Analysis, Patterns, History, Nova chatbot, lottery data, RLS policies. 100% client-side; no backend or database changes.

---

## What you'll see when shipped

A new **Backtest** tab with a leaderboard like:

| Method | Confidence | L4 Hits | L3 Hits | Lift (L4) |
|---|---|---|---|---|
| High-Frequency Based | high | 4 / 365 (1.10%) | 31 / 365 (8.5%) | **2.2×** |
| Complex Number Analysis | high | 1 / 365 (0.27%) | 18 / 365 (4.9%) | 0.5× |
| … | … | … | … | … |

…with the March 31 win pinned in the "Recent wins" card, and a clear answer to "which methods actually earn their confidence rating against real history?"