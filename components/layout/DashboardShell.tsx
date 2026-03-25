'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import type { Profile } from '@/lib/types'

function getPageTitle(pathname: string): string {
  if (/^\/(student|supervisor|faculty|admin)$/.test(pathname)) return 'Dashboard'
  if (pathname.includes('/hours/new')) return 'Log Hours'
  if (pathname.includes('/hours')) return 'Hours'
  if (pathname.includes('/rubrics/new')) return 'New Rubric'
  if (pathname.includes('/rubrics')) return 'Rubric Evaluations'
  if (pathname.includes('/students')) return 'Students'
  if (pathname.includes('/reports')) return 'Reports'
  if (pathname.includes('/users/new')) return 'New User'
  if (pathname.includes('/users')) return 'Users'
  if (pathname.includes('/assignments')) return 'Assignments'
  if (pathname.includes('/rubric')) return 'Evaluation'
  return 'Dashboard'
}

export function DashboardShell({
  children,
  profile,
}: {
  children: React.ReactNode
  profile: Profile
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const title = getPageTitle(pathname)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar role={profile.role} fullName={profile.full_name} program={profile.program} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex w-60 flex-col shadow-xl">
            <Sidebar role={profile.role} fullName={profile.full_name} program={profile.program} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} onMobileMenuToggle={() => setMobileMenuOpen(v => !v)} />
        <main className="flex-1 overflow-y-auto p-6 bg-[var(--color-bg-canvas)]">
          {children}
        </main>
      </div>
    </div>
  )
}
