---
name: mcp-orchestrator
description: Decision engine for tool selection. Teaches the agent when and how to use MCP tools, skills, and built-in capabilities. Invoke at the start of every task to route to the right tools.
---

# MCP Orchestrator Skill

## Purpose

Most models don't automatically know when to invoke specific tools. This skill provides a deterministic decision engine that routes every task to the correct tools, skills, and MCP servers — dramatically improving agent quality.

## When to Invoke

At the start of any task, run through the decision tree to identify required tools. Also invoke when:
- A task stalls and might need a different tool
- The agent is using the wrong approach
- Complex multi-step tasks that span tool categories

## Decision Engine

### Step 1: Classify Task

```
TASK TYPE                 → PRIMARY TOOL
─────────────────────────────────────────────
Read code / search        → SearchCodebase + Grep
Understand codebase       → project-map + repository-intelligence skill
Generate code             → Filesystem MCP (write)
Edit existing code        → SearchReplace tool
Run commands / build      → Terminal MCP
Debug runtime error       → Sequential Thinking + debugging skill
UI work / frontend        → Playwright MCP + frontend-design skill
Unfamiliar library        → Context7 MCP
Architecture planning     → architecture skill + Sequential Thinking
Code review               → code-review skill
Testing                   → testing-strategy skill
Git operations            → GitHub MCP
Research / docs           → WebSearch + Context7
Persist knowledge         → Memory MCP
```

### Step 2: Identify Skills Needed

```
NEED                          → SKILL
─────────────────────────────────────────────
Architecture design           → architecture
Bug detection / quality       → code-review
Debugging strategy            → debugging
Test generation / coverage    → testing-strategy
Codebase understanding        → repository-intelligence
Tool routing                  → mcp-orchestrator (this skill)
```

### Step 3: Apply Tool Budget Constraints

Remember the 40-tool budget limit:
1. Count current tools enabled
2. If near limit, disable unused tools for this task
3. Prioritize: Filesystem > Terminal > Memory > Sequential Thinking
4. Context-specific: Playwright (frontend), Context7 (new libs), GitHub (PRs)

## Tool Routing Rules

### When to use SearchCodebase vs Grep
- **SearchCodebase**: Natural language queries, understanding code intent, finding patterns
- **Grep**: Exact regex matches, finding all usages of a function/variable/import

### When to use Read vs Glob vs LS
- **Read**: When you know the exact file path
- **Glob**: When you know the file name pattern
- **LS**: When exploring directory structure

### When to use Sequential Thinking
- Task involves 3+ distinct steps
- Debugging unclear errors
- Architecture design decisions
- Refactoring with multiple dependencies
- Any task where the approach isn't immediately obvious

### When to use Playwright
- Any frontend code change
- Investigating UI bugs
- Checking responsive design
- Verifying visual output
- Console error inspection

### When NOT to use Playwright
- Pure backend changes
- CLI tools
- Library code with no UI
- When no dev server is running

## Anti-Patterns

- Using Grep when SearchCodebase would find it faster
- Reading files one-by-one instead of batching
- Running Terminal commands when a dedicated tool exists
- Using Playwright when no UI is involved
- Skipping project-map read before starting work
- Using R1 model for tool calling (use V3)
