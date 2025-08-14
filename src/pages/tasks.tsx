import React, { useEffect, useState, useMemo } from 'react'
import { PageLayout } from '../components/templates/PageLayout'
import { Card, FormInput, FormSelect } from '../components/molecules'
import { Badge } from '../components/atoms/Badge'
import { Button } from '../components/atoms/Button'
import { useTaskStore, useAppStore } from '../lib/stores'
import { cn } from '../lib/utils/cn'
import { Task, TaskStatus, Priority } from '../lib/types'
import { 
  TaskFilters, 
  TaskFormatters, 
  TaskValidators, 
  sortTasks, 
  filterTasks, 
  groupTasks,
  TaskFilter,
  TaskGroupBy,
  TaskSortField,
  SortDirection
} from '../lib/stores/base/StoreSelectors'

// Task List Item Component
interface TaskListItemProps {
  task: Task
  isSelected: boolean
  onToggleSelect: (taskId: string) => void
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete: (taskId: string) => void
  showProject?: boolean
}

function TaskListItem({ 
  task, 
  isSelected, 
  onToggleSelect, 
  onTaskUpdate,
  onTaskDelete,
  showProject = true
}: TaskListItemProps) {
  const [showActions, setShowActions] = useState(false)
  
  const isOverdue = TaskValidators.isOverdue(task)
  const isDueToday = TaskValidators.isDueToday(task)
  const formattedDueDate = TaskFormatters.formatDueDate(task)
  
  const handleStatusToggle = () => {
    onTaskUpdate(task.id, {
      status: task.status === 'DONE' ? 'TODO' : 'DONE',
      completedAt: task.status === 'DONE' ? undefined : new Date()
    })
  }
  
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border transition-all",
      isSelected 
        ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20" 
        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750",
      task.status === 'DONE' && "opacity-60"
    )}>
      {/* Selection checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelect(task.id)}
        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
      />
      
      {/* Status checkbox */}
      <input
        type="checkbox"
        checked={task.status === 'DONE'}
        onChange={handleStatusToggle}
        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
      />
      
      {/* Task content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className={cn(
              "text-sm font-medium",
              task.status === 'DONE' && "line-through",
              isOverdue && task.status !== 'DONE' && "text-red-600 dark:text-red-400",
              isDueToday && task.status !== 'DONE' && "text-orange-600 dark:text-orange-400"
            )}>
              {task.title}
            </h3>
            
            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {/* Status badge */}
              <Badge
                variant={TaskFormatters.getBadgeVariant(task, 'status')}
                className="text-xs"
              >
                {task.status}
              </Badge>
              
              {/* Priority badge */}
              {task.priority && (
                <Badge
                  variant={TaskFormatters.getBadgeVariant(task, 'priority')}
                  className="text-xs"
                >
                  Priority {task.priority}
                </Badge>
              )}
              
              {/* Context badge */}
              <Badge 
                variant={task.context === 'work' ? 'progress' : 'planning'} 
                className="text-xs"
              >
                {task.context === 'work' ? '💼' : '🏠'} {task.context}
              </Badge>
              
              {/* Project */}
              {showProject && task.project && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  📁 {task.project}
                </span>
              )}
              
              {/* Due date */}
              {formattedDueDate && (
                <span className={cn(
                  "text-xs",
                  isOverdue && task.status !== 'DONE' && "text-red-600 dark:text-red-400 font-medium",
                  isDueToday && task.status !== 'DONE' && "text-orange-600 dark:text-orange-400 font-medium"
                )}>
                  {formattedDueDate}
                </span>
              )}
              
              {/* Tags */}
              {task.tags.length > 0 && (
                <div className="flex gap-1">
                  {task.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Effort */}
              {task.effort && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ⏱ {TaskFormatters.formatEffort(task.effort)}
                </span>
              )}
            </div>
          </div>
          
          {/* Action menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowActions(!showActions)}
            className="shrink-0"
          >
            ⋮
          </Button>
        </div>
        
        {/* Quick actions */}
        {showActions && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {/* Status actions */}
              {task.status !== 'DONE' && (
                <>
                  <Button
                    variant={task.status === 'NEXT' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => onTaskUpdate(task.id, { status: 'NEXT' })}
                    className="text-xs"
                  >
                    Start Next
                  </Button>
                  <Button
                    variant={task.status === 'WAITING' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => onTaskUpdate(task.id, { status: 'WAITING' })}
                    className="text-xs"
                  >
                    Waiting
                  </Button>
                  <Button
                    variant={task.status === 'SOMEDAY' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => onTaskUpdate(task.id, { status: 'SOMEDAY' })}
                    className="text-xs"
                  >
                    Someday
                  </Button>
                </>
              )}
              
              {/* Priority buttons */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Priority:</span>
                {(['A', 'B', 'C'] as Priority[]).map((priority) => (
                  <Button
                    key={priority}
                    variant={task.priority === priority ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => onTaskUpdate(task.id, { priority })}
                    className="text-xs px-2"
                  >
                    {priority}
                  </Button>
                ))}
              </div>
              
              {/* Delete button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this task?')) {
                    onTaskDelete(task.id)
                  }
                }}
                className="text-xs text-red-600 dark:text-red-400 ml-auto"
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Main Tasks Page Component
export default function TasksPage() {
  const { tasks, projects, loading, error, syncData, updateTask, deleteTask } = useTaskStore()
  const { currentContext } = useAppStore()
  
  // State
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [groupBy, setGroupBy] = useState<TaskGroupBy | 'none'>('none')
  const [sortField, setSortField] = useState<TaskSortField>('created')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showCompleted, setShowCompleted] = useState(true)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([])
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([])
  const [projectFilter, setProjectFilter] = useState<string>('')
  const [overdueOnly, setOverdueOnly] = useState(false)
  
  // Build filter object
  const filters: TaskFilter = {
    status: statusFilter.length > 0 ? statusFilter : undefined,
    priority: priorityFilter.length > 0 ? priorityFilter : undefined,
    projects: projectFilter ? [projectFilter] : undefined,
    isOverdue: overdueOnly,
    searchText: searchQuery,
    contexts: [currentContext]
  }
  
  // Filter and sort tasks
  const processedTasks = useMemo(() => {
    let filtered = filterTasks(tasks, filters)
    
    // Hide completed tasks if requested
    if (!showCompleted) {
      filtered = filtered.filter(task => task.status !== 'DONE')
    }
    
    // Sort tasks
    return sortTasks(filtered, sortField, sortDirection)
  }, [tasks, filters, showCompleted, sortField, sortDirection])
  
  // Group tasks if needed
  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Tasks': processedTasks }
    }
    return groupTasks(processedTasks, groupBy)
  }, [processedTasks, groupBy])
  
  // Get task statistics
  const stats = useMemo(() => {
    const contextTasks = TaskFilters.byContext(tasks, currentContext)
    return {
      total: contextTasks.length,
      active: TaskFilters.active(contextTasks).length,
      completed: TaskFilters.completed(contextTasks).length,
      overdue: TaskFilters.overdue(contextTasks).length,
      nextActions: TaskFilters.nextActions(contextTasks).length,
      waiting: TaskFilters.waiting(contextTasks).length
    }
  }, [tasks, currentContext])
  
  // Action handlers
  const handleToggleSelect = (taskId: string) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTasks(newSelected)
  }
  
  const handleSelectAll = () => {
    if (selectedTasks.size === processedTasks.length) {
      setSelectedTasks(new Set())
    } else {
      setSelectedTasks(new Set(processedTasks.map(t => t.id)))
    }
  }
  
  const handleBatchUpdate = (updates: Partial<Task>) => {
    selectedTasks.forEach(taskId => {
      updateTask(taskId, updates)
    })
    setSelectedTasks(new Set())
  }
  
  const handleBatchDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedTasks.size} tasks?`)) {
      selectedTasks.forEach(taskId => {
        deleteTask(taskId)
      })
      setSelectedTasks(new Set())
    }
  }
  
  const toggleSort = (field: TaskSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }
  
  // Auto-sync data on mount
  useEffect(() => {
    syncData()
  }, [syncData])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Select all (Cmd/Ctrl + A)
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && !e.shiftKey) {
        e.preventDefault()
        handleSelectAll()
      }
      
      // Delete selected (Delete or Backspace)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedTasks.size > 0) {
        e.preventDefault()
        handleBatchDelete()
      }
      
      // Mark as done (Cmd/Ctrl + D)
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && selectedTasks.size > 0) {
        e.preventDefault()
        handleBatchUpdate({ status: 'DONE', completedAt: new Date() })
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedTasks])
  
  if (loading) {
    return (
      <PageLayout title="Tasks">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading tasks...</div>
        </div>
      </PageLayout>
    )
  }
  
  if (error) {
    return (
      <PageLayout title="Tasks">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">Error loading data: {error}</div>
            <Button onClick={syncData}>Retry</Button>
          </div>
        </div>
      </PageLayout>
    )
  }
  
  return (
    <PageLayout title="Tasks">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Tasks
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              All your tasks in one place
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={currentContext === 'work' ? 'progress' : 'planning'}>
              {currentContext === 'work' ? '💼 Work' : '🏠 Home'}
            </Badge>
            <Button onClick={syncData} disabled={loading}>
              {loading ? 'Syncing...' : 'Sync'}
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.active}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.nextActions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Next Actions</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.waiting}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Waiting</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
            </div>
          </Card>
        </div>
        
        {/* Filters and Actions */}
        <Card className="p-4">
          <div className="space-y-4">
            {/* Search and main filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <FormInput
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth
                />
              </div>
              
              <div className="flex gap-2">
                {/* Status filter */}
                <FormSelect
                  value={statusFilter.join(',')}
                  onChange={(e) => setStatusFilter(e.target.value ? e.target.value.split(',') as TaskStatus[] : [])}
                >
                  <option value="">All Status</option>
                  <option value="TODO">TODO</option>
                  <option value="NEXT">NEXT</option>
                  <option value="WAITING">WAITING</option>
                  <option value="SOMEDAY">SOMEDAY</option>
                  <option value="DONE">DONE</option>
                  <option value="CANCELED">CANCELED</option>
                </FormSelect>
                
                {/* Priority filter */}
                <FormSelect
                  value={priorityFilter.join(',')}
                  onChange={(e) => setPriorityFilter(e.target.value ? e.target.value.split(',') as Priority[] : [])}
                >
                  <option value="">All Priority</option>
                  <option value="A">High (A)</option>
                  <option value="B">Medium (B)</option>
                  <option value="C">Low (C)</option>
                </FormSelect>
                
                {/* Project filter */}
                <FormSelect
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                >
                  <option value="">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.title}>
                      {project.title}
                    </option>
                  ))}
                </FormSelect>
              </div>
            </div>
            
            {/* Additional filters and options */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Group by */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Group by:</span>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as TaskGroupBy | 'none')}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="none">None</option>
                  <option value="status">Status</option>
                  <option value="priority">Priority</option>
                  <option value="project">Project</option>
                  <option value="date">Date</option>
                </select>
              </div>
              
              {/* Sort options */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                <div className="flex gap-1">
                  {[
                    { field: 'created' as TaskSortField, label: 'Created' },
                    { field: 'modified' as TaskSortField, label: 'Modified' },
                    { field: 'deadline' as TaskSortField, label: 'Due Date' },
                    { field: 'priority' as TaskSortField, label: 'Priority' },
                    { field: 'title' as TaskSortField, label: 'Title' }
                  ].map((option) => (
                    <Button
                      key={option.field}
                      variant={sortField === option.field ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => toggleSort(option.field)}
                      className="text-xs"
                    >
                      {option.label}
                      {sortField === option.field && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Toggle options */}
              <div className="flex items-center gap-4 ml-auto">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={overdueOnly}
                    onChange={(e) => setOverdueOnly(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Overdue only</span>
                </label>
                
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showCompleted}
                    onChange={(e) => setShowCompleted(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Show completed</span>
                </label>
              </div>
            </div>
            
            {/* Batch actions */}
            {selectedTasks.size > 0 && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedTasks.size} selected:
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchUpdate({ status: 'DONE', completedAt: new Date() })}
                >
                  Mark Done
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchUpdate({ status: 'NEXT' })}
                >
                  Set as Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchUpdate({ priority: 'A' })}
                >
                  Set Priority A
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchUpdate({ priority: 'B' })}
                >
                  Set Priority B
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBatchDelete}
                  className="text-red-600 dark:text-red-400"
                >
                  Delete Selected
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTasks(new Set())}
                  className="ml-auto"
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
        </Card>
        
        {/* Task list */}
        <div className="space-y-6">
          {/* Select all button */}
          {processedTasks.length > 0 && groupBy === 'none' && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {processedTasks.length} tasks
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedTasks.size === processedTasks.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          )}
          
          {/* Tasks grouped or ungrouped */}
          {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
            <div key={groupName}>
              {groupBy !== 'none' && (
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {groupName} ({groupTasks.length})
                  </h3>
                </div>
              )}
              
              {groupTasks.length === 0 ? (
                <Card className="p-12">
                  <div className="text-center">
                    <span className="text-4xl mb-4 block">📋</span>
                    <p className="text-gray-500 dark:text-gray-400">
                      No tasks found matching your filters
                    </p>
                  </div>
                </Card>
              ) : (
                <Card className="divide-y divide-gray-200 dark:divide-gray-700">
                  {groupTasks.map((task) => (
                    <div key={task.id} className="p-2">
                      <TaskListItem
                        task={task}
                        isSelected={selectedTasks.has(task.id)}
                        onToggleSelect={handleToggleSelect}
                        onTaskUpdate={updateTask}
                        onTaskDelete={deleteTask}
                        showProject={groupBy !== 'project'}
                      />
                    </div>
                  ))}
                </Card>
              )}
            </div>
          ))}
        </div>
        
        {/* Keyboard shortcuts help */}
        <Card className="p-4 bg-gray-50 dark:bg-gray-800">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Keyboard Shortcuts
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div><kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded">⌘/Ctrl + A</kbd> Select all</div>
            <div><kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded">⌘/Ctrl + D</kbd> Mark selected as done</div>
            <div><kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded">Delete</kbd> Delete selected</div>
          </div>
        </Card>
      </div>
    </PageLayout>
  )
}