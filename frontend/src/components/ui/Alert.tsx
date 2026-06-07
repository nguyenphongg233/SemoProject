import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const alertVariants = cva(
  "rounded-md border p-4 backdrop-blur-xl", 
  {
    variants: {
      tone: {
        error: "border-danger/30 bg-danger/10 text-danger",
        success: "border-success/30 bg-success/10 text-success",
        info: "border-brand/30 bg-brand/10 text-brand",
        warning: "border-warning/30 bg-warning/10 text-warning"
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