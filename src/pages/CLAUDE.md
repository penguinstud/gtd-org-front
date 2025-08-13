# Pages & Routing

## Overview
The pages directory implements Next.js file-based routing. Each file in this directory automatically becomes a route, with API routes nested under the `api/` subdirectory. This module handles both the user-facing pages and backend API endpoints.

## Directory Structure
```
pages/
├── api/                → API routes (backend)
│   ├── health.ts       → Health check endpoint
│   └── files/          → File operation endpoints
│       ├── list.ts     → List org files
│       └── read.ts     → Read org file content
├── _app.tsx            → App wrapper with providers
├── index.tsx           → Home page (redirects)
├── dashboard.tsx       → Main dashboard view
├── daily.tsx           → Daily planning view
├── inbox.tsx           → Task inbox processing
├── projects.tsx        → Projects overview
└── tasks.tsx           → All tasks view
```

## Key Files
- `_app.tsx` - Global app wrapper, context providers, layout
- `index.tsx` - Entry point, redirects to dashboard
- `dashboard.tsx` - Main application dashboard
- `api/health.ts` - Health check for monitoring

## Page Routes

### Dashboard (`/dashboard`)
- **Purpose**: Central hub showing KPIs and task overview
- **Features**: Context switching, real-time metrics
- **State**: Connected to active context store
```typescript
<PageLayout title="Dashboard">
  <Dashboard context={currentContext} />
</PageLayout>
```

### Daily View (`/daily`)
- **Purpose**: Time-based task planning (9 AM - 9 PM)
- **Features**: Time slots, drag-and-drop scheduling
- **State**: Today's tasks from context store
```typescript
// Time slot structure
const timeSlots = generateTimeSlots(9, 21) // 9 AM to 9 PM
```

### Inbox (`/inbox`)
- **Purpose**: Process unorganized tasks
- **Features**: Quick actions, bulk operations
- **Actions**: Assign project, set due date, refile
```typescript
// Task processing actions
const processTask = (taskId, action) => {
  switch(action.type) {
    case 'ASSIGN_PROJECT':
    case 'SET_DUE_DATE':
    case 'REFILE':
    // Handle action
  }
}
```

### Projects (`/projects`)
- **Purpose**: Project-based task grouping
- **Features**: Project cards, progress tracking
- **Highlighting**: Overdue tasks emphasized

### Tasks (`/tasks`)
- **Purpose**: Comprehensive task management
- **Features**: Filtering, sorting, bulk actions
- **Views**: List, kanban (planned)

## API Routes

### Health Check (`/api/health`)
- **Method**: GET
- **Purpose**: Container health monitoring
- **Response**: Status, uptime, version
```typescript
{
  status: 'healthy',
  timestamp: '2025-01-15T10:30:00Z',
  uptime: 3600,
  version: '0.1.0'
}
```

### File Operations
See detailed API documentation: [`api/CLAUDE.md`](api/CLAUDE.md)

## Routing Patterns

### Page Structure
```typescript
// Standard page structure
export default function PageName() {
  const { data, isLoading } = usePageData()
  
  if (isLoading) return <LoadingState />
  
  return (
    <PageLayout title="Page Title">
      <PageContent data={data} />
    </PageLayout>
  )
}
```

### Protected Routes (Future)
```typescript
// Planned authentication wrapper
export default withAuth(function ProtectedPage() {
  // Page content
})
```

### Dynamic Routes (Planned)
```typescript
// Example: /projects/[id]
export default function ProjectDetail({ projectId }) {
  const project = useProject(projectId)
  // Project detail view
}
```

## Data Fetching Patterns

### Client-Side Fetching
```typescript
// Using SWR or custom hooks
const { data, error } = useSWR('/api/files/list', fetcher)
```

### Server-Side Props (When Needed)
```typescript
export async function getServerSideProps(context) {
  // Fetch data server-side
  return { props: { data } }
}
```

## Page Optimization

### Code Splitting
- Automatic per-route code splitting
- Dynamic imports for heavy components
- Lazy loading non-critical features

### Performance
```typescript
// Lazy load heavy components
const HeavyChart = dynamic(() => import('../components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

## SEO & Metadata
```typescript
// In PageLayout or individual pages
<Head>
  <title>{title} | GTD Org</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />
</Head>
```

## Common Page Tasks

### Creating a New Page
1. Add file to `pages/` directory
2. Import and use `PageLayout`
3. Connect to appropriate stores
4. Add to navigation config
5. Document in this file

### Adding API Endpoint
1. Create file in `pages/api/`
2. Apply security middleware
3. Implement handler logic
4. Document in `api/CLAUDE.md`

## Navigation Configuration
Located in `lib/config/navigation.ts`:
```typescript
export const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/daily', label: 'Daily', icon: Calendar },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare }
]
```

## Error Handling

### 404 Page (Planned)
```typescript
// pages/404.tsx
export default function Custom404() {
  return <ErrorState type="404" />
}
```

### Error Boundary
Implemented at `_app.tsx` level for global error catching

## Testing Pages
```typescript
describe('Dashboard Page', () => {
  it('renders with correct context', () => {
    render(<Dashboard />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
  
  it('switches context', async () => {
    // Test context switching
  })
})
```

## Future Pages (Planned)
- `/settings` - Application configuration
- `/calendar` - Calendar view of tasks
- `/reports` - Analytics and insights
- `/archive` - Completed tasks archive
- `/search` - Global search interface

## Dependencies
- **Next.js**: Routing framework
- **React**: UI framework
- **Components**: All UI components
- **Stores**: State management
- **API**: Backend integration

## Related Modules
- **Parent**: [`src/CLAUDE.md`](../CLAUDE.md) - Source overview
- **API Routes**: [`api/CLAUDE.md`](api/CLAUDE.md) - API documentation
- **Components**: [`components/CLAUDE.md`](../components/CLAUDE.md) - UI components
- **Templates**: [`components/templates/CLAUDE.md`](../components/templates/CLAUDE.md) - Page layouts