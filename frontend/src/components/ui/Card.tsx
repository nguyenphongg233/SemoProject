import React, { useRef, useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const cn = (...inputs: any[]) => twMerge(clsx(inputs))

const cardVariants = cva(
  [
    "group relative p-6 md:p-8 rounded-3xl bg-surface/50 border border-white/5 backdrop-blur-2xl",
    "[box-shadow:0_-20px_80px_-20px_#ffffff0a_inset] overflow-hidden transition-all duration-300",
  ],
  {
    variants: {
      variant: {
        glow: "hover:shadow-glow-blue border-white/10 hover:border-brand/40",
        flat: "before:opacity-0",
        accent: "bg-[linear-gradient(135deg,rgba(220,38,38,0.05),rgba(234,88,12,0.02))] border-brand/20",
      },
    },
    defaultVariants: {
      variant: null,
    },
  }
);

interface CardProps extends VariantProps<typeof cardVariants> {
  children: React.ReactNode
  className?: string
  spotlight?: boolean
}

export default function Card({ children, className, variant, spotlight = true }: CardProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return
    const div = divRef.current
    const rect = div.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleFocus = () => { setIsFocused(true); setOpacity(1) }
  const handleBlur = () => { setIsFocused(false); setOpacity(0) }
  const handleMouseEnter = () => { setOpacity(1) }
  const handleMouseLeave = () => { setOpacity(0) }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(cardVariants({ variant }), className)}
    >
      {spotlight && (
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 z-0"
          style={{
            opacity,
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}