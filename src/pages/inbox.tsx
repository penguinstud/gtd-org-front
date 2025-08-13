import React, { useEffect, useState, useMemo } from 'react'
import { PageLayout } from '../components/templates/PageLayout'
import { Card, Modal } from '../components/molecules'
import { Badge } from '../components/atoms/Badge'
import { Button } from '../components/atoms/Button'
import { useTaskStore, useAppStore } from '../lib/stores'
import { cn } from '../lib/utils/cn'
import { Task, TaskStatus, Priority } from '../lib/types'

interface TaskActionProps {
  task: Task
  onSchedule: (task: Task) => void
  onAssignProject: (task: Task) => void
  onSetPriority: (task: Task, priority: Priority) => void
  onUpdateStatus: (task: Task, status: TaskStatus) => void
  isSelected: boolean
  onToggleSelect: (taskId: string) => void
}

function TaskAction({ 
  task, 
  onSchedule, 
  onAssignProject, 
  onSetPriority, 
  onUpdateStatus,
  isSelected,
  onToggleSelect
}: TaskActionProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div className={cn(
      "p-4 bg-white dark:bg-gray-800 rounded-lg border transition-all",
      isSelected 
        ? "border-blue-500 dark:border-blue-400 shadow-md" 
        : "border-gray-200 dark:border-gray-700 hover:shadow-sm"
    )}>
      <div className="flex items-start gap-3">
        {/* Selection checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(task.id)}
          className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        
        {/* Task content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {task.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {task.status && (
                  <Badge
                    variant={
                      task.status === 'DONE' ? 'success' :
                      task.status === 'NEXT' ? 'progress' :
                      task.status === 'WAITING' ? 'planning' :
                      'secondary'
                    }
                    className="text-xs"
                  >
                    {task.status}
                  </Badge>
                )}
                {task.priority && (
                  <Badge
                    variant={
                      task.priority === 'A' ? 'blocked' :
                      task.priority === 'B' ? 'progress' :
                      'secondary'
                    }
                    className="text-xs"
                  >
                    Priority {task.priority}
                  </Badge>
                )}
                {task.context && (
                  <Badge variant="secondary" className="text-xs">
                    {task.context === 'work' ? '💼' : '🏠'} {task.context}
                  </Badge>
                )}
                {task.deadline && (
                  <span className="text-xs text-orange-600 dark:text-orange-400">
                    Due: {new Date(task.deadline).toLocaleDateString()}
                  </span>
                )}
                {task.project && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    📁 {task.project}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSchedule(task)}
                  className="text-xs"
                >
                  📅 Schedule
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAssignProject(task)}
                  className="text-xs"
                >
                  📁 Assign Project
                </Button>
                
                {/* Priority buttons */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Priority:</span>
                  {(['A', 'B', 'C'] as Priority[]).map((priority) => (
                    <Button
                      key={priority}
                      variant={task.priority === priority ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => onSetPriority(task, priority)}
                      className="text-xs px-2"
                    >
                      {priority}
                    </Button>
                  ))}
                </div>
                
                {/* Status buttons */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Status:</span>
                  <Button
                    variant={task.status === 'NEXT' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => onUpdateStatus(task, 'NEXT')}
                    className="text-xs"
                  >
                    Next
                  </Button>
                  <Button
                    variant={task.status === 'DONE' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => onUpdateStatus(task, 'DONE')}
                    className="text-xs"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function InboxPage() {
  const { tasks, loading, error, syncData, updateTask, projects } = useTaskStore()
  const { currentContext } = useAppStore()
  
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'created' | 'priority' | 'deadline'>('created')
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [showScheduleModal, setShowScheduleModal] = useState<Task | null>(null)
  const [showProjectModal, setShowProjectModal] = useState<Task | null>(null)
  
  // Get inbox tasks (unfiled, unscheduled, or without project)
  const inboxTasks = useMemo(() => {
    return tasks.filter(task => {
      // Filter by context
      if (task.context !== currentContext) return false
      
      // Inbox criteria: no project, or TODO status without schedule
      const isInboxTask = !task.project || 
        (task.status === 'TODO' && !task.scheduled) ||
        (!task.scheduled && task.status !== 'DONE' && task.status !== 'CANCELED')
      
      // Apply status filter
      if (filterStatus !== 'all' && task.status !== filterStatus) return false
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return task.title.toLowerCase().includes(query) ||
          (task.project && task.project.toLowerCase().includes(query)) ||
          (task.tags && task.tags.some(tag => tag.toLowerCase().includes(query)))
      }
      
      return isInboxTask
    })
  }, [tasks, currentContext, filterStatus, searchQuery])
  
  // Sort tasks
  const sortedTasks = useMemo(() => {
    const sorted = [...inboxTasks]
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2 }
          const aPriority = a.priority ? priorityOrder[a.priority] ?? 3 : 3
          const bPriority = b.priority ? priorityOrder[b.priority] ?? 3 : 3
          return aPriority - bPriority
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        case 'created':
        default:
          return new Date(b.created).getTime() - new Date(a.created).getTime()
      }
    })
    return sorted
  }, [inboxTasks, sortBy])
  
  // Action handlers
  const handleSchedule = (task: Task) => {
    setShowScheduleModal(task)
  }
  
  const handleAssignProject = (task: Task) => {
    setShowProjectModal(task)
  }
  
  const handleSetPriority = (task: Task, priority: Priority) => {
    updateTask(task.id, { priority })
  }
  
  const handleUpdateStatus = (task: Task, status: TaskStatus) => {
    updateTask(task.id, { status })
  }
  
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
    if (selectedTasks.size === sortedTasks.length) {
      setSelectedTasks(new Set())
    } else {
      setSelectedTasks(new Set(sortedTasks.map(t => t.id)))
    }
  }
  
  const handleBatchAction = (action: 'schedule' | 'project' | 'priority' | 'status', value?: Priority | TaskStatus | string) => {
    selectedTasks.forEach(taskId => {
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        switch (action) {
          case 'priority':
            if (value) updateTask(taskId, { priority: value as Priority })
            break
          case 'status':
            if (value) updateTask(taskId, { status: value as TaskStatus })
            break
          // TODO: Implement batch schedule and project assignment
        }
      }
    })
  }
  
  // Auto-sync data on mount
  useEffect(() => {
    syncData()
  }, [syncData])
  
  if (loading) {
    return (
      <PageLayout title="Inbox">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading inbox...</div>
        </div>
      </PageLayout>
    )
  }
  
  if (error) {
    return (
      <PageLayout title="Inbox">
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
    <PageLayout title="Inbox">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Inbox
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Process and organize your tasks
          </p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{inboxTasks.length}</p>
              </div>
              <span className="text-2xl">📥</span>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">High Priority</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {inboxTasks.filter(t => t.priority === 'A').length}
                </p>
              </div>
              <span className="text-2xl">⚡</span>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">With Deadline</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {inboxTasks.filter(t => t.deadline).length}
                </p>
              </div>
              <span className="text-2xl">⏰</span>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Selected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTasks.size}</p>
              </div>
              <span className="text-2xl">☑️</span>
            </div>
          </Card>
        </div>
        
        {/* Filters and Actions */}
        <Card className="p-4">
          <div className="space-y-4">
            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="TODO">TODO</option>
                  <option value="NEXT">NEXT</option>
                  <option value="WAITING">WAITING</option>
                  <option value="DONE">DONE</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created">Sort by Created</option>
                  <option value="priority">Sort by Priority</option>
                  <option value="deadline">Sort by Deadline</option>
                </select>
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
                  onClick={() => handleBatchAction('priority', 'A')}
                >
                  Set Priority A
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchAction('status', 'NEXT')}
                >
                  Mark as Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchAction('status', 'DONE')}
                >
                  Mark as Done
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
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tasks ({sortedTasks.length})
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedTasks.size === sortedTasks.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          
          {sortedTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No tasks in your inbox. Great job staying organized! 🎉
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedTasks.map((task) => (
                <TaskAction
                  key={task.id}
                  task={task}
                  onSchedule={handleSchedule}
                  onAssignProject={handleAssignProject}
                  onSetPriority={handleSetPriority}
                  onUpdateStatus={handleUpdateStatus}
                  isSelected={selectedTasks.has(task.id)}
                  onToggleSelect={handleToggleSelect}
                />
              ))}
            </div>
          )}
        </Card>
{/* Schedule Modal */}
        {showScheduleModal && (
          <Modal
            isOpen={!!showScheduleModal}
            onClose={() => setShowScheduleModal(null)}
            title="Schedule Task"
            size="md"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Task: {showScheduleModal.title}
                </h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  defaultValue="09:00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <select
                  defaultValue="30"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowScheduleModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    // TODO: Implement actual scheduling
                    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
                    const timeInput = document.querySelector('input[type="time"]') as HTMLInputElement
                    if (dateInput && timeInput) {
                      const scheduledDate = new Date(`${dateInput.value}T${timeInput.value}`)
                      updateTask(showScheduleModal.id, { scheduled: scheduledDate })
                    }
                    setShowScheduleModal(null)
                  }}
                >
                  Schedule Task
                </Button>
              </div>
            </div>
          </Modal>
        )}
        
        {/* Project Assignment Modal */}
        {showProjectModal && (
          <Modal
            isOpen={!!showProjectModal}
            onClose={() => setShowProjectModal(null)}
            title="Assign to Project"
            size="md"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Task: {showProjectModal.title}
                </h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Project
                </label>
                <select
                  defaultValue=""
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.title}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Create New Project
                </label>
                <input
                  type="text"
                  placeholder="Enter new project name..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowProjectModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    // TODO: Implement actual project assignment
                    const projectSelect = document.querySelector('select') as HTMLSelectElement
                    const newProjectInput = document.querySelector('input[type="text"]') as HTMLInputElement
                    
                    if (newProjectInput && newProjectInput.value) {
                      updateTask(showProjectModal.id, { project: newProjectInput.value })
                    } else if (projectSelect && projectSelect.value) {
                      updateTask(showProjectModal.id, { project: projectSelect.value })
                    }
                    
                    setShowProjectModal(null)
                  }}
                >
                  Assign Project
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </PageLayout>
  )
}