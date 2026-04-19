# Plan — Session 50 Task 2: Performance-Dashboards für `paperclip-content-platform`

## Context

Alexandra soll in ihrer Web-UI `content.alexandra-anthopoulou.cloud` ihre Instagram-Performance selbst bewerten. Die Datenerfassung ist fertig (Session 47 + heute Task 1: Daily-Poll-Workflow `wnl3Ycm72jbuT2Hn` schreibt täglich Time-Series nach `ig_post_performance`). Die `/insights/*`-Routen im Frontend sind EmptyState-Stubs — sie warten auf Inhalt.

**Ziel der Spec:** Session 51 kann direkt bauen, keine Architektur-Entscheidungen mehr offen.

**Deliverable:** Diese Plan-Datei wird nach ExitPlanMode nach `paperclip-content-platform/docs/dashboards-spec.md` kopiert.

---

## Datenquellen (alle bestätigt)

### `ig_post_performance` — Time-Series der eigenen Reels (täglicher Poll, 60 neueste)
**IDs:** `ig_media_id`, `ig_shortcode`, `ig_permalink`, `ig_posted_at`, `thumbnail_url`, `ig_caption_preview` (500 Zeichen), `ig_media_type`, `ig_media_product_type`, `is_trial_reel`
**Raw:** `views`, `reach`, `likes`, `comments`, `shares`, `saved`, `total_interactions`, `ig_reels_avg_watch_time_ms`, `ig_reels_video_view_total_time_ms`, `reels_skip_rate`, `reposts`, `crossposted_views`, `facebook_views`
**Rates:** `likes_per_reach`, `shares_per_reach`, `save_rate`, `engagement_rate`
**Scoring:** `viral_score`, `viral_tier` (S/A/B/C/D)
**Polling-Meta:** `captured_at`, `poll_count`, `is_final`

### `hook_ideas` — Alexandras eigene Hooks (manuelle Kuration)
`id`, `adapted_hook_text`, `category`, `hook_pattern`, `target_audience`, `rationale`, `status` (new/liked/dismissed/used), `martin_feedback`, `scraped_hook_source_id`, `eval_score`, `date_created`

### `scraped_hooks` — Competitor-Hooks (Apify, 8 Accounts, 80 Reels)
`id`, `hook_text`, `post_url`, `account_username`, `viral_tier`, `roll_type`, `image_url`, `thumbnail_url`, `posted_at`, `views_count`

### `content_posts` — Pipeline (Kanban)
`id`, `hook_text`, `category`, `caption_type`, `eval_score`, `published_date`, `posting_slot`, `human_feedback`, `status` (draft/ready/on_hold/approved/published/archived), `date_updated`

### `account_insights_history` — **FEHLT** (Follower-Gap)
Aktuell kein Tracking. Meta Graph API `/me/insights?metric=follower_count,profile_views,reach&period=day` würde tägliche Snapshots liefern. Muss als eigener n8n-Workflow gebaut werden (Folge-Task, siehe Roadmap).

### Kategorien-Taxonomie
`hormone`, `schilddruese`, `stoffwechsel`, `regeneration`, `mindset`, `bewegung` (aus `src/lib/categories.ts`, je mit Tailwind-Farbe).

### Vorhandene Tech
- **Recharts 2.15.3** + `src/components/ui/chart.tsx` (shadcn-ChartContainer) — Charts ready
- **Filter:** `DataTableFilterDropdown`, Radix Select, Popover, Command, Calendar, ScrollArea vorhanden
- **Fehlend:** MultiSelect-Komponente + DateRange-Picker (aus shadcn übernehmbar)

---

## 4 Dashboards — Detail-Spec

### Dashboard 1 — **Top Reels** (`/insights/performance` — ersetzt Stub)

