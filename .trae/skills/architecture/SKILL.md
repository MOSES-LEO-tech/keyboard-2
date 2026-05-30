---
name: architecture
description: Architecture analysis, design, review, ADRs, dependency mapping, and refactoring guidance. Invoke for system design, module boundaries, component hierarchy, or when planning structural changes.
---

# Architecture Skill

## Triggers

Invoke when:
- Planning project structure or new features
- Reviewing architecture decisions
- Analyzing dependencies or module boundaries
- Designing system architecture
- Evaluating architectural trade-offs
- Creating Architecture Decision Records (ADRs)
- Planning refactoring or migrations
- Onboarding onto a new codebase

## Workflow

### Step 1: Read Repository Intelligence
Always read `.trae/project-map/Architecture.md` first. If empty, populate it.

### Step 2: Analyze
- Map current module structure and dependencies
- Identify architectural patterns in use
- Detect coupling issues, circular dependencies, god modules
- Evaluate separation of concerns, cohesion

### Step 3: Design or Review
- Propose architecture following SOLID principles
- Choose appropriate patterns based on project needs
- Define clear module boundaries and public APIs
- Plan data flow and component hierarchy

### Step 4: Document
- Create ADRs using standard format:
  - **Title**: Short name
  - **Status**: Proposed | Accepted | Deprecated | Superseded
  - **Context**: What motivates this decision?
  - **Decision**: What was decided?
  - **Consequences**: What becomes easier/harder?

### Step 5: Update Project Map
- Update `.trae/project-map/Architecture.md` with findings
- Note anti-patterns detected
- Update module boundaries and data flow

## Output Standards
- Use Mermaid diagrams for visual clarity
- Reference concrete file paths
- Be explicit about trade-offs
- Prioritize simplicity — avoid over-engineering
- Output in ENGINEER_MODE format when code changes involved

## Patterns Reference

### When to use:
- **Layered**: Standard CRUD apps, APIs
- **Hexagonal (Ports & Adapters)**: Apps with multiple I/O channels
- **Feature-Sliced**: Large React/Next.js apps
- **Clean Architecture**: Complex domain logic
- **Event-Driven**: Async workflows, microservices
- **Monorepo**: Multi-package projects with shared code

### Anti-patterns to flag:
- God modules (>500 lines, multiple responsibilities)
- Circular dependencies
- Feature envy (module using another's internals)
- Improper layering (DB calls in UI layer)
- Leaking abstractions
