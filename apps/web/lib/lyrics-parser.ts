/**
 * Lyrics Parser - Auto-detects song sections from raw lyrics
 * Supports various formats: [Verse 1], (Chorus), BRIDGE:, etc.
 */

export type SectionType = 'verse' | 'chorus' | 'bridge' | 'pre-chorus' | 'intro' | 'outro';

export type ParsedSection = {
  id: string;
  type: SectionType;
  content: string;
  originalLabel?: string;
};

// Common section markers and their mappings (more forgiving patterns)
const SECTION_PATTERNS: Array<{
  pattern: RegExp;
  type: SectionType;
}> = [
  // Verse patterns - match anywhere in line with brackets or parentheses
  { pattern: /\[\s*verse\s*\d*\s*\]/i, type: 'verse' },
  { pattern: /\(\s*verse\s*\d*\s*\)/i, type: 'verse' },
  { pattern: /^verse\s*\d*\s*:?\s*$/i, type: 'verse' },
  { pattern: /^v\s*\d+\s*:?\s*$/i, type: 'verse' },

  // Chorus patterns
  { pattern: /\[\s*chorus\s*\d*\s*\]/i, type: 'chorus' },
  { pattern: /\(\s*chorus\s*\d*\s*\)/i, type: 'chorus' },
  { pattern: /^chorus\s*\d*\s*:?\s*$/i, type: 'chorus' },
  { pattern: /\[\s*hook\s*\d*\s*\]/i, type: 'chorus' },
  { pattern: /\[\s*refrain\s*\d*\s*\]/i, type: 'chorus' },

  // Bridge patterns
  { pattern: /\[\s*bridge\s*\d*\s*\]/i, type: 'bridge' },
  { pattern: /\(\s*bridge\s*\d*\s*\)/i, type: 'bridge' },
  { pattern: /^bridge\s*\d*\s*:?\s*$/i, type: 'bridge' },
  { pattern: /\[\s*middle\s*8?\s*\]/i, type: 'bridge' },

  // Pre-chorus patterns
  { pattern: /\[\s*pre[-\s]?chorus\s*\d*\s*\]/i, type: 'pre-chorus' },
  { pattern: /\(\s*pre[-\s]?chorus\s*\d*\s*\)/i, type: 'pre-chorus' },
  { pattern: /^pre[-\s]?chorus\s*\d*\s*:?\s*$/i, type: 'pre-chorus' },

  // Intro patterns
  { pattern: /\[\s*intro\s*\d*\s*\]/i, type: 'intro' },
  { pattern: /\(\s*intro\s*\d*\s*\)/i, type: 'intro' },
  { pattern: /^intro\s*\d*\s*:?\s*$/i, type: 'intro' },

  // Outro patterns
  { pattern: /\[\s*outro\s*\d*\s*\]/i, type: 'outro' },
  { pattern: /\(\s*outro\s*\d*\s*\)/i, type: 'outro' },
  { pattern: /^outro\s*\d*\s*:?\s*$/i, type: 'outro' },
  { pattern: /\[\s*ending\s*\]/i, type: 'outro' },
  { pattern: /\[\s*coda\s*\]/i, type: 'outro' },
];

/**
 * Detect if a line is a section header
 */
function detectSectionType(line: string): { type: SectionType; label: string } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  for (const { pattern, type } of SECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { type, label: trimmed };
    }
  }

  return null;
}

/**
 * Check if lyrics have any section markers
 */
export function hasSectionMarkers(lyrics: string): boolean {
  const lines = lyrics.split('\n');
  return lines.some((line) => detectSectionType(line) !== null);
}

/**
 * Parse raw lyrics into structured sections
 */
export function parseLyrics(lyrics: string): ParsedSection[] {
  const lines = lyrics.split('\n');
  const sections: ParsedSection[] = [];

  let currentSection: ParsedSection | null = null;
  let contentLines: string[] = [];

  const flushSection = () => {
    if (currentSection) {
      currentSection.content = contentLines.join('\n').trim();
      if (currentSection.content) {
        sections.push(currentSection);
      }
    }
    contentLines = [];
  };

  for (const line of lines) {
    const sectionHeader = detectSectionType(line);

    if (sectionHeader) {
      // Save previous section
      flushSection();

      // Start new section
      currentSection = {
        id: crypto.randomUUID(),
        type: sectionHeader.type,
        content: '',
        originalLabel: sectionHeader.label,
      };
    } else if (currentSection) {
      // Add line to current section
      contentLines.push(line);
    } else {
      // Content before any section marker - create a default verse
      if (line.trim()) {
        contentLines.push(line);
      }
    }
  }

  // Flush last section
  flushSection();

  // If no sections were detected but there's content, create a single verse
  if (sections.length === 0 && contentLines.length > 0) {
    sections.push({
      id: crypto.randomUUID(),
      type: 'verse',
      content: contentLines.join('\n').trim(),
    });
  }

  return sections;
}

