import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Wallet, Zap, BarChart3, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/constants'

function SpotlightCard({ children, to, className }: { children: React.ReactNode, to: string, className?: string }) {
  const divRef = useRef<HTMLAnchorElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
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
    <Link
      ref={divRef}
      to={to}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-30"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />
      {children}
    </Link>
  )
}

export default function BentoGrid() {
  return (
    <section className="mx-auto h-full w-full max-w-full px-4 md:max-w-screen-xl md:px-12 lg:px-20 py-20">
      
      {/* Header */}
      <div className="flex w-full flex-col items-center justify-center py-8 lg:items-center">
        <div className="relative inline-flex h-8 select-none overflow-hidden rounded-full p-[1.5px] focus:outline-none mb-6">
          <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#dc2626_0%,#ea580c_50%,#dc2626_100%)]"></span>
          <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-midnight-2 px-4 py-1 font-medium text-sm text-text-strong backdrop-blur-3xl">
            Features
          </span>
        </div>
        <h2 className="!leading-[1.1] mt-2 text-center font-heading font-bold text-3xl text-text-strong md:text-5xl lg:text-center">
          Experience Smart Mobility
        </h2>
        <p className="mt-4 max-w-lg text-center text-lg text-text-muted lg:text-center">
          SEMO is a cutting-edge fleet management tool that delivers seamless rentals and powerful analytics.
        </p>
      </div>

      {/* Grid */}
      <div className="grid w-full auto-rows-[24rem] grid-cols-1 md:grid-cols-3 gap-6 py-8 z-20 relative">
        
        {/* Card 1: Live Map & Routing (Wide) */}
        <SpotlightCard to={ROUTES.LOGIN} className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-surface [box-shadow:0_-20px_80px_-20px_#ffffff0a_inset] hover:shadow-glow-blue hover:border-brand/50 transition-all duration-300 cursor-pointer col-span-1 md:col-span-2">
          <div className="relative h-full w-full overflow-hidden">
            {/* UI Mockup Placeholder */}
            <div className="absolute top-10 right-10 left-10 md:left-auto md:w-[70%] h-full rounded-tl-xl border border-border/80 border-r-0 border-b-0 bg-surface-elevated shadow-soft transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-[1.03] group-hover:-translate-x-2 group-hover:shadow-glow-blue">
              <div className="flex flex-col p-6 space-y-4">
                <div className="w-full h-8 bg-surface-muted rounded"></div>
                <div className="w-3/4 h-8 bg-surface-muted rounded"></div>
                <div className="flex gap-4 pt-4">
                  <div className="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center"><MapPin className="text-brand w-6 h-6"/></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-full h-4 bg-brand/20 rounded"></div>
                    <div className="w-5/6 h-4 bg-surface-muted rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pointer-events-none z-10 flex flex-col gap-2 p-8 transition-all duration-300 absolute bottom-0 left-0 w-full bg-gradient-to-t from-surface via-surface/90 to-transparent pt-12">
            <MapPin className="h-10 w-10 origin-left text-brand transition-all duration-300 ease-in-out group-hover:-translate-y-1" />
            <h3 className="font-semibold text-text-strong text-2xl group-hover:text-brand transition-colors">Live Map & Routing</h3>
            <p className="max-w-md text-text-muted text-base">Find scooters nearby and navigate to them instantly with GraphHopper A* routing.</p>
            
            <div className="flex items-center text-sm font-medium text-brand mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
              Try it now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
          
          <div className="pointer-events-none absolute inset-0 transition-all duration-300 group-hover:bg-white/[.03]"></div>
        </SpotlightCard>

        {/* Card 2: Digital Wallet (Square) */}
        <SpotlightCard to={ROUTES.LOGIN} className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-surface [box-shadow:0_-20px_80px_-20px_#ffffff0a_inset] hover:shadow-glow-cyan hover:border-accent/50 transition-all duration-300 cursor-pointer col-span-1 md:col-span-1">
          <div className="relative h-full w-full overflow-hidden">
             {/* UI Mockup Placeholder */}
             <div className="absolute top-10 inset-x-10 h-32 rounded-2xl border border-border/80 bg-surface-elevated shadow-soft flex flex-col items-center justify-center transition-all duration-300 ease-out group-hover:-translate-y-3 group-hover:shadow-glow-cyan">
                <span className="text-text-muted text-sm font-medium">Available Balance</span>
                <span className="text-3xl font-bold text-text-strong mt-1">150.000 <span className="text-accent">đ</span></span>
             </div>
          </div>
          
          <div className="pointer-events-none z-10 flex flex-col gap-2 p-8 transition-all duration-300 absolute bottom-0 left-0 w-full bg-gradient-to-t from-surface via-surface/90 to-transparent pt-12">
            <Wallet className="h-10 w-10 origin-left text-accent transition-all duration-300 ease-in-out group-hover:-translate-y-1" />
            <h3 className="font-semibold text-text-strong text-2xl group-hover:text-accent transition-colors">Digital Wallet</h3>
            <p className="text-text-muted text-base">Seamless top-ups and automatic ride payments.</p>
            
            <div className="flex items-center text-sm font-medium text-accent mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
              Top up <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
          
          <div className="pointer-events-none absolute inset-0 transition-all duration-300 group-hover:bg-white/[.03]"></div>
        </SpotlightCard>

        {/* Card 3: 1-Tap Booking (Square) */}
        <SpotlightCard to={ROUTES.LOGIN} className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-surface [box-shadow:0_-20px_80px_-20px_#ffffff0a_inset] hover:shadow-glow-blue hover:border-brand/50 transition-all duration-300 cursor-pointer col-span-1 md:col-span-1">
          <div className="relative h-full w-full overflow-hidden">
             {/* UI Mockup Placeholder */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80%] flex flex-col items-center justify-center transition-all duration-500 ease-out group-hover:scale-125">
                <div className="w-24 h-24 rounded-full bg-gradient-brand shadow-glow-blue flex items-center justify-center animate-[pulse_3s_ease-in-out_infinite] group-hover:animate-none">
                  <Zap className="w-10 h-10 text-white fill-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                </div>
             </div>
          </div>
          
          <div className="pointer-events-none z-10 flex flex-col gap-2 p-8 transition-all duration-300 absolute bottom-0 left-0 w-full bg-gradient-to-t from-surface via-surface/90 to-transparent pt-12">
            <Zap className="h-10 w-10 origin-left text-violet transition-all duration-300 ease-in-out group-hover:-translate-y-1" />
            <h3 className="font-semibold text-text-strong text-2xl group-hover:text-brand transition-colors">1-Tap Booking</h3>
            <p className="text-text-muted text-base">Reserve, unlock, and ride with a single tap.</p>
            
            <div className="flex items-center text-sm font-medium text-brand mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
              Book a ride <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
          
          <div className="pointer-events-none absolute inset-0 transition-all duration-300 group-hover:bg-white/[.03]"></div>
        </SpotlightCard>

        {/* Card 4: Fleet Management (Wide) */}
        <SpotlightCard to={ROUTES.LOGIN} className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-surface [box-shadow:0_-20px_80px_-20px_#ffffff0a_inset] hover:shadow-glow-cyan hover:border-accent/50 transition-all duration-300 cursor-pointer col-span-1 md:col-span-2">
          <div className="relative h-full w-full overflow-hidden">
            {/* UI Mockup Placeholder */}
            <div className="absolute top-10 right-10 left-10 md:right-auto md:w-[75%] h-full rounded-tr-2xl border border-border/80 border-l-0 border-b-0 bg-surface-elevated shadow-soft transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-[1.03] group-hover:translate-x-2 group-hover:shadow-glow-cyan">
              <div className="grid grid-cols-2 gap-4 p-6">
                <div className="h-20 bg-surface rounded-xl border border-border flex flex-col justify-center px-5 shadow-sm">
                  <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Total Revenue</span>
                  <span className="text-text-strong text-2xl font-bold mt-1">$12,450</span>
                </div>
                <div className="h-20 bg-surface rounded-xl border border-border flex flex-col justify-center px-5 shadow-sm">
                  <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Active Rides</span>
                  <span className="text-brand text-2xl font-bold mt-1">42</span>
                </div>
                <div className="h-20 bg-surface rounded-xl border border-border flex flex-col justify-center px-5 shadow-sm">
                  <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Maintenance</span>
                  <span className="text-red-400 text-2xl font-bold mt-1">3</span>
                </div>
                <div className="h-20 bg-surface rounded-xl border border-border flex flex-col justify-center px-5 shadow-sm">
                  <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Available</span>
                  <span className="text-accent text-2xl font-bold mt-1">89</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pointer-events-none z-10 flex flex-col gap-2 p-8 transition-all duration-300 absolute bottom-0 left-0 w-full bg-gradient-to-t from-surface via-surface/90 to-transparent pt-12">
            <BarChart3 className="h-10 w-10 origin-left text-accent transition-all duration-300 ease-in-out group-hover:-translate-y-1" />
            <h3 className="font-semibold text-text-strong text-2xl group-hover:text-accent transition-colors">Fleet Management</h3>
            <p className="max-w-md text-text-muted text-base">Powerful admin dashboard for analytics, maintenance tracking, and revenue overview.</p>
            
            <div className="flex items-center text-sm font-medium text-accent mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
              View dashboard <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
          
          <div className="pointer-events-none absolute inset-0 transition-all duration-300 group-hover:bg-white/[.03]"></div>
        </SpotlightCard>

      </div>
    </section>
  )
}
