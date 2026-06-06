import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 min-h-12 px-6 py-3 border-0 rounded-[14px] cursor-pointer font-semibold tracking-[0.02em] relative isolate transition-all duration-200 ease-out select-none',
  {
    variants: {
      variant: {
        primary: [
          'text-white bg-gradient-brand shadow-glow-blue',
          'disabled:opacity-55 disabled:cursor-not-allowed',
          'bg-[length:200%_200%] bg-[position:0%_0%]',
          'hover:not-disabled:bg-[position:100%_100%]',
          'hover:disabled:no-underline hover:not-disabled:-translate-y-[1px] hover:not-disabled:brightness-[1.08]',
          'active:not-disabled:translate-y-0',
          'hover:not-disabled:shadow-glow-cyan'
        ].join(' '),
        
        secondary: [
          'text-text-strong bg-surface-elevated border border-border-strong backdrop-blur-[12px]',
          'hover:not-disabled:-translate-y-[1px] hover:not-disabled:brightness-[1.05]',
          'active:not-disabled:translate-y-0',
          'disabled:opacity-55 disabled:cursor-not-allowed',
          'hover:not-disabled:bg-brand-soft hover:not-disabled:border-border-glow',
          'dark:text-white' /* Trả lại chữ trắng khi ở giao diện tối */
        ].join(' '),
        
        destructive: [
          'text-white bg-danger',
          'shadow-[0_4px_12px_rgba(220,38,38,0.25)]', /* Đổ bóng mịn cho light mode */
          'dark:shadow-[0_0_24px_rgba(255,92,122,0.45)]', /* Đổ bóng neon cho dark mode */
          'hover:not-disabled:-translate-y-[1px] hover:not-disabled:brightness-[1.1]',
          'active:not-disabled:translate-y-0',
          'disabled:opacity-55 disabled:cursor-not-allowed'
        ].join(' '),
        
        ghost: [
          'text-text-muted bg-transparent border border-transparent',
          'hover:not-disabled:-translate-y-[1px] active:not-disabled:translate-y-0',
          'disabled:opacity-55 disabled:cursor-not-allowed',
          'hover:not-disabled:text-text-strong hover:not-disabled:bg-surface-muted'
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);


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