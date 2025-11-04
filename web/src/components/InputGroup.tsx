import React from 'react'

export const InputGroup: React.FC<{label: string; helperText?: string; children: React.ReactNode;}> = ({label, helperText, children}) => {
  return (
    <div className="space-y-1">
      <label className="label">{label}</label>
      {children}
      {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  )
}