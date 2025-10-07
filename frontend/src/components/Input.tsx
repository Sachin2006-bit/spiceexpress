import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string
}

export default function Input({ className = '', ...rest }: InputProps) {
  return (
    <input
      className={
        `w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 ` +
        `focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent ` +
        className
      }
      {...rest}
    />
  )
}


