import React from 'react'

export const BaseCard: React.FC<React.PropsWithChildren<{title?: string; right?: React.ReactNode; className?: string;}>> = ({title, right, className='', children}) => {
  return (
    <section className={`card p-4 ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h2 className="text-base font-semibold text-gray-800">{title}</h2>}
          {right}
        </div>
      )}
      <div>{children}</div>
    </section>
  )
}