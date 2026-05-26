import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'

export default function Header() {
  return (
    <header className="border-b border-white/6 bg-[rgba(255,255,255,0.02)] backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <Logo />
            <span className="text-lg font-semibold tracking-tight">Voxora AI</span>
          </Link>

          <div className="flex items-center gap-3">
            <button className="px-3 py-1.5 rounded-md bg-white/6 hover:bg-white/8 text-sm">Upgrade</button>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm">ME</div>
          </div>
        </div>
      </div>
    </header>
  )
}
