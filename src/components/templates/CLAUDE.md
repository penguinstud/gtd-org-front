# Template Components

## Overview
Templates are page-level components that provide consistent structure and layout for the application. They define the overall page skeleton, combining organisms to create complete page layouts while remaining content-agnostic.

## Key Files
- `PageLayout.tsx` - Main application layout wrapper
- `index.ts` - Central export for all templates

## Component Specifications

### PageLayout Component
- **Purpose**: Consistent content structure across all pages (without navigation)
- **Composition**: Main content area + optional sidebar + responsive container
- **Props**: `children`, `title`, `actions`, `variant`, `currentPath`
- **Features**: Content layout, page headers, sidebar support
- **Note**: Navigation (PremiumTopNav) is rendered globally in `_app.tsx`
```typescript
<PageLayout title="Dashboard" variant="sidebar" currentPath="/dashboard">
  <Dashboard />
</PageLayout>
```

## Layout Architecture

### Standard Page Structure
```typescript
// Navigation is rendered in _app.tsx
export const PageLayout = ({ children, title, actions }) => (
  <div className="bg-workspace">
    <main className="max-w-7xl mx-auto p-6">
      <PageHeader title={title} actions={actions} />
      {children}
    </main>
  </div>
)
```

### Responsive Grid System
- **Desktop**: 12-column grid with sidebar
- **Tablet**: 8-column grid, collapsible sidebar
- **Mobile**: Single column, bottom navigation

## Layout Patterns

### 1. Dashboard Layout
```typescript
// Full-width dashboard with widget grid
<PageLayout variant="dashboard">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Dashboard widgets */}
  </div>
</PageLayout>
```

### 2. Form Layout
```typescript
// Centered form with constrained width
<PageLayout variant="form">
  <div className="max-w-2xl mx-auto">
    {/* Form content */}
  </div>
</PageLayout>
```

### 3. List Layout
```typescript
// Sidebar + content pattern
<PageLayout variant="list">
  <div className="flex gap-6">
    <aside className="w-64">{/* Filters */}</aside>
    <div className="flex-1">{/* List content */}</div>
  </div>
</PageLayout>
```

## Common Features

### SEO & Metadata
- Dynamic page titles
- Meta descriptions
- Open Graph tags
- Structured data

### Loading States
```typescript
<PageLayout loading={isLoading}>
  {isLoading ? <LoadingState /> : <Content />}
</PageLayout>
```

### Error Boundaries
```typescript
<PageLayout>
  <ErrorBoundary fallback={<ErrorState />}>
    <RiskyComponent />
  </ErrorBoundary>
</PageLayout>
```

## Styling System

### Design Tokens
- `bg-workspace`: #f6f7fb (light gray background)
- `bg-header`: #323338 (dark header)
- `container`: Responsive width constraints
- `spacing`: Consistent padding scale

### Container Breakpoints
```css
/* Tailwind container configuration */
.container {
  @apply mx-auto px-4;
  max-width: 100%;
  
  @screen sm { max-width: 640px; }
  @screen md { max-width: 768px; }
  @screen lg { max-width: 1024px; }
  @screen xl { max-width: 1280px; }
}
```

## Creating New Templates

### Template Checklist
1. Define layout structure
2. Set up responsive behavior
3. Configure SEO defaults
4. Handle loading/error states
5. Export from `templates/index.ts`

### Example: Split View Template
```typescript
export const SplitViewLayout = ({ left, right, title }) => (
  <PageLayout title={title}>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="overflow-auto">{left}</div>
      <div className="overflow-auto">{right}</div>
    </div>
  </PageLayout>
)
```

## Performance Considerations
- Minimize layout shifts (CLS)
- Optimize for Core Web Vitals
- Use CSS Grid for complex layouts
- Implement proper loading skeletons

## Accessibility Guidelines
- Skip navigation links
- Landmark regions (header, main, nav)
- Focus management on route changes
- Responsive font sizing

## Future Templates (Planned)
- `SplitViewLayout` - Side-by-side content
- `WizardLayout` - Multi-step processes
- `FullscreenLayout` - Distraction-free mode
- `PrintLayout` - Print-optimized styling
- `MobileLayout` - Mobile-specific UI

## Testing Templates
```typescript
describe('PageLayout', () => {
  it('renders navigation and content', () => {
    render(
      <PageLayout title="Test">
        <div>Content</div>
      </PageLayout>
    )
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})
```

## Dependencies
- **Next.js**: Head component for SEO
- **Organisms**: PremiumTopNav
- **Utils**: cn for class merging
- **Styles**: Global CSS and design tokens

## Related Modules
- **Parent**: [`components/CLAUDE.md`](../CLAUDE.md) - Component overview
- **Organisms**: [`organisms/CLAUDE.md`](../organisms/CLAUDE.md) - Complex sections
- **Pages**: [`pages/CLAUDE.md`](../../pages/CLAUDE.md) - Route implementations
- **Styles**: [`styles/globals.css`](../../styles/globals.css) - Global styles