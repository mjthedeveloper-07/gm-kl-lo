# Plan — L4 Daily Hit Playbook (20-Method Backtest)

## Objective
Find the strongest L4 (last 4 digits) prediction system for **daily play with exactly 5 numbers per draw**. Keep all 16 currently-deployed methods as the baseline, add 4 new L4-optimized complex-number variants derived from the formula sheet, and rank everything in one unified backtest.

---

## The 16 existing methods (kept as-is, no changes)

These remain the production prediction systems. They will be re-evaluated under the new L4 / 5-picks scoring rules so we can compare apples to apples with the new methods.

1. Frequency-Based
2. Probability-Weighted
3. Trend-Based
4. Hot-Cold Balanced
5. Pattern Matching
6. Complex Number Analysis
7. Phase & Magnitude Based
8. Exponential Form
9. Complex Roots
10. Exponentiation
11. Real/Imaginary Decomposition
12. L4 Positional Top-K
13. L4 Markov Tail
14. L4 Recency Bigrams
15. L3 Anchor + L4 Prefix
16. L4 Stable Positional

## 4 new L4-optimized methods (derived from the uploaded formula sheet)

Each one targets the L4 tail directly instead of splitting F3/L3. They reuse the existing complex-number utilities in `predictionGenerator.ts`.

| # | New Method | Source identity from sheet | What it does for L4 |
|---|---|---|---|
| 17 | **L4 Complex Polar Drift** | `z = r·(cosθ + i·sinθ)` | Tracks `(r, θ)` of the last 50 L4 tails, projects the next `(r', θ')` from drift, converts back to a 4-digit tail |
| 18 | **L4 Conjugate Mirror** | `z̄ = a − bi`, `−z` | Mirrors the hottest recent L4 tails across real/imag axes to surface symmetric candidates |
| 19 | **L4 nth-Roots Generator** | `ⁿ√z = r^(1/n)·e^(i(θ+2πk)/n)` | Takes the last winning L4 as `z`, generates its 4 fourth-roots, maps each root back to a 4-digit tail |
| 20 | **L4 z₁·z₂ Angular Drift** | `z₁·z₂ = r₁r₂·e^i(θ₁+θ₂)` | Multiplies the last two L4 tails as complex numbers, uses the resulting angle to predict the next tail family |

---

## Backtest protocol

- **Window**: full history (2,227 draws after the April 26 update)
- **Picks per draw**: exactly **5** (top-5 from each method's ranked output)
- **Tier scored**: L4 only (this run is L4-focused)
- **Baseline**: `1 − (1 − 1/10000)^5 ≈ 0.0500%` random hit rate
- **Metrics per method**:
  - Total L4 hits / draws
  - Hit rate %
  - Lift vs random
  - Recent form (last 365 draws)
  - Streak data (longest hit gap, hottest 90-day window)
  - Sample of last 5 L4 wins with predicted vs actual

## Ranking & playbook construction

1. Rank all 20 methods by **(L4 lift × 0.6) + (recent-365 lift × 0.4)** so recent form weighs in.
2. Take the **top 3 methods** and build the daily 5-ticket ensemble:
   - 2 picks from rank-1 method
   - 2 picks from rank-2 method
   - 1 pick from rank-3 method
3. De-duplicate across the 5 tickets so the user always plays 5 distinct L4 tails.

## Deliverables (in `/mnt/documents/`)

1. **`l4-method-leaderboard.csv`** — all 20 methods ranked, with hits, rate, lift, recent form
2. **`l4-daily-playbook.txt`** — the 5-ticket daily system, including:
   - Which method generates which ticket
   - Today's 5 L4 tails for the next draw (using current history through April 26)
   - Rolling refresh rule (regenerated each day from latest result)
3. **`l4-formula-mapping.txt`** — short technical note mapping each of the 4 new methods back to the exact identity from the uploaded screenshot

## Files touched

- `src/utils/predictionGenerator.ts` — add 4 new exported generator functions (methods 17–20). No edits to existing 16 methods.
- `src/utils/backtestEngine.ts` — register the 4 new methods in the methods registry so they appear in the backtest tab too.
- One throwaway script in `/tmp/` to produce the CSV/TXT artifacts. No UI changes in this pass.

## Out of scope for this run
- L2 and L3 scoring (already covered in prior reports)
- UI surfacing of the new playbook (can be added in a follow-up once the leaderboard confirms the winners)
