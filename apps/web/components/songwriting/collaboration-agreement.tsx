'use client';

import { Card, Button } from '@cronkwaters/ui';
import { FileCheck, Download, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import type { CopyrightInfo } from './copyright-manager';

type AgreementType = 'joint' | 'work-for-hire' | 'custom';

type CollaborationAgreement = {
  songTitle: string;
  agreementType: AgreementType;
  contributors: Array<{
    name: string;
    email: string;
    percentage: number;
    role: string;
  }>;
  terms: {
    syncRights: boolean;
    mechanicalRights: boolean;
    performanceRights: boolean;
    masterRights: boolean;
  };
  customTerms?: string;
  agreementDate: string;
};

type CollaborationAgreementGeneratorProps = {
  songTitle: string;
  copyrightInfo: CopyrightInfo;
};

const AGREEMENT_TEMPLATES = {
  joint: {
    name: 'Joint Ownership',
    description: 'All contributors share ownership equally based on agreed percentages',
    icon: Users,
  },
  'work-for-hire': {
    name: 'Work for Hire',
    description: 'One party retains all rights, others are compensated for work',
    icon: FileCheck,
  },
  custom: {
    name: 'Custom Agreement',
    description: 'Define your own terms and conditions',
    icon: FileCheck,
  },
};

export function CollaborationAgreementGenerator({
  songTitle,
  copyrightInfo,
}: CollaborationAgreementGeneratorProps) {
  const [agreementType, setAgreementType] = useState<AgreementType>('joint');
  const [terms, setTerms] = useState({
    syncRights: true,
    mechanicalRights: true,
    performanceRights: true,
    masterRights: false,
  });
  const [customTerms, setCustomTerms] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAgreementText = (): string => {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let agreement = `
COLLABORATION AGREEMENT

This Collaboration Agreement ("Agreement") is entered into on ${date}, by and between the following parties (collectively, the "Parties"):

${copyrightInfo.splits.map((split, idx) => `
${idx + 1}. ${split.contributorName} (${split.percentage}% ownership)
   Role: ${split.role.charAt(0).toUpperCase() + split.role.slice(1)}
   ${split.email ? `Email: ${split.email}` : ''}
   ${split.proAffiliation ? `PRO: ${split.proAffiliation}` : ''}
`).join('')}

REGARDING THE MUSICAL WORK:

Title: "${songTitle}"
${copyrightInfo.iswc ? `ISWC: ${copyrightInfo.iswc}` : ''}
${copyrightInfo.isrc ? `ISRC: ${copyrightInfo.isrc}` : ''}
Copyright Year: ${copyrightInfo.copyrightYear || new Date().getFullYear()}
${copyrightInfo.copyrightHolder ? `Copyright Holder: ${copyrightInfo.copyrightHolder}` : ''}

---

1. OWNERSHIP & SPLITS

The Parties agree that ownership of the musical work "${songTitle}" shall be divided as follows:

${copyrightInfo.splits.map(split => `   • ${split.contributorName}: ${split.percentage}%`).join('\n')}

Each Party's share represents their ownership interest in all rights to the musical work, including but not limited to copyright, publishing rights, and all derivative works.

2. GRANT OF RIGHTS

${agreementType === 'joint' ? `
This is a JOINT OWNERSHIP agreement. All Parties retain co-ownership rights and agree that:
   • No Party may exploit the work without consent of all Parties
   • All income shall be distributed according to the ownership percentages above
   • Each Party grants the others the right to administer their share
` : agreementType === 'work-for-hire' ? `
This is a WORK FOR HIRE agreement where:
   • The hiring party retains 100% ownership of all rights
   • Contributors are compensated as agreed separately
   • Contributors waive all future claims to ownership
` : ''}

The Parties agree that the following rights are ${terms.syncRights ? 'INCLUDED' : 'EXCLUDED'}:
   • Synchronization Rights (use in TV, film, advertising)

The Parties agree that the following rights are ${terms.mechanicalRights ? 'INCLUDED' : 'EXCLUDED'}:
   • Mechanical Rights (reproduction and distribution)

The Parties agree that the following rights are ${terms.performanceRights ? 'INCLUDED' : 'EXCLUDED'}:
   • Performance Rights (public performance and broadcast)

The Parties agree that the following rights are ${terms.masterRights ? 'INCLUDED' : 'EXCLUDED'}:
   • Master Recording Rights (if applicable)

${customTerms ? `\n3. CUSTOM TERMS\n\n${customTerms}\n` : ''}

4. REPRESENTATION AND WARRANTIES

Each Party represents and warrants that:
   • They have the right to enter into this Agreement
   • Their contribution is original and does not infringe on third-party rights
   • They will not grant any rights that conflict with this Agreement

5. DISPUTE RESOLUTION

Any disputes arising from this Agreement shall be resolved through:
   • Good faith negotiation between Parties
   • Mediation if negotiation fails
   • Arbitration in accordance with applicable law

6. GOVERNING LAW

This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction where the work was created.

---

SIGNATURES

By signing below, each Party acknowledges that they have read, understood, and agree to be bound by the terms of this Agreement.

${copyrightInfo.splits.map(split => `
${split.contributorName}

Signature: _________________________ Date: _____________

Print Name: ${split.contributorName}
`).join('\n')}

---

Generated by CronkWaters Professional Songwriting Platform
${new Date().toLocaleDateString()}

DISCLAIMER: This agreement is a template and should be reviewed by a qualified music attorney before signing. It does not constitute legal advice.
`;

    return agreement;
  };

  const downloadAgreement = () => {
    setIsGenerating(true);
    try {
      const agreementText = generateAgreementText();
      const blob = new Blob([agreementText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${songTitle.replace(/[^a-z0-9]/gi, '_')}_Collaboration_Agreement.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating agreement:', error);
      alert('Failed to generate agreement. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const hasContributors = copyrightInfo.splits.length > 0;
  const hasSplitsAt100 = copyrightInfo.splits.reduce((sum, split) => sum + split.percentage, 0) === 100;

  return (
    <Card className="border-gray-800 bg-gradient-to-b from-gray-900 to-black p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
          <FileCheck className="h-6 w-6 text-green-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Collaboration Agreement</h3>
          <p className="text-sm text-gray-400">Generate legal agreement for all contributors</p>
        </div>
      </div>

      {/* Agreement Type Selection */}
      <div className="mb-6 space-y-3">
        <label className="text-sm font-medium text-gray-300">Agreement Type</label>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(AGREEMENT_TEMPLATES).map(([type, template]) => {
            const Icon = template.icon;
            return (
              <button
                key={type}
                onClick={() => setAgreementType(type as AgreementType)}
                className={`flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition ${
                  agreementType === type
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${agreementType === type ? 'text-green-400' : 'text-gray-400'}`} />
                  {agreementType === type && <CheckCircle className="h-4 w-4 text-green-400" />}
                </div>
                <div>
                  <p className={`font-semibold ${agreementType === type ? 'text-white' : 'text-gray-300'}`}>
                    {template.name}
                  </p>
                  <p className="text-xs text-gray-500">{template.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rights Checkboxes */}
      <div className="mb-6 space-y-3">
        <label className="text-sm font-medium text-gray-300">Rights Included</label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800/50 p-3">
            <input
              type="checkbox"
              checked={terms.syncRights}
              onChange={(e) => setTerms({ ...terms, syncRights: e.target.checked })}
              className="h-5 w-5"
            />
            <div>
              <p className="font-medium text-white">Synchronization</p>
              <p className="text-xs text-gray-500">TV, film, advertising</p>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800/50 p-3">
            <input
              type="checkbox"
              checked={terms.mechanicalRights}
              onChange={(e) => setTerms({ ...terms, mechanicalRights: e.target.checked })}
              className="h-5 w-5"
            />
            <div>
              <p className="font-medium text-white">Mechanical</p>
              <p className="text-xs text-gray-500">Reproduction & distribution</p>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800/50 p-3">
            <input
              type="checkbox"
              checked={terms.performanceRights}
              onChange={(e) => setTerms({ ...terms, performanceRights: e.target.checked })}
              className="h-5 w-5"
            />
            <div>
              <p className="font-medium text-white">Performance</p>
              <p className="text-xs text-gray-500">Public performance & broadcast</p>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800/50 p-3">
            <input
              type="checkbox"
              checked={terms.masterRights}
              onChange={(e) => setTerms({ ...terms, masterRights: e.target.checked })}
              className="h-5 w-5"
            />
            <div>
              <p className="font-medium text-white">Master Recording</p>
              <p className="text-xs text-gray-500">Sound recording rights</p>
            </div>
          </label>
        </div>
      </div>

      {/* Custom Terms */}
      {agreementType === 'custom' && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Custom Terms (Optional)
          </label>
          <textarea
            value={customTerms}
            onChange={(e) => setCustomTerms(e.target.value)}
            placeholder="Enter any additional terms or conditions..."
            rows={4}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white"
          />
        </div>
      )}

      {/* Validation */}
      {!hasContributors && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border-2 border-yellow-500/30 bg-yellow-500/10 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-yellow-400" />
          <div>
            <p className="font-medium text-yellow-400">Contributors Required</p>
            <p className="text-sm text-yellow-300">Add contributors to the Ownership Splits section first</p>
          </div>
        </div>
      )}

      {!hasSplitsAt100 && hasContributors && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border-2 border-yellow-500/30 bg-yellow-500/10 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-yellow-400" />
          <div>
            <p className="font-medium text-yellow-400">Splits Must Total 100%</p>
            <p className="text-sm text-yellow-300">Adjust ownership percentages to equal 100%</p>
          </div>
        </div>
      )}

      {/* Download Button */}
      <Button
        onClick={downloadAgreement}
        disabled={!hasContributors || !hasSplitsAt100 || isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Clock className="mr-2 h-5 w-5 animate-spin" />
            Generating Agreement...
          </>
        ) : (
          <>
            <Download className="mr-2 h-5 w-5" />
            Download Agreement
          </>
        )}
      </Button>

      {/* Legal Notice */}
      <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
        <p className="mb-2 text-xs font-semibold uppercase text-yellow-400">Legal Notice</p>
        <p className="text-xs text-gray-400">
          This agreement is a template and should be reviewed by a qualified music attorney before signing. 
          It does not constitute legal advice. CronkWaters is not responsible for the legal validity of this document.
        </p>
      </div>
    </Card>
  );
}