**Zweck:** Schneller Überblick. "Was lief die letzten X Tage?"

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│ Performance                          [7d|30d|90d|YTD]  │ ← Zeitraum-Toggle
├────────────────────────────────────────────────────────┤
│ [KPI] Engagement │ [KPI] Save-Rate │ [KPI] Avg Watch │ [KPI] Viral-Mix│ ← 4 Headline-KPIs
│ 4.2%  ▲ +0.8pp   │ 2.1%  ▼ -0.2pp   │ 8.4s  ▲ +1.1s  │ S:2 A:5 B:3 C:1│   inkl. Delta
├────────────────────────────────────────────────────────┤
│ Filter: [Alle|Feed|Reels|Trial] [Kategorie▾] [Roll▾]   │ ← Filter-Bar
├────────────────────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐             │
│ │ Thumb  │ │ Thumb  │ │ Thumb  │ │ Thumb  │ ...         │ ← Kachel-Grid
│ │ [S]3.2k│ │ [A]2.1k│ │ [A]1.8k│ │ [B]1.2k│              │   (Viral-Tier-Badge)
│ │Hook-T..│ │Hook-T..│ │Hook-T..│ │Hook-T..│              │   Hook-Preview
│ │hormone │ │ darm   │ │schilddr│ │regener.│              │   Kategorie-Chip
│ │🔗Reel  │ │🔗Reel  │ │🔗Reel  │ │🔗Reel  │              │   Link zu IG
│ └────────┘ └────────┘ └────────┘ └────────┘              │
└────────────────────────────────────────────────────────┘
```

**KPI-Queries** (alle gegen `ig_post_performance`, `is_final=true` ODER `captured_at = MAX(captured_at) per ig_media_id`):
```ts
// Engagement-Rate (avg über Zeitraum)
filter: { ig_posted_at: { _gte: "$start", _lte: "$end" } }
aggregate: { avg: ["engagement_rate"] }

// Save-Rate
aggregate: { avg: ["save_rate"] }

// Avg Watch Time (ms → s konvertiert im Frontend)
aggregate: { avg: ["ig_reels_avg_watch_time_ms"] }

// Viral-Tier-Verteilung
groupBy: ["viral_tier"]
aggregate: { count: ["id"] }
```
Previous-Period-Delta: parallel dieselbe Query mit `$start - (end-start)` bis `$start`.

**Top-Reels-Query:**
```ts
endpoint: /items/ig_post_performance
filter: {
  ig_posted_at: { _gte: "$start", _lte: "$end" },
  is_trial_reel: "$trial_filter",  // optional
  // ... category joinen via hook_ideas oder content_posts per ig_shortcode
}
sort: ["-viral_score"]
limit: 12
fields: [ig_media_id, ig_shortcode, ig_permalink, ig_posted_at, thumbnail_url,
         ig_caption_preview, views, reach, viral_score, viral_tier,
         engagement_rate, save_rate, is_trial_reel]
```

**Kategorie-Join:** `ig_post_performance` hat aktuell kein `category`-Feld. **Lösung (User-Wahl): Hook-Text-Similarity auf `hook_ideas.adapted_hook_text`** — beim Polling jeden `ig_caption_preview` gegen alle `adapted_hook_text` matchen, Top-Match mit Similarity > 0.7 → Kategorie übernehmen. Funktioniert auch für Reels die nicht durch `content_posts` gingen. Implementierung: Code-Node im Polling-Workflow (zwischen Derived Metrics und POST). Bei keinem Match → `category = null` (Filter zeigt "Unkategorisiert").

**Components (neu):**
- `src/components/insights/TopReelCard.tsx` — Kachel mit Thumbnail, Badge, Kategorie-Chip, IG-Link
- `src/components/insights/KpiStatCard.tsx` — Value + Delta + Icon
- `src/components/insights/PeriodToggle.tsx` — 7d/30d/90d/YTD-Tab
- `src/components/shared/CategoryFilter.tsx` — Multi-Select über 6 Kategorien

---

### Dashboard 2 — **Deep-Dive** (`/insights/analyse` — NEUE ROUTE)

**Zweck:** "Alle Reels, intelligent filtern." Forensische Analyse.

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│ Analyse                                                │
├────────────────────────────────────────────────────────┤
│ [Search Hook-Text] [Zeitraum] [Kategorie▾] [Roll▾]     │
│ [Viral-Tier▾] [Trial?] [Sort: Views|Engagement|Skip..] │
├────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐         │
│ │ Scatterplot: X=Hook-Länge   Y=Skip-Rate     │         │
│ │ Punktfarbe = viral_tier                     │         │
│ └─────────────────────────────────────────────┘         │
├────────────────────────────────────────────────────────┤
│ Thumb│Hook-Preview│Views│Reach│Eng%│Save%│Skip%│Watch│Tier│
│ ●    │"Hast du.." │12.3k│ 8.1k│5.2%│2.1%│68%  │7.8s │ A  │
│ ●    │"3 Gründe.."│ 8.7k│ 6.2k│4.8%│1.9%│71%  │6.9s │ B  │ ...
└────────────────────────────────────────────────────────┘
```

