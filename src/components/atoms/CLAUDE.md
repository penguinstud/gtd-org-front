# Atomic Components

## Overview
The foundational building blocks of the UI system. Atoms are the smallest functional units that cannot be broken down further while maintaining their purpose. They serve as the base for all higher-level components.

## Key Files
- `Button.tsx` - Primary interactive element with variants
- `Badge.tsx` - Status indicators and counters
- `index.ts` - Central export point for all atoms

## Component Specifications

### Button Component
- **Purpose**: Standardized interactive element
- **Variants**: Primary, secondary, ghost, danger
- **Props**: `onClick`, `disabled`, `loading`, `size`, `variant`
- **Usage**: Form submissions, actions, navigation
```typescript
<Button variant="primary" onClick={handleClick}>
  Save Changes
</Button>
```

### Badge Component
- **Purpose**: Display status, counts, or labels
- **Variants**: Default, success, warning, danger, info
- **Props**: `children`, `variant`, `size`
- **Usage**: Task counts, status indicators, tags
```typescript
<Badge variant="success">Completed</Badge>
<Badge variant="warning">3</Badge>
```

## Design Principles
1. **Single Responsibility**: Each atom has one clear purpose
2. **Composability**: Designed to work together in molecules
3. **Consistency**: Shared styling patterns via CVA
4. **Accessibility**: Proper ARIA attributes and keyboard support

## Styling Patterns
```typescript
// Using Class Variance Authority (CVA)
const atomVariants = cva(
  "base-classes", // Common styles
  {
    variants: {
      variant: {
        primary: "primary-styles",
        secondary: "secondary-styles"
      },
      size: {
        sm: "text-sm px-2 py-1",
        md: "text-base px-4 py-2",
        lg: "text-lg px-6 py-3"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
)
```

## Common Tasks

### Creating a New Atom
1. Create component file in `atoms/` directory
2. Define TypeScript interface for props
3. Implement with CVA for variants
4. Export from `atoms/index.ts`
5. Add usage examples here

### Testing Atoms
```typescript
// Example test structure
describe('Button', () => {
  it('renders with correct variant classes', () => {
    render(<Button variant="primary">Test</Button>)
    expect(screen.getByRole('button')).toHaveClass('primary-classes')
  })
})
```

## Performance Considerations
- Atoms are pure components (no internal state)
- Use React.memo only if parent re-renders frequently
- Keep atoms lightweight and focused
- Avoid complex logic in atoms

## Accessibility Requirements
- **Button**: Role, aria-label, keyboard navigation
- **Badge**: Semantic meaning via aria-label
- **Focus**: Visible focus indicators
- **Contrast**: WCAG AA compliant colors

## Future Atoms (Planned)
- `Input` - Form text input with validation states
- `Icon` - Standardized icon wrapper
- `Spinner` - Loading indicator
- `Checkbox` - Form checkbox element
- `Radio` - Form radio button

## Dependencies
- **React**: UI framework
- **CVA**: Variant management
- **Tailwind**: Utility classes
- **cn utility**: Class name merging

## Related Modules
- **Parent**: [`components/CLAUDE.md`](../CLAUDE.md) - Component system overview
- **Molecules**: [`molecules/CLAUDE.md`](../molecules/CLAUDE.md) - Composed components
- **Utils**: [`lib/utils/CLAUDE.md`](../../lib/utils/CLAUDE.md) - Helper functions