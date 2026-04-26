# Plan — L4 Hit Report by Prediction Method

## Goal
Produce a single downloadable text/CSV report showing **which of the 16 prediction methods scored L4 hits** during the backtest, ranked by performance.

## Scope (L4 only — no L3, no nets)
Only the 16 methods from `predictionGenerator.ts` evaluated against the **last 4 digits** of each historical draw. The Tight/Mid/Wide nets are excluded per request.

## What I will do (default mode)

1. **Run the existing backtest** (`runBacktest()` from `src/utils/backtestEngine.ts`) via a one-off Node script in `/tmp`. No code changes to the engine — I'll consume `methodScores` and `timeline` directly from the report it already returns.

2. **Generate two artifacts in `/mnt/documents/`:**

   **a. `l4-hits-by-method.csv`** — one row per (method × draw it hit), sortable in Excel:
   ```
   method, l4_hit_rate, lift_vs_random, total_l4_hits, hit_date, lottery, actual_result, actual_l4, predicted_number
   ```

   **b. `l4-hits-by-method-summary.txt`** — human-readable ranked summary:
   ```
   ===========================================
   L4 HIT REPORT — 16 PREDICTION METHODS
   Backtest window: <first date> → <last date>
   Draws evaluated: N
   Random baseline: 0.20%
   ===========================================

   #1  L4 Positional Top-K
       L4 Hits: 42 / 2,226 draws (1.89%)
       Lift vs random: 1.80×
       Recent form (last 365 draws): 8 hits (2.19%)
       Confidence: high
       Sample winning draws:
         - 12.04.26  Lottery 7  actual 234567 → predicted 891234 (L4 match: 4567)
         - ...

   #2  L4 Recency Bigrams
       ...
   ```

3. **Surface both files** as `<lov-artifact>` tags so you can download them directly.

## Why this approach
- **No engine modification needed** — the backtest already tracks every L4 hit per method in `methodScores[].hits` (filtered to `matchType === "L4"`).
- **Full audit trail** comes from the existing `hits` array; the engine currently caps it for UI display, so the script will run with the cap removed for the export only.
- **Single source of truth** — same numbers you see in the Backtest tab, just exported per-method.

## Files touched
- **None permanently.** One throwaway script in `/tmp/generate-l4-report.ts` that imports the existing engine. The engine's display cap on `hits` will be temporarily lifted only for this export run (no committed code change).

## Out of scope
- L3 hits, ensemble hits, net hits — request was L4-only.
- Adding a UI panel — file-only delivery.
