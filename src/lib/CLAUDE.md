# Library Modules

## Overview
The lib directory contains all shared business logic, utilities, and application services. It serves as the central hub for non-UI code, providing reusable functionality across components and pages.

## Directory Structure
```
lib/
├── config/        → Application configuration
├── hooks/         → Custom React hooks
├── security/      → Security utilities and validation
├── stores/        → State management (Zustand)
├── utils/         → Utility functions and helpers
├── types.ts       → Shared TypeScript types
└── index.ts       → Central export point
```

## Key Files
- `types.ts` - Core TypeScript interfaces and types
- `index.ts` - Aggregated exports for clean imports
- `config/navigation.ts` - Navigation configuration

## Module Categories

### State Management (`stores/`)
- **Purpose**: Centralized application state using Zustand
- **Features**: Context isolation, persistence, real-time sync
- **Key Stores**: `appStore`, `workStore`, `homeStore`
- **Documentation**: [`stores/CLAUDE.md`](stores/CLAUDE.md)

### Security (`security/`)
- **Purpose**: Input validation, path security, rate limiting
- **Features**: Path traversal protection, sanitization
- **Key Modules**: `pathValidation`, `rateLimiting`
- **Documentation**: [`security/CLAUDE.md`](security/CLAUDE.md)

### Utilities (`utils/`)
- **Purpose**: Helper functions and common operations
- **Features**: Org parsing, file watching, styling helpers
- **Key Utils**: `orgParser`, `cn`, `logger`
- **Documentation**: [`utils/CLAUDE.md`](utils/CLAUDE.md)

### Custom Hooks (`hooks/`)
- **Purpose**: Reusable React logic patterns
- **Features**: Data fetching, state management, side effects
- **Examples**: `useTask`, `useOrgFile`, `useDebounce`

### Configuration (`config/`)
- **Purpose**: Centralized app configuration
- **Features**: Navigation items, feature flags, constants
- **Key Files**: `navigation.ts`

## Type System

### Core Types
```typescript
// Task management types
export interface Task {
  id: string
  title: string
  status: TaskStatus
  context: Context
  // ... other properties
}

// Context types
export type Context = 'work' | 'home'

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

## Import Patterns

### Clean Imports
```typescript
// Instead of deep imports
import { Task } from '../../lib/types'
import { useWorkStore } from '../../lib/stores/workStore'

// Use aggregated exports
import { Task, useWorkStore } from '@/lib'
```

### Barrel Exports
```typescript
// lib/index.ts
export * from './types'
export * from './stores'
export * from './utils'
export * from './hooks'
```

## Common Tasks

### Adding a New Utility
1. Create function in appropriate `utils/` file
2. Add TypeScript types
3. Export from `utils/index.ts`
4. Update main `lib/index.ts`
5. Document in `utils/CLAUDE.md`

### Creating a Custom Hook
```typescript
// lib/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debouncedValue
}
```

### Adding Store Module
1. Create store file in `stores/`
2. Define interface and initial state
3. Implement actions and selectors
4. Export hooks for components
5. Document in `stores/CLAUDE.md`

## Architecture Patterns

### Separation of Concerns
- **UI Logic**: Keep in components
- **Business Logic**: Place in lib modules
- **Data Fetching**: Use hooks or stores
- **Validation**: Centralize in security module

### Dependency Direction
```
Components → Lib → External APIs
     ↓         ↓
   Stores    Utils
```

## Testing Strategy
- **Unit Tests**: Pure functions in utils
- **Hook Tests**: Using @testing-library/react-hooks
- **Store Tests**: Action and selector testing
- **Integration**: API interaction testing

## Performance Guidelines
- Memoize expensive computations
- Use lazy imports for heavy modules
- Implement proper TypeScript types
- Avoid circular dependencies

## Security Considerations
- All user input passes through security module
- Path operations use validation helpers
- API responses are typed and validated
- Sensitive operations are logged

## Future Modules (Planned)
- `lib/api/` - API client abstraction
- `lib/workers/` - Web Worker utilities
- `lib/cache/` - Caching strategies
- `lib/validators/` - Zod schema validators

## Dependencies
- **Zustand**: State management
- **date-fns**: Date utilities
- **Zod**: Schema validation (planned)
- **React**: Hook dependencies

## Related Modules
- **Parent**: [`src/CLAUDE.md`](../CLAUDE.md) - Source overview
- **Components**: [`components/CLAUDE.md`](../components/CLAUDE.md) - UI usage
- **Pages**: [`pages/CLAUDE.md`](../pages/CLAUDE.md) - Route integration
- **API**: [`pages/api/CLAUDE.md`](../pages/api/CLAUDE.md) - Backend integration