'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { UserRole } from '@/lib/types'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case 'student':
      return [
        { label: 'Dashboard',   href: '/student',             icon: <HomeIcon /> },
        { label: 'Log Hours',   href: '/student/hours/new',   icon: <PlusIcon /> },
        { label: 'My Hours',    href: '/student/hours',       icon: <ClockIcon /> },
        { label: 'Evaluations', href: '/student/rubrics',     icon: <ClipboardIcon /> },
      ]
    case 'site_supervisor':
      return [
        { label: 'Dashboard',  href: '/supervisor',            icon: <HomeIcon /> },
        { label: 'My Students', href: '/supervisor/students',  icon: <UsersIcon /> },
      ]
    case 'faculty_supervisor':
      return [
        { label: 'Dashboard',  href: '/faculty',               icon: <HomeIcon /> },
        { label: 'Students',   href: '/faculty/students',      icon: <UsersIcon /> },
        { label: 'Rubrics',    href: '/faculty/rubrics',       icon: <ClipboardIcon /> },
        { label: 'Reports',    href: '/faculty/reports',       icon: <DownloadIcon /> },
      ]
    case 'super_admin':
      return [
        { label: 'Dashboard',    href: '/admin',               icon: <HomeIcon /> },
        { label: 'Users',        href: '/admin/users',         icon: <UsersIcon /> },
        { label: 'Assignments',  href: '/admin/assignments',   icon: <LinkIcon /> },
      ]
  }
}

interface SidebarProps {
  role: UserRole
  fullName: string
  program: string | null
}

export function Sidebar({ role, fullName, program }: SidebarProps) {
  const pathname = usePathname()
  const navItems = getNavItems(role)

  const roleLabel: Record<UserRole, string> = {
    student:             'Student',
    site_supervisor:     'Site Supervisor',
    faculty_supervisor:  'Faculty Supervisor',
    super_admin:         'Administrator',
  }

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-[var(--color-bg-surface)] border-r border-[var(--color-border-default)] h-full">
      {/* Logo / app name */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-[var(--color-border-default)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--blue-500)] flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 2L3 7v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V7l-7-5z" fill="white" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
            Practicum Tracker
          </p>
          {program && (
            <p className="text-xs text-[var(--color-text-tertiary)]">{program}</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Main navigation">
        <ul className="space-y-1" role="list">
          {navItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    'flex items-center gap-3 h-9 px-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[var(--color-bg-primary-subtle)] text-[var(--blue-700)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User info at bottom */}
      <div className="p-3 border-t border-[var(--color-border-default)]">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-[var(--blue-100)] text-[var(--blue-700)] flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{fullName}</p>
            <p className="text-xs text-[var(--color-text-tertiary)] truncate">{roleLabel[role]}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

// Icons
function HomeIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 6.5L8 1.5l6.5 5V14a.5.5 0 01-.5.5H10V10H6v4.5H2a.5.5 0 01-.5-.5V6.5z" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <circle cx="8" cy="8" r="6.5" strokeLinecap="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4.5V8l2.5 2" />
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" d="M8 2.5v11M2.5 8h11" />
    </svg>
  )
}
function ClipboardIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <rect x="3.5" y="2.5" width="9" height="11" rx="1" strokeLinecap="round" />
      <path strokeLinecap="round" d="M6 2.5a2 2 0 014 0" />
      <path strokeLinecap="round" d="M5.5 7h5M5.5 9.5h3" />
    </svg>
  )
}
function UsersIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <circle cx="6" cy="5" r="2.5" />
      <path strokeLinecap="round" d="M1.5 14c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5" />
      <circle cx="11.5" cy="5" r="2" />
      <path strokeLinecap="round" d="M13.5 9.5c.985.818 1.5 1.96 1.5 3.5" />
    </svg>
  )
}
function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v8M5 7.5l3 3 3-3" />
      <path strokeLinecap="round" d="M2.5 11.5v1a1 1 0 001 1h9a1 1 0 001-1v-1" />
    </svg>
  )
}
function LinkIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 9.5a3 3 0 004.243 0l2-2a3 3 0 00-4.243-4.243L7.5 4.257" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 6.5a3 3 0 00-4.243 0l-2 2a3 3 0 004.243 4.243L8.5 11.743" />
    </svg>
  )
}
