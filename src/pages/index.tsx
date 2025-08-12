import React from 'react'
import { PageLayout } from '../components/layout/PageLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

export default function HomePage() {
  return (
    <PageLayout
      title="GTD Org Front"
      actions={
        <Button>
          Get Started
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Welcome to GTD Org Front</CardTitle>
            <CardDescription>
              A premium, local-first productivity application for managing your GTD workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              This application combines the visual appeal of modern productivity tools like Monday.com 
              and Linear with the power of org-mode files, running entirely on your local machine.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Local-First</Badge>
              <Badge variant="planning">Org-Mode Integration</Badge>
              <Badge variant="progress">Premium Design</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Tasks</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Projects</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completed Today</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>📊 Rich Dashboard Views</li>
              <li>📅 Daily Planning Interface</li>
              <li>📁 Project Management</li>
              <li>📥 Inbox Processing</li>
              <li>⚙️ Flexible Settings</li>
            </ul>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Configure your org-mode directories to start using the application.
            </p>
            <Button variant="outline" className="w-full">
              Open Settings
            </Button>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Development Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Session 1: Foundation</span>
                <Badge variant="success">Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Session 2: Data Layer</span>
                <Badge variant="progress">Next</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Session 3: Dashboard</span>
                <Badge variant="secondary">Planned</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}