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
│   ├── components/           # Reusable UI components
│   │   ├── boards/          # Board and card components
│   │   ├── forms/           # Form components
│   │   ├── layouts/         # Layout components
│   │   └── ui/              # Base UI components
│   ├── pages/               # Next.js pages
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand stores
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── styles/              # Global styles
├── public/                  # Static assets
├── docs/                    # Project documentation
└── tests/                   # Test files
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

### Phase 1: Foundation (Current)
- [x] Project setup and configuration
- [ ] Basic component library
- [ ] Core data models
- [ ] File system integration

### Phase 2: Core Features
- [ ] Task management interface
- [ ] Project board views
- [ ] Context switching
- [ ] Basic Org-mode sync

### Phase 3: Advanced Features
- [ ] Drag-and-drop functionality
- [ ] Timeline views
- [ ] Review workflows
- [ ] Advanced filtering

### Phase 4: Polish & Performance
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Accessibility improvements
- [ ] Documentation completion

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
git clone https://github.com/yourusername/gtd-org-front.git
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