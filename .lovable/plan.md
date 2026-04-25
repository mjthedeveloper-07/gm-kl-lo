# Full Dataset Rebuild + Full-History L4 Backtest

## Goal
Replace the current `lotteryHistory` (~545 rows, mostly 2023–2026) with the **full 2019–2026 daily dataset** from your 8 uploaded CSVs (~2,800 valid rows), then re-run the Backtest tab over **all available draws** with primary focus on **Last 4 (L4)** matches.

---

## 1. Merge uploaded CSVs into `src/data/lotteryHistory.ts`

**Inputs** (8 files, all `Year/Month/Date,Result` format):
- `kl_2019-2.txt`, `kl_2020-2.txt`, `KL_2021-2.txt`, `kl_2022-2.txt`, `kl_2023-2.txt`, `kl_2024-2.txt`, `kl_2025-12.txt`, `kl_2026-24.txt`

**Build script** (`scripts/build_lottery_history.ts`, run once via `bun`):
1. Copy each upload to `/tmp/`, parse all rows.
2. **Drop rows with blank `Result`** (e.g. 2020 COVID gaps, 2021 Sundays, 2022/2023 missing dates).
3. **Normalize**:
   - `date` → `dd.mm.yy`
   - `day` → derived from JS `Date` (Mon/Tue/…)
   - `lottery` → looked up from Kerala weekly schedule (Mon=Bhagyathara, Tue=Sthree Sakthi, Wed=Dhanalekshmi, Thu=Karunya Plus, Fri=Suvarna Keralam, Sat=Karunya, Sun=Samrudhi). For pre‑2024 entries the historical names were different (Win-Win Mon, Akshaya Wed, Nirmal Fri, Pournami Sun, Sthree Sakthi Tue, Karunya Plus Thu, Karunya Sat) — apply the **legacy schedule for 2019–Mar 2024** and the **new schedule from Apr 2024 onward**.
   - `draw` → first 3 digits of `result` (existing convention).
   - `lotteryType` → `"regular"`.
4. **Dedupe** by `date` (keep upload value; if 2026 calendar fixes already in current file conflict, uploads win — they are the source of truth).
5. **Preserve** the existing 2026 hand-corrections we already made (March 31 = `307508`, April 1 = `Wed/Dhanalekshmi/246443`) — uploads already match these.
6. Sort newest-first (matches current ordering).
7. Emit a fresh `lotteryHistory: LotteryResult[] = [ … ]` block, leaving all helper functions and the `LotteryResult` interface untouched.

**Output**: `src/data/lotteryHistory.ts` grows from ~545 rows to **~2,800 rows** spanning 2019‑01‑01 → 2026‑04‑24.

---

## 2. Extend the backtest engine to use the full window

**`src/utils/backtestEngine.ts`** — minimal changes:
- Change default `runBacktest(windowSize = 365)` → `runBacktest(windowSize = Infinity)` so it scores **every eligible draw** (warm‑up still requires ≥50 priors, so first ~50 rows are skipped).
- Keep daily roll‑forward, keep L4 + L3 scoring, keep Lift vs random.
- Add `recentHits` cap from 10 → 25 per method (more data, more wins to surface).
- `topL4Hits` cap from 8 → 20.
- `timeline.slice(-60)` → keep last **120** points so the chart still tells a story without exploding.

**`src/components/BacktestReport.tsx`**:
- Header chip: change "Window: last 365 draws" → "Window: full history (YYYY → YYYY)".
- Add a "Total L4 wins (all methods, all time)" headline stat next to current scoreboard.
- L4 timeline chart: switch x‑axis label density (every 10th tick) since we'll have ~120 bars.
- Method leaderboard: add a sortable column **"L4 wins"** (raw count) — currently only hit-rate and lift are shown.
- Loading skeleton stays; computation will go from ~2–5 s to **~15–30 s** for ~2,750 evaluated draws × 11 methods. Add a progress label ("Evaluating draw 1,240 / 2,750…") driven by `requestAnimationFrame` chunks of 50 draws so the UI doesn't freeze.

**No change** to `src/utils/predictionGenerator.ts` — `generateAllPredictionsFor(history)` already handles arbitrary slices.

---

## 3. UI / Index

No structural changes to `src/pages/Index.tsx`. The Backtest tab will automatically reflect the bigger dataset.

---

## 4. Files touched

| File | Change |
|---|---|
| `scripts/build_lottery_history.ts` | **new** — one‑off generator (kept in repo for re‑runs) |
| `src/data/lotteryHistory.ts` | **regenerated** body, helpers preserved |
| `src/utils/backtestEngine.ts` | full‑history default, larger caps, chunked eval |
| `src/components/BacktestReport.tsx` | full‑history label, "L4 wins" column, progress UI |

## 5. What you'll see after approval
- **AI Predictions tab**: same — next draw is still seeded by the latest result (24.04.26 = `211038`).
- **Backtest tab**: leaderboard, lift, and "Recent L4 Wins" computed against **~2,750 historical draws** instead of 365. The March 31 2026 L4 hit remains; many more historical L4 wins will surface so you can see which methods truly outperform random over 7 years.

## 6. Disclaimer (kept)
Lottery draws are independent random events. Even a method showing positive lift over 7 years cannot guarantee future wins — historical performance is informational only.
