'use server'

import { db } from '@/lib/db'
import { currentUser } from '@/lib/session'
import { Parser } from 'json2csv'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface ExportOptions {
  format: 'csv' | 'pdf' | 'json'
  includeMetadata?: boolean
}

export async function exportSplitSheet(splitSheetId: string, options: ExportOptions) {
  const user = await currentUser()
  if (!user?.id) {
    throw new Error('You must be logged in to export split sheets')
  }

  // Verify user has access to this split sheet
  const splitSheet = await db.splitSheet.findFirst({
    where: {
      id: splitSheetId,
      song: {
        project: {
          organization: {
            members: {
              some: {
                userId: user.id
              }
            }
          }
        }
      }
    },
    include: {
      song: {
        include: {
          project: {
            select: {
              name: true,
              organization: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      },
      recipients: {
        orderBy: {
          percentage: 'desc'
        }
      }
    }
  })

  if (!splitSheet) {
    throw new Error('Split sheet not found or access denied')
  }

  switch (options.format) {
    case 'csv':
      return exportSplitSheetAsCSV(splitSheet)
    case 'pdf':
      return exportSplitSheetAsPDF(splitSheet, options.includeMetadata)
    case 'json':
      return exportSplitSheetAsJSON(splitSheet, options.includeMetadata)
    default:
      throw new Error('Invalid export format')
  }
}

function exportSplitSheetAsCSV(splitSheet: any) {
  const fields = ['name', 'role', 'percentage', 'pro', 'ipi', 'publisher', 'email']
  const parser = new Parser({ fields })
  const csv = parser.parse(splitSheet.recipients)

  return {
    data: csv,
    filename: `${splitSheet.song.title}-splits-${new Date().toISOString().split('T')[0]}.csv`,
    contentType: 'text/csv'
  }
}

async function exportSplitSheetAsPDF(splitSheet: any, includeMetadata = true) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792]) // Letter size
  const { width, height } = page.getSize()
  
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  let yPosition = height - 50

  // Header
  page.drawText('SPLIT SHEET', {
    x: 50,
    y: yPosition,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  })

  yPosition -= 40

  // Song info
  page.drawText(`Song: ${splitSheet.song.title}`, {
    x: 50,
    y: yPosition,
    size: 16,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  })

  yPosition -= 25

  if (includeMetadata) {
    page.drawText(`Project: ${splitSheet.song.project.name}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: helvetica,
      color: rgb(0, 0, 0),
    })

    yPosition -= 20

    page.drawText(`Organization: ${splitSheet.song.project.organization.name}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: helvetica,
      color: rgb(0, 0, 0),
    })

    yPosition -= 20

    if (splitSheet.song.isrc) {
      page.drawText(`ISRC: ${splitSheet.song.isrc}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helvetica,
        color: rgb(0, 0, 0),
      })
      yPosition -= 20
    }

    page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: helvetica,
      color: rgb(0, 0, 0),
    })

    yPosition -= 30
  }

  // Table header
  const tableHeaders = ['Name', 'Role', 'Share %', 'PRO', 'Publisher']
  const columnWidths = [150, 100, 70, 70, 150]
  let xPosition = 50

  // Draw header row
  page.drawRectangle({
    x: 50,
    y: yPosition - 5,
    width: 540,
    height: 25,
    color: rgb(0.95, 0.95, 0.95),
  })

  tableHeaders.forEach((header, index) => {
    page.drawText(header, {
      x: xPosition,
      y: yPosition,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    })
    xPosition += columnWidths[index]
  })

  yPosition -= 30

  // Draw recipient rows
  splitSheet.recipients.forEach((recipient: any) => {
    xPosition = 50

    // Name
    page.drawText(recipient.name || 'N/A', {
      x: xPosition,
      y: yPosition,
      size: 11,
      font: helvetica,
      color: rgb(0, 0, 0),
    })
    xPosition += columnWidths[0]

    // Role
    page.drawText(recipient.role || 'N/A', {
      x: xPosition,
      y: yPosition,
      size: 11,
      font: helvetica,
      color: rgb(0, 0, 0),
    })
    xPosition += columnWidths[1]

    // Percentage
    page.drawText(`${recipient.percentage}%`, {
      x: xPosition,
      y: yPosition,
      size: 11,
      font: helvetica,
      color: rgb(0, 0, 0),
    })
    xPosition += columnWidths[2]

    // PRO
    page.drawText(recipient.pro || 'N/A', {
      x: xPosition,
      y: yPosition,
      size: 11,
      font: helvetica,
      color: rgb(0, 0, 0),
    })
    xPosition += columnWidths[3]

    // Publisher
    const publisher = recipient.publisher || 'N/A'
    const truncatedPublisher = publisher.length > 25 ? publisher.substring(0, 22) + '...' : publisher
    page.drawText(truncatedPublisher, {
      x: xPosition,
      y: yPosition,
      size: 11,
      font: helvetica,
      color: rgb(0, 0, 0),
    })

    yPosition -= 25
  })

  // Total row
  yPosition -= 10
  page.drawLine({
    start: { x: 50, y: yPosition + 15 },
    end: { x: 590, y: yPosition + 15 },
    thickness: 1,
    color: rgb(0, 0, 0),
  })

  const totalPercentage = splitSheet.recipients.reduce((sum: number, r: any) => sum + r.percentage, 0)
  
  page.drawText('TOTAL', {
    x: 50,
    y: yPosition,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  })

  page.drawText(`${totalPercentage}%`, {
    x: 220,
    y: yPosition,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  })

  // Footer
  yPosition = 50
  page.drawText('Generated by CronkWaters', {
    x: width / 2 - 60,
    y: yPosition,
    size: 10,
    font: helvetica,
    color: rgb(0.6, 0.6, 0.6),
  })

  const pdfBytes = await pdfDoc.save()

  return {
    data: Buffer.from(pdfBytes).toString('base64'),
    filename: `${splitSheet.song.title}-splits-${new Date().toISOString().split('T')[0]}.pdf`,
    contentType: 'application/pdf'
  }
}

function exportSplitSheetAsJSON(splitSheet: any, includeMetadata = true) {
  const exportData: any = {
    song: {
      title: splitSheet.song.title,
      isrc: splitSheet.song.isrc
    },
    splits: splitSheet.recipients.map((r: any) => ({
      name: r.name,
      role: r.role,
      percentage: r.percentage,
      pro: r.pro,
      ipi: r.ipi,
      publisher: r.publisher,
      email: r.email
    })),
    totalPercentage: splitSheet.recipients.reduce((sum: number, r: any) => sum + r.percentage, 0),
    finalized: splitSheet.finalized,
    exportDate: new Date().toISOString()
  }

  if (includeMetadata) {
    exportData.project = {
      name: splitSheet.song.project.name,
      organization: splitSheet.song.project.organization.name
    }
    exportData.createdAt = splitSheet.createdAt
    exportData.updatedAt = splitSheet.updatedAt
  }

  return {
    data: JSON.stringify(exportData, null, 2),
    filename: `${splitSheet.song.title}-splits-${new Date().toISOString().split('T')[0]}.json`,
    contentType: 'application/json'
  }
}

export async function exportProjectData(projectId: string, options: ExportOptions) {
  const user = await currentUser()
  if (!user?.id) {
    throw new Error('You must be logged in to export project data')
  }

  // Verify user has access to this project
  const project = await db.project.findFirst({
    where: {
      id: projectId,
      organization: {
        members: {
          some: {
            userId: user.id
          }
        }
      }
    },
    include: {
      organization: {
        select: {
          name: true
        }
      },
      songs: {
        include: {
          splitSheet: {
            include: {
              recipients: true
            }
          }
        }
      },
      licenses: {
        select: {
          id: true,
          title: true,
          template: true,
          status: true,
          signedAt: true
        }
      },
      assets: {
        select: {
          id: true,
          name: true,
          fileType: true,
          fileSize: true,
          uploadedAt: true
        }
      },
      _count: {
        select: {
          songs: true,
          assets: true,
          licenses: true,
          splitSheets: true
        }
      }
    }
  })

  if (!project) {
    throw new Error('Project not found or access denied')
  }

  switch (options.format) {
    case 'csv':
      return exportProjectAsCSV(project)
    case 'pdf':
      return exportProjectAsPDF(project, options.includeMetadata)
    case 'json':
      return exportProjectAsJSON(project, options.includeMetadata)
    default:
      throw new Error('Invalid export format')
  }
}

function exportProjectAsCSV(project: any) {
  // Create songs CSV data
  const songsData = project.songs.map((song: any) => ({
    title: song.title,
    status: song.status,
    genre: song.genre || 'N/A',
    duration: song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : 'N/A',
    bpm: song.bpm || 'N/A',
    key: song.key || 'N/A',
    isrc: song.isrc || 'N/A',
    hasSplitSheet: song.splitSheet ? 'Yes' : 'No'
  }))

  const fields = ['title', 'status', 'genre', 'duration', 'bpm', 'key', 'isrc', 'hasSplitSheet']
  const parser = new Parser({ fields })
  const csv = parser.parse(songsData)

  return {
    data: csv,
    filename: `${project.name}-songs-${new Date().toISOString().split('T')[0]}.csv`,
    contentType: 'text/csv'
  }
}

async function exportProjectAsPDF(project: any, includeMetadata = true) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792])
  const { width, height } = page.getSize()
  
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  let yPosition = height - 50

  // Header
  page.drawText('PROJECT REPORT', {
    x: 50,
    y: yPosition,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  })

  yPosition -= 40

  // Project info
  page.drawText(project.name, {
    x: 50,
    y: yPosition,
    size: 18,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  })

  yPosition -= 25

  if (project.description) {
    const descriptionLines = project.description.match(/.{1,80}/g) || []
    descriptionLines.slice(0, 3).forEach((line: string) => {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 11,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
      })
      yPosition -= 15
    })
  }

  yPosition -= 10

  // Stats
  const stats = [
    { label: 'Songs', value: project._count.songs },
    { label: 'Assets', value: project._count.assets },
    { label: 'Licenses', value: project._count.licenses },
    { label: 'Split Sheets', value: project._count.splitSheets }
  ]

  let xPosition = 50
  stats.forEach(stat => {
    // Stat box
    page.drawRectangle({
      x: xPosition,
      y: yPosition - 35,
      width: 120,
      height: 50,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    })

    // Stat value
    page.drawText(stat.value.toString(), {
      x: xPosition + 60 - (stat.value.toString().length * 8),
      y: yPosition - 15,
      size: 20,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    })

    // Stat label
    page.drawText(stat.label, {
      x: xPosition + 60 - (stat.label.length * 3),
      y: yPosition - 30,
      size: 10,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    })

    xPosition += 130
  })

  yPosition -= 70

  // Songs section
  if (project.songs.length > 0) {
    page.drawText('SONGS', {
      x: 50,
      y: yPosition,
      size: 14,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    })

    yPosition -= 25

    project.songs.slice(0, 15).forEach((song: any) => {
      // Song title
      page.drawText(`• ${song.title}`, {
        x: 60,
        y: yPosition,
        size: 11,
        font: helvetica,
        color: rgb(0, 0, 0),
      })

      // Song metadata
      const metadata = []
      if (song.genre) metadata.push(song.genre)
      if (song.duration) metadata.push(`${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}`)
      if (song.isrc) metadata.push(`ISRC: ${song.isrc}`)
      
      if (metadata.length > 0) {
        page.drawText(metadata.join(' • '), {
          x: 250,
          y: yPosition,
          size: 9,
          font: helvetica,
          color: rgb(0.5, 0.5, 0.5),
        })
      }

      yPosition -= 20
    })

    if (project.songs.length > 15) {
      page.drawText(`... and ${project.songs.length - 15} more songs`, {
        x: 60,
        y: yPosition,
        size: 10,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      })
    }
  }

  // Footer
  page.drawText(`Generated on ${new Date().toLocaleDateString()} by CronkWaters`, {
    x: width / 2 - 100,
    y: 50,
    size: 10,
    font: helvetica,
    color: rgb(0.6, 0.6, 0.6),
  })

  const pdfBytes = await pdfDoc.save()

  return {
    data: Buffer.from(pdfBytes).toString('base64'),
    filename: `${project.name}-report-${new Date().toISOString().split('T')[0]}.pdf`,
    contentType: 'application/pdf'
  }
}

function exportProjectAsJSON(project: any, includeMetadata = true) {
  const exportData: any = {
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      organization: project.organization.name
    },
    statistics: {
      totalSongs: project._count.songs,
      totalAssets: project._count.assets,
      totalLicenses: project._count.licenses,
      totalSplitSheets: project._count.splitSheets
    },
    songs: project.songs.map((song: any) => ({
      id: song.id,
      title: song.title,
      status: song.status,
      genre: song.genre,
      duration: song.duration,
      bpm: song.bpm,
      key: song.key,
      isrc: song.isrc,
      lyrics: song.lyrics,
      splitSheet: song.splitSheet ? {
        finalized: song.splitSheet.finalized,
        totalPercentage: song.splitSheet.recipients.reduce((sum: number, r: any) => sum + r.percentage, 0),
        recipients: song.splitSheet.recipients.map((r: any) => ({
          name: r.name,
          role: r.role,
          percentage: r.percentage,
          pro: r.pro,
          publisher: r.publisher
        }))
      } : null
    })),
    licenses: project.licenses,
    assets: project.assets.map((asset: any) => ({
      id: asset.id,
      name: asset.name,
      fileType: asset.fileType,
      fileSize: asset.fileSize,
      uploadedAt: asset.uploadedAt
    })),
    exportDate: new Date().toISOString()
  }

  if (!includeMetadata) {
    delete exportData.project.id
    exportData.songs.forEach((song: any) => delete song.id)
    exportData.assets.forEach((asset: any) => delete asset.id)
  }

  return {
    data: JSON.stringify(exportData, null, 2),
    filename: `${project.name}-full-export-${new Date().toISOString().split('T')[0]}.json`,
    contentType: 'application/json'
  }
}
