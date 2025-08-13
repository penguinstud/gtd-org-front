import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { 
  BaseTaskStore, 
  createBaseStoreImplementation, 
  createInitialState 
} from './base/BaseTaskStore'

/**
 * Home-specific task and project store
 * Extends BaseTaskStore with home context isolation
 */
export interface HomeStore extends BaseTaskStore {
  // Add any home-specific methods here if needed
}

export const useHomeStore = create<HomeStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      ...createInitialState(),
      
      // All base store methods with home context
      ...createBaseStoreImplementation<HomeStore>(set, get, 'home'),
      
      // Override syncData for home-specific logic if needed
      syncData: async () => {
        const baseImpl = createBaseStoreImplementation<HomeStore>(set, get, 'home')
        await baseImpl.syncData()
      }
    })),
    { name: 'home-store' }
  )
)

// Auto-initialize home store on creation
useHomeStore.getState().initialize()