**Query-Basis:** `ig_post_performance` + Refine `useTable` mit voller Filter-/Sort-Pagination.

**Scatterplot (Recharts `<ScatterChart>`):**
```ts
data: items.map(r => ({
  x: r.ig_caption_preview?.split(' ').slice(0, 5).join(' ').length,  // Hook-Länge Approx
  y: r.reels_skip_rate,
  z: r.views,  // Punkt-Größe
  tier: r.viral_tier,
}))
```
Besser: Eigenes `hook_length_sec`-Feld aus Whisper-Transkript (V2).

**Table:** Refine `<DataTable>` + eigene Columns. Sortierbar pro Spalte.

**Components (neu):**
- `src/pages/insights/analyse.tsx`
- `src/components/insights/HookLengthScatter.tsx`
- `src/components/insights/ReelsDataTable.tsx` (Refine-Table-Wrapper)

---

### Dashboard 3 — **Monatsbilanz** (`/insights/report` — ersetzt Stub)

**Zweck:** "Wie war April 2026?" Narrative Monats-Zusammenfassung, vergleichbar.

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│ Weekly Report              [April 2026 ▾] vs [März ▾]  │
├────────────────────────────────────────────────────────┤
│ Follower-Gewinn: +312  (März: +198, Δ +57%)            │ ← account_insights_history
│ Postings: 14 Reels + 3 Stories (März: 11 Reels)        │
│ Top-3-Reels dieses Monats:                             │
│   ① "Hast du.." 12.3k views · 210 Follower attrib.     │
│   ② "3 Gründe.." 8.7k views · 145 Follower attrib.     │
│   ③ "Warum.." 6.2k views · 87 Follower attrib.         │
├────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐         │
│ │ Line-Chart: Follower-Verlauf April (daily)  │         │
│ └─────────────────────────────────────────────┘         │
├────────────────────────────────────────────────────────┤
│ Bar-Chart: Engagement-Rate pro Kategorie (April vs März)│
│   hormone     ▓▓▓▓▓▓▓▓ 5.4% (vs 4.2%)                   │
│   stoffwechs. ▓▓▓▓▓▓   4.1% (vs 4.8%)                   │
│   ...                                                    │
├────────────────────────────────────────────────────────┤
│ Learnings (Auto-generiert):                             │
│ • "Hormone-Reels performten 28% besser als März."       │
│ • "Bester Posting-Slot: Di 18-20 Uhr (4.8% Engagement)" │
│ • "Trial-Reels hatten 31% niedrigere Skip-Rate."        │
└────────────────────────────────────────────────────────┘
```

**Queries:**
- Follower-Gewinn: `account_insights_history` nach Monat aggregieren (**blockiert bis Collection existiert**)
- Postings: `count` auf `ig_post_performance` mit `ig_posted_at` im Monat, deduped per `ig_media_id`
- Top-3-Reels: `sort: -views, limit: 3, filter: ig_posted_at IN month`
- Follower-Attribution: neues Feld in `ig_post_performance` — `follower_delta_24h` (Meta Q1 2026 API)
- Kategorie-Bar: `aggregate avg engagement_rate, groupBy category`
- Auto-Learnings: Insight-Engine-Output (siehe unten)

**Components (neu):**
- `src/pages/insights/report.tsx` (komplett neu)
- `src/components/insights/MonthSelector.tsx` (2x für Vergleich)
- `src/components/insights/FollowerLineChart.tsx`
- `src/components/insights/CategoryComparisonBarChart.tsx`
- `src/components/insights/AutoLearningsCard.tsx`

---

### Dashboard 4 — **Pattern-Finder** (`/insights/learnings` — ersetzt Stub)

**Zweck:** "Was haben Reels mit niedrigem Skip-Rate gemeinsam?" Learnings-Engine-UI.

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│ Pattern-Finder                                         │
├────────────────────────────────────────────────────────┤
│ Frage auswählen:                                        │
│ ● Was haben Reels mit niedriger Skip-Rate gemeinsam?   │
│ ○ Was haben Reels mit vielen Saves gemeinsam?          │
│ ○ Was haben Reels mit hohem Viral-Score gemeinsam?     │
│ ○ Was haben Reels mit vielen Follower-Gewinnen...?     │
│                                                         │
│ Datenbasis: [Alle eigenen Reels ▾] [nur Letzte 90d ▾]  │
├────────────────────────────────────────────────────────┤
│ Top-3-Pattern gefunden:                                │
│                                                         │
│ 1. Kategorie "hormone" (+38% niedriger als Median)     │
│    Belege: 8 von 12 Low-Skip-Reels sind hormone        │
│                                                         │
│ 2. Posting-Slot 18-20 Uhr (+22% niedriger)             │
│    Belege: 6 von 12 Low-Skip-Reels im Zeitfenster      │
│                                                         │
│ 3. Hook-Länge < 4s (+18% niedriger)                    │
│    Belege: Durchschn. Hook 3.2s vs 5.8s Gesamt-Median  │
├────────────────────────────────────────────────────────┤
│ Referenz-Reels (die 12 Reels in der Low-Skip-Gruppe):  │
│ [Thumbnail-Grid ähnlich Dashboard 1]                    │
└────────────────────────────────────────────────────────┘
```

