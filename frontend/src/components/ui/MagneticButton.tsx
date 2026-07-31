import React, { useRef, useState, useEffect } from 'react'

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  intensity?: number
}

export default function MagneticButton({ children, intensity = 20, className = '', ...props }: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const button = buttonRef.current
    if (!button) return

    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = button.getBoundingClientRect()
      const centerX = left + width / 2
      const centerY = top + height / 2
      const mouseX = e.clientX
      const mouseY = e.clientY

      // Calculate distance from center
      const distX = mouseX - centerX
      const distY = mouseY - centerY

      // If mouse is within a certain range of the button, attract it
      const maxDistance = 150
      const distance = Math.sqrt(distX * distX + distY * distY)

      if (distance < maxDistance) {
        // Magnetic pull (closer = stronger)
        const pullX = (distX / maxDistance) * intensity
        const pullY = (distY / maxDistance) * intensity
        setPosition({ x: pullX, y: pullY })
      } else {
        // Reset
        setPosition({ x: 0, y: 0 })
      }
    }

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 })
    }

    window.addEventListener('mousemove', handleMouseMove)
    button.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      button.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [intensity])

  return (
    <button
      ref={buttonRef}
      className={`relative transition-transform duration-300 ease-out ${className}`}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      {...props}
    >
      {children}
    </button>
  )
}
