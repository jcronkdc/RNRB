/**
 * Export lyrics in various formats
 * Follows mycelial principle: Clean, simple, no dependencies
 */

interface Suggestion {
  lineNumber: number;
  suggestedText: string;
  status: 'pending' | 'accepted' | 'rejected';
  suggestedBy: string;
  reason?: string;
}

interface ExportOptions {
  format: 'txt' | 'pdf' | 'json';
  includeSuggestions?: boolean;
  includeMetadata?: boolean;
}

export function exportLyrics(
  songTitle: string,
  lyrics: string,
  suggestions: Suggestion[],
  metadata: { key?: string; tempo?: number; timeSignature?: string },
  options: ExportOptions
): string | Blob {
  const lines = lyrics.split('\n');

  switch (options.format) {
    case 'txt':
      return exportAsTxt(songTitle, lines, suggestions, metadata, options);

    case 'json':
      return exportAsJson(songTitle, lines, suggestions, metadata);

    case 'pdf':
      // PDF export would use jsPDF or similar
      // For now, return enhanced TXT that can be converted
      return exportAsTxt(songTitle, lines, suggestions, metadata, {
        ...options,
        includeSuggestions: true,
      });

    default:
      return exportAsTxt(songTitle, lines, suggestions, metadata, options);
  }
}

function exportAsTxt(
  songTitle: string,
  lines: string[],
  suggestions: Suggestion[],
  metadata: { key?: string; tempo?: number; timeSignature?: string },
  options: ExportOptions
): string {
  let output = '';

  // Header
  output += `${songTitle}\n`;
  output += '='.repeat(songTitle.length) + '\n\n';

  // Metadata
  if (options.includeMetadata) {
    if (metadata.key) output += `Key: ${metadata.key}\n`;
    if (metadata.tempo) output += `Tempo: ${metadata.tempo} BPM\n`;
    if (metadata.timeSignature) output += `Time Signature: ${metadata.timeSignature}\n`;
    output += '\n';
  }

  // Lyrics with suggestions
  lines.forEach((line, index) => {
    output += line + '\n';

    // Add suggestions if requested
    if (options.includeSuggestions) {
      const lineSuggestions = suggestions.filter((s) => s.lineNumber === index);
      lineSuggestions.forEach((suggestion) => {
        output += `  [${suggestion.status.toUpperCase()}] Alt: "${suggestion.suggestedText}"`;
        if (suggestion.reason) {
          output += ` - ${suggestion.reason}`;
        }
        output += ` (by ${suggestion.suggestedBy})\n`;
      });
    }
  });

  // Footer
  output += '\n---\n';
  output += `Exported from Rock N' Roll Basement\n`;
  output += `Date: ${formatDateTime(new Date())}\n`;

  return output;
}

function exportAsJson(
  songTitle: string,
  lines: string[],
  suggestions: Suggestion[],
  metadata: { key?: string; tempo?: number; timeSignature?: string }
): string {
  const data = {
    title: songTitle,
    metadata,
    lyrics: lines,
    suggestions: suggestions.map((s) => ({
      lineNumber: s.lineNumber,
      original: lines[s.lineNumber],
      suggested: s.suggestedText,
      reason: s.reason,
      status: s.status,
      suggestedBy: s.suggestedBy,
    })),
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };

  return JSON.stringify(data, null, 2);
}

// Download helper
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
