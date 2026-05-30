# Architecture Rules

## Default Architecture

New projects start with this architecture unless specified otherwise:

```
src/
├── app/            # Next.js App Router pages
├── components/
│   ├── ui/         # shadcn/ui primitives (generated)
│   ├── shared/     # Reusable components across pages
│   └── layout/     # Layout components (header, sidebar, footer)
├── hooks/          # Custom React hooks
├── lib/
│   ├── api/        # API client, fetch wrappers, types
│   ├── db/         # Database client, queries, migrations
│   ├── auth/       # Authentication logic
│   └── utils/      # Pure utility functions
├── stores/         # Zustand stores
├── types/          # Shared TypeScript types/interfaces
└── styles/         # Global styles, CSS variables
```

## Architecture Rules

### Separation of Concerns
- Components render UI, hooks manage logic, lib provides services
- No business logic in components — extract to hooks or lib
- No API calls directly from components — use hooks or services
- No direct DOM manipulation — use React refs and state

### Module Boundaries
- Each directory is a module with clear responsibility
- Imports flow downward: pages → components → hooks → lib
- No upward imports (lib must not import components)
- No circular dependencies — detect with ESLint import rules

### State Management
- Server state: React Query / TanStack Query
- Client state: Zustand
- URL state: Next.js searchParams / useSearchParams
- Form state: React Hook Form + Zod validation
- No prop drilling beyond 2 levels — lift to context or store

### Data Flow
- Unidirectional: User Action → Event Handler → State Update → Re-render
- Server data: cached by React Query, invalidated on mutation
- Optimistic updates where UX benefits

### File Size Limits
- Components: max 300 lines
- Hooks: max 200 lines
- Utility files: max 500 lines
- Break apart at these thresholds

### Naming Conventions
- Components: PascalCase, filename matches component name
- Hooks: camelCase, prefixed with `use`
- Utilities: camelCase, descriptive verb names
- Types: PascalCase, suffixed with role (Props, Response, Input)
- Files: kebab-case for non-component files
