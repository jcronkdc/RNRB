'use client'

import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, FileJson, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@cronkwaters/ui'
import { Button } from '@cronkwaters/ui'
import { Checkbox } from '@cronkwaters/ui'
// Import removed - using API routes instead
import { useToast } from '@cronkwaters/ui'

interface ExportButtonProps {
  type: 'splitSheet' | 'project'
  id: string
  title?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ExportButton({ 
  type, 
  id, 
  title = 'Export',
  variant = 'outline',
  size = 'sm'
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const { toast } = useToast()

  const handleExport = async (format: 'csv' | 'pdf' | 'json') => {
    setIsExporting(true)
    
    try {
      // Build API URL
      const endpoint = type === 'splitSheet' ? '/api/export/split-sheet' : '/api/export/project'
      const params = new URLSearchParams({
        id,
        format,
        includeMetadata: String(includeMetadata)
      })

      const response = await fetch(`${endpoint}?${params}`)
      
      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : `export.${format}`

      // Create download link
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Export successful',
        description: `${title} has been exported as ${format.toUpperCase()}`
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Export failed',
        description: 'There was an error exporting your data. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {size !== 'icon' && <span className="ml-2">Export</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="mr-2 h-4 w-4" />
          <span>PDF Document</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span>CSV Spreadsheet</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="mr-2 h-4 w-4" />
          <span>JSON Data</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-2">
          <label className="flex items-center space-x-2 text-sm">
            <Checkbox
              checked={includeMetadata}
              onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
            />
            <span>Include metadata</span>
          </label>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