**Insight-Engine — V1-Algorithmus (Feature-Korrelation):**

Läuft als Directus-Flow (serverseitig) ODER als lokales Python-Skript (cron daily):

```python
# Pseudo-Code
import pandas as pd
df = fetch_directus("/items/ig_post_performance?filter[is_final][_eq]=true")

# Binary target per Frage
if question == "niedrige_skip_rate":
    df["target"] = df["reels_skip_rate"] < df["reels_skip_rate"].quantile(0.25)

# Numerische Features
num_features = ["hook_length_sec", "caption_length", "post_hour", "poll_count"]
# Kategoriale → One-Hot
cat_features = pd.get_dummies(df[["category", "is_trial_reel", "ig_media_product_type"]])

# Mean-Delta pro Feature
deltas = []
for f in num_features + list(cat_features.columns):
    mean_true = df[df.target][f].mean()
    mean_false = df[~df.target][f].mean()
    delta_pct = (mean_true - mean_false) / mean_false * 100
    deltas.append({"feature": f, "delta_pct": delta_pct, "n": df.target.sum()})

top3 = sorted(deltas, key=lambda d: abs(d["delta_pct"]), reverse=True)[:3]
# Render als natürlichsprachliche Regeln
```

**Output-Collection:** `learnings` (neu, einfaches Schema):
```
id, question_id, generated_at, pattern_text, delta_pct, evidence_count, evidence_reels_ids (json array)
```

**Components (neu):**
- `src/pages/insights/learnings.tsx` (komplett neu)
- `src/components/insights/QuestionSelector.tsx`
- `src/components/insights/PatternResultCard.tsx`
- `src/components/insights/EvidenceReelsGrid.tsx` (wiederverwendbar aus Dashboard 1)

**V2 (Session 52+):**
- Decision-Tree (sklearn, `max_depth=3`) → Top-3-Regeln statt nur Feature-Deltas
- LLM-Cluster auf Whisper-Transkripten (erst wenn 100+ Reels)
- Natural-Language-Query-Input ("Reels mit >5k Views wo ich Hormone erkläre")

**Engine-Location-Entscheidung (final):** **n8n Code-Node** in neuem Workflow "Pattern-Finder Daily 05:00".

**Warum nicht FastAPI auf Coolify:**
- Keine KI-Kosten nötig — Feature-Korrelation ist Statistik, kein LLM (~50 Zeilen JS reichen).
- Coolify hatte Deployment-Risiken (Session 42: Disk-Full, Bundle-Splitting-Break). Neuer Service = neues Risiko.
- n8n ist bewährt, läuft stabil, bekannte Patterns.
- V2 (sklearn Decision-Tree, LLM-Cluster) kann später zu FastAPI migrieren, wenn nötig.

**Flow:**
```
ScheduleTrigger 05:00 → HTTP GET /items/ig_post_performance (alle is_final=true Reels)
  → Code Node: JavaScript rechnet Feature-Deltas pro Frage
  → Split-Out pro Frage-Result
  → HTTP POST /items/learnings (pattern_text, delta_pct, evidence_reels_ids)
```

