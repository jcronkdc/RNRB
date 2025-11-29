'use client';

import {
  Mic,
  Speaker,
  Monitor,
  Lightbulb,
  Music,
  Download,
  Users,
  Clock,
  Coffee,
  Car,
  Bed,
  Utensils,
  Check,
  Plus,
  ZoomIn,
} from 'lucide-react';
import { useState } from 'react';

interface TechRiderSectionProps {
  content: {
    headline?: string;
    // Performance Info
    performanceLength?: string;
    setupTime?: string;
    soundcheckTime?: string;
    numberOfPerformers?: number;
    // Audio Requirements
    audioRequirements?: {
      channels?: number;
      monitors?: number;
      items?: Array<{ item: string; quantity: number; notes?: string }>;
    };
    // Backline
    backline?: Array<{ item: string; provided: boolean; notes?: string }>;
    // Lighting
    lightingRequirements?: string;
    lightingNotes?: string;
    // Stage Plot
    stagePlotImage?: string;
    stagePlotPdf?: string;
    stageWidth?: string;
    stageDepth?: string;
    // Input List
    inputList?: Array<{
      channel: number;
      instrument: string;
      mic?: string;
      stand?: string;
      notes?: string;
    }>;
    // Hospitality
    hospitality?: {
      dressing_room?: boolean;
      meals?: string;
      drinks?: string[];
      dietary?: string;
      parking?: string;
      accommodation?: string;
      other?: string[];
    };
    // Downloads
    techRiderPdf?: string;
    inputListPdf?: string;
    // Contact
    productionContact?: { name: string; phone?: string; email?: string };
  };
  theme?: Record<string, unknown>;
}

