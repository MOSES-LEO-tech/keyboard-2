---
name: code-review
description: Systematic code review for bugs, risks, regressions, type safety, and testing gaps. Invoke before merging, after implementing, or when asked to review code.
---

# Code Review Skill

## Triggers

Invoke when:
- User asks for a "review" or "code review"
- Before merging a PR
- After implementing a feature or fix
- User wants quality assessment of code
- Debugging effort reveals systematic issues

## Review Priority

Focus on findings in order of severity:

### Critical (must fix)
- Security vulnerabilities (unvalidated input, exposed secrets, injection)
- Data loss risks (incorrect mutations, missing transactions)
- Regression risks (changed behavior without tests)
- Type safety violations (`as any`, missing null checks)

### High (should fix)
- Missing error handling (swallowed errors, broad catches)
- Race conditions (async state, concurrent mutations)
- Memory leaks (unmounted state updates, undisposed listeners)
- Logic errors (edge cases, boundary conditions)

### Medium (consider fixing)
- Missing tests for new behavior
- Performance issues (unnecessary re-renders, large bundles)
- Accessibility gaps (missing labels, poor contrast)
- Inconsistent patterns with codebase conventions

### Low (optional)
- Naming improvements
- Code organization suggestions
- Comment clarity
- Dead code

## Workflow

1. **Read context**: Load affected files and surrounding code
2. **Trace data flow**: Follow inputs → processing → outputs
3. **Check edge cases**: null, empty, error, loading states
4. **Verify types**: ensure no `any` or type escapes
5. **Check tests**: existing tests still pass? new behavior tested?
6. **Report findings**: ordered by severity with file:line references

## Output Format

```
## Review: {scope}

### Critical
- [{file}:{line}] {finding} — {impact}

### High
- [{file}:{line}] {finding} — {impact}

### Medium
- [{file}:{line}] {finding}

### Low
- [{file}:{line}] {finding}

### Summary
- Files reviewed: {count}
- Issues found: {critical + high + medium + low}
- Verdict: {APPROVE | CHANGES_REQUESTED}
```

## Codebase Convention Checks

Always verify against:
- `.trae/rules/project-conventions.md`
- `.trae/rules/architecture-rules.md`
- `.trae/rules/tech-stack-rules.md`

Flag any violations even if code is functionally correct.