**Code-Node-Logik (Pseudocode):**
```js
const rows = $input.all().map(i => i.json);
const questions = [
  { id: "low_skip", target: r => r.reels_skip_rate < percentile(rows, "reels_skip_rate", 25) },
  { id: "high_saves", target: r => r.save_rate > percentile(rows, "save_rate", 75) },
  { id: "high_viral", target: r => ["S", "A"].includes(r.viral_tier) },
  // ... ggf. high_follower_attribution wenn follower_delta_24h da ist
];
const numFeatures = ["poll_count", "ig_reels_avg_watch_time_ms", /* hook_length wenn vorhanden */];
const catFeatures = ["category", "is_trial_reel", "ig_media_product_type"];

for (const q of questions) {
  const group1 = rows.filter(q.target);
  const group2 = rows.filter(r => !q.target(r));
  const deltas = [];
  for (const f of numFeatures) {
    const m1 = mean(group1.map(r => r[f]));
    const m2 = mean(group2.map(r => r[f]));
    deltas.push({ feature: f, delta_pct: (m1 - m2) / m2 * 100, type: "num" });
  }
  for (const f of catFeatures) {
    // Enrichment-Rate: prozentualer Anteil jedes Wertes in Gruppe 1 vs. 2
    for (const v of uniqueValues(rows, f)) {
      const share1 = group1.filter(r => r[f] === v).length / group1.length;
      const share2 = group2.filter(r => r[f] === v).length / group2.length;
      deltas.push({ feature: `${f}=${v}`, delta_pct: (share1 - share2) * 100, type: "cat" });
    }
  }
  const top3 = deltas.sort((a,b) => Math.abs(b.delta_pct) - Math.abs(a.delta_pct)).slice(0, 3);
  // emit für HTTP-POST
}
```

Keine externen Libraries, läuft komplett in n8n. Kosten: 0 (n8n-Execution ist Self-Hosted).

---

## Architektur-Änderungen / neue Tasks

### Directus (Backend)
- [ ] **Neue Collection `account_insights_history`** (blockierend für Dashboard 3, User-bestätigt)
  - Felder: `id`, `date`, `follower_count`, `profile_views`, `account_reach`, `new_followers_daily`, `captured_at`
  - Quelle: neuer n8n-Workflow, daily 04:30 nach dem Reels-Poll
- [ ] **Feld `category` in `ig_post_performance`** (Dashboard 1 Kategorie-Filter)
  - **Befüllung: Hook-Text-Similarity auf `hook_ideas.adapted_hook_text`** (User-Wahl)
  - Algorithmus: bei neuem `ig_post_performance`-Row → `hook_ideas` durchsuchen, Cosine/Levenshtein auf `ig_caption_preview[:200]` vs. alle `adapted_hook_text`, Match wenn Similarity > 0.7 → Kategorie übernehmen
  - Wird im n8n-Polling-Workflow als Code-Node eingebaut, zwischen "Set Derived Metrics" und "Directus POST Row"
- [ ] **Feld `follower_delta_24h` in `ig_post_performance`** (Dashboard 3 Follower-Attribution)
  - Meta Graph API Q1 2026: `insights?metric=follows` → per Reel
  - Polling-Workflow erweitern
- [ ] **Neue Collection `learnings`** (Dashboard 4 Cache)

### n8n
- [ ] **Neuer Workflow "Alexandra: Account Insights Daily 04:30"** (clone-Pattern wie Task 1, ScheduleTrigger)
- [ ] **Erweiterung Workflow `wnl3Ycm72jbuT2Hn`** (Category-Join + follower_delta_24h)
- [ ] **Neuer Workflow "Pattern-Finder Daily 05:00"** — HTTP-Call an FastAPI-Wrapper

### `paperclip-content-platform` (Frontend)
- [ ] Neue Routen: `/insights/analyse` (Dashboard 2)
- [ ] Bestehende Stubs ersetzen: `/insights/performance`, `/insights/report`, `/insights/learnings`
- [ ] Neue geteilte Components: `CategoryFilter`, `MultiSelect`, `DateRangePicker`, `PeriodToggle`, `KpiStatCard`, `TopReelCard`, `EvidenceReelsGrid`
- [ ] Neue Insights-Components: 4x Dashboard-spezifisch (ca. 12 neue Files)
- [ ] `src/lib/categories.ts` erweitern um Tier-Farb-Mapping (`S=gold`, `A=emerald`, ...)

### n8n (zusätzlich zu oben)
- [ ] **Neuer Workflow "Pattern-Finder Daily 05:00"** — ScheduleTrigger → HTTP GET Directus → Code-Node (Feature-Deltas) → HTTP POST Directus `learnings`. KEINE FastAPI, KEINE externe App.

