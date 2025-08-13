# Architecture Requirements - GTD Org Front

## Project Overview

Building a modern, local-first productivity application inspired by premium SaaS tools like Linear, Monday.com, and Notion. The application combines the visual appeal of modern productivity tools with the power of org-mode files, running entirely on the local machine.

## Core Requirements

### Visual Design System
- **Primary color**: #0073ea (Professional blue)
- **Header background**: #323338 (dark)
- **Workspace background**: #f6f7fb (light gray)
- **Typography**: System fonts, clean hierarchy, base 14px
- **Cards**: White background, rounded corners, drop shadow, hover elevation
- **Spacing**: Consistent margin & padding scale (Tailwind's spacing units)
- **Badges**: Pill-shaped with matching status colors
- **Navigation bar**: Glassmorphic premium style with dropdown menus
- **Charts & KPIs**: Always in card containers with consistent padding and title styling
- **Responsive behavior**: Desktop-first with mobile optimization

### Status Color System
- **Green**: Success/completed tasks
- **Yellow**: In-progress/waiting tasks
- **Red**: Blocked/canceled tasks
- **Purple**: Planning/someday tasks

### Core Application Pages

1. **Dashboard**
   - KPIs, charts, and grouped task cards
   - Rich dashboard with analytics
   - Context switching (Work/Home)

2. **Daily View**
   - Time-slot sections (9 AM to 9 PM)
   - Clear time-based task organization
   - Matches dashboard styling

3. **Inbox Page**
   - Task processing from inbox.org
   - Per-task actions:
     - Assign project
     - Refile to selected .org file
     - Set due date
     - Apply changes for individual tasks
     - Mark done or archive

4. **Projects View**
   - Tasks grouped by project
   - Overdue tasks highlighted at top
   - Filterable stats

5. **Tasks Page**
   - Comprehensive task management
   - Filtering and sorting capabilities

6. **Settings Page**
   - Org-mode configuration
   - File path management
   - User preferences

## Technical Architecture

### Frontend Structure (Feature-Based)

```
src/
├── components/           # Atomic Design System
│   ├── atoms/           # Button, Badge, Input, Icon
│   ├── molecules/       # TaskCard, KpiCard, SearchBar
│   ├── organisms/       # Navigation, Sidebar, TaskBoard
│   └── templates/       # PageLayout, DashboardLayout
├── features/            # Business Logic Modules
│   ├── dashboard/       # Dashboard-specific components & logic
│   ├── inbox/           # Inbox processing & actions
│   ├── daily/           # Time-slot planning interface
│   ├── projects/        # Project management views
│   └── settings/        # Configuration management
├── lib/                 # Shared Business Logic
│   ├── api/            # API layer & HTTP client
│   ├── stores/         # Zustand state management
│   ├── hooks/          # Custom React hooks
│   └── utils/          # Helper functions
├── pages/              # Next.js routing
└── types/              # TypeScript definitions
```

### Technology Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Meta Framework**: Next.js 14+ for SSR and routing
- **Styling**: Tailwind CSS with custom premium design system
- **State Management**: Zustand for lightweight client state
- **Data Parsing**: Custom org-mode parser (already implemented)
- **UI Components**: Radix UI for accessibility
- **Drag & Drop**: React DnD
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

### Backend Strategy (Local-First)

- **File System**: Direct org-mode file integration
- **API Layer**: Next.js API routes for file operations
- **No Database**: Org files serve as data storage
- **File Watching**: Optional real-time sync with chokidar
- **Context Separation**: Work and Home org directories

### Deployment Strategy

- **Docker**: Containerized deployment with docker-compose
- **File Mounting**: Org files directory mounted as volume
- **Local Server**: Lightweight local server setup
- **No Cloud Dependencies**: Completely offline-capable

## Architecture Principles

### DRY (Don't Repeat Yourself)
- Shared component library with atomic design
- Reusable business logic in custom hooks
- Type-safe interfaces throughout
- Consistent styling system

### Separation of Concerns
- Feature modules with clear boundaries
- Data layer separated from UI logic
- Component composition over inheritance
- Clear API contracts between layers

### Maintainability
- Feature-based folder structure
- TypeScript for type safety
- Comprehensive error handling
- Consistent naming conventions

### Performance
- Local-first architecture (no network dependencies)
- Lazy loading for large data sets
- Optimistic updates for better UX
- Minimal bundle size with code splitting

## Responsive Design Requirements

- **Desktop-first**: Primary development target
- **Tablet optimization**: Touch-friendly interactions
- **Mobile support**: Essential features accessible on mobile
- **Progressive enhancement**: Core functionality without JavaScript

## Accessibility Requirements

- **WCAG 2.1 AA compliance**
- **Keyboard navigation**: Full keyboard accessibility
- **Screen reader support**: Proper ARIA labels
- **Color contrast**: Minimum 4.5:1 ratio
- **Focus management**: Visible focus indicators

## File Integration Specifications

### Org-Mode File Structure
```
org-files/
├── work/
│   ├── projects.org
│   ├── tasks.org
│   └── meetings.org
└── home/
    ├── personal.org
    ├── finance.org
    ├── health.org
    └── learning.org
```

### Supported Org-Mode Features
- Headlines with TODO keywords (TODO, NEXT, WAITING, SOMEDAY, DONE, CANCELED)
- Priority levels ([#A], [#B], [#C])
- Tags and properties
- Scheduling and deadlines
- Property drawers
- Context detection (work/home)

## Development Workflow

### Docker Configuration
- **Development**: Hot reload with volume mounting
- **Production**: Optimized build with minimal footprint
- **Testing**: Isolated test environment
- **CI/CD**: Automated testing and deployment

### Code Quality
- **ESLint + Prettier**: Code formatting and linting
- **Husky**: Git hooks for quality gates
- **TypeScript**: Strict type checking
- **Testing**: Jest + React Testing Library

## Future Extensibility

### Plugin Architecture
- Modular feature system
- Custom org-mode parsers
- Theme customization
- Integration hooks

### Data Export/Import
- Backup and restore functionality
- Export to various formats
- Import from other productivity tools
- Sync with external services (optional)

## Implementation Plan - Approved

### Decision Summary
- **File Integration**: Real-time file system watcher with chokidar for responsive sync
- **Development Approach**: Infrastructure-first (Docker → Core → Features)
- **Architecture**: Feature-based modular structure with DRY principles
- **Priority**: Premium design consistency across all views

### Implementation Sequence
1. **Infrastructure Phase**: Docker setup with docker-compose
2. **Core Services**: File system watcher and real-time sync
3. **Architecture**: Restructure to feature-based modules
4. **Design System**: Atomic components (atoms → molecules → organisms → templates)
5. **Data Layer**: API routes, Zustand stores, org-mode integration
6. **Feature Development**: Dashboard → Daily → Inbox → Projects → Tasks → Settings
7. **Enhancement**: Navigation, drag-and-drop, responsive design
8. **Quality**: Error handling, testing, CI/CD

### Key Implementation Notes
- Start with Docker infrastructure for consistent development environment
- Real-time file watching ensures seamless org-mode integration
- Feature modules maintain clear separation of concerns
- Atomic design system ensures UI consistency and reusability
- Local-first architecture eliminates cloud dependencies

This architecture provides a solid foundation for building a premium, maintainable productivity application that scales with user needs while maintaining local-first principles.