/**
 * Smart parse - auto-detect sections from unstructured lyrics
 * Uses heuristics when no explicit markers are found
 */
export function smartParseLyrics(lyrics: string): ParsedSection[] {
  // First, try parsing with explicit markers
  if (hasSectionMarkers(lyrics)) {
    return parseLyrics(lyrics);
  }

  // No markers found - use heuristics
  const sections: ParsedSection[] = [];
  const paragraphs = lyrics.split(/\n\s*\n+/).filter((p) => p.trim());

  if (paragraphs.length === 0) {
    return sections;
  }

  // Heuristics for common patterns:
  // - Repeated sections are likely choruses
  // - First section is often a verse
  // - Short sections after verses might be pre-choruses
  // - Very short final sections might be outros

  const normalized = paragraphs.map((p) =>
    p
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
  );
  const occurrences = new Map<string, number[]>();

  normalized.forEach((text, index) => {
    const existing = occurrences.get(text) || [];
    existing.push(index);
    occurrences.set(text, existing);
  });

  // Find repeated sections (likely choruses)
  const repeatedIndices = new Set<number>();
  for (const [, indices] of occurrences) {
    if (indices.length > 1) {
      indices.forEach((i) => repeatedIndices.add(i));
    }
  }

  let verseCount = 0;
  let chorusCount = 0;

  paragraphs.forEach((content, index) => {
    const isRepeated = repeatedIndices.has(index);
    const isShort = content.split('\n').filter((l) => l.trim()).length <= 2;
    const isLast = index === paragraphs.length - 1;
    const isFirst = index === 0;

    let type: SectionType;

    if (isRepeated) {
      type = 'chorus';
      chorusCount++;
    } else if (isFirst && isShort) {
      type = 'intro';
    } else if (isLast && isShort) {
      type = 'outro';
    } else {
      type = 'verse';
      verseCount++;
    }

    sections.push({
      id: crypto.randomUUID(),
      type,
      content: content.trim(),
    });
  });

  return sections;
}

/**
 * Convert parsed sections to the format expected by StreamlinedSongBuilder
 */
export function sectionsToBlocks(sections: ParsedSection[]): Array<{
  id: string;
  type: SectionType;
  content: string;
  chordPlacements?: Array<{ wordIndex: number; lineIndex: number; chord: string }>;
}> {
  return sections.map((section) => ({
    id: section.id,
    type: section.type,
    content: section.content,
    chordPlacements: [],
  }));
}

/**
 * Parse and convert in one step
 */
export function parseLyricsToBlocks(lyrics: string): ReturnType<typeof sectionsToBlocks> {
  const sections = smartParseLyrics(lyrics);
  return sectionsToBlocks(sections);
}

/**
 * Get summary of detected sections (for UI feedback)
 */
export function getSectionSummary(sections: ParsedSection[]): string {
  const counts: Record<SectionType, number> = {
    verse: 0,
    chorus: 0,
    bridge: 0,
    'pre-chorus': 0,
    intro: 0,
    outro: 0,
  };

  sections.forEach((s) => counts[s.type]++);

  const parts: string[] = [];
  if (counts.verse) parts.push(`${counts.verse} verse${counts.verse > 1 ? 's' : ''}`);
  if (counts.chorus) parts.push(`${counts.chorus} chorus${counts.chorus > 1 ? 'es' : ''}`);
  if (counts.bridge) parts.push(`${counts.bridge} bridge${counts.bridge > 1 ? 's' : ''}`);
  if (counts['pre-chorus'])
    parts.push(`${counts['pre-chorus']} pre-chorus${counts['pre-chorus'] > 1 ? 'es' : ''}`);
  if (counts.intro) parts.push('intro');
  if (counts.outro) parts.push('outro');

  return parts.join(', ') || 'No sections detected';
}
