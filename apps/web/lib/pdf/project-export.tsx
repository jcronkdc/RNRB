import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts if needed
// Font.register({ family: 'Roboto', src: source });

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 120,
    fontWeight: 'bold',
    color: '#666',
  },
  value: {
    flex: 1,
    color: '#333',
  },
  listItem: {
    marginBottom: 8,
    paddingLeft: 15,
  },
  listHeader: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#999',
    fontSize: 10,
  },
  timestamp: {
    marginTop: 5,
  }
});

interface ProjectExportData {
  project: {
    name: string;
    orgName: string;
    description?: string;
    status: string;
    visibility: string;
    createdAt: Date;
  };
  songs: Array<{
    title: string;
    key?: string;
    tempo?: number;
  }>;
  assets: Array<{
    name: string;
    type: string;
    size: number;
  }>;
  splits: Array<{
    title: string;
    contributors: Array<{
      name: string;
      percentage: number;
      role?: string;
    }>;
  }>;
}

export function ProjectExportPDF({ data }: { data: ProjectExportData }) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{data.project.name}</Text>
          <Text style={styles.subtitle}>Organization: {data.project.orgName}</Text>
          <Text style={styles.subtitle}>Project Export</Text>
        </View>

        {/* Project Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{data.project.status}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Visibility:</Text>
            <Text style={styles.value}>{data.project.visibility}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Created:</Text>
            <Text style={styles.value}>{formatDate(data.project.createdAt)}</Text>
          </View>
          {data.project.description && (
            <View style={styles.row}>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.value}>{data.project.description}</Text>
            </View>
          )}
        </View>

        {/* Songs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Songs ({data.songs.length})</Text>
          {data.songs.length > 0 ? (
            data.songs.map((song, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listHeader}>{song.title}</Text>
                {(song.key || song.tempo) && (
                  <Text>
                    {song.key && `Key: ${song.key}`}
                    {song.key && song.tempo && ' • '}
                    {song.tempo && `Tempo: ${song.tempo} BPM`}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text>No songs in this project yet.</Text>
          )}
        </View>

        {/* Assets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assets ({data.assets.length})</Text>
          {data.assets.length > 0 ? (
            data.assets.map((asset, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listHeader}>{asset.name}</Text>
                <Text>Type: {asset.type} • Size: {formatFileSize(asset.size)}</Text>
              </View>
            ))
          ) : (
            <Text>No assets in this project yet.</Text>
          )}
        </View>

        {/* Splits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Splits ({data.splits.length})</Text>
          {data.splits.length > 0 ? (
            data.splits.map((split, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listHeader}>{split.title}</Text>
                {split.contributors.map((contrib, cIndex) => (
                  <Text key={cIndex}>
                    • {contrib.name}: {contrib.percentage}%
                    {contrib.role && ` (${contrib.role})`}
                  </Text>
                ))}
              </View>
            ))
          ) : (
            <Text>No splits configured yet.</Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>© {new Date().getFullYear()} CronkWaters</Text>
          <Text style={styles.timestamp}>
            Generated on {new Date().toLocaleString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
