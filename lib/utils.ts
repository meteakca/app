import type { UserRole } from '@/lib/types'

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'student':            return '/student'
    case 'site_supervisor':    return '/supervisor'
    case 'faculty_supervisor': return '/faculty'
    case 'super_admin':        return '/admin'
  }
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatHours(hours: number): string {
  return `${Number(hours).toFixed(2)} hrs`
}

export function currentAcademicYear(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-based
  // Academic year starts in August
  const startYear = month >= 8 ? year : year - 1
  return `${startYear}-${startYear + 1}`
}
