import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const alertVariants = cva(
  "rounded-[14px] border border-transparent p-1 backdrop-blur-xl",
  {
    variants: {
      tone: {
        error: "border-[rgba(255,92,122,0.35)] bg-[rgba(255,92,122,0.12)] text-[#ffd1da]",
        success: "border-[rgba(0,224,164,0.35)] bg-[rgba(0,224,164,0.12)] text-[#b8ffe6]",
        info: "border-[rgba(0,82,255,0.35)] bg-[rgba(0,82,255,0.14)] text-[#c9deff]",
      },
    },
    defaultVariants: {
      tone: "error",
    },
  }
)

// 2. Sử dụng VariantProps của cva để tự động lấy type cho tone (error | success | info)
interface AlertProps extends VariantProps<typeof alertVariants> {
  children: ReactNode;
  className?: string;
}

export default function Alert({ children, tone, className }: AlertProps) {
  return (
    <div className={alertVariants({ tone, className })}>
      {children}
    </div>
  )
}