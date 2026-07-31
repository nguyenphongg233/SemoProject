import { Link } from 'react-router-dom'
import { ChevronDown, Menu } from 'lucide-react'
import Button from '@/components/ui/Button'
import { ROUTES } from '@/constants'

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-[99999] h-16 w-full select-none border-b border-border/40 bg-background/60 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto h-full w-full max-w-full px-4 md:max-w-screen-xl md:px-12 lg:px-20 flex items-center justify-between">
        <div className="flex items-center space-x-12">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-text-strong">Semo<span className="text-brand">AI</span></span>
          </Link>
          
          <nav className="hidden lg:flex items-center space-x-1">
            <button className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors text-text-muted hover:text-text-strong hover:bg-surface-muted focus:outline-none">
              Features
              <ChevronDown className="ml-1 h-3 w-3 transition duration-200 group-hover:rotate-180" />
            </button>
            <Link to="#" className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors text-text-muted hover:text-text-strong hover:bg-surface-muted focus:outline-none">
              Pricing
            </Link>
            <Link to="#" className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors text-text-muted hover:text-text-strong hover:bg-surface-muted focus:outline-none">
              Enterprise
            </Link>
            <button className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors text-text-muted hover:text-text-strong hover:bg-surface-muted focus:outline-none">
              Resources
              <ChevronDown className="ml-1 h-3 w-3 transition duration-200 group-hover:rotate-180" />
            </button>
          </nav>
        </div>

        <div className="hidden items-center lg:flex space-x-4">
          <Link to={ROUTES.LOGIN} className="text-sm font-medium text-text-muted hover:text-text-strong transition-colors">
            Log in
          </Link>
          <Link to={ROUTES.REGISTER}>
            <Button variant="primary" className="h-9 px-4 py-2 min-h-0 rounded-lg shadow-none text-sm">
              Start for free
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-end lg:hidden">
          <button className="inline-flex items-center justify-center rounded-md text-text-muted hover:text-text-strong hover:bg-surface-muted h-9 w-9">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
