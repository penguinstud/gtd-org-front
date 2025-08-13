import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { PageLayout } from '../components/templates/PageLayout'
import { Card } from '../components/molecules/Card'
import { Badge } from '../components/atoms/Badge'
import { Button } from '../components/atoms/Button'
import { useTaskStore, useAppStore } from '../lib/stores'
import { cn } from '../lib/utils/cn'
import { Task } from '../lib/types'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Generate time slots from 9AM to 9PM
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 9; hour <= 21; hour++) {
    const time = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`
    slots.push({
      hour,
      time,
      displayTime: time
    })
  }
  return slots
}

// Draggable Task Component with Duration Visualization
interface DraggableTaskProps {
  task: Task
  isDragging?: boolean
  isCompact?: boolean
  showResizeHandle?: boolean
  onResizeStart?: (e: React.MouseEvent) => void
  onResizeEnd?: () => void
}

function DraggableTask({
  task,
  isDragging = false,
  isCompact = false,
  showResizeHandle = false,
  onResizeStart,
  onResizeEnd
}: DraggableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  // Check if this is a meeting
  const isMeeting = task.tags?.includes('meeting') || task.title.toLowerCase().includes('meeting')

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative bg-white dark:bg-gray-800 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-move group",
        isDragging ? "border-blue-500 dark:border-blue-400 shadow-lg" : "border-gray-200 dark:border-gray-700",
        isMeeting && "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-300 dark:border-blue-700",
        isCompact ? "p-2" : "p-3"
      )}
    >
      {/* Priority indicator bar */}
      {task.priority && (
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
          task.priority === 'A' ? 'bg-red-500' :
          task.priority === 'B' ? 'bg-yellow-500' :
          'bg-green-500'
        )} />
      )}
      
      <div className={cn("group", task.priority && "ml-2")}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isMeeting && (
                <span className="text-xs">📅</span>
              )}
              {task.scheduled && !isCompact && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(task.scheduled).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              )}
              {task.duration && !isCompact && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {task.duration} min
                </span>
              )}
              {!isCompact && (
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
            </div>
            <h4 className={cn(
              "font-medium text-gray-900 dark:text-white",
              isCompact ? "text-xs truncate" : "text-sm"
            )}>
              {task.title}
            </h4>
            {task.project && !isCompact && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                📁 {task.project}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {showResizeHandle && (
              <div
                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-ns-resize px-1 py-2"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  onResizeStart?.(e)
                }}
                onMouseUp={() => onResizeEnd?.()}
              >
                <span className="text-gray-400 text-xs">⋮⋮</span>
              </div>
            )}
            {!isCompact && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-gray-400">⋮⋮⋮</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Task with Duration Block Component
interface TaskWithDurationProps {
  task: Task
  hour: number
  timeSlots: { hour: number; time: string; displayTime: string }[]
}

function TaskWithDuration({ task, hour }: TaskWithDurationProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [tempDuration, setTempDuration] = useState(task.duration || 60)
  const resizeStartY = useRef<number>(0)
  const originalDuration = useRef<number>(task.duration || 60)
  
  const { updateTask } = useTaskStore()
  
  // Calculate how many time slots this task spans
  const duration = task.duration || 60
  
  // Check if task extends beyond visible time slots
  const endHour = hour + Math.ceil(duration / 60)
  const isOverflowing = endHour > 21
  
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    resizeStartY.current = e.clientY
    originalDuration.current = task.duration || 60
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - resizeStartY.current
      const deltaMinutes = Math.round((deltaY / 80) * 60) // 80px = 60 minutes
      const newDuration = Math.max(15, Math.min(480, originalDuration.current + deltaMinutes)) // Min 15 min, max 8 hours
      setTempDuration(newDuration)
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      if (tempDuration !== task.duration) {
        updateTask(task.id, {
          duration: tempDuration,
          modified: new Date()
        })
      }
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [task, tempDuration, updateTask])
  
  const displayDuration = isResizing ? tempDuration : duration
  const displayHeight = (displayDuration / 60) * 80
  
  return (
    <div
      className="relative"
      style={{
        height: `${displayHeight}px`,
        minHeight: '60px'
      }}
    >
      <div className={cn(
        "absolute inset-0 rounded-lg transition-all",
        isResizing && "ring-2 ring-blue-500 ring-offset-2"
      )}>
        <DraggableTask
          task={task}
          isCompact={displayDuration < 45}
          showResizeHandle={true}
          onResizeStart={handleResizeStart}
        />
        
        {/* Duration indicator overlay */}
        {isResizing && (
          <div className="absolute -right-16 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
            {displayDuration} min
          </div>
        )}
        
        {/* Overflow indicator */}
        {isOverflowing && !isResizing && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-orange-600 dark:text-orange-400 font-medium">
            ↓ Continues
          </div>
        )}
      </div>
    </div>
  )
}

// Time Slot Component with Drop Zone and Duration Support
interface TimeSlotProps {
  hour: number
  time: string
  tasks: Task[]
  isCurrentHour: boolean
  timeSlots: { hour: number; time: string; displayTime: string }[]
}

function TimeSlot({ hour, time, tasks, isCurrentHour, timeSlots }: TimeSlotProps) {
  const {
    setNodeRef,
    isOver,
  } = useSortable({
    id: `slot-${hour}`,
    data: {
      type: 'timeslot',
      hour,
    }
  })

  // Group overlapping tasks
  const getTaskLayout = (tasks: Task[]) => {
    if (tasks.length === 0) return []
    
    // Sort tasks by scheduled time
    const sortedTasks = [...tasks].sort((a, b) => {
      if (!a.scheduled || !b.scheduled) return 0
      return new Date(a.scheduled).getTime() - new Date(b.scheduled).getTime()
    })
    
    // For now, simple stacking - could be enhanced for side-by-side layout
    return sortedTasks
  }

  const layoutTasks = getTaskLayout(tasks)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex gap-4 min-h-[80px] border-b border-gray-200 dark:border-gray-700 transition-colors relative',
        isCurrentHour && 'bg-blue-50 dark:bg-blue-900/20',
        isOver && 'bg-blue-100 dark:bg-blue-900/30'
      )}
      style={{ height: '80px' }}
    >
      {/* Time label */}
      <div className="w-24 py-4 pr-4 text-right">
        <span className={cn(
          'text-sm font-medium',
          isCurrentHour ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
        )}>
          {time}
        </span>
      </div>
      
      {/* Task slot */}
      <div className="flex-1 relative py-2 pr-4">
        {layoutTasks.length > 0 ? (
          <SortableContext
            items={layoutTasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="relative">
              {layoutTasks.map((task, index) => {
                // Check if task has duration and should be rendered as a block
                if (task.duration && task.duration > 30) {
                  return (
                    <div key={task.id} className="absolute top-0 left-0 right-0" style={{
                      zIndex: layoutTasks.length - index,
                      marginLeft: index * 8 + 'px' // Slight offset for overlapping tasks
                    }}>
                      <TaskWithDuration
                        task={task}
                        hour={hour}
                        timeSlots={timeSlots}
                      />
                    </div>
                  )
                } else {
                  return (
                    <div key={task.id} className="mb-2">
                      <DraggableTask task={task} />
                    </div>
                  )
                }
              })}
            </div>
          </SortableContext>
        ) : (
          <div className="h-full flex items-center">
            <div className={cn(
              "w-full h-12 border-2 border-dashed rounded-lg flex items-center justify-center text-sm transition-colors cursor-pointer",
              isOver
                ? "border-blue-400 dark:border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10"
                : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-500 dark:hover:text-gray-400"
            )}>
              {isOver ? '📥 Drop task here' : '+ Add task'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DailyPage() {
  const { loading, error, syncData, getScheduledTasksForDate, updateTask } = useTaskStore()
  const { currentContext } = useAppStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )
  
  // Get current date and hour
  const now = new Date()
  const currentHour = now.getHours()
  
  // Generate time slots
  const timeSlots = useMemo(() => generateTimeSlots(), [])
  
  // Get today's scheduled tasks
  const todaysTasks = useMemo(() => {
    return getScheduledTasksForDate(selectedDate)
  }, [getScheduledTasksForDate, selectedDate])
  
  // Group tasks by hour based on their scheduled time
  const { tasksByHour, unscheduledTasks } = useMemo(() => {
    const grouped: Record<number, Task[]> = {}
    const unscheduled: Task[] = []
    
    // Initialize all hours
    timeSlots.forEach(slot => {
      grouped[slot.hour] = []
    })
    
    // Group tasks by their scheduled hour
    todaysTasks.forEach((task) => {
      if (task.scheduled) {
        const scheduledDate = new Date(task.scheduled)
        const hour = scheduledDate.getHours()
        
        // Only add to time slots if within our 9AM-9PM range
        if (hour >= 9 && hour <= 21 && grouped[hour]) {
          grouped[hour].push(task)
        } else {
          // Tasks scheduled outside our time range go to unscheduled
          unscheduled.push(task)
        }
      } else {
        // Tasks without scheduled time
        unscheduled.push(task)
      }
    })
    
    // Sort tasks within each hour by their exact scheduled time
    Object.keys(grouped).forEach(hour => {
      grouped[parseInt(hour)].sort((a, b) => {
        if (!a.scheduled || !b.scheduled) return 0
        return new Date(a.scheduled).getTime() - new Date(b.scheduled).getTime()
      })
    })
    
    return { tasksByHour: grouped, unscheduledTasks: unscheduled }
  }, [todaysTasks, timeSlots])
  
  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = todaysTasks.find(t => t.id === event.active.id)
    if (task) {
      setActiveTask(task)
    }
  }, [todaysTasks])
  
  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    
    if (!over) return
    
    // Check if we're dropping on a time slot
    if (typeof over.id === 'string' && over.id.startsWith('slot-')) {
      const targetHour = parseInt(over.id.replace('slot-', ''))
      const taskId = active.id as string
      const task = todaysTasks.find(t => t.id === taskId)
      
      // Update the task's scheduled time
      const newScheduledDate = new Date(selectedDate)
      newScheduledDate.setHours(targetHour, 0, 0, 0)
      
      // If task doesn't have duration, give it a default
      const updates: Partial<Task> = {
        scheduled: newScheduledDate,
        modified: new Date()
      }
      
      if (task && !task.duration) {
        updates.duration = 60 // Default 1 hour duration
      }
      
      updateTask(taskId, updates)
    }
    // Handle reordering within the same slot
    else if (active.id !== over.id) {
      // Find which hour both tasks belong to
      const sourceTask = todaysTasks.find(t => t.id === active.id)
      const targetTask = todaysTasks.find(t => t.id === over.id)
      
      if (sourceTask && targetTask && sourceTask.scheduled && targetTask.scheduled) {
        // Swap the exact times while keeping the same hour
        const sourceTime = new Date(sourceTask.scheduled)
        const targetTime = new Date(targetTask.scheduled)
        
        updateTask(sourceTask.id, { 
          scheduled: targetTime,
          modified: new Date()
        })
        updateTask(targetTask.id, { 
          scheduled: sourceTime,
          modified: new Date()
        })
      }
    }
  }, [todaysTasks, updateTask, selectedDate])
  
  
  // Navigation handlers
  const handlePreviousDay = () => {
    const prev = new Date(selectedDate)
    prev.setDate(prev.getDate() - 1)
    setSelectedDate(prev)
  }
  
  const handleNextDay = () => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + 1)
    setSelectedDate(next)
  }
  
  const handleToday = () => {
    setSelectedDate(new Date())
  }
  
  // Auto-sync data on mount
  useEffect(() => {
    syncData()
  }, [syncData])
  
  if (loading) {
    return (
      <PageLayout title="Daily View">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading daily schedule...</div>
        </div>
      </PageLayout>
    )
  }
  
  if (error) {
    return (
      <PageLayout title="Daily View">
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
    <PageLayout title="Daily View">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Daily Schedule
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={currentContext === 'work' ? 'progress' : 'planning'}>
                {currentContext === 'work' ? '💼 Work' : '🏠 Home'}
              </Badge>
              <Button variant="outline" onClick={handlePreviousDay}>
                ← Previous
              </Button>
              <Button variant="primary" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" onClick={handleNextDay}>
                Next →
              </Button>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{todaysTasks.length}</p>
                </div>
                <span className="text-2xl">📋</span>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {todaysTasks.filter(t => t.status === 'DONE').length}
                  </p>
                </div>
                <span className="text-2xl">✅</span>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {todaysTasks.filter(t => t.status === 'NEXT').length}
                  </p>
                </div>
                <span className="text-2xl">🚀</span>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">High Priority</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {todaysTasks.filter(t => t.priority === 'A').length}
                  </p>
                </div>
                <span className="text-2xl">⚡</span>
              </div>
            </Card>
          </div>
          
          {/* Time Grid */}
          <Card className="overflow-hidden">
            <div className="p-6 pb-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Schedule
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700 relative">
              {/* Current time indicator */}
              {currentHour >= 9 && currentHour <= 21 && selectedDate.toDateString() === now.toDateString() && (
                <div
                  className="absolute left-0 right-0 h-0.5 bg-blue-500 z-10 pointer-events-none"
                  style={{
                    top: `${(currentHour - 9) * 80 + 40 + (now.getMinutes() / 60) * 80}px`
                  }}
                >
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                </div>
              )}
              
              {/* Time slots */}
              <SortableContext
                items={[...timeSlots.map(s => `slot-${s.hour}`), ...todaysTasks.map(t => t.id)]}
                strategy={verticalListSortingStrategy}
              >
                {timeSlots.map((slot) => (
                  <TimeSlot
                    key={slot.hour}
                    hour={slot.hour}
                    time={slot.displayTime}
                    tasks={tasksByHour[slot.hour] || []}
                    isCurrentHour={slot.hour === currentHour && selectedDate.toDateString() === now.toDateString()}
                    timeSlots={timeSlots}
                  />
                ))}
              </SortableContext>
            </div>
          </Card>
          
          {/* Unscheduled Tasks */}
          {unscheduledTasks.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Unscheduled Tasks
                <Badge variant="secondary" className="ml-2">{unscheduledTasks.length}</Badge>
              </h3>
              <SortableContext
                items={unscheduledTasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {unscheduledTasks.map((task) => (
                    <DraggableTask key={task.id} task={task} />
                  ))}
                </div>
              </SortableContext>
            </Card>
          )}
          
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-4">
              {/* Primary Actions */}
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">
                  <span className="mr-2">📝</span>
                  Add Task
                </Button>
                <Button variant="outline">
                  <span className="mr-2">📅</span>
                  Schedule Meeting
                </Button>
                <Button variant="outline">
                  <span className="mr-2">🔄</span>
                  Sync Calendar
                </Button>
                <Button variant="outline">
                  <span className="mr-2">📊</span>
                  View Week
                </Button>
              </div>
              
              {/* Quick Duration Presets */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick Duration Presets:</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      // Quick 15-minute task - TODO: Implement task creation
                      // Will be implemented when add task modal is ready
                    }}
                  >
                    15 min
                  </button>
                  <button
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      // Quick 30-minute task - TODO: Implement task creation
                      // Will be implemented when add task modal is ready
                    }}
                  >
                    30 min
                  </button>
                  <button
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      // Quick 1-hour task - TODO: Implement task creation
                      // Will be implemented when add task modal is ready
                    }}
                  >
                    1 hour
                  </button>
                  <button
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      // Quick 2-hour block - TODO: Implement task creation
                      // Will be implemented when add task modal is ready
                    }}
                  >
                    2 hours
                  </button>
                  <button
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    onClick={() => {
                      // Quick meeting block - TODO: Implement task creation
                      // Will be implemented when add task modal is ready
                    }}
                  >
                    📅 Meeting (1h)
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-90">
              <DraggableTask task={activeTask} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </PageLayout>
  )
}