import React, { useEffect, useMemo } from 'react'
import { PageLayout } from '../components/templates/PageLayout'
import { Card } from '../components/molecules/Card'
import { Badge } from '../components/atoms/Badge'
import { Button } from '../components/atoms/Button'
import { useTaskStore, useAppStore } from '../lib/stores'
import { cn } from '../lib/utils/cn'
import { Task } from '../lib/types'

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

interface TimeSlotProps {
  hour: number
  time: string
  tasks: Task[]
  isCurrentHour: boolean
}

function TimeSlot({ time, tasks, isCurrentHour }: TimeSlotProps) {
  return (
    <div className={cn(
      'flex gap-4 min-h-[80px] border-b border-gray-200 dark:border-gray-700',
      isCurrentHour && 'bg-blue-50 dark:bg-blue-900/20'
    )}>
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
      <div className="flex-1 py-4 pr-4">
        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {task.scheduled && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(task.scheduled).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        )}
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
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </h4>
                      {task.project && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          📁 {task.project}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                      ⋮
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center">
            <div className="w-full h-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors cursor-pointer">
              + Add task
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DailyPage() {
  const { loading, error, syncData, getScheduledTasksForDate } = useTaskStore()
  const { currentContext } = useAppStore()
  
  // Get current date and hour
  const now = new Date()
  const currentHour = now.getHours()
  
  // Generate time slots
  const timeSlots = useMemo(() => generateTimeSlots(), [])
  
  // Get today's scheduled tasks
  const todaysTasks = useMemo(() => {
    return getScheduledTasksForDate(new Date())
  }, [getScheduledTasksForDate])
  
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Daily Schedule
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={currentContext === 'work' ? 'progress' : 'planning'}>
              {currentContext === 'work' ? '💼 Work' : '🏠 Home'}
            </Badge>
            <Button variant="outline">
              ← Previous
            </Button>
            <Button variant="primary">
              Today
            </Button>
            <Button variant="outline">
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
            {currentHour >= 9 && currentHour <= 21 && (
              <div
                className="absolute left-0 right-0 h-0.5 bg-blue-500 z-10 pointer-events-none"
                style={{
                  top: `${(currentHour - 9) * 80 + 40 + (new Date().getMinutes() / 60) * 80}px`
                }}
              >
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full" />
              </div>
            )}
            
            {/* Time slots */}
            {timeSlots.map((slot) => (
              <TimeSlot
                key={slot.hour}
                hour={slot.hour}
                time={slot.displayTime}
                tasks={tasksByHour[slot.hour] || []}
                isCurrentHour={slot.hour === currentHour}
              />
            ))}
          </div>
        </Card>
        
        {/* Unscheduled Tasks */}
        {unscheduledTasks.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Unscheduled Tasks
              <Badge variant="secondary" className="ml-2">{unscheduledTasks.length}</Badge>
            </h3>
            <div className="space-y-2">
              {unscheduledTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
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
                        {task.deadline && (
                          <span className="text-xs text-orange-600 dark:text-orange-400">
                            Due: {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </h4>
                      {task.project && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          📁 {task.project}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                      ⋮
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
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
        </Card>
      </div>
    </PageLayout>
  )
}