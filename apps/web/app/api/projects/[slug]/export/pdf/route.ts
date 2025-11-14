import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getOrgSessionFromSession } from '@cronkwaters/auth';
import { getProjectBySlug, listSongs, listAssets, listSplitSheets, prisma } from '@cronkwaters/db';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { ProjectExportPDF } from '@/lib/pdf/project-export';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Await params in Next.js 15
    const { slug } = await params;
    
    // Authenticate user
    const session = await getOrgSessionFromSession();
    if (!session || !session.activeMembership) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get project
    const activeMembership = session.activeMembership as NonNullable<typeof session.activeMembership>;
    const orgId = activeMembership.org.id;
    const project = await getProjectBySlug(slug, orgId);
    if (!project) {
      return new NextResponse('Project not found', { status: 404 });
    }

    // Fetch related data
    const [songs, assets, splits] = await Promise.all([
      listSongs(project.id),
      listAssets(project.id),
      // Get splits with contributors
      prisma.splitSheet.findMany({
        where: { projectId: project.id },
        include: {
          contributors: true
        }
      })
    ]);

    // Prepare data for PDF
    const pdfData = {
      project: {
        name: project.name,
        orgName: activeMembership.org.name,
        description: project.description || undefined,
        status: project.status,
        visibility: project.visibility,
        createdAt: project.createdAt
      },
      songs: songs.map(song => ({
        title: song.title,
        key: song.key || undefined,
        tempo: song.tempo || undefined
      })),
      assets: assets.map(asset => ({
        name: asset.name,
        type: asset.assetType,
        size: Number(asset.bytes)
      })),
      splits: splits.map(split => ({
        title: split.title,
        contributors: split.contributors.map(contrib => ({
          name: contrib.name,
          percentage: contrib.percentage,
          role: contrib.role || undefined
        }))
      }))
    };

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(ProjectExportPDF, { data: pdfData })
    );

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${project.slug}_export.pdf"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
