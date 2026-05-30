# Project Architecture Map

> Auto-maintained by Repository Intelligence Agent
> Last updated: {timestamp}
> Schema version: 1.0

## Architecture Overview

### Type
{monolith | microservices | monorepo | library}

### Primary Pattern
{layered | hexagonal | event-driven | MVC | MVVM | clean-architecture}

## Layer Map

```
┌─────────────────────────────────┐
│         Presentation            │
│  {components, pages, layouts}   │
├─────────────────────────────────┤
│         Application             │
│  {hooks, services, state}       │
├─────────────────────────────────┤
│           Domain                │
│  {models, entities, types}      │
├─────────────────────────────────┤
│       Infrastructure            │
│  {api, db, auth, storage}       │
└─────────────────────────────────┘
```

## Module Boundaries

| Module | Path | Responsibility | Dependencies |
|--------|------|----------------|--------------|
| | | | |

## Data Flow

```
User Action → Component → Hook/Service → API/Database → State Update → Re-render
```

## Key Architectural Decisions

| ADR | Decision | Rationale | Date |
|-----|----------|-----------|------|
| | | | |

## Anti-Patterns Detected

| Issue | Location | Severity | Status |
|-------|----------|----------|--------|
| | | | |
