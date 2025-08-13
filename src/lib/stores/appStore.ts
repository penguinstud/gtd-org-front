import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Context, AppState, User, AppSettings } from '../types'
import { BaseContextStore } from './contextStore'
import { useWorkStore } from './workStore'
import { useHomeStore } from './homeStore'

interface AppStore extends AppState {
  // Actions
  setCurrentContext: (context: Context) => void
  setUser: (user: User) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  toggleContext: () => void
  
  // UI state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Loading states
  isInitializing: boolean
  setInitializing: (loading: boolean) => void
  
  // Context management
  getActiveStore: () => BaseContextStore
  getWorkStore: () => BaseContextStore
  getHomeStore: () => BaseContextStore
  syncAllContexts: () => Promise<void>
  resetAllContexts: () => void
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set: (partial: Partial<AppStore> | ((state: AppStore) => Partial<AppStore>)) => void, get: () => AppStore) => ({
        // Initial state
        currentContext: 'work',
        user: undefined,
        settings: {
          enableFileWatching: true,
          autoBackup: true,
          backupRetentionDays: 30,
          syncInterval: 5
        },
        sidebarOpen: true,
        isInitializing: true,

        // Actions
        setCurrentContext: (context: Context) => {
          set({ currentContext: context })
          
          // Trigger sync for the new active context
          const activeStore = context === 'work' ? useWorkStore : useHomeStore
          activeStore.getState().syncData()
        },
        
        setUser: (user: User) => set({ user }),
        
        updateSettings: (newSettings: Partial<AppSettings>) =>
          set((state: AppStore) => ({
            settings: { ...state.settings, ...newSettings }
          })),
        
        toggleContext: () => {
          const currentContext = get().currentContext
          const newContext = currentContext === 'work' ? 'home' : 'work'
          get().setCurrentContext(newContext)
        },
        
        setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
        
        setInitializing: (loading: boolean) => set({ isInitializing: loading }),
        
        // Context management methods
        getActiveStore: () => {
          const { currentContext } = get()
          return currentContext === 'work' ? useWorkStore.getState() : useHomeStore.getState()
        },
        
        getWorkStore: () => useWorkStore.getState(),
        
        getHomeStore: () => useHomeStore.getState(),
        
        syncAllContexts: async () => {
          try {
            await Promise.all([
              useWorkStore.getState().syncData(),
              useHomeStore.getState().syncData()
            ])
          } catch (error) {
            // Failed to sync all contexts
          }
        },
        
        resetAllContexts: () => {
          useWorkStore.getState().reset()
          useHomeStore.getState().reset()
        }
      }),
      {
        name: 'app-store',
        partialize: (state: AppStore) => ({
          currentContext: state.currentContext,
          user: state.user,
          settings: state.settings,
          sidebarOpen: state.sidebarOpen
        })
      }
    ),
    { name: 'app-store' }
  )
)