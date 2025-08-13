# GTD Org Front

A modern, Monday.com-inspired web application for managing GTD (Getting Things Done) workflows with Org-mode integration.

## Project Overview

This front-end application provides an intuitive, visual interface for managing GTD workflows that integrates with existing Org-mode productivity systems. The application features a Monday.com-style board interface with drag-and-drop functionality, real-time updates, and comprehensive task management capabilities.

## Key Features

### Core GTD Workflow Support
- **Inbox Management**: Quick capture and processing of incoming tasks
- **Context-Based Organization**: Work and Home productivity systems
- **Project Management**: Visual project boards with task dependencies
- **Review Workflows**: Weekly and daily review processes
- **Archive System**: Automatic archiving of completed tasks

### Monday.com-Inspired Interface
- **Board Views**: Kanban-style boards for projects and workflows
- **Custom Columns**: Configurable columns for different data types
- **Drag & Drop**: Intuitive task management and status updates
- **Timeline Views**: Gantt-style project timelines
- **Dashboard**: Comprehensive overview with widgets and analytics

### Org-mode Integration
- **Dual Environment Support**: Seamless switching between Work and Home contexts
- **File Synchronization**: Real-time sync with Org files
- **Metadata Preservation**: Maintains all Org-mode properties and relationships
- **Emacs Compatibility**: Full compatibility with existing Emacs workflows

## Target User Experience

### Monday.com Design Elements
- **Clean, Modern Interface**: Bright, colorful, and engaging design
- **Board-Centric Navigation**: Primary focus on visual project boards
- **Smart Automation**: Automated workflows and rule-based actions
- **Collaborative Features**: Team collaboration and communication tools
- **Mobile-Responsive**: Optimized for desktop, tablet, and mobile devices

### GTD-Specific Enhancements
- **Quick Capture**: Fast task entry with smart categorization
- **Context Switching**: Easy toggle between Work and Home environments
- **Review Prompts**: Guided weekly and daily review processes
- **Priority Management**: Visual priority indicators and sorting
- **Next Actions**: Clear focus on actionable items

## Technology Stack

### Frontend Framework
- **React 18+** with TypeScript for type safety
- **Next.js 14+** for SSR and routing
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations

### State Management & Data
- **Zustand** for lightweight state management
- **React Query/TanStack Query** for server state
- **Zod** for runtime type validation
- **Date-fns** for date manipulation

### UI Components
- **Radix UI** for accessible component primitives
- **React DnD** for drag-and-drop functionality
- **React Hook Form** for form management
- **Lucide React** for consistent iconography

### Development Tools
- **Vite** for fast development builds
- **ESLint + Prettier** for code quality
- **Husky** for git hooks
- **Conventional Commits** for semantic versioning

## Project Structure

```
gtd-org-front/
├── src/
│   ├── components/          # Atomic Design System
│   │   ├── atoms/          # Basic UI elements (Button, Badge, etc.)
│   │   ├── molecules/      # Simple component combinations (Card, etc.)
│   │   ├── organisms/      # Complex UI sections (Navigation, etc.)
│   │   ├── templates/      # Page layouts and structures
│   │   └── index.ts        # Centralized exports
│   ├── features/           # Feature-based modules
│   │   ├── dashboard/      # Dashboard functionality
│   │   ├── daily/          # Daily planning interface
│   │   ├── inbox/          # Inbox processing
│   │   ├── projects/       # Project management
│   │   ├── settings/       # Configuration
│   │   └── tasks/          # Task management
│   ├── lib/                # Shared business logic
│   │   ├── config/         # Application configuration
│   │   ├── hooks/          # Custom React hooks
│   │   ├── stores/         # Zustand state management
│   │   ├── types.ts        # TypeScript definitions
│   │   └── utils/          # Helper functions & utilities
│   ├── pages/              # Next.js pages and API routes
│   │   ├── api/            # Backend API endpoints
│   │   └── index.tsx       # Main application page
│   └── styles/             # Global styles and Tailwind config
├── docs/                   # Comprehensive documentation
├── org-files/              # Sample org-mode files
│   ├── work/               # Work context files
│   └── home/               # Home context files
├── tests/                  # Test files and fixtures
├── docker-compose.yml      # Container orchestration
├── Dockerfile              # Container configuration
└── server.js               # Development server
```

## Core Data Models

