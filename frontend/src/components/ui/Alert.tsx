import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const alertVariants = cva(
  "rounded-[14px] border border-transparent p-4 backdrop-blur-xl", // Mẹo: Thường alert nên p-4 thay vì p-1 để text không bị dính sát viền
  {
    variants: {
      tone: {
        error: "border-danger/35 bg-danger/12 text-[#ffd1da]",
        success: "border-success/35 bg-success/12 text-[#b8ffe6]",
        info: "border-brand/35 bg-brand/14 text-[#c9deff]",
      },
    },
    defaultVariants: {
      tone: "error",
    },
  }
);

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