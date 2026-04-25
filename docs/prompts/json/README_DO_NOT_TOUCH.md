# Prompt JSON Protection

This directory contains EdenChat platform paste artifacts.

Do not auto-edit JSON body fields, including narrative `trigger` keys. Body-level
`trigger` fields can be intentional runtime content and are not the same thing as
the file-end `// --- TRIGGER ---` activation notes.

Allowed maintenance:

- Add or review file-end `// --- TRIGGER ---` notes during a moderator-opened
  prompt/platform update cycle.
- Run `tools/audit_trigger_keys.ps1` for audit-only visibility.

Prohibited by default:

- Renaming body `trigger` keys.
- Bulk rewriting prompt JSON bodies.
- Treating audit output as a fix list.
