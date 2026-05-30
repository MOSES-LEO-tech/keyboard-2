# Tech Stack Rules

## Primary Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 22 LTS |
| Language | TypeScript | 5.x strict |
| Framework | Next.js | 15.x App Router |
| Database | SQLite / PostgreSQL | latest |
| ORM | Prisma | latest |
| Auth | NextAuth.js / Better Auth | latest |
| Styling | TailwindCSS | 4.x |
| Components | shadcn/ui | latest |
| Forms | React Hook Form + Zod | latest |
| Animations | Framer Motion | latest |
| Server State | TanStack Query | latest |
| Client State | Zustand | latest |
| Validation | Zod | latest |

## Secondary Stack (Desktop)

| Layer | Technology |
|-------|-----------|
| Desktop Framework | Electron |
| Desktop State | Zustand |
| IPC | Electron IPC (typed) |

## Python Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Python 3.12+ |
| API | FastAPI |
| Validation | Pydantic v2 |
| Testing | pytest |

## Rules

### Dependencies
- Lock versions in package.json — no `^` or `~`
- Audit dependencies before adding — prefer maintained packages
- Minimize bundle size — verify tree-shaking
- No abandoned packages (last commit > 1 year = investigate)

### TypeScript Config
- `strict: true` always
- `noUncheckedIndexedAccess: true`
- `noImplicitReturns: true`
- Path aliases: `@/` maps to `src/`

### ESLint Config
- Use `eslint-config-next` as base
- Add `@typescript-eslint` rules
- No unused imports, no console.log in production code
- Import order: built-in → external → internal → relative

### Build
- Build must pass with zero warnings
- Bundle analyzer for production builds
- Lazy load non-critical routes
