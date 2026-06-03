import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 min-h-12 px-6 py-3 border-0 rounded-[14px] cursor-pointer font-semibold tracking-[0.02em] relative isolate transition-all duration-200 ease-out select-none',
  {
    variants: {
      variant: {
        primary: 
          'text-white bg-[image:var(--gradient-brand)] shadow-[var(--glow-blue)] hover:disabled:no-underline hover:not-disabled:-translate-y-[1px] hover:not-disabled:brightness-[1.08] active:not-disabled:translate-y-0 disabled:opacity-55 disabled:cursor-not-allowed hover:not-disabled:shadow-[0_0_28px_rgba(0,82,255,0.6),0_0_72px_rgba(0,209,255,0.3)]',
        
        secondary: 
          'text-[color:var(--text-strong)] bg-[color:var(--surface-elevated)] border border-[color:var(--border-strong)] backdrop-blur-[12px] hover:not-disabled:-translate-y-[1px] hover:not-disabled:brightness-[1.08] active:not-disabled:translate-y-0 disabled:opacity-55 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(0,82,255,0.12)] hover:not-disabled:border-[color:var(--border-glow)]',
        
        destructive: 
          'text-white bg-gradient-to-br from-[#ff3d6e] to-[#c11d3f] shadow-[0_0_24px_rgba(255,92,122,0.45)] hover:not-disabled:-translate-y-[1px] hover:not-disabled:brightness-[1.08] active:not-disabled:translate-y-0 disabled:opacity-55 disabled:cursor-not-allowed',
        
        ghost: 
          'text-[color:var(--text-muted)] bg-transparent border border-transparent hover:not-disabled:-translate-y-[1px] hover:not-disabled:brightness-[1.08] active:not-disabled:translate-y-0 disabled:opacity-55 disabled:cursor-not-allowed hover:not-disabled:text-[color:var(--text-strong)] hover:not-disabled:bg-[color:var(--surface-muted)]',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
)

interface ButtonProps 
  extends ButtonHTMLAttributes<HTMLButtonElement>, 
    VariantProps<typeof buttonVariants> {
  children: ReactNode
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export default function Button({
  children,
  variant,
  type = 'button',
  className,
  disabled = false,
  leadingIcon = null,
  trailingIcon = null,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      // 3. Sử dụng kết hợp cva + twMerge để xử lý chuỗi class gọn gàng
      className={twMerge(buttonVariants({ variant, className }))}
      {...props}
    >
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </button>
  )
}