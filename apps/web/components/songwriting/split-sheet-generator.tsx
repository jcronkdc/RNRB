'use client';

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { Download, FileText, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { CopyrightInfo, SongSplit } from './copyright-manager';

type SplitSheetGeneratorProps = {
  songTitle: string;
  songId?: string;
  copyrightInfo: CopyrightInfo;
  onEmailAll?: () => void;
};

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #000',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
    borderBottom: '1 solid #ccc',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottom: '1 solid #eee',
    paddingBottom: 5,
  },
  label: {
    width: '30%',
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    width: '70%',
    color: '#000',
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 8,
    fontWeight: 'bold',
    borderBottom: '2 solid #000',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #ddd',
  },
  tableCell: {
    flex: 1,
  },
  tableCellName: {
    flex: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: '1 solid #ccc',
    paddingTop: 10,
    fontSize: 9,
    color: '#666',
  },
  signatureSection: {
    marginTop: 40,
    padding: 20,
    border: '1 solid #ccc',
    backgroundColor: '#fafafa',
  },
  signatureLine: {
    marginTop: 30,
    marginBottom: 5,
    borderTop: '1 solid #000',
    paddingTop: 5,
  },
  disclaimer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fffbea',
    border: '1 solid #f59e0b',
    fontSize: 9,
    color: '#333',
  },
  percentage: {
    fontWeight: 'bold',
    color: '#000',
  },
});

// PDF Document Component
const SplitSheetDocument = ({ songTitle, copyrightInfo }: { songTitle: string; copyrightInfo: CopyrightInfo }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>OWNERSHIP SPLIT SHEET</Text>
        <Text style={styles.subtitle}>Musical Work Registration Document</Text>
        <Text style={styles.songTitle}>"{songTitle}"</Text>
      </View>

      {/* Copyright Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Copyright Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Copyright Year:</Text>
          <Text style={styles.value}>{copyrightInfo.copyrightYear || 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Copyright Holder:</Text>
          <Text style={styles.value}>{copyrightInfo.copyrightHolder || 'Not specified'}</Text>
        </View>
        {copyrightInfo.iswc && (
          <View style={styles.row}>
            <Text style={styles.label}>ISWC:</Text>
            <Text style={styles.value}>{copyrightInfo.iswc}</Text>
          </View>
        )}
        {copyrightInfo.isrc && (
          <View style={styles.row}>
            <Text style={styles.label}>ISRC:</Text>
            <Text style={styles.value}>{copyrightInfo.isrc}</Text>
          </View>
        )}
      </View>

      {/* PRO Information */}
      {copyrightInfo.performingRightsOrg && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Rights Organization</Text>
          <View style={styles.row}>
            <Text style={styles.label}>PRO:</Text>
            <Text style={styles.value}>{copyrightInfo.performingRightsOrg}</Text>
          </View>
          {copyrightInfo.proWriterNumber && (
            <View style={styles.row}>
              <Text style={styles.label}>Writer IPI:</Text>
              <Text style={styles.value}>{copyrightInfo.proWriterNumber}</Text>
            </View>
          )}
          {copyrightInfo.proPublisherNumber && (
            <View style={styles.row}>
              <Text style={styles.label}>Publisher IPI:</Text>
              <Text style={styles.value}>{copyrightInfo.proPublisherNumber}</Text>
            </View>
          )}
        </View>
      )}

      {/* Ownership Splits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ownership Splits</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellName}>Contributor Name</Text>
            <Text style={styles.tableCell}>Role</Text>
            <Text style={styles.tableCell}>Share %</Text>
            <Text style={styles.tableCellName}>Email</Text>
          </View>
          {/* Table Rows */}
          {copyrightInfo.splits.map((split, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCellName}>{split.contributorName}</Text>
              <Text style={styles.tableCell}>{split.role}</Text>
              <Text style={[styles.tableCell, styles.percentage]}>{split.percentage}%</Text>
              <Text style={styles.tableCellName}>{split.email || 'Not provided'}</Text>
            </View>
          ))}
          {/* Total */}
          <View style={[styles.tableRow, { backgroundColor: '#f0f0f0', fontWeight: 'bold' }]}>
            <Text style={styles.tableCellName}>TOTAL</Text>
            <Text style={styles.tableCell}></Text>
            <Text style={[styles.tableCell, styles.percentage]}>
              {copyrightInfo.splits.reduce((sum, split) => sum + split.percentage, 0)}%
            </Text>
            <Text style={styles.tableCellName}></Text>
          </View>
        </View>
      </View>

      {/* Publishing Information */}
      {copyrightInfo.publisherName && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Publishing Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Publisher:</Text>
            <Text style={styles.value}>{copyrightInfo.publisherName}</Text>
          </View>
          {copyrightInfo.publisherShare !== undefined && (
            <View style={styles.row}>
              <Text style={styles.label}>Publisher Share:</Text>
              <Text style={styles.value}>{copyrightInfo.publisherShare}%</Text>
            </View>
          )}
        </View>
      )}

      {/* Signature Section */}
      <View style={styles.signatureSection}>
        <Text style={[styles.sectionTitle, { borderBottom: 'none' }]}>Signatures</Text>
        <Text style={{ fontSize: 9, marginBottom: 15, color: '#666' }}>
          By signing below, all parties acknowledge and agree to the ownership percentages stated above.
        </Text>
        {copyrightInfo.splits.map((split, index) => (
          <View key={index} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 10, marginBottom: 5 }}>
              {split.contributorName} ({split.percentage}%)
            </Text>
            <View style={styles.signatureLine}>
              <Text style={{ fontSize: 9, color: '#666' }}>Signature</Text>
            </View>
            <Text style={{ fontSize: 9, color: '#666', marginTop: 5 }}>
              Date: _______________
            </Text>
          </View>
        ))}
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>IMPORTANT LEGAL NOTICE:</Text>
        <Text>
          This split sheet is a preliminary agreement between contributors. It is recommended to have this document
          reviewed by a music attorney and registered with your Performance Rights Organization (PRO). This document
          does not constitute a complete publishing agreement and should be supplemented with proper legal contracts.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleDateString()}</Text>
        <Text>CronkWaters - Professional Songwriting Platform</Text>
      </View>
    </Page>
  </Document>
);

