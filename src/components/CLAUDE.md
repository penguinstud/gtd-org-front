# UI Component System

## Overview
The component library implementing atomic design methodology for building consistent, reusable UI elements. Components are organized by complexity level, promoting composition and reusability throughout the application.

## Atomic Design Hierarchy
```
components/
├── atoms/        → Basic building blocks
├── molecules/    → Simple component groups
├── organisms/    → Complex UI features
├── templates/    → Page layout structures
└── common/       → Shared utilities (loading, error states)
```

## Key Files
- `index.ts` - Central export hub for all components
- `common/LoadingState.tsx` - Standardized loading indicator
- `common/ErrorState.tsx` - Consistent error display

## Component Categories

### Atoms (Basic Elements)
- **Purpose**: Indivisible UI elements
- **Examples**: [`Button`](atoms/Button.tsx), [`Badge`](atoms/Badge.tsx)
- **Characteristics**: No internal state, pure presentation
- **Documentation**: [`atoms/CLAUDE.md`](atoms/CLAUDE.md)

### Molecules (Simple Composites)
- **Purpose**: Groups of atoms functioning together
- **Examples**: [`Card`](molecules/Card.tsx), [`Modal`](molecules/Modal.tsx), [`KpiCard`](molecules/KpiCard.tsx)
- **Characteristics**: May have minimal state, composed of atoms
- **Documentation**: [`molecules/CLAUDE.md`](molecules/CLAUDE.md)

### Organisms (Complex Features)
- **Purpose**: Complete sections of UI
- **Examples**: [`Dashboard`](organisms/Dashboard.tsx), [`PremiumTopNav`](organisms/PremiumTopNav.tsx)
- **Characteristics**: Business logic, state management, feature-complete
- **Documentation**: [`organisms/CLAUDE.md`](organisms/CLAUDE.md)

### Templates (Page Layouts)
- **Purpose**: Page-level component structures
- **Examples**: [`PageLayout`](templates/PageLayout.tsx)
- **Characteristics**: Layout logic, consistent page structure
- **Documentation**: [`templates/CLAUDE.md`](templates/CLAUDE.md)

## Design System Integration

### Styling Approach
- **Tailwind CSS**: Utility-first styling
- **CVA (Class Variance Authority)**: Component variants
- **Design Tokens**: Consistent theming via CSS variables

### Component Patterns
```typescript
// Standard component structure
interface ComponentProps {
  className?: string
  children?: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export const Component: React.FC<ComponentProps> = ({ 
  className, 
  children, 
  variant = 'primary' 
}) => {
  return (
    <div className={cn(baseStyles, variantStyles[variant], className)}>
      {children}
    </div>
  )
}
```

## Common Development Tasks

### Creating a New Component
1. Determine atomic level (atom/molecule/organism/template)
2. Create file in appropriate directory
3. Export from level's `index.ts`
4. Add to main `components/index.ts`
5. Document in level's CLAUDE.md

### Using Class Variance Authority
```typescript
import { cva } from 'class-variance-authority'

const buttonVariants = cva('base-classes', {
  variants: {
    variant: {
      primary: 'primary-classes',
      secondary: 'secondary-classes'
    }
  }
})
```

### Component Composition
```typescript
// Compose molecules from atoms
import { Button, Badge } from '../atoms'

export const CardHeader = ({ title, count }) => (
  <div className="flex justify-between">
    <h3>{title}</h3>
    <Badge>{count}</Badge>
  </div>
)
```

## Performance Guidelines
- Use `React.memo` for expensive renders
- Implement proper key props in lists
- Lazy load heavy organisms
- Keep atoms pure and stateless

## Testing Approach
- **Atoms**: Snapshot tests for visual regression
- **Molecules**: Unit tests for interactions
- **Organisms**: Integration tests with state
- **Templates**: Layout and responsiveness tests

## Accessibility Standards
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management in modals
- Semantic HTML structure

## Related Modules
- **Parent**: [`src/CLAUDE.md`](../CLAUDE.md) - Source architecture
- **Stores**: [`lib/stores/CLAUDE.md`](../lib/stores/CLAUDE.md) - State hooks
- **Utils**: [`lib/utils/CLAUDE.md`](../lib/utils/CLAUDE.md) - Helper functions
- **Pages**: [`pages/CLAUDE.md`](../pages/CLAUDE.md) - Component usage