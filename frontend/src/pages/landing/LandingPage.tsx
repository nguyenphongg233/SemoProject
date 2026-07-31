import HeroSection from '@/components/landing/HeroSection'
import LogoCloud from '@/components/landing/LogoCloud'
import BentoGrid from '@/components/landing/BentoGrid'

export default function LandingPage() {
  return (
    <div className="w-full h-full flex flex-col">
      <HeroSection />
      <LogoCloud />
      <BentoGrid />
      {/* 
        Future phases will include:
        - Pricing Section or Footer
      */}
    </div>
  )
}
