---
name: testing-strategy
description: Test generation, coverage analysis, test framework guidance, and test quality review. Invoke before implementing features, after fixing bugs, or when test coverage needs improvement.
---

# Testing Strategy Skill

## Triggers

Invoke when:
- Implementing a new feature (write tests first or alongside)
- Fixing a bug (add regression test)
- Reviewing test coverage
- Setting up testing for a new project
- User asks about testing approach

## Test Pyramid

```
        ┌──────┐
        │ E2E  │  ← Critical user flows only
       ┌┴──────┴┐
       │  INTEG  │  ← API routes, service boundaries
      ┌┴────────┴┐
      │   UNIT    │  ← Utilities, hooks, pure functions
     └───────────┘
```

## Test Types by Layer

### Unit Tests (Jest / Vitest)
**What**: Pure functions, utilities, hooks, state logic
**When**: Always, for all new code
**Tool**: Vitest (preferred for Vite/Next.js), Jest
```
- Test behavior, not implementation
- One assert per test (or closely related asserts)
- Descriptive test names: "should return X when Y"
- Arrange → Act → Assert pattern
```

### Component Tests (Testing Library)
**What**: Component rendering, user interactions, accessibility
**When**: Shared components, complex forms, conditional rendering
**Tool**: @testing-library/react
```
- Query by role/text/label, not by test-id (unless necessary)
- Test from user perspective
- Verify accessibility (focus, labels, roles)
```

### Integration Tests
**What**: API routes, data fetching, auth flows, form submission
**When**: Any API route or service boundary
**Tool**: Vitest + supertest (API), or Testing Library (integrated)
```
- Mock external services only, not internal ones
- Test the full request → response cycle
- Verify error states and edge cases
```

### E2E Tests (Playwright)
**What**: Critical user journeys (login → dashboard → action)
**When**: Core flows that must not break
**Tool**: Playwright
```
- Test real browser behavior
- Use data-testid sparingly — prefer role/text selectors
- Test on all breakpoints for critical flows
```

## Test Templates

### Unit Test (Utility)
```typescript
import { describe, it, expect } from 'vitest'
import { functionName } from './functionName'

describe('functionName', () => {
  it('should return expected result for normal input', () => {
    const result = functionName('input')
    expect(result).toBe('expected')
  })

  it('should handle empty input', () => {
    const result = functionName('')
    expect(result).toBeNull()
  })

  it('should throw for invalid input', () => {
    expect(() => functionName(null)).toThrow()
  })
})
```

### Component Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('should render with props', () => {
    render(<ComponentName title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('should call onClick handler', () => {
    const onClick = vi.fn()
    render(<ComponentName onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
```

## Coverage Targets

| Layer | Target |
|-------|--------|
| Utilities / Pure functions | 90%+ |
| Hooks | 80%+ |
| Components | 60%+ |
| API Routes | 80%+ |
| E2E (critical flows) | 100% of critical paths |

## When Writing Tests

- New feature: write tests alongside implementation
- Bug fix: write failing test first, then fix
- Refactor: existing tests must pass before and after
- Legacy code: add characterization tests before changing

## Anti-Patterns

- Testing implementation details (internal state, method names)
- Testing library/framework behavior
- Over-mocking (mock only external boundaries)
- Snapshot testing as sole verification
- Flaky tests (time-dependent, order-dependent)
- Empty test files as placeholders
