'use client';

import { useState } from 'react';
import { Check, X, Edit2, Sparkles, User } from 'lucide-react';
import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Clean Collaborative Lyrics Editor
 * Workflow: Write → Click word/sentence → Suggest change → Accept/Reject → Master version
 * Following mycelial principle: Clean, focused, intuitive
 */

interface LyricChange {
  id: string;
  lineNumber: number;
  changeType: 'word' | 'sentence' | 'line';
  startPosition?: number;
  endPosition?: number;
  originalText: string;
  suggestedText: string;
  reason?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'revised';
  suggestedBy: string;
  suggestedByName: string;
  createdAt: Date;
}

interface CleanCollaborativeEditorProps {
  songId: string;
  initialLyrics: string;
  changes: LyricChange[];
  currentUserName: string;
}

export default function CleanCollaborativeEditor({
  songId,
  initialLyrics,
  changes,
  currentUserName
}: CleanCollaborativeEditorProps) {
  const [lyrics, setLyrics] = useState(initialLyrics || '');
  const [selectedText, setSelectedText] = useState<{
    text: string;
    lineNumber: number;
    start: number;
    end: number;
    type: 'word' | 'sentence';
  } | null>(null);
  const [suggestionText, setSuggestionText] = useState('');
  const [suggestionReason, setSuggestionReason] = useState('');

  const lines = lyrics.split('\n');

  // Get pending changes for a specific line
  const getPendingChanges = (lineNumber: number) => {
    return changes.filter(c => c.lineNumber === lineNumber && c.status === 'pending');
  };

  // Apply accepted change to master version
  const handleAcceptChange = (change: LyricChange) => {
    const newLines = [...lines];
    const line = newLines[change.lineNumber];

    if (change.changeType === 'word' && change.startPosition !== undefined && change.endPosition !== undefined) {
      // Replace specific word
      newLines[change.lineNumber] = 
        line.substring(0, change.startPosition) + 
        change.suggestedText + 
        line.substring(change.endPosition);
    } else {
      // Replace entire line/sentence
      newLines[change.lineNumber] = change.suggestedText;
    }

    setLyrics(newLines.join('\n'));
    
    // TODO: tRPC mutation to mark as accepted and save to database
    console.log('Accepted change:', change.id);
  };

  const handleRejectChange = (changeId: string) => {
    // TODO: tRPC mutation to mark as rejected
    console.log('Rejected change:', changeId);
  };

  const handleReviseChange = (changeId: string) => {
    // TODO: Open revision dialog
    console.log('Revise change:', changeId);
  };

  const handleSubmitSuggestion = () => {
    if (!selectedText || !suggestionText.trim()) return;

    // TODO: tRPC mutation to create new LyricChange
    console.log('New suggestion:', {
      lineNumber: selectedText.lineNumber,
      changeType: selectedText.type,
      startPosition: selectedText.start,
      endPosition: selectedText.end,
      originalText: selectedText.text,
      suggestedText: suggestionText,
      reason: suggestionReason,
      suggestedBy: currentUserName
    });

    alert(`Suggestion submitted: "${selectedText.text}" → "${suggestionText}"`);
    setSelectedText(null);
    setSuggestionText('');
    setSuggestionReason('');
  };

  // Render a line with clickable words
  const renderLine = (line: string, lineNumber: number) => {
    const words = line.split(' ');
    const pendingChanges = getPendingChanges(lineNumber);

    return (
      <div className="group relative py-2">
        {/* Line number */}
        <span className="absolute -left-8 top-2 text-xs text-muted-foreground">
          {lineNumber + 1}
        </span>

        {/* Clickable words */}
        <div className="flex flex-wrap gap-1">
          {words.map((word, wordIndex) => {
            const wordStart = words.slice(0, wordIndex).join(' ').length + (wordIndex > 0 ? 1 : 0);
            const wordEnd = wordStart + word.length;

            return (
              <span
                key={wordIndex}
                onClick={() => {
                  setSelectedText({
                    text: word,
                    lineNumber,
                    start: wordStart,
                    end: wordEnd,
                    type: 'word'
                  });
                  setSuggestionText(word);
                }}
                className="cursor-pointer hover:bg-brand-primary/10 px-1 rounded transition-colors font-mono"
              >
                {word}
              </span>
            );
          })}
          
          {/* Click sentence button */}
          <button
            onClick={() => {
              setSelectedText({
                text: line,
                lineNumber,
                start: 0,
                end: line.length,
                type: 'sentence'
              });
              setSuggestionText(line);
            }}
            className="opacity-0 group-hover:opacity-100 ml-2 text-xs text-muted-foreground hover:text-brand-primary transition-opacity"
          >
            <Edit2 className="w-3 h-3 inline" />
          </button>
        </div>

        {/* Pending changes for this line */}
        {pendingChanges.length > 0 && (
          <div className="mt-3 space-y-2 ml-8">
            {pendingChanges.map((change) => (
              <motion.div
                key={change.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Show what changed */}
                    <div className="text-sm mb-2">
                      <span className="line-through text-muted-foreground">{change.originalText}</span>
                      <span className="mx-2">→</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {change.suggestedText}
                      </span>
                    </div>
                    
                    {/* Who suggested it */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{change.suggestedByName}</span>
                      {change.reason && (
                        <>
                          <span>•</span>
                          <span className="italic">"{change.reason}"</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAcceptChange(change)}
                      className="text-green-600 hover:bg-green-600/10"
                      title="Accept"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReviseChange(change.id)}
                      className="text-blue-600 hover:bg-blue-600/10"
                      title="Revise"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRejectChange(change.id)}
                      className="text-red-600 hover:bg-red-600/10"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Master Version Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Master Version (Auto-saved)</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Click any word to suggest replacement • Click line to rewrite sentence
        </div>
      </div>

      {/* Lyrics Editor */}
      <div className="bg-background border border-border rounded-lg p-8 pl-12 font-mono text-base leading-loose">
        {lines.map((line, index) => (
          <div key={index}>
            {line.trim() ? (
              renderLine(line, index)
            ) : (
              <div className="h-6" /> // Empty line for spacing
            )}
          </div>
        ))}
      </div>

      {/* Suggestion Form (Modal) */}
      <AnimatePresence>
        {selectedText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedText(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background border border-border rounded-xl p-6 max-w-2xl w-full shadow-2xl"
            >
              <h3 className="text-xl font-semibold mb-4">
                Suggest {selectedText.type === 'word' ? 'Word' : 'Sentence'} Change
              </h3>

              <div className="space-y-4">
                {/* Original */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Original
                  </label>
                  <div className="p-3 bg-muted/50 rounded-lg font-mono">
                    {selectedText.text}
                  </div>
                </div>

                {/* Suggested */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Suggestion
                  </label>
                  <input
                    type="text"
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    placeholder={`Enter your ${selectedText.type} replacement...`}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    autoFocus
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Why this change? (Optional)
                  </label>
                  <input
                    type="text"
                    value={suggestionReason}
                    onChange={(e) => setSuggestionReason(e.target.value)}
                    placeholder="Better rhyme, clearer meaning, flow..."
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <Button onClick={handleSubmitSuggestion} disabled={!suggestionText.trim()}>
                    Submit Suggestion
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedText(null);
                      setSuggestionText('');
                      setSuggestionReason('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Suggestions
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Text */}
      <div className="text-sm text-muted-foreground space-y-2">
        <p className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span>Pending suggestions are highlighted in yellow</span>
        </p>
        <p className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span>Accepted changes are merged into master version (editable)</span>
        </p>
        <p className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span>Accept = Merge into master</span>
          <Edit2 className="w-4 h-4 text-blue-600 ml-4" />
          <span>Revise = Suggest alternative</span>
          <X className="w-4 h-4 text-red-600 ml-4" />
          <span>Reject = Decline change</span>
        </p>
      </div>
    </div>
  );
}

