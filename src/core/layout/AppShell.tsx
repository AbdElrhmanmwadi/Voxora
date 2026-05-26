import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

type Props = {
  children: React.ReactNode
}

export default function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-6 py-8">
          <aside className="col-span-12 md:col-span-3 lg:col-span-2">
            <Sidebar />
          </aside>
          <main className="col-span-12 md:col-span-9 lg:col-span-10">
            <div className="space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
