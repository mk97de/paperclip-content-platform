# paperclip-content-platform — Einstieg für Agenten

<!-- Zweck: zwei bis vier Sätze — was das Repo tut, für wen, wo es läuft. Von doctor.py angelegt;
     dieser Kommentar wird beim ersten Ausfüllen gelöscht. -->

Codex und Claude lesen dieselbe Datei: Codex direkt, Claude über `CLAUDE.md` (Symlink oder
`@AGENTS.md`). Globale Regeln stehen in `~/.claude/CLAUDE.md` + `~/.claude/rules/` und für
Codex in `~/.codex/AGENTS.md`; hier steht nur, was dieses Repo betrifft.

## Gemeinsamer Arbeitsvertrag

Für Codex und Claude gelten `~/.claude/rules/karpathy-principles.md` und
`~/.claude/rules/session-protocols.md`; vor relevanter Arbeit lesen, falls nicht bereits geladen.
Ein konkreter Start-Slice wird nach der Rekonstruktion ausgeführt. Abschluss auf Auftrag oder
nach verifiziertem festen Ziel; konkrete Read-only-, Git- und Fachgrenzen bleiben erhalten.
Git und `docs/<ws>/CONTINUITY.md` sind kanonisch; Board und Memory sind optional.
Git-Schreibaktionen nur durch den bestehenden `session_git_close.py`, eigene Pfade einzeln,
normaler Push mit Remote-Nachweis. Fremde Änderungen und lebende Locks erhalten.

## Vor der Arbeit lesen

| Du arbeitest an … | lies zuerst |
|---|---|
| einem laufenden Workstream | `docs/<ws>/CONTINUITY.md` — Ziel, Entscheidungen, Folgesession-Vertrag |
| Historie einer Entscheidung | `docs/<ws>/sessions/HO-<Datum>-<Nr>.md` — Abruf per `grep` und `git log` |

<!-- Repo-spezifische Zeilen hier ergänzen: Deploy-Ziel, gesperrte Pfade, Messregeln. ≤ 60 Zeilen. -->
