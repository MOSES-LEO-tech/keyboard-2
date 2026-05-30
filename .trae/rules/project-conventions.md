# Project Conventions

## Git

### Branches
- `main` — production-ready, protected
- `develop` — integration branch
- `feat/{name}` — new features
- `fix/{name}` — bug fixes
- `refactor/{name}` — refactoring
- `chore/{name}` — tooling, deps, config

### Commits
Format: `type(scope): description`

Types: feat, fix, refactor, chore, docs, test, style, perf

Examples:
- `feat(auth): add magic link login`
- `fix(api): handle null response in user endpoint`
- `refactor(db): extract query builder to shared module`

### PRs
- One PR = one logical change
- Description includes: What, Why, Testing notes
- Screenshots for UI changes
- Linked issue if exists

## Code Style

### General
- No comments for obvious code ("assigns the value", "increments counter")
- Comments for: complex algorithms, non-obvious decisions, workarounds
- No commented-out code — remove it
- No TODO without ticket reference
- No emojis in code, commit messages, or PRs

### Naming
- Descriptive over short (getUserByEmail, not getUser)
- Avoid abbreviations (configuration, not config — exception: common ones like db, api, auth)
- Boolean variables: is/has/should prefix (isLoading, hasError)
- Event handlers: handle prefix (handleClick, handleSubmit)

### Error Handling
- Try/catch at service boundaries only
- Let errors bubble through to error boundaries
- User-facing errors must be actionable
- Log errors with context, not just message

### Testing
- Unit tests for utilities and hooks
- Integration tests for API routes
- E2E tests for critical user flows
- Test behavior, not implementation
- Coverage: target 80% for utils, 60% for components

## Directory Conventions
- Each feature folder contains: page.tsx, not-found.tsx, loading.tsx, error.tsx (Next.js)
- Components co-located near usage unless shared by 3+ routes
- Tests in __tests__ alongside source or .test.ts suffix
- No default exports — named exports only
