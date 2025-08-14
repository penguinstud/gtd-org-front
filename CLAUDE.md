# GTD Org Front - AI Development Guide

## Project Overview
A modern, local-first productivity application inspired by premium SaaS tools (Linear, Monday.com, Notion) that combines visual appeal with org-mode file power. Built with Next.js, TypeScript, and containerized for easy deployment.

## Quick Start
- **Development**: `docker-compose up` or `npm run dev`
- **Build**: `docker build -t gtd-org-front .`
- **Test**: `npm test`

## Architecture Summary
- **Frontend**: Next.js with React 18 + TypeScript
- **Styling**: Tailwind CSS with atomic design system
- **State**: Zustand stores with context isolation (work/home)
- **Backend**: Next.js API routes with security middleware
- **Data**: Local org-mode files (no database)
- **Security**: Comprehensive validation, rate limiting, container hardening

## Directory Structure
```
gtd-org-front/
├── src/                    → Application source code
│   ├── components/         → UI components (atomic design)
│   ├── lib/               → Business logic & utilities
│   └── pages/             → Next.js pages & API routes
├── docs/                  → Technical documentation
├── org-files/             → User data (work/home contexts)
├── scripts/               → Automation & deployment tools
└── tests/                 → Test suites & fixtures
```

## Module Documentation
Each directory contains its own CLAUDE.md file with detailed information:

### Core Application
- [`src/CLAUDE.md`](src/CLAUDE.md) - Main application architecture
- [`src/components/CLAUDE.md`](src/components/CLAUDE.md) - UI component system
- [`src/lib/CLAUDE.md`](src/lib/CLAUDE.md) - Shared utilities & stores
- [`src/pages/CLAUDE.md`](src/pages/CLAUDE.md) - Routing & API endpoints

### Supporting Systems
- [`docs/CLAUDE.md`](docs/CLAUDE.md) - Documentation index
- [`scripts/CLAUDE.md`](scripts/CLAUDE.md) - Build & deployment tools
- [`org-files/CLAUDE.md`](org-files/CLAUDE.md) - Data structure & formats

## Key Features
1. **Context Isolation**: Separate work/home task management
2. **Real-time Sync**: File watcher for org-mode changes
3. **Premium UI**: Monday.com-inspired design system
4. **Local-First**: No cloud dependencies, complete privacy
5. **Security-First**: Path validation, rate limiting, CSP headers

## Recent Architecture Improvements (January 2025)
1. **Navigation Refactoring**: PremiumTopNav now renders exclusively in `_app.tsx`, eliminating duplicate rendering
2. **Component Simplification**: PageLayout focuses solely on content layout without navigation concerns
3. **Identified Modularization Opportunities**:
   - Form input components for consistent styling
   - Unified task item components across pages
   - Specialized modal components for common operations
   - Filter and sort control components

## Common Development Tasks

### Adding a New Component
1. Choose appropriate atomic level (atom/molecule/organism/template)
2. Create component in `src/components/{level}/`
3. Export from `src/components/{level}/index.ts`
4. Document in level's CLAUDE.md file

### Creating an API Endpoint
1. Add handler to `src/pages/api/`
2. Apply security middleware (`withSecurity`)
3. Implement rate limiting if needed
4. Document in `src/pages/api/CLAUDE.md`

### Modifying State Management
1. Identify context (work/home) or global (app)
2. Update appropriate store in `src/lib/stores/`
3. Use store hooks in components
4. Document changes in `src/lib/stores/CLAUDE.md`

## Technology Stack
- **Framework**: Next.js 14+ (React 18)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + CVA
- **State**: Zustand with persistence
- **Validation**: Zod schemas
- **Testing**: Jest + React Testing Library
- **Container**: Docker with security hardening

## Design Patterns
- **Atomic Design**: Component organization
- **Feature-Based**: Business logic modules
- **Repository Pattern**: File operations
- **Middleware Pattern**: Security & validation
- **Observer Pattern**: File watching

## Security Considerations
- Input validation on all API endpoints
- Path traversal protection
- Rate limiting per IP
- Container runs as non-root user
- CSP headers prevent XSS
- Read-only application mounts

## Performance Guidelines
- Lazy load heavy components
- Use React.memo for expensive renders
- Implement virtual scrolling for long lists
- Optimize bundle with code splitting
- Cache org-mode parsing results

## Related Documentation
- [Architecture Requirements](ARCHITECTURE-REQUIREMENTS.md)
- [Security Architecture](docs/SECURITY-ARCHITECTURE.md)
- [Frontend Style Guide](FRONTEND_STYLE_GUIDE.md)
- [Feature Development Plan](FEATURE_DEVELOPMENT_PLAN.md)