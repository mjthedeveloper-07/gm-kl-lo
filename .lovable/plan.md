# Remove the Regenerate Button

## Context
The "AI Predictions" tab renders `PredictionSetsView.tsx`, which currently has a **Regenerate** button that calls `generateAllPredictions()` on each click, producing different numbers every time. This violates the core project rule (per memory): **predictions must be deterministic, seeded by Date + Latest Result, with no manual regenerate**.

## Changes

### `src/components/PredictionSetsView.tsx`
1. **Remove the Regenerate button** from the header `CardHeader`.
2. **Remove the `RefreshCw` import** (no longer used).
3. **Remove the success toast** (`"Generated new predictions..."`) — predictions are now generated silently once on mount.
4. **Rename `regeneratePredictions` → `loadPredictions`** for clarity, and call it only in the initial `useEffect`.
5. Keep all other functionality intact (copy-to-clipboard, confidence badges, prediction cards).

### Note on determinism
The underlying `generateAllPredictions()` in `src/utils/predictionGenerator.ts` should already produce stable output per day (per the seeded-PRNG memory rule). Removing the button is the surface-level fix the user requested. If predictions still drift on reload, that's a separate follow-up in the generator itself — I'll flag it but not change generator logic in this pass unless you ask.

## Files Modified
- `src/components/PredictionSetsView.tsx` — remove button, icon import, and toast
