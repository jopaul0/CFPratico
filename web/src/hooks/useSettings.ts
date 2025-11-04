import { useEffect, useState } from 'react'

export type SessionBehavior = 'auto' | 'password' | 'biometrics'
export type ThemePreference = 'light' | 'dark' | 'system'

const LS_KEY = 'cfp_settings'

export type Settings = {
  theme_preference: ThemePreference
  session_behavior: SessionBehavior
  notifications_enabled: boolean
}

const defaultSettings: Settings = {
  theme_preference: 'light',
  session_behavior: 'password',
  notifications_enabled: true,
}

export function useSettings(){
  const [settings, setSettings] = useState<Settings>(() => {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) as Settings : defaultSettings
  })

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(settings))
    if (settings.theme_preference === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings])

  return { settings, setSettings }
}