

## Problem

The AI prediction methods are **deterministic** — they always produce the same output from the same dataset. When you add new results, the underlying data changes, but many methods (Frequency-Based, Trend-Based, Pattern Matching, Hot-Cold, and all 6 Complex Number methods) use fixed indices (e.g., always pick top 3, always use `variant % 3`), so results barely shift even with new data.

Only "Probability-Weighted" uses `Math.random()` and actually varies.

## Plan: Make All Predictions Adaptive and Variable

### File: `src/utils/predictionGenerator.ts`

**1. Add weighted random sampling utility**
- Create a `weightedRandomPick(items, weights, count)` helper that samples without replacement, weighted by frequency — so higher-frequency digits are more likely but not guaranteed.

**2. Update each deterministic method to use randomized selection from top candidates:**

| Method | Current Behavior | New Behavior |
|--------|-----------------|-------------|
| Frequency-Based | Always picks top 3 per position | Weighted random from top 5 per position |
| Trend-Based | Always uses same start digit + fixed pair indices | Randomly picks from top 3 start digits + weighted pair selection |
| Hot-Cold Balanced | Fixed alternating pattern | Random mix ratio (60-80% hot, 20-40% cold) per generation |
| Pattern Matching | Fixed pair indices | Weighted random from top 15 pairs |
| Complex Number (6 methods) | Fixed mathematical operations | Add small random perturbation: `angle + (Math.random()-0.5)*0.3`, `magnitude * (0.9 + Math.random()*0.2)` |

**3. Add recency weighting**
- Weight recent results (last 6 months) 2x more than older data in frequency calculations, so new data has stronger influence on predictions.

### File: `src/components/PredictionSetsView.tsx`

**4. Show generation timestamp**
- Display "Generated at HH:MM:SS" below the header so users see fresh results each time.

### Result
- Every "Regenerate" click produces different numbers
- Adding new lottery results immediately shifts prediction distributions
- Recent data has more influence than old data

