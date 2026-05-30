---
name: debugging
description: Scientific debugging methodology with hypothesis generation, evidence collection, and root cause verification. Invoke for complex bugs, runtime errors, build failures, or when static analysis is insufficient.
---

# Debugging Skill

## Triggers

Invoke when:
- Bug cannot be resolved by static code analysis alone
- Runtime errors with unclear origin
- Build failures with cryptic errors
- Intermittent / non-deterministic issues
- Complex state management bugs
- Multiple failed fix attempts

## Scientific Debugging Workflow

### Phase 1: Reproduce
1. Read error output, stack trace, or bug report
2. Identify exact reproduction steps
3. Isolate minimum reproduction case
4. Document reproduction in Task_History

### Phase 2: Hypothesize
Use Sequential Thinking MCP to:
1. Map the failure chain from symptom → root
2. List 2-3 possible root causes
3. Rank by likelihood
4. Each hypothesis must be falsifiable

### Phase 3: Instrument
Add targeted instrumentation (never remove until fixed):
- Console.log at decision points (with context, not just "here")
- Error boundary catches with stack traces
- State snapshots at key render points
- Network request/response logging

### Phase 4: Test Hypothesis
1. Apply minimal fix for most likely hypothesis
2. Run reproduction steps
3. If fixed → Phase 5
4. If not → revert, test next hypothesis
5. After 3 failed attempts → broaden search scope

### Phase 5: Root Cause Fix
1. Fix the root cause, not the symptom
2. Add regression test
3. Verify no side effects
4. Update Task_History with findings

## Debugging Patterns

### React State Bugs
- Check for stale closures in useEffect
- Verify dependency arrays
- Look for missing keys in lists
- Check for uncontrolled → controlled input transitions
- Verify state updates are immutable

### TypeScript Errors
- Trace the type chain from error location to definition
- Check for incorrect generics inference
- Look for `as` casts hiding real type mismatches
- Verify discriminated unions are exhausted

### Build/Config Failures
- Check Node.js version compatibility
- Verify lockfile vs package.json versions
- Check for peer dependency conflicts
- Review recently changed config files

### API/Data Issues
- Verify request payload matches expected schema
- Check response shape against types
- Look for unhandled HTTP error statuses
- Verify auth tokens are fresh

### Performance Issues
- Profile with React DevTools
- Check for unnecessary re-renders (React.memo, useMemo)
- Look for expensive computations in render
- Check bundle size with analyzer

## Anti-Patterns to Avoid
- Fixing symptoms instead of root causes
- Adding `as any` to silence type errors
- Wrapping everything in try/catch
- Commenting out failing code
- Adding setTimeout as timing fix
- Changing unrelated code to "see if it helps"
