'use client';

import { useState } from 'react';
import { Plus, Check, X, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@cronkwaters/ui';

interface Suggestion {
  id: string;
  lineNumber: number;
  originalText: string;
  suggestedText: string;
  reason?: string;
  status: 'pending' | 'accepted' | 'rejected';
  suggestedBy: string;
  createdAt: Date;
}

interface CollaborativeLyricsEditorProps {
  songId: string;
  lyrics: string;
  suggestions: Suggestion[];
}

export default function CollaborativeLyricsEditor({ 
  songId, 
  lyrics, 
  suggestions 
}: CollaborativeLyricsEditorProps) {
  const [editedLyrics, setEditedLyrics] = useState(lyrics || '');
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [suggestionText, setSuggestionText] = useState('');
  const [suggestionReason, setSuggestionReason] = useState('');
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);

  const lines = editedLyrics.split('\n');

  const handleLineClick = (lineNumber: number) => {
    setActiveLine(lineNumber);
    setShowSuggestionForm(true);
    setSuggestionText(lines[lineNumber] || '');
  };

  const handleAddSuggestion = () => {
    // TODO: tRPC mutation to save suggestion
    console.log('Adding suggestion:', {
      lineNumber: activeLine,
      original: lines[activeLine!],
      suggested: suggestionText,
      reason: suggestionReason
    });
    
    alert(`Suggestion saved! Line ${(activeLine! + 1)}: "${suggestionText}"`);
    setShowSuggestionForm(false);
    setSuggestionText('');
    setSuggestionReason('');
    setActiveLine(null);
  };

  const handleAcceptSuggestion = (suggestion: Suggestion) => {
    // Replace the line with the suggestion
    const newLines = [...lines];
    newLines[suggestion.lineNumber] = suggestion.suggestedText;
    setEditedLyrics(newLines.join('\n'));
    
    // TODO: tRPC mutation to mark suggestion as accepted
    alert('Suggestion accepted!');
  };

  const handleRejectSuggestion = (suggestion: Suggestion) => {
    // TODO: tRPC mutation to mark suggestion as rejected
    alert('Suggestion rejected');
  };

  const getPendingSuggestionsForLine = (lineNumber: number) => {
    return suggestions.filter(s => s.lineNumber === lineNumber && s.status === 'pending');
  };

  return (
    <div className="space-y-6">
      {/* Lyrics Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-muted-foreground">
            Click any line to suggest an edit
          </label>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="w-3 h-3" />
            <span>Changes auto-save</span>
          </div>
        </div>

        <div className="space-y-1">
          {lines.map((line, index) => {
            const lineSuggestions = getPendingSuggestionsForLine(index);
            const hasLine = line.trim().length > 0;
            
            return (
              <div key={index} className="group">
                {/* Original Line */}
                <div
                  onClick={() => hasLine && handleLineClick(index)}
                  className={`
                    p-3 rounded-lg transition-all cursor-pointer
                    ${activeLine === index ? 'bg-brand-primary/10 ring-2 ring-brand-primary' : 'hover:bg-muted/50'}
                    ${!hasLine ? 'min-h-[1em] opacity-30' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground mr-3">{index + 1}</span>
                    <span className={`flex-1 font-mono ${!hasLine ? 'italic text-muted-foreground' : ''}`}>
                      {line || '(empty line)'}
                    </span>
                    {hasLine && (
                      <Plus className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>

                {/* Suggestions for this line */}
                {lineSuggestions.length > 0 && (
                  <div className="ml-8 mt-2 space-y-2">
                    {lineSuggestions.map((suggestion) => (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-mono mb-2">{suggestion.suggestedText}</p>
                            {suggestion.reason && (
                              <p className="text-xs text-muted-foreground italic">
                                "{suggestion.reason}"
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Suggested by {suggestion.suggestedBy}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAcceptSuggestion(suggestion)}
                              className="text-green-600 hover:bg-green-600/10"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRejectSuggestion(suggestion)}
                              className="text-red-600 hover:bg-red-600/10"
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
          })}
        </div>
      </div>

      {/* Suggestion Form (appears when line is clicked) */}
      {showSuggestionForm && activeLine !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
        >
          <Card className="p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold mb-1">Suggest Edit for Line {activeLine + 1}</h3>
                <p className="text-sm text-muted-foreground">Original: "{lines[activeLine]}"</p>
              </div>
              <button
                onClick={() => {
                  setShowSuggestionForm(false);
                  setActiveLine(null);
                  setSuggestionText('');
                  setSuggestionReason('');
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Suggested Version
                </label>
                <input
                  type="text"
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  placeholder="Enter your alternative lyric..."
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Why this change? (Optional)
                </label>
                <input
                  type="text"
                  value={suggestionReason}
                  onChange={(e) => setSuggestionReason(e.target.value)}
                  placeholder="Better rhyme, clearer meaning, etc."
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleAddSuggestion} disabled={!suggestionText.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Suggestion
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowSuggestionForm(false);
                    setActiveLine(null);
                    setSuggestionText('');
                    setSuggestionReason('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Help Text */}
      <Card className="p-4 bg-blue-500/5 border-blue-500/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-600 dark:text-blue-400 mb-1">
              Collaborative Editing
            </p>
            <p className="text-muted-foreground">
              Click any line to suggest an alternative. Your collaborators can accept or reject suggestions.
              Use the chat to discuss changes, or start a video session to co-write together in real-time.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

