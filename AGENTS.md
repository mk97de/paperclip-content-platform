# paperclip-content-platform — Einstieg für Agenten

<!-- Zweck: zwei bis vier Sätze — was das Repo tut, für wen, wo es läuft. Von doctor.py angelegt;
     dieser Kommentar wird beim ersten Ausfüllen gelöscht. -->

Codex und Claude lesen dieselbe Datei: Codex direkt, Claude über `CLAUDE.md` (Symlink oder
`@AGENTS.md`). Globale Regeln stehen in `~/.claude/CLAUDE.md` + `~/.claude/rules/` und für
Codex in `~/.codex/AGENTS.md`; hier steht nur, was dieses Repo betrifft.

## Session-Protokoll

Ein Workstream trägt seinen Zustand in `docs/<ws>/CONTINUITY.md` (aktive Datei) und
`docs/<ws>/sessions/` (eine unveränderliche Akte je Session). Git plus diese Datei sind kanonisch.

- **Start:** `/session-start <Startprompt>` (Claude) bzw. `$session-start <Startprompt>` (Codex).
  Read-only; einziger Schreibvorgang ist die Lock-Datei `docs/<ws>/.session-lock`.
- **Ende:** nur auf ausdrücklichen Aufruf `/session-end` bzw. `$session-end`. Ein Abschied,
  ein erledigter letzter Punkt oder Token-Nähe lösen es nicht aus.
- **Neuer Workstream:** Startprompt mit `Handoff-ID: BOOTSTRAP`; der Start legt die Continuity an.
- Ein lebender fremder Lock heißt: fremde Dateien im `git status` liegen lassen und melden.

## Git

Der Session-Abschluss ist der einzige Commit-Pfad: session-eigene Pfade namentlich stagen,
normal committen, Branch pushen, Remote-SHA verifizieren.

Ausgeschlossen: `git add -A` · `--no-verify` · Force in jeder Form · Tags · Branchlöschung ·
geratener Ref · Branchwechsel im Arbeits-Worktree · Reset · Clean · Deploy als Nebenwirkung.
Fremde dirty oder staged Dateien werden gemeldet, nie mitgenommen; unklare Eigentümerschaft stoppt.

## Vor der Arbeit lesen

| Du arbeitest an … | lies zuerst |
|---|---|
| einem laufenden Workstream | `docs/<ws>/CONTINUITY.md` — Ziel, Entscheidungen, Folgesession-Vertrag |
| Historie einer Entscheidung | `docs/<ws>/sessions/HO-<Datum>-<Nr>.md` — Abruf per `grep` und `git log` |

<!-- Repo-spezifische Zeilen hier ergänzen: Deploy-Ziel, gesperrte Pfade, Messregeln. ≤ 60 Zeilen. -->
