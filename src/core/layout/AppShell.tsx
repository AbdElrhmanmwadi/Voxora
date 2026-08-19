import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

type Props = {
  children: React.ReactNode
}

export default function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto w-full max-w-[1536px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 py-6 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] lg:py-8">
          <aside className="min-w-0">
            <Sidebar />
          </aside>
          <main className="min-w-0">
            <div className="pb-12">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
