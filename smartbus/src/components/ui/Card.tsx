import React from 'react'

interface CardProps {
  title?: string
  className?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  title,
  className: classNameProp,
  children,
  footer,
  ...props
}) => {
  const className = `bg-white rounded-2xl p-6 shadow-lg border border-gray-200 ${classNameProp || ''}`.trim()

  return (
    <div className={className} {...props}>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-navy-900">{title}</h3>
          {footer}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  )
}