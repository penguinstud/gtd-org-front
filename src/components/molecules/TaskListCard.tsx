import React from 'react'
import { Card } from './Card'
import { Badge } from '../atoms/Badge'
import { getStatusBadgeVariant, getPriorityBadgeVariant } from '../../lib/utils/badges'
import type { Task } from '../../lib/types'

interface TaskListCardProps {
  title: string
  tasks: Task[]
  maxItems?: number
  badgeText?: string
}

export const TaskListCard: React.FC<TaskListCardProps> = ({ 
  title, 
  tasks, 
  maxItems = 5,
  badgeText 
}) => {
  if (tasks.length === 0) return null

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {badgeText && (
          <Badge variant="progress">{badgeText}</Badge>
        )}
      </div>
      <div className="space-y-3">
        {tasks.slice(0, maxItems).map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </div>
    </Card>
  )
}

interface TaskRowProps {
  task: Task
}

const TaskRow: React.FC<TaskRowProps> = ({ task }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <Badge variant={getStatusBadgeVariant(task.status)}>
          {task.status}
        </Badge>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {task.title}
        </span>
      </div>
      {task.project && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          📁 {task.project}
        </div>
      )}
    </div>
    {task.priority && (
      <Badge variant={getPriorityBadgeVariant(task.priority)}>
        {task.priority}
      </Badge>
    )}
  </div>
)