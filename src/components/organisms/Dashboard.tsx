import React, { useEffect } from 'react'
import { PageLayout } from '../templates/PageLayout'
import { KpiCard } from '../molecules/KpiCard'
import { Card } from '../molecules/Card'  // Card is in molecules, not atoms
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'
import { useTaskStore, useAppStore } from '../../lib/stores'
import { cn } from '../../lib/utils/cn'

export interface DashboardProps {
  className?: string
}

export function Dashboard({ className }: DashboardProps) {
  const {
    loading,
    error,
    syncData,
    getTaskStats,
    getOverdueTasks,
    getTodaysTasks
  } = useTaskStore()
  
  const { currentContext } = useAppStore()
  
  const stats = getTaskStats()
  const overdueTasks = getOverdueTasks()
  const todaysTasks = getTodaysTasks()
  
  // Auto-sync data on mount
  useEffect(() => {
    syncData()
  }, [syncData])
  
  if (loading) {
    return (
      <PageLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </PageLayout>
    )
  }
  
  if (error) {
    return (
      <PageLayout title="Dashboard">
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
    <PageLayout title="Dashboard">
      <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {currentContext === 'work' ? 'Work' : 'Personal'} productivity overview
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
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Tasks"
          value={stats.total}
          subtitle={`${stats.completed} completed`}
          badge={{
            text: `${Math.round(stats.completionRate)}%`,
            variant: stats.completionRate > 75 ? 'success' : stats.completionRate > 50 ? 'progress' : 'blocked'
          }}
          icon="📋"
        />
        
        <KpiCard
          title="Due Today"
          value={todaysTasks.length}
          subtitle="Tasks scheduled for today"
          badge={todaysTasks.length > 0 ? {
            text: 'Active',
            variant: 'progress'
          } : undefined}
          icon="📅"
        />
        
        <KpiCard
          title="Overdue"
          value={overdueTasks.length}
          subtitle="Tasks past deadline"
          badge={overdueTasks.length > 0 ? {
            text: 'Attention',
            variant: 'blocked'
          } : {
            text: 'On Track',
            variant: 'success'
          }}
          icon="⚠️"
        />
        
        <KpiCard
          title="In Progress"
          value={stats.inProgress}
          subtitle="Active next actions"
          badge={{
            text: 'NEXT',
            variant: 'progress'
          }}
          icon="🚀"
        />
      </div>
      
      {/* Context Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Context Breakdown
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Work</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stats.byContext.work}</span>
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ 
                      width: `${stats.total > 0 ? (stats.byContext.work / stats.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Home</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stats.byContext.home}</span>
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className="h-full bg-purple-500 rounded-full" 
                    style={{ 
                      width: `${stats.total > 0 ? (stats.byContext.home / stats.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Priority Distribution
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="blocked">A</Badge>
                <span className="text-sm text-gray-600 dark:text-gray-300">High Priority</span>
              </div>
              <span className="text-sm font-medium">{stats.byPriority.A}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="progress">B</Badge>
                <span className="text-sm text-gray-600 dark:text-gray-300">Medium Priority</span>
              </div>
              <span className="text-sm font-medium">{stats.byPriority.B}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">C</Badge>
                <span className="text-sm text-gray-600 dark:text-gray-300">Low Priority</span>
              </div>
              <span className="text-sm font-medium">{stats.byPriority.C}</span>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Recent Tasks */}
      {todaysTasks.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Today&apos;s Tasks
            </h3>
            <Badge variant="progress">{todaysTasks.length} tasks</Badge>
          </div>
          <div className="space-y-3">
            {todaysTasks.slice(0, 5).map((task) => (
              <div 
                key={task.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        task.status === 'DONE' ? 'success' :
                        task.status === 'NEXT' ? 'progress' :
                        task.status === 'WAITING' ? 'planning' :
                        'secondary'
                      }
                    >
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
                  <Badge 
                    variant={
                      task.priority === 'A' ? 'blocked' :
                      task.priority === 'B' ? 'progress' :
                      'secondary'
                    }
                  >
                    {task.priority}
                  </Badge>
                )}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="flex flex-col items-center p-4 h-auto">
            <span className="text-2xl mb-2">📝</span>
            <span className="text-sm">Add Task</span>
          </Button>
          
          <Button className="flex flex-col items-center p-4 h-auto">
            <span className="text-2xl mb-2">📥</span>
            <span className="text-sm">Process Inbox</span>
          </Button>
          
          <Button className="flex flex-col items-center p-4 h-auto">
            <span className="text-2xl mb-2">📊</span>
            <span className="text-sm">View Projects</span>
          </Button>
          
          <Button className="flex flex-col items-center p-4 h-auto">
            <span className="text-2xl mb-2">📅</span>
            <span className="text-sm">Daily Plan</span>
          </Button>
        </div>
      </Card>
      </div>
    </PageLayout>
  )
}