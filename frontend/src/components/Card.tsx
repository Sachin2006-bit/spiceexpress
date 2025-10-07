import type { PropsWithChildren, HTMLAttributes } from 'react'

type CardProps = PropsWithChildren<{
  className?: string
}> & HTMLAttributes<HTMLDivElement>

export default function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <div
      className={
        `bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`
      }
      {...rest}
    >
      {children}
    </div>
  )
}


