---
name: repository-intelligence
description: Maintains a living map of the codebase — architecture, dependencies, components, APIs, database schema, and task history. Invoke at project start, after major changes, and when context is needed for any task.
---

# Repository Intelligence Skill

## Purpose

Build and maintain a mental model of the repository that persists across sessions. This is the foundation that enables Codex-like understanding of a codebase.

## When to Invoke

- **On project start**: Populate all project-map files from scratch
- **After major changes**: Architecture shifts, new modules, dependency changes
- **Before any significant task**: Read relevant map file for context
- **When context is lost**: After long sessions, re-read project-map
- **Periodically**: Every 5-10 sessions, refresh the map

## Project Map Files

All files live in `.trae/project-map/`:

| File | Content | When Updated |
|------|---------|-------------|
| Architecture.md | Layers, modules, patterns, data flow | Architecture changes |
| Dependencies.md | All packages, versions, update status | Package changes |
| Component_Map.md | Component tree, routes, hooks, stores | Component changes |
| API_Map.md | Endpoints, types, auth, error handling | API changes |
| Database_Map.md | Schema, migrations, queries, indexes | Schema changes |
| Task_History.md | Completed tasks, patterns, recurring issues | Every task |

## Workflow

### Initial Analysis (First Run)
1. Read package.json → populate Dependencies.md
2. Read tsconfig.json → note aliases, strict settings
3. Map directory structure → populate Architecture.md
4. Identify component tree → populate Component_Map.md
5. Find API routes and type definitions → populate API_Map.md
6. Find database schema and migrations → populate Database_Map.md

### Incremental Update (After Changes)
1. Identify which map files are affected by changes
2. Read current map file content
3. Update only changed sections
4. Add timestamp

### Pre-Task Context Loading
1. Read project-map/Architecture.md for structural context
2. Read project-map/Component_Map.md for affected components
3. Read relevant rules from .trae/rules/
4. Load into working context before planning

## Memory MCP Integration

After populating or updating project-map files:
- Store key architecture decisions via Memory MCP
- Remember coding conventions discovered
- Note recurring workflow patterns
- Record project-specific gotchas

This ensures short-term project-map data persists as long-term memory.

## Rules

- Never modify project-map files without first reading the codebase
- Always timestamp updates
- Keep maps concise — no prose, just facts
- If uncertain about a mapping, mark it with `[VERIFY]` and revisit
- Update Task_History.md after every completed task
