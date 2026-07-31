import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import MagneticButton from '@/components/ui/MagneticButton'
import SplitText from '@/components/ui/SplitText'
import { ROUTES } from '@/constants'
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Mock Data for the Map
const BACH_KHOA_CENTER: [number, number] = [21.0052, 105.8433]
const mockScooters = [
  { id: 1, name: 'Semo Pro #1', lat: 21.0062, lng: 105.8433, status: 'AVAILABLE', battery: 98 },
  { id: 2, name: 'Semo Lite #4', lat: 21.0042, lng: 105.8413, status: 'IN_USE', battery: 65 },
  { id: 3, name: 'Semo Pro #8', lat: 21.0032, lng: 105.8453, status: 'AVAILABLE', battery: 100 },
  { id: 4, name: 'Semo Ultra #2', lat: 21.0072, lng: 105.8463, status: 'MAINTENANCE', battery: 12 },
]

const statusStyles: Record<string, { color: string; fillColor: string }> = {
  AVAILABLE:   { color: 'var(--color-cyan)', fillColor: 'var(--color-cyan)' },
  IN_USE:      { color: 'var(--color-brand)', fillColor: 'var(--color-brand)' },
  MAINTENANCE: { color: 'var(--color-violet)', fillColor: 'var(--color-violet)' },
}

export default function HeroSection() {
  return (
    <section className="relative w-full pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="mx-auto h-full w-full max-w-full px-4 md:max-w-screen-xl md:px-12 lg:px-20">
        
        {/* Text Content */}
        <div className="flex w-full flex-col items-center justify-center text-center">
          
          {/* Animated Badge */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <button className="group relative grid overflow-hidden rounded-full px-4 py-1.5 mb-8 shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset] transition-colors duration-200">
              <span>
                <span className="spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-[flip_2s_infinite] overflow-hidden rounded-full [mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:rotate-[-90deg] before:animate-[rotate_3s_linear_infinite] before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]"></span>
              </span>
              <span className="backdrop absolute inset-[1px] rounded-full bg-midnight-2 transition-colors duration-200 group-hover:bg-surface-elevated"></span>
              <span className="absolute inset-x-0 bottom-0 h-full w-full bg-gradient-to-tr from-brand-soft blur-md"></span>
              <span className="z-10 flex items-center justify-center gap-1 py-0.5 text-text-strong text-sm font-medium">
                ✨ Meet SEMO - Smart E-Mobility
                <ArrowRight className="ml-1 size-3.5 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
              </span>
            </button>
          </div>

          {/* Heading */}
          <h1 className="w-full text-balance pb-6 text-center font-heading font-bold text-5xl text-text-strong tracking-tight sm:text-6xl md:text-7xl lg:text-8xl max-w-5xl leading-[1.1]">
            <SplitText text="Next-gen Urban Mobility With" delay={80} />{' '}
            <span className="inline-block bg-[linear-gradient(110deg,#dc2626,45%,#ea580c,55%,#dc2626)] bg-[length:200%_100%] animate-[shiny-text_3s_linear_infinite] bg-clip-text text-transparent drop-shadow-[0_0_32px_rgba(220,38,38,0.4)] animate-in fade-in zoom-in duration-1000 delay-500 fill-mode-both">
              Intelligence
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-10 text-balance text-lg text-text-muted tracking-normal md:text-xl max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
            Rent e-scooters effortlessly, track them in real-time, 
            <br className="hidden md:block" />
            and commute smart with our AI-powered routing platform.
          </p>

          {/* CTA */}
          <div className="z-50 flex items-center justify-center gap-4 whitespace-nowrap animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700 fill-mode-both">
            <Link to={ROUTES.REGISTER}>
              <MagneticButton intensity={20}>
                <Button variant="primary" className="h-14 px-10 text-lg shadow-glow-blue pointer-events-none" trailingIcon={<ArrowRight className="h-5 w-5" />}>
                  Start managing for free
                </Button>
              </MagneticButton>
            </Link>
          </div>
        </div>

        {/* Dashboard Image Mockup with Glow */}
        <div className="relative w-full bg-transparent px-2 pt-20 pb-20 md:py-32 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150 fill-mode-both">
          
          {/* Aurora Glow Effect */}
          <div className="absolute inset-0 left-1/2 -translate-x-1/2 h-1/4 w-3/4 animate-[aurora_15s_linear_infinite] bg-[length:300%_300%] blur-[6rem] bg-gradient-brand-soft md:top-[10%] md:h-1/3 opacity-70"></div>
          
          <div className="-m-2 lg:-m-4 rounded-xl bg-surface-muted p-2 ring-1 ring-border-strong ring-inset backdrop-blur-3xl lg:rounded-2xl relative z-10">
            
            {/* Border Beam Effect */}
            <div className="absolute inset-[0] rounded-[inherit] [border:1.5px_solid_transparent] ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)] after:absolute after:aspect-square after:w-[250px] after:animate-[border-beam_12s_linear_infinite] after:[background:linear-gradient(to_left,var(--color-brand),var(--color-cyan),transparent)] after:[offset-anchor:90%_50%] after:[offset-path:rect(0_auto_auto_0_round_250px)] opacity-50"></div>
            
            {/* Real Interactive Map Demo */}
            <div className="relative rounded-md ring-1 ring-border overflow-hidden lg:rounded-xl aspect-video w-full shadow-card z-0">
              <MapContainer
                center={BACH_KHOA_CENTER}
                zoom={15}
                minZoom={12}
                maxZoom={18}
                scrollWheelZoom={false}
                zoomControl={false}
                className="w-full h-full z-0"
                style={{ background: 'var(--color-midnight-2)' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* User Location Mock */}
                <CircleMarker
                  center={BACH_KHOA_CENTER}
                  radius={8}
                  pathOptions={{ color: 'var(--color-brand)', fillColor: 'var(--color-brand)', fillOpacity: 0.9, weight: 2 }}
                >
                  <Tooltip direction="top" offset={[0, -8]} permanent>You</Tooltip>
                </CircleMarker>

                {/* Mock Scooters */}
                {mockScooters.map((s) => {
                  const style = statusStyles[s.status] || { color: '#8BA0C7', fillColor: '#8BA0C7' }
                  return (
                    <CircleMarker
                      key={s.id}
                      center={[s.lat, s.lng]}
                      radius={10}
                      pathOptions={{
                        color: style.color,
                        fillColor: style.fillColor,
                        fillOpacity: 0.9,
                        weight: 2,
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -8]} permanent>
                        {s.name}
                      </Tooltip>
                      <Popup>
                        <div className="grid gap-1 min-w-40 text-text-strong font-sans">
                          <strong>{s.name}</strong>
                          <p>Status: {s.status}</p>
                          <p>Battery: {s.battery}%</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  )
                })}
              </MapContainer>
              
              {/* ReactBits Fuzzy Glass Overlay for the Map container (purely aesthetic) */}
              <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none z-[1000]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
            </div>

            {/* Bottom Fade Gradient to blend with background */}
            <div className="absolute inset-x-0 -bottom-4 z-40 h-1/2 w-full bg-gradient-to-t from-bg to-transparent"></div>
            <div className="absolute inset-x-0 bottom-0 md:-bottom-8 z-50 h-1/4 w-full bg-gradient-to-t from-bg via-bg to-transparent"></div>
          </div>
        </div>

      </div>
    </section>
  )
}
