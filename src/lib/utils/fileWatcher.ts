import chokidar from 'chokidar'
import { useTaskStore } from '../stores/taskStore'

export interface FileWatcherConfig {
  watchDirectories: string[]
  enabled: boolean
  debounceMs: number
}

class FileWatcher {
  private watcher: chokidar.FSWatcher | null = null
  private config: FileWatcherConfig
  private debounceTimer: NodeJS.Timeout | null = null

  constructor(config: FileWatcherConfig) {
    this.config = config
  }

  start() {
    if (!this.config.enabled || this.watcher) {
      return
    }

    console.log('🔍 Starting file watcher for org files...')
    
    this.watcher = chokidar.watch(this.config.watchDirectories, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      usePolling: false,
      ignoreInitial: true
    })

    this.watcher
      .on('add', (path) => this.handleFileChange('add', path))
      .on('change', (path) => this.handleFileChange('change', path))
      .on('unlink', (path) => this.handleFileChange('unlink', path))
      .on('error', (error) => {
        console.error('File watcher error:', error)
      })
      .on('ready', () => {
        console.log('✅ File watcher ready. Watching for org file changes...')
      })
  }

  stop() {
    if (this.watcher) {
      console.log('⏹️ Stopping file watcher...')
      this.watcher.close()
      this.watcher = null
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }

  private handleFileChange(event: string, filePath: string) {
    // Only watch .org files
    if (!filePath.endsWith('.org')) {
      return
    }

    console.log(`📝 File ${event}: ${filePath}`)

    // Debounce rapid file changes
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(() => {
      this.syncData()
    }, this.config.debounceMs)
  }

  private async syncData() {
    try {
      console.log('🔄 File change detected, syncing data...')
      const taskStore = useTaskStore.getState()
      await taskStore.syncData()
      console.log('✅ Data sync completed')
    } catch (error) {
      console.error('❌ Failed to sync data after file change:', error)
    }
  }

  updateConfig(newConfig: Partial<FileWatcherConfig>) {
    const wasEnabled = this.config.enabled
    this.config = { ...this.config, ...newConfig }

    // Restart watcher if configuration changed
    if (wasEnabled !== this.config.enabled) {
      this.stop()
      if (this.config.enabled) {
        this.start()
      }
    }
  }
}

// Global file watcher instance
let fileWatcher: FileWatcher | null = null

export function initializeFileWatcher(config: FileWatcherConfig): FileWatcher {
  if (fileWatcher) {
    fileWatcher.stop()
  }

  fileWatcher = new FileWatcher(config)
  fileWatcher.start()
  
  return fileWatcher
}

export function getFileWatcher(): FileWatcher | null {
  return fileWatcher
}

export function stopFileWatcher(): void {
  if (fileWatcher) {
    fileWatcher.stop()
    fileWatcher = null
  }
}

// Hook for React components
export function useFileWatcher() {
  const startWatcher = (config: FileWatcherConfig) => {
    return initializeFileWatcher(config)
  }

  const stopWatcher = () => {
    stopFileWatcher()
  }

  const isWatching = () => {
    return fileWatcher !== null
  }

  return {
    startWatcher,
    stopWatcher,
    isWatching: isWatching()
  }
}

// Auto-initialize file watcher in development
if (typeof window !== 'undefined') {
  // Browser environment - initialize file watcher
  const orgWorkDir = process.env.NEXT_PUBLIC_ORG_WORK_DIR || './org-files/work'
  const orgHomeDir = process.env.NEXT_PUBLIC_ORG_HOME_DIR || './org-files/home'
  
  initializeFileWatcher({
    watchDirectories: [orgWorkDir, orgHomeDir],
    enabled: true,
    debounceMs: 500
  })
}