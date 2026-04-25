# Show "Next Day" target on AI Predictions tab

## Goal
On the **AI Predictions** tab, prominently show that the displayed predictions are for the **next draw day** after the latest result in `lotteryHistory`. Right now the tab just shows numbers with no indication of *which* day they're predicting — so after each daily update, it's unclear that they're targeting tomorrow's draw.

## What you'll see

A new highlighted "Next Draw Target" card at the top of the AI Predictions tab, e.g.:

> 🎯 **Predicting: Tue, 31.03.26 — Sthree Sakthi**
> Based on latest result: **Mon, 30.03.26 — Bhagyathara → 574710**

All existing prediction cards (Frequency-based, Complex Number, Hot Streak, etc.) stay unchanged below it.

## Implementation

### 1. New helper: `src/utils/nextDrawInfo.ts` (new file)

Pure function `getNextDrawInfo()` that:
- Reads `lotteryHistory[0]` (newest entry — file is sorted newest-first).
- Parses its `date` (`"30.03.26"` → JS Date), adds 1 day, formats back to `"DD.MM.YY"`.
- Computes the next day's weekday short name (`Mon`, `Tue`, etc.).
- Maps weekday → Kerala lottery name using the established weekly schedule:
  - Mon → Bhagyathara
  - Tue → Sthree Sakthi
  - Wed → Dhanalekshmi
  - Thu → Karunya Plus
  - Fri → Suvarna Keralam
  - Sat → Karunya
  - Sun → Samrudhi
- Returns `{ nextDate, nextDay, nextLottery, latestResult }`.

Isolates date/schedule logic; no changes to `predictionGenerator.ts`.

### 2. Update `src/components/PredictionSetsView.tsx`

- Import `getNextDrawInfo`, call it on mount alongside `generateAllPredictions()`.
- **Add a "Next Draw Target" card** between the current header card and the disclaimer, using the prestige aesthetic (gradient border, gold/purple accent per `mem://style/visual-design`):
  - Big line: `🎯 Predicting: {nextDay}, {nextDate} — {nextLottery}`
  - Small line: `Based on latest result: {latest.day}, {latest.date} — {latest.lottery} → {latest.result}` with the **last 4 digits visually larger** (per the "Last 4 prominently larger" core memory rule).
- Update the existing header subtitle to: *"Predictions auto-update based on the latest result. Currently targeting the next draw."*

### 3. Behaviour after each daily update

As soon as you add the new day's result to `lotteryHistory.ts`, the AI Predictions tab automatically:
- Bumps the "Next Draw Target" forward by one day.
- Picks the correct lottery name from the weekday schedule.
- Re-runs `generateAllPredictions()` against the updated history (predictions stay seeded/deterministic per `mem://architecture/prediction-consistency`).

No regenerate button needed — fully consistent with the deterministic-predictions rule.

## Files

- **New**: `src/utils/nextDrawInfo.ts`
- **Modified**: `src/components/PredictionSetsView.tsx` (~25 lines added)

## Out of scope (flagged, not included)

- Changing the underlying prediction algorithms — they already consume latest history automatically.
- Hit-tracker (predictions vs. actual outcome) — separate plan if you want it.
- Holiday-aware skipping (if a draw is cancelled, calendar still advances by 1 day). Say the word and I'll add a holiday list.