export function TechRiderSection({ content, theme }: TechRiderSectionProps) {
  const {
    headline = 'Technical Rider',
    performanceLength = '',
    setupTime = '',
    soundcheckTime = '',
    numberOfPerformers = 0,
    audioRequirements,
    backline = [],
    lightingRequirements = '',
    lightingNotes = '',
    stagePlotImage = '',
    stagePlotPdf = '',
    stageWidth = '',
    stageDepth = '',
    inputList = [],
    hospitality,
    techRiderPdf = '',
    inputListPdf = '',
    productionContact,
  } = content;

  const accentColor = (theme?.accent as string) || '#f97316';
  const [showFullStagePlot, setShowFullStagePlot] = useState(false);

  return (
    <section className="py-20" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold" style={{ color: 'var(--text)' }}>
            {headline}
          </h1>
          <p className="text-xl" style={{ color: 'var(--muted)' }}>
            Technical requirements and stage setup
          </p>

          {/* Download Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {techRiderPdf && (
              <a
                href={techRiderPdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all hover:scale-105"
                style={{ background: accentColor, color: '#fff' }}
              >
                <Download size={20} />
                Download Tech Rider PDF
              </a>
            )}
            {inputListPdf && (
              <a
                href={inputListPdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all hover:scale-105"
                style={{
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              >
                <Download size={20} />
                Download Input List
              </a>
            )}
          </div>
        </div>

        {/* Quick Info */}
        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {performanceLength && (
            <div className="rounded-xl p-6 text-center" style={{ background: 'var(--panel)' }}>
              <Clock size={32} className="mx-auto mb-3" style={{ color: accentColor }} />
              <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {performanceLength}
              </div>
              <div style={{ color: 'var(--muted)' }}>Set Length</div>
            </div>
          )}
          {setupTime && (
            <div className="rounded-xl p-6 text-center" style={{ background: 'var(--panel)' }}>
              <Clock size={32} className="mx-auto mb-3" style={{ color: accentColor }} />
              <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {setupTime}
              </div>
              <div style={{ color: 'var(--muted)' }}>Setup Time</div>
            </div>
          )}
          {soundcheckTime && (
            <div className="rounded-xl p-6 text-center" style={{ background: 'var(--panel)' }}>
              <Mic size={32} className="mx-auto mb-3" style={{ color: accentColor }} />
              <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {soundcheckTime}
              </div>
              <div style={{ color: 'var(--muted)' }}>Soundcheck</div>
            </div>
          )}
          {numberOfPerformers > 0 && (
            <div className="rounded-xl p-6 text-center" style={{ background: 'var(--panel)' }}>
              <Users size={32} className="mx-auto mb-3" style={{ color: accentColor }} />
              <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {numberOfPerformers}
              </div>
              <div style={{ color: 'var(--muted)' }}>Performers</div>
            </div>
          )}
        </div>

        {/* Stage Plot */}
        {stagePlotImage && (
          <div className="mb-12">
            <h2
              className="mb-6 flex items-center gap-2 text-2xl font-bold"
              style={{ color: 'var(--text)' }}
            >
              <Monitor size={24} style={{ color: accentColor }} />
              Stage Plot
            </h2>
            <div
              className="relative overflow-hidden rounded-xl"
              style={{ background: 'var(--panel)' }}
            >
              {(stageWidth || stageDepth) && (
                <div
                  className="absolute right-4 top-4 rounded-lg px-3 py-1 text-sm"
                  style={{ background: 'var(--bg)' }}
                >
                  {stageWidth && <span>Width: {stageWidth}</span>}
                  {stageWidth && stageDepth && <span> × </span>}
                  {stageDepth && <span>Depth: {stageDepth}</span>}
                </div>
              )}
              <button
                type="button"
                className="w-full"
                onClick={() => setShowFullStagePlot(!showFullStagePlot)}
              >
                <img
                  src={stagePlotImage}
                  alt="Stage Plot"
                  className={`w-full transition-transform ${showFullStagePlot ? 'scale-150' : ''}`}
                />
              </button>
              <button
                onClick={() => setShowFullStagePlot(!showFullStagePlot)}
                className="absolute bottom-4 right-4 flex items-center gap-1 rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--bg)', color: 'var(--text)' }}
              >
                <ZoomIn size={16} />
                {showFullStagePlot ? 'Zoom Out' : 'Zoom In'}
              </button>
            </div>
            {stagePlotPdf && (
              <a
                href={stagePlotPdf}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm hover:underline"
                style={{ color: accentColor }}
              >
                <Download size={16} />
                Download Stage Plot PDF
              </a>
            )}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Audio Requirements */}
          {audioRequirements && (
            <div className="rounded-xl p-6" style={{ background: 'var(--panel)' }}>
              <h2
                className="mb-6 flex items-center gap-2 text-xl font-bold"
                style={{ color: 'var(--text)' }}
              >
                <Speaker size={20} style={{ color: accentColor }} />
                Audio Requirements
              </h2>

              <div className="mb-6 grid grid-cols-2 gap-4">
                {audioRequirements.channels && (
                  <div className="rounded-lg p-4" style={{ background: 'var(--bg)' }}>
                    <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                      {audioRequirements.channels}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--muted)' }}>
                      Channels Required
                    </div>
                  </div>
                )}
                {audioRequirements.monitors && (
                  <div className="rounded-lg p-4" style={{ background: 'var(--bg)' }}>
                    <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                      {audioRequirements.monitors}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--muted)' }}>
                      Monitor Mixes
                    </div>
                  </div>
                )}
              </div>

              {audioRequirements.items && audioRequirements.items.length > 0 && (
                <div className="space-y-2">
                  {audioRequirements.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg p-3"
                      style={{ background: 'var(--bg)' }}
                    >
                      <span style={{ color: 'var(--text)' }}>{item.item}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-mono" style={{ color: 'var(--muted)' }}>
                          ×{item.quantity}
                        </span>
                        {item.notes && (
                          <span className="text-sm" style={{ color: 'var(--muted)' }}>
                            ({item.notes})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Backline */}
          {backline.length > 0 && (
            <div className="rounded-xl p-6" style={{ background: 'var(--panel)' }}>
              <h2
                className="mb-6 flex items-center gap-2 text-xl font-bold"
                style={{ color: 'var(--text)' }}
              >
                <Music size={20} style={{ color: accentColor }} />
                Backline
              </h2>
              <div className="space-y-2">
                {backline.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg p-3"
                    style={{ background: 'var(--bg)' }}
                  >
                    <span style={{ color: 'var(--text)' }}>{item.item}</span>
                    <div className="flex items-center gap-2">
                      {item.provided ? (
                        <span className="flex items-center gap-1 rounded bg-green-500/20 px-2 py-1 text-xs text-green-400">
                          <Check size={12} />
                          Provided
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded bg-orange-500/20 px-2 py-1 text-xs text-orange-400">
                          <Plus size={12} />
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lighting */}
          {(lightingRequirements || lightingNotes) && (
            <div className="rounded-xl p-6" style={{ background: 'var(--panel)' }}>
              <h2
                className="mb-6 flex items-center gap-2 text-xl font-bold"
                style={{ color: 'var(--text)' }}
              >
                <Lightbulb size={20} style={{ color: accentColor }} />
                Lighting
              </h2>
              {lightingRequirements && (
                <p className="mb-4" style={{ color: 'var(--text)' }}>
                  {lightingRequirements}
                </p>
              )}
              {lightingNotes && (
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {lightingNotes}
                </p>
              )}
            </div>
          )}

          {/* Hospitality */}
          {hospitality && (
            <div className="rounded-xl p-6" style={{ background: 'var(--panel)' }}>
              <h2
                className="mb-6 flex items-center gap-2 text-xl font-bold"
                style={{ color: 'var(--text)' }}
              >
                <Coffee size={20} style={{ color: accentColor }} />
                Hospitality
              </h2>
              <div className="space-y-4">
                {hospitality.dressing_room && (
                  <div className="flex items-center gap-2" style={{ color: 'var(--text)' }}>
                    <Check size={16} className="text-green-500" />
                    Private dressing room required
                  </div>
                )}
                {hospitality.meals && (
                  <div className="flex items-start gap-2">
                    <Utensils size={16} className="mt-1" style={{ color: accentColor }} />
                    <div>
                      <span className="font-medium" style={{ color: 'var(--text)' }}>
                        Meals:{' '}
                      </span>
                      <span style={{ color: 'var(--muted)' }}>{hospitality.meals}</span>
                    </div>
                  </div>
                )}
                {hospitality.drinks && hospitality.drinks.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Coffee size={16} className="mt-1" style={{ color: accentColor }} />
                    <div>
                      <span className="font-medium" style={{ color: 'var(--text)' }}>
                        Beverages:{' '}
                      </span>
                      <span style={{ color: 'var(--muted)' }}>{hospitality.drinks.join(', ')}</span>
                    </div>
                  </div>
                )}
                {hospitality.dietary && (
                  <div className="flex items-start gap-2">
                    <Utensils size={16} className="mt-1" style={{ color: accentColor }} />
                    <div>
                      <span className="font-medium" style={{ color: 'var(--text)' }}>
                        Dietary:{' '}
                      </span>
                      <span style={{ color: 'var(--muted)' }}>{hospitality.dietary}</span>
                    </div>
                  </div>
                )}
                {hospitality.parking && (
                  <div className="flex items-start gap-2">
                    <Car size={16} className="mt-1" style={{ color: accentColor }} />
                    <div>
                      <span className="font-medium" style={{ color: 'var(--text)' }}>
                        Parking:{' '}
                      </span>
                      <span style={{ color: 'var(--muted)' }}>{hospitality.parking}</span>
                    </div>
                  </div>
                )}
                {hospitality.accommodation && (
                  <div className="flex items-start gap-2">
                    <Bed size={16} className="mt-1" style={{ color: accentColor }} />
                    <div>
                      <span className="font-medium" style={{ color: 'var(--text)' }}>
                        Accommodation:{' '}
                      </span>
                      <span style={{ color: 'var(--muted)' }}>{hospitality.accommodation}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input List */}
        {inputList.length > 0 && (
          <div className="mt-12">
            <h2
              className="mb-6 flex items-center gap-2 text-2xl font-bold"
              style={{ color: 'var(--text)' }}
            >
              <Mic size={24} style={{ color: accentColor }} />
              Input List
            </h2>
            <div className="overflow-x-auto rounded-xl" style={{ background: 'var(--panel)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold"
                      style={{ color: 'var(--muted)' }}
                    >
                      CH
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold"
                      style={{ color: 'var(--muted)' }}
                    >
                      Instrument
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold"
                      style={{ color: 'var(--muted)' }}
                    >
                      Mic
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold"
                      style={{ color: 'var(--muted)' }}
                    >
                      Stand
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold"
                      style={{ color: 'var(--muted)' }}
                    >
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inputList.map((input, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-3 font-mono" style={{ color: accentColor }}>
                        {input.channel}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text)' }}>
                        {input.instrument}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>
                        {input.mic || '-'}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>
                        {input.stand || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>
                        {input.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Production Contact */}
        {productionContact && (
          <div className="mt-12 rounded-xl p-6" style={{ background: 'var(--panel)' }}>
            <h2 className="mb-4 text-xl font-bold" style={{ color: 'var(--text)' }}>
              Production Contact
            </h2>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Name
                </p>
                <p className="font-semibold" style={{ color: 'var(--text)' }}>
                  {productionContact.name}
                </p>
              </div>
              {productionContact.phone && (
                <div>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    Phone
                  </p>
                  <a href={`tel:${productionContact.phone}`} style={{ color: accentColor }}>
                    {productionContact.phone}
                  </a>
                </div>
              )}
              {productionContact.email && (
                <div>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    Email
                  </p>
                  <a href={`mailto:${productionContact.email}`} style={{ color: accentColor }}>
                    {productionContact.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
