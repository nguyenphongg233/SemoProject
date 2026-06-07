import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const alertVariants = cva(
  "rounded-md border p-4 backdrop-blur-xl", 
  {
    variants: {
      tone: {
        error: "border-red-500/50 bg-red-500/20 text-red-200",
        success: "border-emerald-500/50 bg-emerald-500/20 text-emerald-200",
        info: "border-blue-500/50 bg-blue-500/20 text-blue-200",
        warning: "border-amber-500/50 bg-amber-500/20 text-amber-200"
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