### Task Model
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'NEXT' | 'WAITING' | 'SOMEDAY' | 'DONE' | 'CANCELED';
  priority: 'A' | 'B' | 'C' | null;
  project?: string;
  context: 'work' | 'home';
  scheduled?: Date;
  deadline?: Date;
  effort?: number;
  tags: string[];
  properties: Record<string, any>;
  created: Date;
  modified: Date;
}
```

### Project Model
```typescript
interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'ACTIVE' | 'SOMEDAY' | 'COMPLETED' | 'ARCHIVED';
  context: 'work' | 'home';
  tasks: Task[];
  area?: string;
  priority: 'A' | 'B' | 'C' | null;
  created: Date;
  modified: Date;
}
```

## Integration Architecture

### Org-mode File Integration
- **File Watchers**: Monitor Org files for changes
- **Bidirectional Sync**: Changes flow between web app and Org files
- **Conflict Resolution**: Smart merging of concurrent changes
- **Backup System**: Automatic backups before modifications

### Emacs Integration
- **Emacs Server**: Optional Emacs server for direct integration
- **Capture Templates**: Web-based capture that creates proper Org entries
- **Agenda Export**: Export agenda views to web interface
- **Refile Support**: Web-based refiling with proper Org structure

## Development Phases

### Phase 1: Foundation ✅ Complete
- [x] Project setup and configuration
- [x] Atomic design system implementation
- [x] Core data models and TypeScript types
- [x] Comprehensive org-mode parser
- [x] File system integration with API routes
- [x] Docker containerization setup
- [x] Premium UI component library

### Phase 2: Data Layer ✅ Complete
- [x] Org-mode file parsing utilities
- [x] File system API routes
- [x] TypeScript type definitions
- [x] Zustand state management stores
- [x] Real-time file watching integration

### Phase 3: Dashboard & State Management ✅ Complete
- [x] Task management interface
- [x] Project board views
- [x] Context switching functionality
- [x] Dashboard with analytics
- [x] Comprehensive refactoring for DRY principles
- [x] Shared utility layer implementation
- [x] Reusable UI component library

### Phase 4: Core Features (In Progress)
- [x] Enhanced navigation system
- [ ] Drag-and-drop functionality
- [ ] Daily planning interface
- [ ] Inbox processing workflow

### Phase 5: Advanced Features
- [ ] Timeline views
- [ ] Review workflows
- [ ] Advanced filtering and search
- [ ] Project templates
- [ ] Automation rules

### Phase 6: Polish & Performance
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Accessibility improvements
- [ ] Production deployment

## Design System

### Color Palette (Monday.com Inspired)
- **Primary**: Blue (#0073EA) - Main actions and navigation
- **Success**: Green (#00CA72) - Completed tasks and positive actions
- **Warning**: Orange (#FF9500) - Deadlines and important notices
- **Error**: Red (#E2445C) - Errors and critical items
- **Neutral**: Gray (#676879) - Secondary text and borders

### Typography
- **Headings**: Inter (bold, clean)
- **Body**: Inter (regular, readable)
- **Code**: JetBrains Mono (monospace for technical content)

### Component Patterns
- **Cards**: Rounded corners, subtle shadows, hover effects
- **Buttons**: Bold, high contrast, clear call-to-action styling
- **Forms**: Clean inputs with validation states
- **Navigation**: Tab-based with clear active states

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/penguinstud/gtd-org-front.git
cd gtd-org-front

# Install dependencies
npm install

# Start development server
npm run dev
```

### Configuration
1. Copy `.env.example` to `.env.local`
2. Configure Org-mode file paths
3. Set up file watching preferences
4. Configure backup directories

## Recent Updates

### Comprehensive Refactoring (Phase 3 Complete) ✨
The application has undergone major refactoring to improve maintainability and eliminate code duplication:

#### **New Shared Utilities**
- **Badge Variants** (`src/lib/utils/badgeVariants.ts`) - Centralized badge styling logic
- **Task Helpers** (`src/lib/utils/taskHelpers.ts`) - Comprehensive task operations library
- **Navigation Config** (`src/lib/config/navigation.ts`) - Data-driven navigation system

#### **Reusable UI Components**
- **Loading States** (`src/components/common/LoadingState.tsx`) - Consistent loading patterns
- **Error States** (`src/components/common/ErrorState.tsx`) - Standardized error handling

#### **Architecture Improvements**
- **DRY Principles**: Eliminated 60%+ of code duplication
- **Type Safety**: 100% TypeScript coverage for utilities
- **Performance Ready**: Optimized for memoization and lazy loading
- **Configuration-Driven**: Navigation and components now data-driven

📖 **See [`docs/REFACTORING.md`](docs/REFACTORING.md) for detailed refactoring documentation**

## Contributing

### Development Workflow
1. Create feature branch from `main`
2. Follow conventional commit format
3. Add tests for new features
4. Update documentation as needed
5. Submit pull request with detailed description

### Code Standards
- TypeScript for all new code
- ESLint + Prettier for formatting
- Component composition over inheritance
- Accessibility-first design
- Mobile-first responsive design

## License

MIT License - see LICENSE file for details.