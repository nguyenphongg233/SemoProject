import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx' // Hoặc dùng hàm cn custom của bạn nếu có
import { twMerge } from 'tailwind-merge'

const cn = (...inputs: any[]) => twMerge(clsx(inputs))

const cardVariants = cva(
  [
    "relative p-6 rounded-2xl bg-slate-800 border border-border",
    "shadow-lg overflow-hidden",
  ],
  {
    variants: {
      variant: {
        glow: "shadow-[var(--shadow-card),var(--shadow-glow-blue)]",
        flat: "before:opacity-0",
        accent: "bg-[linear-gradient(135deg,rgba(0,82,255,0.22),rgba(0,209,255,0.08))]",
      },
    },
    defaultVariants: {
      variant: null,
    },
  }
);

interface CardProps extends VariantProps<typeof cardVariants> {
  children: ReactNode
  className?: string
}

export default function Card({ children, className, variant }: CardProps) {
  return (
    <section className={cn(cardVariants({ variant }), className)}>
      {children}
    </section>
  )
} 