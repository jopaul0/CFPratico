import React from 'react'
import { BaseCard } from '../components/BaseCard'
import { InputGroup } from '../components/InputGroup'
import { SimpleButton } from '../components/SimpleButton'
import { useSettings } from '../hooks/useSettings'

export default function SettingsScreen(){
  const { settings, setSettings } = useSettings()

  return (
    <div className="space-y-6">
      <BaseCard title="Preferências">
        <div className="grid gap-4 md:grid-cols-2">
          <InputGroup label="Tema">
            <select className="input" value={settings.theme_preference}
              onChange={e => setSettings({...settings, theme_preference: e.target.value as any})}>
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
              <option value="system">Sistema</option>
            </select>
          </InputGroup>
          <InputGroup label="Comportamento da sessão">
            <select className="input" value={settings.session_behavior}
              onChange={e => setSettings({...settings, session_behavior: e.target.value as any})}>
              <option value="password">Senha</option>
              <option value="auto">Automático</option>
              <option value="biometrics">Biometria</option>
            </select>
          </InputGroup>
          <div className="flex items-center gap-2">
            <input id="notif" type="checkbox" checked={settings.notifications_enabled}
              onChange={e => setSettings({...settings, notifications_enabled: e.target.checked})}/>
            <label htmlFor="notif">Notificações habilitadas</label>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="Sobre">
        <p>Versão Web de demonstração do CF Prático. Os dados ficam no seu navegador (LocalStorage).</p>
        <div className="mt-3"><SimpleButton onClick={() => localStorage.clear()}>Limpar dados locais</SimpleButton></div>
      </BaseCard>
    </div>
  )
}