import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getOrgSessionFromSession, type OrgAwareSession } from '@cronkwaters/auth';
import { getProjectBySlug } from '@cronkwaters/db';

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

    // Generate PDF content (simplified HTML for now)
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${project.name} - Export</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.6;
          }
          h1 { color: #333; }
          h2 { color: #666; margin-top: 30px; }
          .project-info { margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .meta { color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <h1>${project.name}</h1>
        <div class="project-info">
          <p class="meta">Organization: ${activeMembership.org.name}</p>
          <p class="meta">Created: ${new Date(project.createdAt).toLocaleDateString()}</p>
          <p class="meta">Status: ${project.status || 'Active'}</p>
        </div>

        ${project.description ? `
        <div class="section">
          <h2>Description</h2>
          <p>${project.description}</p>
        </div>
        ` : ''}

        <div class="section">
          <h2>Songs</h2>
          ${project.songs && project.songs.length > 0 ? `
            <ul>
              ${project.songs.map((song) => `
                <li>
                  <strong>${song.title}</strong>
                  ${song.key ? ` - Key: ${song.key}` : ''}
                  ${song.tempo ? ` - ${song.tempo} BPM` : ''}
                </li>
              `).join('')}
            </ul>
          ` : '<p>No songs in this project yet.</p>'}
        </div>

        <div class="section">
          <h2>Assets</h2>
          ${project.assets && project.assets.length > 0 ? `
            <ul>
              ${project.assets.map((asset) => `
                <li>
                  <strong>${asset.name}</strong>
                  - ${asset.mimeType}
                  ${asset.bytes ? ` (${(Number(asset.bytes) / 1024 / 1024).toFixed(2)} MB)` : ''}
                </li>
              `).join('')}
            </ul>
          ` : '<p>No assets in this project yet.</p>'}
        </div>

        <div class="meta" style="margin-top: 50px; text-align: center;">
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>© ${new Date().getFullYear()} CronkWaters</p>
        </div>
      </body>
      </html>
    `;

    // Return HTML with PDF content-type headers
    // Note: In production, you'd use a proper PDF generation library like puppeteer or pdfkit
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${project.slug}_export.pdf"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
