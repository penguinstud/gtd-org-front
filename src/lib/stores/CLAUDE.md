# State Management (Zustand Stores)

## Overview
The stores directory contains Zustand-based state management for the application. It implements a context-aware architecture that separates work and home data while maintaining a global app state for shared settings and navigation.

## Store Architecture
```
stores/
├── appStore.ts         → Global application state
├── workStore.ts        → Work context tasks/data
├── homeStore.ts        → Home context tasks/data
├── contextStore.ts     → Context creation factory
├── taskStore.ts        → Task-specific utilities
├── base/               → Base store implementations
│   ├── BaseTaskStore.ts
│   └── StoreSelectors.ts
└── index.ts            → Aggregated exports
```

## Key Files
- `appStore.ts` - Global settings, current context, navigation state
- `contextStore.ts` - Factory for creating context-specific stores
- `workStore.ts` - Work tasks and related data
- `homeStore.ts` - Personal/home tasks and data

## Store Types

### App Store (Global)
```typescript
interface AppStore {
  // State
  currentContext: Context
  settings: AppSettings
  isLoading: boolean
  
  // Actions
  setCurrentContext: (context: Context) => void
  toggleContext: () => void
  updateSettings: (settings: Partial<AppSettings>) => void
  
  // Computed
  getActiveStore: () => BaseContextStore
}
```

### Context Stores (Work/Home)
```typescript
interface BaseContextStore {
  // State
  tasks: Task[]
  isLoading: boolean
  lastSync: Date | null
  
  // Actions
  addTask: (task: Omit<Task, 'id'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  syncData: () => Promise<void>
  
  // Selectors
  getOverdueTasks: () => Task[]
  getTodaysTasks: () => Task[]
  getTaskStats: () => ContextTaskStats
}
```

## State Management Patterns

### 1. Context Isolation
```typescript
// Separate stores for different contexts
const workStore = createContextStore('work')
const homeStore = createContextStore('home')

// Access current context dynamically
const { getActiveStore } = useAppStore()
const currentStore = getActiveStore()
```

### 2. Persistence
```typescript
// Automatic persistence to localStorage
persist(
  (set, get) => ({
    // Store implementation
  }),
  {
    name: 'app-storage',
    partialize: (state) => ({
      // Only persist specific fields
      currentContext: state.currentContext,
      settings: state.settings
    })
  }
)
```

### 3. Computed Values (Selectors)
```typescript
// Derive values from state
getOverdueTasks: () => {
  const now = new Date()
  return get().tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < now
  )
}
```

## Common Usage Patterns

### Using in Components
```typescript
// Global state
import { useAppStore } from '@/lib/stores'

function Navigation() {
  const { currentContext, toggleContext } = useAppStore()
  
  return (
    <button onClick={toggleContext}>
      Current: {currentContext}
    </button>
  )
}

// Context-specific state
import { useWorkStore } from '@/lib/stores'

function WorkDashboard() {
  const { tasks, getTodaysTasks } = useWorkStore()
  const todayTasks = getTodaysTasks()
  
  return <TaskList tasks={todayTasks} />
}
```

### Subscribing to Changes
```typescript
// Subscribe to specific state slices
useEffect(() => {
  const unsubscribe = useWorkStore.subscribe(
    (state) => state.tasks,
    (tasks) => {
      console.log('Tasks updated:', tasks)
    }
  )
  
  return unsubscribe
}, [])
```

### Async Actions
```typescript
syncData: async () => {
  set({ isLoading: true })
  
  try {
    const response = await fetch('/api/files/list?context=work')
    const data = await response.json()
    
    // Process and update state
    set({ 
      tasks: processTasks(data),
      lastSync: new Date(),
      isLoading: false
    })
  } catch (error) {
    set({ isLoading: false })
    // Handle error
  }
}
```

## Store Testing
```typescript
describe('AppStore', () => {
  beforeEach(() => {
    useAppStore.setState(initialState)
  })
  
  it('toggles context correctly', () => {
    const { toggleContext } = useAppStore.getState()
    
    expect(useAppStore.getState().currentContext).toBe('work')
    toggleContext()
    expect(useAppStore.getState().currentContext).toBe('home')
  })
})
```

## Performance Optimization

### Selective Subscriptions
```typescript
// Only re-render when specific fields change
const taskCount = useWorkStore(state => state.tasks.length)
const isLoading = useWorkStore(state => state.isLoading)
```

### Memoized Selectors
```typescript
const stats = useWorkStore(state => state.getTaskStats())
// getTaskStats is memoized internally
```

## Best Practices
1. **Keep stores focused** - One store per domain/context
2. **Use selectors** - Compute derived state instead of storing
3. **Immutable updates** - Always return new objects/arrays
4. **Type safety** - Leverage TypeScript for store interfaces
5. **Test actions** - Unit test store logic separately

## Advanced Patterns

### Store Composition
```typescript
// Combine multiple stores
const useComposedState = () => {
  const appState = useAppStore()
  const workState = useWorkStore()
  
  return {
    ...appState,
    workTasks: workState.tasks
  }
}
```

### Middleware
```typescript
// Add logging middleware
const log = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('Previous state:', get())
      set(...args)
      console.log('New state:', get())
    },
    get,
    api
  )
```

## Dependencies
- **Zustand**: Core state management
- **TypeScript**: Type definitions
- **React**: Hook integration

## Related Modules
- **Parent**: [`lib/CLAUDE.md`](../CLAUDE.md) - Library overview
- **Types**: [`lib/types.ts`](../types.ts) - Type definitions
- **Components**: [`components/CLAUDE.md`](../../components/CLAUDE.md) - UI integration
- **API**: [`pages/api/CLAUDE.md`](../../pages/api/CLAUDE.md) - Data fetching