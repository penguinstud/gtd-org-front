# Molecular Components

## Overview
Molecules are relatively simple groups of UI elements functioning together as a unit. They combine atoms to create more complex, reusable components that serve specific interface needs while remaining focused and composable.

## Key Files
- `Card.tsx` - Container component with shadow and padding
- `Modal.tsx` - Overlay dialog for focused interactions
- `KpiCard.tsx` - Key Performance Indicator display card
- `index.ts` - Central export for all molecules

## Component Specifications

### Card Component
- **Purpose**: Consistent container for content sections
- **Composition**: Base container with standardized styling
- **Props**: `children`, `className`, `padding`, `shadow`
- **Usage**: Dashboard widgets, content sections, list items
```typescript
<Card className="p-6">
  <h3>Task Overview</h3>
  <p>5 tasks completed today</p>
</Card>
```

### Modal Component
- **Purpose**: Overlay for focused user interactions
- **Composition**: Backdrop, container, close button
- **Props**: `isOpen`, `onClose`, `title`, `children`, `size`
- **Features**: Focus trap, ESC key handling, click-outside
```typescript
<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Edit Task">
  <TaskForm />
</Modal>
```

### KpiCard Component
- **Purpose**: Display metrics with visual emphasis
- **Composition**: Card + icon + value + label + trend
- **Props**: `title`, `value`, `trend`, `icon`, `color`
- **Usage**: Dashboard metrics, statistics display
```typescript
<KpiCard 
  title="Tasks Completed"
  value={42}
  trend="+12%"
  icon={CheckCircle}
  color="success"
/>
```

## Composition Patterns

### Combining Atoms
```typescript
// Example: Card with Badge
import { Badge } from '../atoms'

export const TaskCard = ({ task }) => (
  <Card>
    <div className="flex justify-between">
      <h4>{task.title}</h4>
      <Badge variant={task.status}>{task.status}</Badge>
    </div>
  </Card>
)
```

### State Management
- **Local State**: Modal open/close, hover effects
- **Props Drilling**: Pass data from parent components
- **Store Integration**: Connect to Zustand for complex state

## Styling Guidelines
1. **Consistent Spacing**: Use Tailwind spacing scale
2. **Shadow Hierarchy**: Light shadows for cards, stronger for modals
3. **Responsive Design**: Mobile-first approach
4. **Animation**: Subtle transitions for better UX

## Common Tasks

### Creating a New Molecule
1. Identify atoms to compose
2. Create file in `molecules/` directory
3. Define clear prop interface
4. Implement with composition in mind
5. Export from `molecules/index.ts`

### Testing Molecules
```typescript
describe('Modal', () => {
  it('closes on escape key', () => {
    const onClose = jest.fn()
    render(<Modal isOpen={true} onClose={onClose}>Content</Modal>)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
```

## Accessibility Considerations
- **Modal**: Focus management, ARIA attributes
- **Card**: Semantic structure, heading hierarchy
- **KpiCard**: Screen reader friendly value descriptions
- **Keyboard**: Full keyboard navigation support

## Performance Tips
- Use React.memo for frequently re-rendered molecules
- Lazy load modal content when closed
- Optimize animations with CSS transforms
- Debounce interactive state changes

## Form Components (Implemented)
- `FormInput` - Reusable text input with consistent styling
- `FormSelect` - Dropdown select with consistent styling  
- `FormTextarea` - Textarea with consistent styling
- All form components support labels, errors, and fullWidth prop

## Future Molecules (Planned)
- `Dropdown` - Advanced menu with options
- `SearchBar` - Input + Icon + Clear button
- `Notification` - Alert/toast component
- `DataTable` - Table with sorting/filtering

## Dependencies
- **Atoms**: Button, Badge components
- **React**: Component framework
- **Tailwind**: Styling utilities
- **Lucide**: Icon components

## Related Modules
- **Parent**: [`components/CLAUDE.md`](../CLAUDE.md) - Component overview
- **Atoms**: [`atoms/CLAUDE.md`](../atoms/CLAUDE.md) - Basic building blocks
- **Organisms**: [`organisms/CLAUDE.md`](../organisms/CLAUDE.md) - Complex features
- **Utils**: [`lib/utils/CLAUDE.md`](../../lib/utils/CLAUDE.md) - Helper functions