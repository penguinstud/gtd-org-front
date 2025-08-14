import React, { useState, useEffect } from 'react'
import { Modal } from '../molecules/Modal'
import { Button } from '../atoms/Button'
import { Badge } from '../atoms/Badge'
import { useTaskStore } from '../../lib/stores/taskStore'
import { useAppStore } from '../../lib/stores/appStore'
import { TaskStatus, Priority, TaskFormData } from '../../lib/types'
import { cn } from '../../lib/utils/cn'

interface TaskCreationModalProps {
  isOpen: boolean
  onClose: () => void
  defaultProject?: string
  defaultStatus?: TaskStatus
}

const TASK_STATUSES: { value: TaskStatus; label: string; icon: string }[] = [
  { value: 'TODO', label: 'To Do', icon: '📋' },
  { value: 'NEXT', label: 'Next Action', icon: '⭐' },
  { value: 'WAITING', label: 'Waiting', icon: '⏳' },
  { value: 'SOMEDAY', label: 'Someday', icon: '💭' },
]

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'A', label: 'High', color: 'bg-red-100 text-red-700' },
  { value: 'B', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'C', label: 'Low', color: 'bg-green-100 text-green-700' },
  { value: null, label: 'None', color: 'bg-gray-100 text-gray-600' },
]

const WORK_AREAS = ['Development', 'Design', 'Management', 'Research', 'Operations']
const HOME_AREAS = ['Finance', 'Health', 'Learning', 'Household', 'Personal']

export function TaskCreationModal({
  isOpen,
  onClose,
  defaultProject = '',
  defaultStatus = 'TODO'
}: TaskCreationModalProps) {
  const { currentContext } = useAppStore()
  const { addTask, projects } = useTaskStore()
  
  // Form state
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: defaultStatus,
    priority: null,
    project: defaultProject,
    scheduled: undefined,
    deadline: undefined,
    effort: undefined,
    cost: undefined,
    area: '',
    tags: []
  })
  
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        status: defaultStatus,
        priority: null,
        project: defaultProject,
        scheduled: undefined,
        deadline: undefined,
        effort: undefined,
        cost: undefined,
        area: '',
        tags: []
      })
      setTagInput('')
      setErrors({})
    }
  }, [isOpen, defaultProject, defaultStatus])

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (formData.effort && (formData.effort < 0 || formData.effort > 100)) {
      newErrors.effort = 'Effort must be between 0 and 100 hours'
    }
    
    if (formData.cost && formData.cost < 0) {
      newErrors.cost = 'Cost must be a positive number'
    }
    
    if (formData.scheduled && formData.deadline && formData.scheduled > formData.deadline) {
      newErrors.scheduled = 'Scheduled date cannot be after deadline'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Create the task
      const newTask = {
        title: formData.title.trim(),
        description: formData.description?.trim(),
        status: formData.status,
        priority: formData.priority,
        project: formData.project || undefined,
        context: currentContext,
        scheduled: formData.scheduled,
        deadline: formData.deadline,
        effort: formData.effort,
        cost: formData.cost,
        area: formData.area || undefined,
        tags: formData.tags,
        properties: {},
        created: new Date(),
        modified: new Date()
      }
      
      addTask(newTask)
      onClose()
    } catch (error) {
      console.error('Failed to create task:', error)
      setErrors({ title: 'Failed to create task. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle tag addition
  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
      setTagInput('')
    }
  }

  // Handle tag removal
  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  // Get areas based on context
  const areas = currentContext === 'work' ? WORK_AREAS : HOME_AREAS

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={cn(
              "w-full px-3 py-2 border rounded-md shadow-sm",
              "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
              errors.title && "border-red-500"
            )}
            placeholder="Enter task title..."
            autoFocus
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={3}
            placeholder="Add task details..."
          />
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TASK_STATUSES.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: status.value })}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md border transition-all",
                    formData.status === status.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750"
                  )}
                >
                  <span>{status.icon}</span>
                  <span className="text-sm">{status.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRIORITIES.map((priority) => (
                <button
                  key={priority.value || 'none'}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: priority.value })}
                  className={cn(
                    "px-3 py-2 rounded-md border transition-all text-sm font-medium",
                    formData.priority === priority.value
                      ? priority.color
                      : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750"
                  )}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Project and Area */}
        <div className="grid grid-cols-2 gap-4">
          {/* Project */}
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project
            </label>
            <select
              id="project"
              value={formData.project || ''}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">No Project</option>
              {projects
                .filter(p => p.context === currentContext && p.status === 'ACTIVE')
                .map(project => (
                  <option key={project.id} value={project.title}>
                    {project.title}
                  </option>
                ))}
            </select>
          </div>

          {/* Area */}
          <div>
            <label htmlFor="area" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Area
            </label>
            <select
              id="area"
              value={formData.area || ''}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">No Area</option>
              {areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          {/* Scheduled */}
          <div>
            <label htmlFor="scheduled" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Scheduled Date
            </label>
            <input
              type="date"
              id="scheduled"
              value={formData.scheduled ? formData.scheduled.toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                scheduled: e.target.value ? new Date(e.target.value) : undefined 
              })}
              className={cn(
                "w-full px-3 py-2 border rounded-md shadow-sm",
                "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                errors.scheduled && "border-red-500"
              )}
            />
            {errors.scheduled && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduled}</p>
            )}
          </div>

          {/* Deadline */}
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Deadline
            </label>
            <input
              type="date"
              id="deadline"
              value={formData.deadline ? formData.deadline.toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                deadline: e.target.value ? new Date(e.target.value) : undefined 
              })}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Effort and Cost */}
        <div className="grid grid-cols-2 gap-4">
          {/* Effort */}
          <div>
            <label htmlFor="effort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Effort (hours)
            </label>
            <input
              type="number"
              id="effort"
              value={formData.effort || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                effort: e.target.value ? parseFloat(e.target.value) : undefined 
              })}
              className={cn(
                "w-full px-3 py-2 border rounded-md shadow-sm",
                "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                errors.effort && "border-red-500"
              )}
              min="0"
              max="100"
              step="0.5"
              placeholder="e.g., 2.5"
            />
            {errors.effort && (
              <p className="mt-1 text-sm text-red-600">{errors.effort}</p>
            )}
          </div>

          {/* Cost (for home context) */}
          {currentContext === 'home' && (
            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cost ($)
              </label>
              <input
                type="number"
                id="cost"
                value={formData.cost || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  cost: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                className={cn(
                  "w-full px-3 py-2 border rounded-md shadow-sm",
                  "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                  errors.cost && "border-red-500"
                )}
                min="0"
                step="0.01"
                placeholder="e.g., 25.00"
              />
              {errors.cost && (
                <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              className="flex-1 px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Add a tag..."
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddTag}
            >
              Add
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-xs hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}