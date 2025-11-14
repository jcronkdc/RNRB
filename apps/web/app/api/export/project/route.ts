import { NextRequest, NextResponse } from 'next/server'
import { exportProjectData } from '@/lib/actions/export'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')
  const format = searchParams.get('format') as 'csv' | 'pdf' | 'json'
  const includeMetadata = searchParams.get('includeMetadata') === 'true'

  if (!id || !format) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  try {
    const result = await exportProjectData(id, { format, includeMetadata })
    
    // Convert base64 PDF back to binary if needed
    let data: Uint8Array | string
    if (format === 'pdf') {
      const binaryString = atob(result.data)
      data = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        (data as Uint8Array)[i] = binaryString.charCodeAt(i)
      }
    } else {
      data = result.data
    }

    return new NextResponse(data, {
      headers: {
        'Content-Type': result.contentType,
        'Content-Disposition': `attachment; filename="${result.filename}"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export project data' },
      { status: 500 }
    )
  }
}