### Nicht gebaut (Entscheidung dagegen):
- ~~FastAPI-Wrapper `learnings-engine` auf Coolify~~ — Overhead, kein Nutzen in V1. Erst wenn V2-Engine (sklearn/LLM) nötig wird.

---

## Reihenfolge für Session 51 (Umsetzung)

**Wave 1 — Daten-Fundament (blockierend):**
1. Directus: `category`-Feld in `ig_post_performance` + Backfill
2. n8n: Polling-Workflow um Category-Join erweitern
3. Directus: neue Collection `account_insights_history` anlegen
4. n8n: neuer "Account Insights Daily 04:30"-Workflow
5. **Verify:** 1-2 Tage Daten-Akkumulation abwarten, dann Directus-Content prüfen

**Wave 2 — Dashboards 1+2 (können parallel):**
6. Dashboard 1 (Top Reels): TopReelCard, KpiStatCard, PeriodToggle, CategoryFilter, `performance.tsx` rewrite
7. Dashboard 2 (Deep-Dive): HookLengthScatter, ReelsDataTable, neue Route `analyse.tsx`

**Wave 3 — Dashboard 3 (nach Wave 1 Daten da):**
8. Dashboard 3 (Monatsbilanz): MonthSelector, FollowerLineChart, CategoryComparisonBarChart, `report.tsx` rewrite

**Wave 4 — Pattern-Finder (Session 52+):**
9. `learnings`-Collection in Directus anlegen
10. n8n-Workflow "Pattern-Finder Daily 05:00" — ScheduleTrigger + HTTP + Code-Node + HTTP (keine FastAPI)
11. Dashboard 4 (Pattern-Finder): QuestionSelector, PatternResultCard, `learnings.tsx` rewrite

---

## Verification

Pro Dashboard nach Fertigstellung:
1. `pnpm dev` in `paperclip-content-platform/` starten
2. Login als Alexandra (Directus-Auth)
3. Route aufrufen, auf echten Daten testen
4. Chrome-MCP: `mcp__Claude_in_Chrome__navigate` + `read_page` für Smoke-Test
5. Mobile-Viewport: `resize_window` auf 375x667, Layout-Check
6. Produktionsdeploy via Coolify (`content-platform` App-UUID `gs40wsccw8wsk4k4cg4swg0s`)
7. Nach Deploy: `https://content.alexandra-anthopoulou.cloud` manuell durchklicken

---

## Critical Files / Pfade

- **Ziel-Repo:** `/Users/martinklemm/Desktop/Health Business Projects/paperclip-content-platform/`
- **Insights-Pages:** `src/pages/insights/{performance,report,learnings,analyse}.tsx`
- **Shared Components:** `src/components/shared/` (CategoryFilter, MultiSelect, DateRangePicker, PeriodToggle)
- **Insights Components:** `src/components/insights/` (neu anlegen, 12 Files)
- **Kategorien:** `src/lib/categories.ts`
- **Directus Client:** `src/providers/directus.ts`
- **Chart-Primitive:** `src/components/ui/chart.tsx` (bereits da, Recharts-Wrapper)
- **Routing:** `src/App.tsx` (`/insights/analyse`-Route hinzufügen)
- **Directus URL:** `crm.alexandra-anthopoulou.cloud`
- **Daily-Poll-Workflow:** n8n `wnl3Ycm72jbuT2Hn` (inaktiv, aktivieren nach Schema-Erweiterung)

---

## User-Entscheidungen (final, Phase 3 abgeschlossen)

1. **Follower-Gap:** Jetzt einplanen, `account_insights_history`-Collection + neuer n8n-Polling-Workflow sind Teil von Wave 1.
2. **Pattern-Finder-Engine:** n8n Code-Node (pure JS, keine KI-Kosten, kein neuer Service auf Coolify).
3. **Kategorie-Befüllung:** Hook-Text-Similarity auf `hook_ideas.adapted_hook_text`, nicht Pipeline-Join.
4. **Spec-Ziel-Pfad:** `paperclip-content-platform/docs/dashboards-spec.md`.

---

## Roadmap-Notiz (Task 3, separat zu diesem Plan)

Mobile Push-Notifications in der Web-UI (z.B. "12 neue Hook-Ideen in der Inbox"). Stichpunkt für später: Web Push API + Service Worker, PWA-Manifest bereits in `paperclip-content-platform/public/` prüfen. Nicht heute, nicht in Session 51. Parken in `docs/roadmap.md`.
