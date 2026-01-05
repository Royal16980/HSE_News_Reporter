'use client'

import { create } from 'zustand'

export type TabKey = 'review' | 'schedule' | 'analytics' | 'settings'

type UIState = {
  activeTab: TabKey
  isOffline: boolean
  showUpdateBanner: boolean
  setActiveTab: (tab: TabKey) => void
  setOffline: (offline: boolean) => void
  setUpdateBanner: (show: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'review',
  isOffline: false,
  showUpdateBanner: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setOffline: (offline) => set({ isOffline: offline }),
  setUpdateBanner: (show) => set({ showUpdateBanner: show }),
}))
