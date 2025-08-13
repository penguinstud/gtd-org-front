import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Context, AppState, User, AppSettings } from '../types'

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
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
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
        setCurrentContext: (context) => set({ currentContext: context }),
        
        setUser: (user) => set({ user }),
        
        updateSettings: (newSettings) => 
          set((state) => ({
            settings: { ...state.settings, ...newSettings }
          })),
        
        toggleContext: () => 
          set((state) => ({
            currentContext: state.currentContext === 'work' ? 'home' : 'work'
          })),
        
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        
        setInitializing: (loading) => set({ isInitializing: loading })
      }),
      {
        name: 'app-store',
        partialize: (state) => ({
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