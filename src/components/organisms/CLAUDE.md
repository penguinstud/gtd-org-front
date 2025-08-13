# Organism Components

## Overview
Organisms are complex UI components that form distinct sections of an interface. They combine multiple molecules and atoms to create feature-complete, standalone sections that handle business logic and state management.

## Key Files
- `Dashboard.tsx` - Main dashboard with KPIs and task overview
- `PremiumTopNav.tsx` - Premium navigation bar with context switching
- `EnhancedNavigation.tsx` - Feature-rich navigation component
- `index.ts` - Central export for all organisms

## Component Specifications

### Dashboard Component
- **Purpose**: Central hub displaying task metrics and summaries
- **Composition**: Multiple KpiCards, task lists, charts
- **State**: Connected to context stores (work/home)
- **Features**: Real-time updates, context-aware data
```typescript
<Dashboard context="work" />
// Displays work-specific metrics and tasks
```

### PremiumTopNav Component
- **Purpose**: Application-wide navigation and context switching
- **Composition**: Logo, nav links, context switcher, user menu
- **State**: Current context, navigation state
- **Features**: Glassmorphic design, dropdown menus
```typescript
<PremiumTopNav 
  currentContext={context}
  onContextSwitch={handleContextSwitch}
/>
```

### EnhancedNavigation Component
- **Purpose**: Advanced navigation with search and filtering
- **Composition**: Navigation items, search bar, filters
- **State**: Active route, search query, filter state
- **Features**: Dynamic routing, real-time search
```typescript
<EnhancedNavigation
  items={navItems}
  activeRoute={currentPath}
/>
```

## Architecture Patterns

### State Management Integration
```typescript
// Example: Dashboard connected to stores
import { useWorkStore, useHomeStore } from '../../lib/stores'

export const Dashboard = ({ context }) => {
  const store = context === 'work' ? useWorkStore() : useHomeStore()
  const { tasks, getTaskStats } = store
  
  return (
    <div className="dashboard-grid">
      <KpiSection stats={getTaskStats()} />
      <TaskList tasks={tasks} />
    </div>
  )
}
```

### Business Logic
- **Data Fetching**: API calls through custom hooks
- **State Updates**: Direct store mutations
- **Side Effects**: useEffect for subscriptions
- **Performance**: Memoization for expensive operations

## Styling Approach
1. **Grid Layouts**: CSS Grid for dashboard layouts
2. **Responsive Design**: Breakpoint-specific arrangements
3. **Theme Integration**: Design tokens for consistency
4. **Animation**: Framer Motion for complex transitions

## Common Tasks

### Creating a New Organism
1. Plan component architecture and data flow
2. Create file in `organisms/` directory
3. Connect to relevant stores/contexts
4. Compose from existing molecules/atoms
5. Export from `organisms/index.ts`

### Testing Organisms
```typescript
describe('Dashboard', () => {
  it('displays correct metrics for context', () => {
    const { getByText } = render(<Dashboard context="work" />)
    expect(getByText('Work Tasks')).toBeInTheDocument()
  })
  
  it('updates when store changes', async () => {
    // Test store integration and reactivity
  })
})
```

## Performance Optimization
- **Code Splitting**: Dynamic imports for heavy organisms
- **Virtualization**: For long lists in dashboard
- **Memoization**: useMemo for computed values
- **Lazy Loading**: Defer non-critical sections

## Accessibility Features
- **Landmarks**: Proper ARIA regions
- **Live Regions**: Announce dynamic updates
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Descriptive labels and states

## Data Flow Patterns
```typescript
// Unidirectional data flow
Store → Organism → Molecules → Atoms
         ↓
      Actions → Store Updates
```

## Future Organisms (Planned)
- `TaskBoard` - Kanban-style task management
- `CalendarView` - Time-based task visualization
- `ProjectOverview` - Project details and progress
- `SettingsPanel` - Application configuration UI
- `ReportingDashboard` - Analytics and insights

## Dependencies
- **Stores**: Zustand state management
- **Molecules**: Card, Modal, KpiCard
- **Atoms**: Button, Badge components
- **Utils**: Data formatting, API helpers
- **Types**: TypeScript interfaces

## Integration Points
- **API Routes**: `/api/files/*` for data
- **File Watcher**: Real-time org file updates
- **Context System**: Work/Home separation
- **Routing**: Next.js page navigation

## Related Modules
- **Parent**: [`components/CLAUDE.md`](../CLAUDE.md) - Component overview
- **Templates**: [`templates/CLAUDE.md`](../templates/CLAUDE.md) - Page layouts
- **Stores**: [`lib/stores/CLAUDE.md`](../../lib/stores/CLAUDE.md) - State management
- **Pages**: [`pages/CLAUDE.md`](../../pages/CLAUDE.md) - Route integration