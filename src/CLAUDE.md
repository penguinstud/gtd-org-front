# Source Code Architecture

## Overview
The main application source code directory containing all React components, business logic, API routes, and utilities. Organized using feature-based architecture with atomic design principles for the UI layer.

## Directory Structure
```
src/
├── components/    → UI components using atomic design
├── lib/          → Shared libraries and business logic
├── pages/        → Next.js pages and API routes
└── styles/       → Global styles and design tokens
```

## Key Files
- `pages/_app.tsx` - Next.js application wrapper with global providers
- `pages/index.tsx` - Application entry point (redirects to dashboard)
- `styles/globals.css` - Global styles and Tailwind imports
- `styles/design-tokens.css` - CSS variables for theming

## Architecture Patterns

### 1. Component Organization (Atomic Design)
- **Atoms**: Basic UI building blocks ([`components/atoms/`](components/atoms/CLAUDE.md))
- **Molecules**: Composite components ([`components/molecules/`](components/molecules/CLAUDE.md))
- **Organisms**: Complex features ([`components/organisms/`](components/organisms/CLAUDE.md))
- **Templates**: Page layouts ([`components/templates/`](components/templates/CLAUDE.md))

### 2. State Management
- **Global State**: Zustand stores in [`lib/stores/`](lib/stores/CLAUDE.md)
- **Context Isolation**: Separate work/home task stores
- **Persistence**: Local storage sync for offline capability

### 3. API Layer
- **Routes**: Next.js API routes in [`pages/api/`](pages/api/CLAUDE.md)
- **Security**: Middleware wrappers for validation and rate limiting
- **File Operations**: Safe org-mode file reading/writing

## Dependencies
- **React 18**: UI framework with concurrent features
- **Next.js 14**: Full-stack React framework
- **TypeScript**: Type safety throughout
- **Tailwind CSS**: Utility-first styling
- **Zustand**: Lightweight state management
- **Lucide React**: Icon library

## Common Development Tasks

### Creating a New Page
1. Add file to `pages/` directory
2. Import and use `PageLayout` template
3. Connect to appropriate store hooks
4. Follow routing conventions

### Adding Business Logic
1. Create module in `lib/` directory
2. Export from `lib/index.ts`
3. Add TypeScript types to `lib/types.ts`
4. Document in module's CLAUDE.md

### Implementing Security
1. Use validation functions from `lib/security/`
2. Apply `withSecurity` middleware to API routes
3. Sanitize all user inputs
4. Follow path validation patterns

## Type System
- **Strict Mode**: TypeScript configured for maximum safety
- **Shared Types**: Centralized in `lib/types.ts`
- **Component Props**: Strongly typed with interfaces
- **API Contracts**: Type-safe request/response handling

## Performance Considerations
- **Code Splitting**: Automatic with Next.js routing
- **Lazy Loading**: Dynamic imports for heavy components
- **Bundle Optimization**: Tree shaking enabled
- **CSS Optimization**: Tailwind purge in production

## Testing Strategy
- **Unit Tests**: Component and utility testing
- **Integration**: API route testing
- **Fixtures**: Test data in `tests/fixtures/`
- **Coverage**: Minimum 80% target

## Related Modules
- **Parent**: [`/CLAUDE.md`](../CLAUDE.md) - Project overview
- **Components**: [`components/CLAUDE.md`](components/CLAUDE.md) - UI layer
- **Libraries**: [`lib/CLAUDE.md`](lib/CLAUDE.md) - Business logic
- **Pages**: [`pages/CLAUDE.md`](pages/CLAUDE.md) - Routing