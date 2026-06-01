# Graph Report - Find-stores by ShR  (2026-06-01)

## Corpus Check
- 5 files · ~8,478 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 20 nodes · 19 edges · 7 communities (4 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f81d0f80`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]

## God Nodes (most connected - your core abstractions)
1. `changeLanguage()` - 4 edges
2. `performSearch()` - 3 edges
3. `hooks` - 2 edges
4. `normalizeForSearch()` - 2 edges
5. `updateQuickButtons()` - 2 edges
6. `applyTranslations()` - 2 edges
7. `PreToolUse` - 1 edges
8. `translations` - 1 edges
9. `uz_cyr_to_lat` - 1 edges
10. `data` - 1 edges

## Surprising Connections (you probably didn't know these)
- `changeLanguage()` --calls--> `performSearch()`  [EXTRACTED]
  script.js → script.js  _Bridges community 2 → community 4_

## Import Cycles
- None detected.

## Communities (7 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.25
Nodes (3): data, translations, uz_cyr_to_lat

### Community 2 - "Community 2"
Cohesion: 0.67
Nodes (3): applyTranslations(), changeLanguage(), updateQuickButtons()

## Knowledge Gaps
- **5 isolated node(s):** `PreToolUse`, `translations`, `uz_cyr_to_lat`, `data`, `graphify`
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `changeLanguage()` connect `Community 2` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `performSearch()` connect `Community 4` to `Community 0`, `Community 2`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **What connects `PreToolUse`, `translations`, `uz_cyr_to_lat` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._