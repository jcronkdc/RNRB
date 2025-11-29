import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { formatDateLong, formatDateTime } from './format-date';

type SetlistSong = {
  id: string;
  title: string;
  artist?: string;
  key?: string;
  tempo?: number;
  duration?: number; // seconds
  notes?: string;
  position: number;
};

type SetlistExportOptions = {
  showName: string;
  venueName?: string;
  date?: string;
  notes?: string;
  layout?: 'full' | 'compact' | 'stage';
};

/**
 * Export setlist to PDF
 *
 * Layouts:
 * - full: All details (song info, keys, tempos, notes)
 * - compact: Just songs, keys, and durations
 * - stage: Large fonts, minimal info for stage use
 */
export function exportSetlistToPDF(songs: SetlistSong[], options: SetlistExportOptions) {
  const { showName, venueName, date, notes, layout = 'full' } = options;

  // Create PDF
  const doc = new jsPDF({
    orientation: layout === 'stage' ? 'portrait' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 20; // Current Y position

  // Header
  doc.setFontSize(layout === 'stage' ? 24 : 18);
  doc.setFont('helvetica', 'bold');
  doc.text(showName || 'Setlist', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Venue and date
  if (venueName || date) {
    doc.setFontSize(layout === 'stage' ? 14 : 12);
    doc.setFont('helvetica', 'normal');
    const subtitle: string[] = [];
    if (venueName) subtitle.push(venueName);
    if (date) subtitle.push(formatDateLong(date));
    doc.text(subtitle.join(' • ') || '', pageWidth / 2, y, { align: 'center' });
    y += 10;
  }

  // Notes (if any)
  if (notes && layout !== 'stage') {
    doc.setFontSize(10);
    doc.setTextColor(100);
    const splitNotes = doc.splitTextToSize(notes, pageWidth - 40);
    doc.text(splitNotes, pageWidth / 2, y, { align: 'center' });
    y += splitNotes.length * 5 + 5;
  }

  y += 5;

  // Calculate total duration
  const totalDuration = songs.reduce((sum, song) => sum + (song.duration || 0), 0);
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours > 0) return `${hours}h ${remainingMins}m`;
    return `${mins}m`;
  };

  // Summary
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`${songs.length} songs • ${formatDuration(totalDuration)} total`, pageWidth / 2, y, {
    align: 'center',
  });
  y += 10;

  // Reset color
  doc.setTextColor(0);

  // Layout: Stage (large fonts, minimal info)
  if (layout === 'stage') {
    songs.forEach((song, index) => {
      // Check if we need a new page
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 20;
      }

      // Position number
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100);
      doc.text(`${index + 1}.`, 15, y);

      // Song title
      doc.setFontSize(20);
      doc.setTextColor(0);
      doc.text(song.title || 'Untitled', 25, y);

      y += 8;

      // Key and tempo (if available)
      if (song.key || song.tempo) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80);
        const meta: string[] = [];
        if (song.key) meta.push(`Key: ${song.key}`);
        if (song.tempo) meta.push(`${song.tempo} BPM`);
        doc.text(meta.join(' • ') || '', 25, y);
        y += 8;
      }

      // Notes (if any)
      if (song.notes) {
        doc.setFontSize(12);
        doc.setTextColor(100);
        const splitSongNotes = doc.splitTextToSize(song.notes, pageWidth - 35);
        doc.text(splitSongNotes || '', 25, y);
        y += splitSongNotes.length * 5 + 3;
      }

      y += 5; // Spacing between songs
    });
  } else {
    // Layout: Full or Compact (table format)
    const tableColumns =
      layout === 'full'
        ? ['#', 'Song', 'Artist', 'Key', 'Tempo', 'Duration', 'Notes']
        : ['#', 'Song', 'Key', 'Duration'];

    const tableRows = songs.map((song, index) => {
      const formatSongDuration = (seconds?: number) => {
        if (!seconds) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };

      if (layout === 'full') {
        return [
          index + 1,
          song.title,
          song.artist || '-',
          song.key || '-',
          song.tempo ? `${song.tempo}` : '-',
          formatSongDuration(song.duration),
          song.notes || '-',
        ];
      } else {
        return [index + 1, song.title, song.key || '-', formatSongDuration(song.duration)];
      }
    });

    autoTable(doc, {
      startY: y,
      head: [tableColumns],
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: layout === 'compact' ? 10 : 9,
        cellPadding: layout === 'compact' ? 4 : 3,
      },
      headStyles: {
        fillColor: [60, 60, 60],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles:
        layout === 'full'
          ? {
              0: { cellWidth: 10 }, // #
              1: { cellWidth: 50 }, // Song
              2: { cellWidth: 40 }, // Artist
              3: { cellWidth: 15 }, // Key
              4: { cellWidth: 20 }, // Tempo
              5: { cellWidth: 20 }, // Duration
              6: { cellWidth: 40 }, // Notes
            }
          : {
              0: { cellWidth: 15 }, // #
              1: { cellWidth: 100 }, // Song
              2: { cellWidth: 30 }, // Key
              3: { cellWidth: 30 }, // Duration
            },
    });
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Generated by CronkWaters', pageWidth / 2, footerY, { align: 'center' });
  doc.text(formatDateTime(new Date()), pageWidth / 2, footerY + 4, { align: 'center' });

  // Generate filename
  const dateStr = date ? new Date(date).toISOString().split('T')[0] : 'setlist';
  const filename = `${(showName || 'setlist').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${dateStr}.pdf`;

  // Save PDF
  doc.save(filename);

  return filename;
}

/**
 * Print setlist (opens print dialog)
 */
export function printSetlist(songs: SetlistSong[], options: SetlistExportOptions) {
  // Create PDF in memory
  const { showName, venueName, date, layout = 'full' } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(showName || 'Setlist', pageWidth / 2, y, { align: 'center' });
  y += 10;

  if (venueName || date) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const subtitle: string[] = [];
    if (venueName) subtitle.push(venueName);
    if (date) subtitle.push(formatDateLong(date));
    doc.text(subtitle.join(' • ') || '', pageWidth / 2, y, { align: 'center' });
    y += 15;
  }

  // Table
  const tableColumns =
    layout === 'compact'
      ? ['#', 'Song', 'Key', 'Duration']
      : ['#', 'Song', 'Artist', 'Key', 'Tempo', 'Duration'];

  const tableRows = songs.map((song, index) => {
    const formatSongDuration = (seconds?: number) => {
      if (!seconds) return '-';
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (layout === 'compact') {
      return [index + 1, song.title, song.key || '-', formatSongDuration(song.duration)];
    } else {
      return [
        index + 1,
        song.title,
        song.artist || '-',
        song.key || '-',
        song.tempo ? `${song.tempo}` : '-',
        formatSongDuration(song.duration),
      ];
    }
  });

  autoTable(doc, {
    startY: y,
    head: [tableColumns],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 10,
    },
  });

  // Open print dialog
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
}
