import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const alertVariants = cva(
  "rounded-md border p-4 backdrop-blur-xl", 
  {
    variants: {
      tone: {
        error: "border-danger/35 bg-danger/12 text-danger",
        success: "border-success/35 bg-success/12 text-success",
        info: "border-brand/35 bg-brand/14 text-info",
        warning: "border-warning/35 bg-warning/12 text-warning"
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