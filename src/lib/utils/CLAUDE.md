# Utility Functions & Helpers

## Overview
The utils directory contains shared utility functions, helper methods, and common operations used throughout the application. These utilities promote code reuse, maintain consistency, and simplify complex operations.

## Key Files
- `orgParser.ts` - Org-mode file parsing and task extraction
- `cn.ts` - Class name merging utility for Tailwind
- `logger.ts` - Centralized logging with levels and formatting
- `fileWatcher.ts` - File system monitoring for real-time updates
- `badgeVariants.ts` - Badge styling configuration
- `lazyImports.ts` - Dynamic import utilities

## Utility Specifications

### Org Parser (`orgParser.ts`)
- **Purpose**: Parse org-mode file content into structured data
- **Features**: Task extraction, metadata parsing, hierarchy handling
- **Main Function**: `parseOrgContent(content: string, filePath: string)`
```typescript
const parsed = parseOrgContent(orgFileContent, '/path/to/file.org')
// Returns: ParseResult with tasks, metadata, and structure
```

### Class Name Utility (`cn.ts`)
- **Purpose**: Merge Tailwind classes with proper precedence
- **Dependencies**: `clsx`, `tailwind-merge`
- **Usage**: Combine conditional classes safely
```typescript
cn('base-class', isActive && 'active-class', className)
// Handles conflicts and duplicates intelligently
```

### Logger (`logger.ts`)
- **Purpose**: Consistent logging across the application
- **Levels**: `debug`, `info`, `warn`, `error`
- **Features**: Timestamps, color coding, environment awareness
```typescript
logger.info('Task created', { taskId, context })
logger.error('Failed to parse org file', error)
```

### File Watcher (`fileWatcher.ts`)
- **Purpose**: Monitor org files for changes
- **Integration**: Triggers store updates on file modifications
- **Events**: `add`, `change`, `unlink`
```typescript
watchOrgFiles((event, path) => {
  if (event === 'change') {
    store.syncData()
  }
})
```

### Badge Variants (`badgeVariants.ts`)
- **Purpose**: Consistent badge styling configuration
- **Variants**: Status colors, sizes, styles
- **Integration**: Used by Badge component
```typescript
export const badgeVariants = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800'
}
```

## Common Patterns

### Error Handling
```typescript
export function safeParseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch (error) {
    logger.warn('JSON parse failed', { error, json })
    return fallback
  }
}
```

### Date Utilities
```typescript
export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function isOverdue(date: Date | string): boolean {
  return new Date(date) < new Date()
}
```

### String Manipulation
```typescript
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return `${str.slice(0, length)}...`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}
```

## Testing Utilities

### Test Setup
```typescript
// Test utilities for common scenarios
export const createMockTask = (overrides?: Partial<Task>): Task => ({
  id: 'test-id',
  title: 'Test Task',
  status: 'TODO',
  context: 'work',
  ...overrides
})
```

### Assertions
```typescript
// Custom test matchers
expect.extend({
  toBeValidOrgFile(received) {
    const pass = isValidOrgFormat(received)
    return {
      pass,
      message: () => `Expected ${received} to be valid org format`
    }
  }
})
```

## Performance Helpers

### Debounce
```typescript
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
```

### Memoization
```typescript
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map()
  return ((...args) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}
```

## Async Utilities

### Retry Logic
```typescript
export async function retry<T>(
  fn: () => Promise<T>,
  options = { attempts: 3, delay: 1000 }
): Promise<T> {
  for (let i = 0; i < options.attempts; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === options.attempts - 1) throw error
      await sleep(options.delay)
    }
  }
  throw new Error('Retry failed')
}
```

### Concurrent Operations
```typescript
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize = 5
): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(processor))
    results.push(...batchResults)
  }
  return results
}
```

## Type Guards
```typescript
export function isTask(obj: unknown): obj is Task {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'status' in obj
  )
}

export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj
}
```

## Best Practices
1. **Pure Functions**: Keep utilities side-effect free
2. **Type Safety**: Always provide TypeScript types
3. **Error Handling**: Graceful degradation
4. **Documentation**: Clear examples in JSDoc
5. **Testing**: Unit test all utilities

## Future Utilities (Planned)
- `validation.ts` - Zod schema utilities
- `crypto.ts` - Encryption/hashing helpers
- `cache.ts` - Local caching strategies
- `formatters.ts` - Data formatting functions

## Dependencies
- **date-fns**: Date manipulation
- **clsx**: Class name construction
- **tailwind-merge**: Tailwind class merging

## Related Modules
- **Parent**: [`lib/CLAUDE.md`](../CLAUDE.md) - Library overview
- **Components**: [`components/CLAUDE.md`](../../components/CLAUDE.md) - UI usage
- **Security**: [`security/CLAUDE.md`](../security/CLAUDE.md) - Validation utilities
- **Stores**: [`stores/CLAUDE.md`](../stores/CLAUDE.md) - State integration