import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { 
  BaseTaskStore, 
  createBaseStoreImplementation, 
  createInitialState 
} from './base/BaseTaskStore'

/**
 * Work-specific task and project store
 * Extends BaseTaskStore with work context isolation
 */
export interface WorkStore extends BaseTaskStore {
  // Add any work-specific methods here if needed
}

export const useWorkStore = create<WorkStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      ...createInitialState(),
      
      // All base store methods with work context
      ...createBaseStoreImplementation<WorkStore>(set, get, 'work'),
      
      // Override syncData for work-specific logic if needed
      syncData: async () => {
        const baseImpl = createBaseStoreImplementation<WorkStore>(set, get, 'work')
        await baseImpl.syncData()
      }
    })),
    { name: 'work-store' }
  )
)

// Auto-initialize work store on creation
useWorkStore.getState().initialize()