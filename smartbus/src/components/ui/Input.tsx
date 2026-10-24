import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  placeholder?: string
  error?: string
  type?: string
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  label,
  placeholder,
  error,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}