

# Accuracy Validation & Pattern Discovery for Ultra Frequency Predictions

## What We're Building

A backtesting system that runs each of the 15 Ultra Frequency prediction methods against all 2,300+ historical results to measure real accuracy, plus a pattern discovery engine that identifies recurring number patterns.

## How It Works

### 1. Backtesting Engine (`src/utils/ultraFreqBacktest.ts`)

For each historical result (starting from result #200 onward to have enough training data):
- Use all results **before** that draw as the "training set"
- Generate predictions using all 15 methods
- Compare each prediction's L4 against the actual L4 result
- Score matches: exact L4 (4/4), 3-digit match, 2-digit match, 1-digit match, positional accuracy (each position checked individually)

Metrics tracked per method:
- **Exact L4 match rate** (all 4 digits correct)
- **3+ digit match rate**
- **2+ digit match rate**
- **Per-position hit rate** (how often each L4 position is correct)
- **Average positional accuracy** (out of 4)

### 2. Pattern Discovery Engine

Analyze the full dataset for:
- **Repeating L4 sequences** — L4 patterns that appear 3+ times
- **Positional streaks** — when a digit holds the same position for consecutive draws
- **Cycle detection** — intervals between repeated L4/L3/L2 patterns
- **Day-of-week patterns** — which digits are more frequent on specific days
- **Follow-on patterns** — after L4 ending "XX", what comes next most often

### 3. New UI Section in `UltraFrequencyPredictions.tsx`

Add two new card sections:
- **Accuracy Dashboard**: Table showing each method's backtest accuracy with color-coded scores, best/worst method highlighting, and overall system accuracy summary
- **Pattern Insights**: Display discovered patterns — top repeating cycles, day-of-week tendencies, follow-on predictions, and streak analysis

### Technical Approach

- Create `src/utils/ultraFreqBacktest.ts` with the backtesting and pattern logic
- The backtest will use a sliding window approach: for draw N, train on draws N+1 to end (since data is newest-first)
- Results cached via `useMemo` to avoid recomputation
- Add accuracy cards and pattern cards above the existing predictions in the component

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/utils/ultraFreqBacktest.ts` | Create — backtesting engine + pattern discovery |
| `src/components/UltraFrequencyPredictions.tsx` | Modify — add accuracy dashboard and pattern insights UI |

