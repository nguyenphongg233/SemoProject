import { Atom, Leaf, Map as MapIcon, Database, Cloud, Zap, Fingerprint, Activity, Layers, Cpu, Code2 } from 'lucide-react'

export default function LogoCloud() {
  const logos = [
    { icon: <Atom className="w-8 h-8" />, name: "React" },
    { icon: <Leaf className="w-8 h-8" />, name: "Spring Boot" },
    { icon: <Database className="w-8 h-8" />, name: "MySQL" },
    { icon: <MapIcon className="w-8 h-8" />, name: "Leaflet" },
    { icon: <Cloud className="w-8 h-8" />, name: "Render" },
    { icon: <Zap className="w-8 h-8" />, name: "Redis" },
    { icon: <Fingerprint className="w-8 h-8" />, name: "JWT Auth" },
    { icon: <Activity className="w-8 h-8" />, name: "Monitoring" },
    { icon: <Layers className="w-8 h-8" />, name: "Docker" },
    { icon: <Cpu className="w-8 h-8" />, name: "AI Routing" },
    { icon: <Code2 className="w-8 h-8" />, name: "TypeScript" },
  ]

  return (
    <section className="relative w-full py-20 bg-midnight-2 overflow-hidden border-y border-white/5">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8 mb-10">
        <h2 className="text-center font-heading font-semibold text-text-muted text-sm uppercase tracking-[0.2em]">
          Powered by enterprise-grade infrastructure
        </h2>
      </div>

      <div className="relative w-full max-w-[100vw] overflow-hidden">
        {/* Transparent Fade Masks */}
        <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-midnight-2 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-midnight-2 to-transparent z-10 pointer-events-none"></div>

        {/* Marquee Container */}
        <div className="flex w-max animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused] gap-16 pr-16 items-center opacity-60 transition-opacity duration-500 hover:opacity-100">
          {/* Double the array for seamless loop */}
          {[...logos, ...logos].map((logo, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-3 text-text-muted hover:text-white transition-colors duration-300 cursor-default grayscale hover:grayscale-0"
            >
              <div className="p-3 bg-surface border border-white/10 rounded-xl shadow-soft">
                {logo.icon}
              </div>
              <span className="font-bold text-xl tracking-tight">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
