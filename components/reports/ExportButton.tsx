'use client'

import { Button } from '@/components/ui/Button'

interface ExportButtonProps {
  rows: Record<string, string | number | null | undefined>[]
  filename?: string
}

export function ExportButton({ rows, filename = 'export.csv' }: ExportButtonProps) {
  function handleExport() {
    if (rows.length === 0) return

    const headers = Object.keys(rows[0])
    const csv = [
      headers.join(','),
      ...rows.map(row =>
        headers.map(h => JSON.stringify(row[h] ?? '')).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="secondary" onClick={handleExport} disabled={rows.length === 0}>
      Download CSV
    </Button>
  )
}
