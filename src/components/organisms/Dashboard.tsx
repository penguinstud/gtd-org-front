import React, { useEffect } from 'react'
import { PageLayout } from '../templates/PageLayout'
import { KpiCard } from '../molecules/KpiCard'
import { Card } from '../molecules/Card'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'
import { ContextStatsCard } from '../molecules/ContextStatsCard'
import { PriorityDistributionCard } from '../molecules/PriorityDistributionCard'
import { TaskListCard } from '../molecules/TaskListCard'
import { QuickActionButton } from '../molecules/QuickActionButton'
import { useTaskStore, useAppStore } from '../../lib/stores'
import { getCompletionRateBadgeVariant } from '../../lib/utils/badges'
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
        <DashboardHeader 
          currentContext={currentContext}
          loading={loading}
          onSync={syncData}
        />
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Total Tasks"
            value={stats.total}
            subtitle={`${stats.completed} completed`}
            badge={{
              text: `${Math.round(stats.completionRate)}%`,
              variant: getCompletionRateBadgeVariant(stats.completionRate)
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
        
        {/* Context & Priority Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ContextStatsCard stats={stats.byContext} />
          <PriorityDistributionCard priorities={stats.byPriority} />
        </div>
        
        {/* Today's Tasks */}
        <TaskListCard 
          title="Today's Tasks"
          tasks={todaysTasks}
          badgeText={`${todaysTasks.length} tasks`}
        />
        
        {/* Quick Actions */}
        <QuickActionsSection />
      </div>
    </PageLayout>
  )
}

interface DashboardHeaderProps {
  currentContext: 'work' | 'home'
  loading: boolean
  onSync: () => void
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ currentContext, loading, onSync }) => (
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
      <Button onClick={onSync} disabled={loading}>
        {loading ? 'Syncing...' : 'Sync'}
      </Button>
    </div>
  </div>
)

const QuickActionsSection: React.FC = () => {
  const quickActions = [
    { icon: '📝', label: 'Add Task', onClick: () => {} },
    { icon: '📥', label: 'Process Inbox', onClick: () => {} },
    { icon: '📊', label: 'View Projects', onClick: () => {} },
    { icon: '📅', label: 'Daily Plan', onClick: () => {} }
  ]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <QuickActionButton key={action.label} {...action} />
        ))}
      </div>
    </Card>
  )
}