import React, { useEffect, useState, useMemo } from 'react'
import { PageLayout } from '../components/templates/PageLayout'
import { Card } from '../components/molecules/Card'
import { FormInput, FormSelect } from '../components/molecules'
import { Badge } from '../components/atoms/Badge'
import { Button } from '../components/atoms/Button'
import { useTaskStore, useAppStore } from '../lib/stores'
import { cn } from '../lib/utils/cn'
import { Task } from '../lib/types'
import { ProjectStats } from '../lib/stores/base/BaseTaskStore'

// Project List Item Component
interface ProjectListItemProps {
  projectStats: ProjectStats
  tasks: Task[]
  isExpanded: boolean
  onToggle: () => void
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
}

function ProjectListItem({ 
  projectStats, 
  tasks, 
  isExpanded, 
  onToggle,
  onTaskUpdate 
}: ProjectListItemProps) {
  const handleTaskComplete = (taskId: string, currentStatus: string) => {
    onTaskUpdate(taskId, {
      status: currentStatus === 'DONE' ? 'TODO' : 'DONE',
      completedAt: currentStatus === 'DONE' ? undefined : new Date()
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Project Header Row */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          {/* Left side - Project info */}
          <div className="flex items-center gap-4 flex-1">
            {/* Expand/Collapse icon */}
            <span className={cn(
              "text-gray-400 transition-transform text-sm",
              isExpanded && "rotate-90"
            )}>
              ▶
            </span>
            
            {/* Project name and stats */}
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {projectStats.projectTitle}
              </h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                <span>{projectStats.totalTasks} tasks</span>
                <span>•</span>
                <span>Last updated {new Date(projectStats.lastModified).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {/* Right side - Stats and indicators */}
          <div className="flex items-center gap-4">
            {/* Overdue count */}
            {projectStats.overdueTasks > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {projectStats.overdueTasks}
                </span>
                <span className="text-xs text-red-600 dark:text-red-400">overdue</span>
              </div>
            )}
            
            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${projectStats.completionPercentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[3rem] text-right">
                {Math.round(projectStats.completionPercentage)}%
              </span>
            </div>
            
            {/* Status badge */}
            <Badge 
              variant={
                projectStats.status === 'COMPLETED' ? 'success' :
                projectStats.status === 'ACTIVE' ? 'progress' :
                projectStats.status === 'ARCHIVED' ? 'secondary' :
                'planning'
              }
            >
              {projectStats.status}
            </Badge>
            
            {/* Priority badge */}
            {projectStats.priority && (
              <Badge 
                variant={
                  projectStats.priority === 'A' ? 'blocked' :
                  projectStats.priority === 'B' ? 'progress' :
                  'secondary'
                }
              >
                {projectStats.priority}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Expanded Task List */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
              No tasks in this project
            </p>
          ) : (
            <div className="space-y-1 py-2">
              {tasks.map((task) => {
                const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'DONE'
                
                return (
                  <div 
                    key={task.id} 
                    className="flex items-center gap-3 py-2 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-750 group"
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={task.status === 'DONE'}
                      onChange={() => handleTaskComplete(task.id, task.status)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    
                    {/* Task details */}
                    <div className="flex-1 flex items-center gap-2">
                      <span className={cn(
                        "text-sm",
                        task.status === 'DONE' && "line-through text-gray-400",
                        isOverdue && task.status !== 'DONE' && "text-red-600 dark:text-red-400"
                      )}>
                        {task.title}
                      </span>
                      
                      {/* Due date */}
                      {task.deadline && (
                        <span className={cn(
                          "text-xs",
                          isOverdue && task.status !== 'DONE' 
                            ? "text-red-600 dark:text-red-400 font-medium" 
                            : "text-gray-500 dark:text-gray-400"
                        )}>
                          {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                      
                      {/* Context badge */}
                      <Badge 
                        variant={task.context === 'work' ? 'progress' : 'planning'} 
                        className="text-xs"
                      >
                        {task.context === 'work' ? '💼' : '🏠'}
                      </Badge>
                      
                      {/* Priority badge */}
                      {task.priority && (
                        <Badge 
                          variant={
                            task.priority === 'A' ? 'blocked' :
                            task.priority === 'B' ? 'progress' :
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Quick actions (visible on hover) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Implement edit functionality
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Main Projects Page Component
export default function ProjectsPage() {
  const { tasks, loading, error, syncData, updateTask, getAllProjectStats, getProjectOverallStats } = useTaskStore()
  const { currentContext } = useAppStore()
  
  // State
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'completion' | 'tasks' | 'modified'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Get project stats
  const projectStats = useMemo(() => getAllProjectStats(), [getAllProjectStats])
  const overallStats = useMemo(() => getProjectOverallStats(), [getProjectOverallStats])
  
  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projectStats
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(p => p.priority === priorityFilter)
    }
    
    // Sort projects
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.projectTitle.localeCompare(b.projectTitle)
          break
        case 'completion':
          comparison = a.completionPercentage - b.completionPercentage
          break
        case 'tasks':
          comparison = a.totalTasks - b.totalTasks
          break
        case 'modified':
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    return sorted
  }, [projectStats, searchQuery, statusFilter, priorityFilter, sortBy, sortOrder])
  
  // Toggle project expansion
  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }
  
  // Auto-sync data on mount
  useEffect(() => {
    syncData()
  }, [syncData])
  
  if (loading) {
    return (
      <PageLayout title="Projects">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading projects...</div>
        </div>
      </PageLayout>
    )
  }
  
  if (error) {
    return (
      <PageLayout title="Projects">
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
    <PageLayout title="Projects">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Projects
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage and track your {currentContext} projects
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
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overallStats.totalProjects}
                </p>
              </div>
              <span className="text-2xl">📁</span>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Overall Completion</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(overallStats.overallCompletionRate)}%
                </p>
              </div>
              <span className="text-2xl">📊</span>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Overdue</p>
                <p className={cn(
                  "text-2xl font-bold",
                  overallStats.totalOverdueTasks > 0 
                    ? "text-red-600 dark:text-red-400" 
                    : "text-gray-900 dark:text-white"
                )}>
                  {overallStats.totalOverdueTasks}
                </p>
              </div>
              <span className="text-2xl">⚠️</span>
            </div>
          </Card>
        </div>
        
        {/* Filters and Search */}
        <Card className="p-4">
          <div className="space-y-4">
            {/* Search and filters row */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <FormInput
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth
                />
              </div>
              
              <div className="flex gap-2">
                <FormSelect
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SOMEDAY">Someday</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </FormSelect>
                
                <FormSelect
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">All Priority</option>
                  <option value="A">High (A)</option>
                  <option value="B">Medium (B)</option>
                  <option value="C">Low (C)</option>
                </FormSelect>
              </div>
            </div>
            
            {/* Sort options */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
              <div className="flex gap-2">
                {[
                  { value: 'name', label: 'Name' },
                  { value: 'completion', label: 'Completion %' },
                  { value: 'tasks', label: 'Task Count' },
                  { value: 'modified', label: 'Last Modified' }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (sortBy === option.value) {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortBy(option.value as typeof sortBy)
                        setSortOrder('asc')
                      }
                    }}
                  >
                    {option.label}
                    {sortBy === option.value && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
        
        {/* Project List */}
        <div className="space-y-4">
          {filteredAndSortedProjects.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <span className="text-4xl mb-4 block">📁</span>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'No projects match your filters'
                    : 'No projects found. Create your first project to get started!'}
                </p>
              </div>
            </Card>
          ) : (
            filteredAndSortedProjects.map((project) => (
              <ProjectListItem
                key={project.projectId}
                projectStats={project}
                tasks={tasks.filter(t => t.project === project.projectTitle)}
                isExpanded={expandedProjects.has(project.projectId)}
                onToggle={() => toggleProject(project.projectId)}
                onTaskUpdate={updateTask}
              />
            ))
          )}
        </div>
      </div>
    </PageLayout>
  )
}