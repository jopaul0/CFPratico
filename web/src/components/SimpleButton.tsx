import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default'|'primary'|'danger'|'ghost'
}

export const SimpleButton: React.FC<Props> = ({variant='default', className='', ...rest}) => {
  const map = {
    default: 'btn',
    primary: 'btn btn-primary',
    danger: 'btn btn-danger',
    ghost: 'inline-flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 text-gray-700'
  } as const
  return <button {...rest} className={`${map[variant]} ${className}`.trim()} />
}