import React, { useState, useEffect } from 'react'
import { PageLayout } from '../components/templates/PageLayout'
import { Card } from '../components/molecules/Card'
import { Button } from '../components/atoms/Button'
import { Badge } from '../components/atoms/Badge'
import { useAppStore } from '../lib/stores'
import { cn } from '../lib/utils/cn'
import { AppSettings, UserPreferences } from '../lib/types'

// Settings Section Component
interface SettingsSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </Card>
  )
}

// Setting Item Component
interface SettingItemProps {
  label: string
  description?: string
  children: React.ReactNode
}

function SettingItem({ label, description, children }: SettingItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <div className="flex items-center">{children}</div>
    </div>
  )
}

// Toggle Switch Component
interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

function ToggleSwitch({ checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  )
}

// Main Settings Page Component
export default function SettingsPage() {
  const { settings, updateSettings, user, setUser, currentContext } = useAppStore()
  
  // Local state for unsaved changes
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings)
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    defaultContext: currentContext,
    theme: 'system',
    enableAnimations: true,
    notifications: {
      deadlines: true,
      dailyReview: true,
      weeklyReview: false
    },
    orgPaths: {
      workDir: '/org-files/work',
      homeDir: '/org-files/home'
    }
  })
  
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Load user preferences if user exists
  useEffect(() => {
    if (user?.preferences) {
      setUserPreferences(user.preferences)
    }
  }, [user])
  
  // Check for changes
  useEffect(() => {
    const settingsChanged = JSON.stringify(localSettings) !== JSON.stringify(settings)
    const prefsChanged = user?.preferences && JSON.stringify(userPreferences) !== JSON.stringify(user.preferences)
    setHasChanges(settingsChanged || !!prefsChanged)
  }, [localSettings, settings, userPreferences, user])
  
  // Handle settings update
  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }
  
  // Handle preference update
  const handlePreferenceChange = (path: string[], value: any) => {
    setUserPreferences(prev => {
      const newPrefs = { ...prev }
      let current: any = newPrefs
      
      for (let i = 0; i < path.length - 1; i++) {
        if (!(path[i] in current)) {
          current[path[i]] = {}
        }
        current = current[path[i]]
      }
      
      current[path[path.length - 1]] = value
      return newPrefs
    })
  }
  
  // Handle theme change
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    handlePreferenceChange(['theme'], theme)
    
    // Apply theme immediately
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }
  
  // Save all changes
  const handleSave = async () => {
    setSaving(true)
    setSaveMessage(null)
    
    try {
      // Update app settings
      updateSettings(localSettings)
      
      // Update user preferences
      if (user) {
        setUser({
          ...user,
          preferences: userPreferences
        })
      }
      
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' })
      setHasChanges(false)
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }
  
  // Reset changes
  const handleReset = () => {
    setLocalSettings(settings)
    if (user?.preferences) {
      setUserPreferences(user.preferences)
    }
    setHasChanges(false)
  }
  
  return (
    <PageLayout title="Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Configure your GTD workspace
            </p>
          </div>
          <Badge variant={currentContext === 'work' ? 'progress' : 'planning'}>
            {currentContext === 'work' ? '💼 Work' : '🏠 Home'}
          </Badge>
        </div>
        
        {/* Save notification */}
        {saveMessage && (
          <Card className={cn(
            "p-4",
            saveMessage.type === 'success' ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          )}>
            <p className={cn(
              "text-sm font-medium",
              saveMessage.type === 'success' ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
            )}>
              {saveMessage.text}
            </p>
          </Card>
        )}
        
        {/* Appearance Settings */}
        <SettingsSection
          title="Appearance"
          description="Customize how the app looks and feels"
        >
          <SettingItem
            label="Theme"
            description="Choose your preferred color scheme"
          >
            <select
              value={userPreferences.theme}
              onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'system')}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </SettingItem>
          
          <SettingItem
            label="Enable Animations"
            description="Show smooth transitions and animations"
          >
            <ToggleSwitch
              checked={userPreferences.enableAnimations}
              onChange={(value) => handlePreferenceChange(['enableAnimations'], value)}
            />
          </SettingItem>
        </SettingsSection>
        
        {/* Org-Mode Configuration */}
        <SettingsSection
          title="Org-Mode Files"
          description="Configure where your org files are stored"
        >
          <SettingItem
            label="Work Directory"
            description="Path to your work-related org files"
          >
            <input
              type="text"
              value={userPreferences.orgPaths.workDir}
              onChange={(e) => handlePreferenceChange(['orgPaths', 'workDir'], e.target.value)}
              className="w-64 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
              placeholder="/path/to/work/org-files"
            />
          </SettingItem>
          
          <SettingItem
            label="Home Directory"
            description="Path to your personal org files"
          >
            <input
              type="text"
              value={userPreferences.orgPaths.homeDir}
              onChange={(e) => handlePreferenceChange(['orgPaths', 'homeDir'], e.target.value)}
              className="w-64 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
              placeholder="/path/to/home/org-files"
            />
          </SettingItem>
        </SettingsSection>
        
        {/* Sync Settings */}
        <SettingsSection
          title="Synchronization"
          description="Control how your data is synced"
        >
          <SettingItem
            label="Enable File Watching"
            description="Automatically sync when org files change"
          >
            <ToggleSwitch
              checked={localSettings.enableFileWatching}
              onChange={(value) => handleSettingChange('enableFileWatching', value)}
            />
          </SettingItem>
          
          <SettingItem
            label="Sync Interval"
            description="How often to check for file changes (in minutes)"
          >
            <input
              type="number"
              min="1"
              max="60"
              value={localSettings.syncInterval}
              onChange={(e) => handleSettingChange('syncInterval', parseInt(e.target.value) || 5)}
              className="w-20 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-center"
            />
          </SettingItem>
          
          <SettingItem
            label="Auto Backup"
            description="Automatically backup your org files"
          >
            <ToggleSwitch
              checked={localSettings.autoBackup}
              onChange={(value) => handleSettingChange('autoBackup', value)}
            />
          </SettingItem>
          
          <SettingItem
            label="Backup Retention"
            description="How many days to keep backup files"
          >
            <input
              type="number"
              min="1"
              max="365"
              value={localSettings.backupRetentionDays}
              onChange={(e) => handleSettingChange('backupRetentionDays', parseInt(e.target.value) || 30)}
              className="w-20 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-center"
              disabled={!localSettings.autoBackup}
            />
          </SettingItem>
        </SettingsSection>
        
        {/* Notifications */}
        <SettingsSection
          title="Notifications"
          description="Choose what notifications you want to receive"
        >
          <SettingItem
            label="Deadline Reminders"
            description="Get notified about approaching deadlines"
          >
            <ToggleSwitch
              checked={userPreferences.notifications.deadlines}
              onChange={(value) => handlePreferenceChange(['notifications', 'deadlines'], value)}
            />
          </SettingItem>
          
          <SettingItem
            label="Daily Review"
            description="Reminder to review your tasks each day"
          >
            <ToggleSwitch
              checked={userPreferences.notifications.dailyReview}
              onChange={(value) => handlePreferenceChange(['notifications', 'dailyReview'], value)}
            />
          </SettingItem>
          
          <SettingItem
            label="Weekly Review"
            description="Reminder for your weekly GTD review"
          >
            <ToggleSwitch
              checked={userPreferences.notifications.weeklyReview}
              onChange={(value) => handlePreferenceChange(['notifications', 'weeklyReview'], value)}
            />
          </SettingItem>
        </SettingsSection>
        
        {/* Default Context */}
        <SettingsSection
          title="Defaults"
          description="Set your default preferences"
        >
          <SettingItem
            label="Default Context"
            description="Which context to show when the app starts"
          >
            <select
              value={userPreferences.defaultContext}
              onChange={(e) => handlePreferenceChange(['defaultContext'], e.target.value as 'work' | 'home')}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
            >
              <option value="work">Work</option>
              <option value="home">Home</option>
            </select>
          </SettingItem>
        </SettingsSection>
        
        {/* Keyboard Shortcuts */}
        <SettingsSection
          title="Keyboard Shortcuts"
          description="Quick keyboard commands for common actions"
        >
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">New Task</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">⌘/Ctrl + N</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Quick Capture</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">⌘/Ctrl + K</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Go to Inbox</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">⌘/Ctrl + I</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Go to Daily</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">⌘/Ctrl + D</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Switch Context</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">⌘/Ctrl + Tab</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Search</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">⌘/Ctrl + /</kbd>
              </div>
            </div>
          </div>
        </SettingsSection>
        
        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-6">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || saving}
          >
            Reset Changes
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}