export function SplitSheetGenerator({ songTitle, songId, copyrightInfo, onEmailAll }: SplitSheetGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  const totalPercentage = copyrightInfo.splits.reduce((sum, split) => sum + split.percentage, 0);
  const isValid = totalPercentage === 100 && copyrightInfo.splits.length > 0;

  const generatePDF = async () => {
    if (!isValid) {
      alert('Cannot generate split sheet. Splits must total 100% and have at least one contributor.');
      return;
    }

    setIsGenerating(true);
    try {
      const doc = <SplitSheetDocument songTitle={songTitle} copyrightInfo={copyrightInfo} />;
      const blob = await pdf(doc).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${songTitle.replace(/[^a-z0-9]/gi, '_')}_Split_Sheet.pdf`;
      link.click();
      
      // Cleanup
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailAll = async () => {
    if (!isValid) {
      alert('Cannot email split sheet. Splits must total 100% and have at least one contributor.');
      return;
    }

    const emailAddresses = copyrightInfo.splits.filter(s => s.email).map(s => s.email);
    if (emailAddresses.length === 0) {
      alert('No email addresses found. Please add email addresses for contributors.');
      return;
    }

    setIsEmailing(true);
    try {
      // Generate PDF blob
      const doc = <SplitSheetDocument songTitle={songTitle} copyrightInfo={copyrightInfo} />;
      const blob = await pdf(doc).toBlob();
      
      // Convert to base64 for API
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result;
        
        // Call API to send emails
        const response = await fetch('/api/split-sheet/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            songTitle,
            songId,
            recipients: copyrightInfo.splits.filter(s => s.email),
            pdfData: base64data,
          }),
        });

        if (response.ok) {
          alert(`Split sheet sent to ${emailAddresses.length} contributor(s)!`);
          if (onEmailAll) onEmailAll();
        } else {
          throw new Error('Failed to send emails');
        }
      };
    } catch (error) {
      console.error('Error emailing split sheet:', error);
      alert('Failed to send emails. Please try again.');
    } finally {
      setIsEmailing(false);
    }
  };

  if (copyrightInfo.splits.length === 0) {
    return (
      <div className="rounded-lg border-2 border-gray-700 bg-gray-800/50 p-6 text-center">
        <FileText className="mx-auto mb-3 h-12 w-12 text-gray-500" />
        <p className="text-gray-400">
          Add contributors to the Ownership Splits section above to generate a split sheet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Validation Status */}
      {!isValid && (
        <div className="rounded-lg border-2 border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="text-sm font-medium text-yellow-400">
            ⚠️ Split sheet cannot be generated until splits total exactly 100%
            {totalPercentage !== 100 && ` (currently ${totalPercentage}%)`}
          </p>
        </div>
      )}

      {/* Preview Info */}
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
        <h4 className="mb-3 font-semibold text-white">Split Sheet Preview</h4>
        <div className="space-y-2 text-sm text-gray-300">
          <p><span className="text-gray-500">Song:</span> {songTitle}</p>
          <p><span className="text-gray-500">Contributors:</span> {copyrightInfo.splits.length}</p>
          <p><span className="text-gray-500">Total:</span> {totalPercentage}%</p>
          <p><span className="text-gray-500">With Emails:</span> {copyrightInfo.splits.filter(s => s.email).length}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={generatePDF}
          disabled={!isValid || isGenerating}
          className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-semibold transition ${
            isValid && !isGenerating
              ? 'border-blue-500/50 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
              : 'cursor-not-allowed border-gray-700 bg-gray-800/50 text-gray-500'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Download PDF
            </>
          )}
        </button>

        <button
          onClick={handleEmailAll}
          disabled={!isValid || isEmailing || copyrightInfo.splits.filter(s => s.email).length === 0}
          className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-semibold transition ${
            isValid && !isEmailing && copyrightInfo.splits.filter(s => s.email).length > 0
              ? 'border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20'
              : 'cursor-not-allowed border-gray-700 bg-gray-800/50 text-gray-500'
          }`}
        >
          {isEmailing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Sending Emails...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Email to All
            </>
          )}
        </button>
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        💡 Tip: Add email addresses to contributors to enable the "Email to All" feature.
        The PDF includes signature lines for all contributors.
      </p>
    </div>
  );
}

