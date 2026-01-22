import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95',
  {
    variants: {
      variant: {
        default:
          'bg-safety-blue text-white hover:bg-blue-600 focus-visible:ring-safety-blue',
        destructive:
          'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
        outline:
          'border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800',
        ghost:
          'hover:bg-gray-100 dark:hover:bg-gray-800',
        link:
          'underline-offset-4 hover:underline text-safety-blue',
        success:
          'bg-green-500 text-white hover:bg-green-600 focus-visible:ring-green-500',
      },
      size: {
        default: 'h-12 px-6 py-3 text-base',
        sm: 'h-9 px-4 text-sm',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
