# Plan — Full L4 / L3 / L2 Hit Analysis Report by Method

## Goal
Produce a comprehensive downloadable report showing, for each of the **16 prediction methods** in the backtest engine, how many times each method hit the actual draw on **L4 (last 4)**, **L3 (last 3)**, and **L2 (last 2)** digits across all 2,226 historical draws.

## Current state
- The backtest engine (`src/utils/backtestEngine.ts`) already tracks **L4** and **L3** hits per method.
- It does **NOT** currently track **L2** — I'll compute L2 in a standalone script using the same prediction outputs (no engine modification needed).

## What I will deliver

Three artifacts in `/mnt/documents/`:

### 1. `method-full-hits-summary.txt` — human-readable ranked report
For each of the 16 methods:
```
#1  L4 Positional Top-K
    Predictions per draw: 5
    ────────────────────────────────────
    L4 hits:  8  / 2,226 draws  (0.36%)   lift 1.80×
    L3 hits: 31  / 2,226 draws  (1.39%)   lift 1.39×
    L2 hits: 198 / 2,226 draws  (8.89%)   lift 1.78×
    ────────────────────────────────────
    Recent form (last 365 draws):
      L4: 2 hits | L3: 7 hits | L2: 38 hits
    Last 5 winning draws (any tier):
      - 12.04.26  Lottery 7  actual 234567 → predicted 891234 [L4]
      - ...
```
Sorted by a weighted combined score (L4 × 100 + L3 × 10 + L2 × 1) so the strongest all-around method ranks first.

### 2. `method-full-hits-matrix.csv` — Excel-ready overview
One row per method, easy to sort/filter:
```
method, predictions_per_draw,
  l4_hits, l4_rate_pct, l4_lift,
  l3_hits, l3_rate_pct, l3_lift,
  l2_hits, l2_rate_pct, l2_lift,
  recent_l4, recent_l3, recent_l2
```

### 3. `method-full-hits-detail.csv` — full audit trail
One row per (method × draw it hit at any tier):
```
method, hit_date, lottery, actual_result, actual_l4, actual_l3, actual_l2,
predicted_number, match_tier (L4/L3/L2)
```

## How I'll compute L2
For each draw and each method:
- Take all predictions the method generated.
- Check if **any** of them ends with the actual draw's last 2 digits.
- Baseline for L2 with `k` predictions: `1 − (1 − 1/100)^k` → used for the lift calculation.

## Files touched
- **None permanently.** One throwaway script in `/tmp/run-full-analysis.ts` that imports `lotteryHistory` and `generateAllPredictionsFor` directly.
- No changes to `backtestEngine.ts`, no UI changes.

## Out of scope
- The L4 Coverage Nets (Tight / Mid / Wide) — report covers only the 16 methods, matching the previous L4-only report.
- The per-draw ensemble (`combinedTopL4`).
- Any UI panel — file-only delivery, like last time.