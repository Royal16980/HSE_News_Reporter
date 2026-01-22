'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Bell,
  Palette,
  Workflow,
  LogOut,
  Moon,
  Sun,
  Smartphone,
  Settings2,
  Trash2,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import appPackage from '../../../../package.json'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { triggerHaptic } from '@/lib/haptics'
import { useAuthStore } from '@/stores/auth'

export default function SettingsPage() {
  const router = useRouter()
  const { user, signOut } = useAuthStore()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [darkMode, setDarkMode] = useState(false)
  const [oledBlack, setOledBlack] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [emailDigest, setEmailDigest] = useState(true)
  const [notificationFrequency, setNotificationFrequency] = useState('daily')
  const [accentColor, setAccentColor] = useState('#3b82f6')
  const [autoPublish, setAutoPublish] = useState(true)
  const [aiProcessing, setAiProcessing] = useState(true)
  const [dailyQuota, setDailyQuota] = useState(5)
  const [hourlyQuota, setHourlyQuota] = useState(3)
  const [settingsReady, setSettingsReady] = useState(false)

  const roleLabel = useMemo(() => {
    const role = (user?.user_metadata?.role as string) || 'admin'
    return role.charAt(0).toUpperCase() + role.slice(1)
  }, [user])

  useEffect(() => {
    if (!resolvedTheme) return
    setDarkMode(resolvedTheme === 'dark')
  }, [resolvedTheme])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('hse-admin-settings')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setOledBlack(Boolean(parsed.oledBlack))
        setPushNotifications(Boolean(parsed.pushNotifications))
        setEmailDigest(Boolean(parsed.emailDigest ?? true))
        setNotificationFrequency(parsed.notificationFrequency || 'daily')
        setAccentColor(parsed.accentColor || '#3b82f6')
        setAutoPublish(Boolean(parsed.autoPublish ?? true))
        setAiProcessing(Boolean(parsed.aiProcessing ?? true))
        setDailyQuota(Number(parsed.dailyQuota ?? 5))
        setHourlyQuota(Number(parsed.hourlyQuota ?? 3))
        if (typeof parsed.darkMode === 'boolean') {
          setTheme(parsed.darkMode ? 'dark' : 'light')
        } else if (theme === 'system') {
          setTheme('system')
        }
      } catch {
        // Ignore malformed settings
      }
    }
    setSettingsReady(true)
  }, [setTheme, theme])

  useEffect(() => {
    if (!settingsReady) return
    if (typeof window === 'undefined') return
    localStorage.setItem(
      'hse-admin-settings',
      JSON.stringify({
        darkMode,
        oledBlack,
        pushNotifications,
        emailDigest,
        notificationFrequency,
        accentColor,
        autoPublish,
        aiProcessing,
        dailyQuota,
        hourlyQuota,
      }),
    )
  }, [
    darkMode,
    oledBlack,
    pushNotifications,
    emailDigest,
    notificationFrequency,
    accentColor,
    autoPublish,
    aiProcessing,
    dailyQuota,
    hourlyQuota,
    settingsReady,
  ])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('oled', oledBlack)
  }, [oledBlack])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.style.setProperty('--accent-color', accentColor)
  }, [accentColor])

  const handleToggle = (setter: (val: boolean) => void, currentValue: boolean) => {
    triggerHaptic('light')
    setter(!currentValue)
  }

  const handleLogout = async () => {
    triggerHaptic('heavy')
    await signOut()
    router.push('/login')
  }

  const handleClearCache = async () => {
    triggerHaptic('light')
    if (typeof window === 'undefined') return
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    }
    localStorage.removeItem('hse-admin-settings')
    window.location.reload()
  }

  return (
    <div className="pb-safe-bottom">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 bg-gradient-to-b from-safety-blue to-blue-600">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-blue-100">App preferences</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user?.email || 'Unknown'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Role</label>
                <p className="font-medium text-gray-900 dark:text-white">{roleLabel}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">Push Notifications</span>
                </div>
                <button
                  onClick={() => handleToggle(setPushNotifications, pushNotifications)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors dark:bg-gray-600"
                  style={{ backgroundColor: pushNotifications ? accentColor : undefined }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">Email Digest</span>
                </div>
                <button
                  onClick={() => handleToggle(setEmailDigest, emailDigest)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors dark:bg-gray-600"
                  style={{ backgroundColor: emailDigest ? accentColor : undefined }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailDigest ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Notification Frequency</label>
                <select
                  value={notificationFrequency}
                  onChange={(event) => setNotificationFrequency(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-safety-blue focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                >
                  <option value="instant">Instant</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">Dark Mode</span>
                </div>
                <button
                  onClick={() => {
                    const next = !darkMode
                    handleToggle(setDarkMode, darkMode)
                    setTheme(next ? 'dark' : 'light')
                  }}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors dark:bg-gray-600"
                  style={{ backgroundColor: darkMode ? accentColor : undefined }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">OLED Black</span>
                </div>
                <button
                  onClick={() => handleToggle(setOledBlack, oledBlack)}
                  disabled={!darkMode}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors disabled:opacity-50 dark:bg-gray-600"
                  style={{ backgroundColor: oledBlack ? accentColor : undefined }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      oledBlack ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                OLED Black uses true black (#000000) for OLED displays to save battery
              </p>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Accent Color</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(event) => setAccentColor(event.target.value)}
                    className="h-10 w-14 rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                    aria-label="Accent color picker"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{accentColor}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Workflow Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5" />
                Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Auto-publish</label>
                  <p className="text-xs text-gray-500">Publish approved articles automatically</p>
                </div>
                <button
                  onClick={() => handleToggle(setAutoPublish, autoPublish)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors dark:bg-gray-600"
                  style={{ backgroundColor: autoPublish ? accentColor : undefined }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoPublish ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">AI Processing</label>
                  <p className="text-xs text-gray-500">Enable AI processing pipeline</p>
                </div>
                <button
                  onClick={() => handleToggle(setAiProcessing, aiProcessing)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors dark:bg-gray-600"
                  style={{ backgroundColor: aiProcessing ? accentColor : undefined }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      aiProcessing ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Daily Quota</label>
                  <input
                    type="number"
                    min={1}
                    value={dailyQuota}
                    onChange={(event) => setDailyQuota(Number(event.target.value))}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-safety-blue focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">3-Hour Quota</label>
                  <input
                    type="number"
                    min={1}
                    value={hourlyQuota}
                    onChange={(event) => setHourlyQuota(Number(event.target.value))}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-safety-blue focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="space-y-3">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClearCache}
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Clear Cache
            </Button>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Settings2 className="h-4 w-4" />
                HSE News Admin
              </div>
              <p className="mt-2">Version {appPackage.version}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
