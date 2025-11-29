/**
 * Validation Schema Tests
 *
 * Integration tests for validations.ts Zod schemas.
 * These tests import the actual code modules to verify functionality
 * and contribute to coverage metrics.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

import {
  cuidSchema,
  uuidSchema,
  safeString,
  emailSchema,
  slugSchema,
  createProjectSchema,
  updateProjectSchema,
  energyProfileSchema,
  generateSetlistSchema,
  libraryFileTypeSchema,
  uploadLibraryFileSchema,
  createSongSchema,
  updateSongSchema,
  assistantChatSchema,
  createTourSchema,
  updateTourSchema,
  createShowSchema,
  updateShowSchema,
  createVenueSchema,
  updateVenueSchema,
  parseSearchParams,
} from '../validations';

describe('Validation Schemas', () => {
  describe('cuidSchema', () => {
    it('should accept valid CUID format', () => {
      // CUID: c + 24 lowercase alphanumeric chars = 25 total
      const validCuid = 'cm4a0b1c2d3e4f5g6h7i8j9kl';
      expect(() => cuidSchema.parse(validCuid)).not.toThrow();
    });

    it('should reject invalid CUID format', () => {
      expect(() => cuidSchema.parse('invalid')).toThrow();
      expect(() => cuidSchema.parse('12345')).toThrow();
      expect(() => cuidSchema.parse('')).toThrow();
    });

    it('should reject wrong prefix', () => {
      expect(() => cuidSchema.parse('am4a0b1c2d3e4f5g6h7i8j9kl')).toThrow();
    });

    it('should reject wrong length', () => {
      expect(() => cuidSchema.parse('cm4a0')).toThrow();
      expect(() => cuidSchema.parse('cm4a0b1c2d3e4f5g6h7i8j9klm')).toThrow(); // 27 chars
    });
  });

  describe('uuidSchema', () => {
    it('should accept valid UUID format', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(() => uuidSchema.parse(validUuid)).not.toThrow();
    });

    it('should reject invalid UUID format', () => {
      expect(() => uuidSchema.parse('invalid')).toThrow();
      expect(() => uuidSchema.parse('550e8400-e29b-41d4')).toThrow();
    });
  });

  describe('safeString', () => {
    it('should accept valid strings within length limit', () => {
      const schema = safeString(100);
      expect(schema.parse('Hello World')).toBe('Hello World');
    });

    it('should strip HTML tags', () => {
      const schema = safeString(100);
      expect(schema.parse('<script>alert(1)</script>')).toBe('alert(1)');
      expect(schema.parse('<b>bold</b>')).toBe('bold');
    });

    it('should trim whitespace', () => {
      const schema = safeString(100);
      expect(schema.parse('  hello world  ')).toBe('hello world');
    });

    it('should reject strings exceeding max length', () => {
      const schema = safeString(10);
      expect(() => schema.parse('this is a very long string')).toThrow();
    });
  });

  describe('emailSchema', () => {
    it('should accept valid emails and lowercase them', () => {
      expect(emailSchema.parse('User@Example.Com')).toBe('user@example.com');
      expect(emailSchema.parse('test@test.org')).toBe('test@test.org');
    });

    it('should reject invalid emails', () => {
      expect(() => emailSchema.parse('invalid')).toThrow();
      expect(() => emailSchema.parse('user@')).toThrow();
    });
  });

  describe('slugSchema', () => {
    it('should accept valid slug format', () => {
      expect(() => slugSchema.parse('my-project')).not.toThrow();
      expect(() => slugSchema.parse('project-123')).not.toThrow();
      expect(() => slugSchema.parse('a')).not.toThrow();
    });

    it('should reject invalid slug format', () => {
      expect(() => slugSchema.parse('My Project')).toThrow(); // spaces
      expect(() => slugSchema.parse('MY-PROJECT')).toThrow(); // uppercase
      expect(() => slugSchema.parse('-invalid')).toThrow(); // starts with hyphen
      expect(() => slugSchema.parse('invalid-')).toThrow(); // ends with hyphen
      expect(() => slugSchema.parse('')).toThrow(); // empty
    });
  });

  describe('createProjectSchema', () => {
    it('should validate valid project data', () => {
      const valid = {
        name: 'My Project',
        description: 'A test project',
        visibility: 'private' as const,
      };

      const result = createProjectSchema.parse(valid);
      expect(result.name).toBe('My Project');
      expect(result.visibility).toBe('private');
    });

    it('should require project name', () => {
      expect(() => createProjectSchema.parse({})).toThrow();
      expect(() => createProjectSchema.parse({ name: '' })).toThrow();
    });

    it('should default visibility to private', () => {
      const result = createProjectSchema.parse({ name: 'Test' });
      expect(result.visibility).toBe('private');
    });

    it('should strip HTML from name and description', () => {
      const result = createProjectSchema.parse({
        name: '<b>Project</b>',
        description: '<script>evil</script>',
      });
      expect(result.name).toBe('Project');
      expect(result.description).toBe('evil');
    });

    it('should accept optional fields', () => {
      const valid = {
        name: 'Project',
        orgId: 'cm4a0b1c2d3e4f5g6h7i8j9kl',
        tagline: 'My tagline',
        genre: 'Rock',
      };

      const result = createProjectSchema.parse(valid);
      expect(result.orgId).toBe(valid.orgId);
      expect(result.tagline).toBe('My tagline');
    });
  });

  describe('updateProjectSchema', () => {
    it('should make all fields optional', () => {
      const result = updateProjectSchema.parse({});
      expect(result).toEqual({});
    });

    it('should validate fields when provided', () => {
      const result = updateProjectSchema.parse({ name: 'Updated Name' });
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('energyProfileSchema', () => {
    it('should accept valid energy profiles', () => {
      expect(energyProfileSchema.parse('high')).toBe('high');
      expect(energyProfileSchema.parse('balanced')).toBe('balanced');
      expect(energyProfileSchema.parse('mellow')).toBe('mellow');
    });

    it('should reject invalid profiles', () => {
      expect(() => energyProfileSchema.parse('extreme')).toThrow();
    });
  });

  describe('generateSetlistSchema', () => {
    it('should validate valid setlist request', () => {
      const valid = {
        projectId: 'cm4a0b1c2d3e4f5g6h7i8j9kl',
        targetDuration: 60,
        energyProfile: 'balanced' as const,
      };

      const result = generateSetlistSchema.parse(valid);
      expect(result.projectId).toBe(valid.projectId);
      expect(result.targetDuration).toBe(60);
    });

    it('should apply defaults', () => {
      const result = generateSetlistSchema.parse({
        projectId: 'cm4a0b1c2d3e4f5g6h7i8j9kl',
      });

      expect(result.targetDuration).toBe(90);
      expect(result.energyProfile).toBe('balanced');
      expect(result.requiredSongs).toEqual([]);
      expect(result.excludedSongs).toEqual([]);
      expect(result.avoidKeyJumps).toBe(true);
      expect(result.genreBalance).toBe('mixed');
    });

    it('should validate duration constraints', () => {
      expect(() =>
        generateSetlistSchema.parse({
          projectId: 'cm4a0b1c2d3e4f5g6h7i8j9kl',
          targetDuration: 2, // too short
        })
      ).toThrow();

      expect(() =>
        generateSetlistSchema.parse({
          projectId: 'cm4a0b1c2d3e4f5g6h7i8j9kl',
          targetDuration: 500, // too long
        })
      ).toThrow();
    });
  });

  describe('libraryFileTypeSchema', () => {
    it('should accept valid file types', () => {
      expect(libraryFileTypeSchema.parse('stem')).toBe('stem');
      expect(libraryFileTypeSchema.parse('demo')).toBe('demo');
      expect(libraryFileTypeSchema.parse('sample')).toBe('sample');
      expect(libraryFileTypeSchema.parse('loop')).toBe('loop');
      expect(libraryFileTypeSchema.parse('other')).toBe('other');
    });

    it('should reject invalid file types', () => {
      expect(() => libraryFileTypeSchema.parse('invalid')).toThrow();
    });
  });

  describe('uploadLibraryFileSchema', () => {
    it('should apply defaults', () => {
      const result = uploadLibraryFileSchema.parse({});
      expect(result.type).toBe('other');
      expect(result.tags).toEqual([]);
    });

    it('should validate tags', () => {
      const result = uploadLibraryFileSchema.parse({
        type: 'stem',
        tags: ['guitar', 'drums'],
      });
      expect(result.tags).toEqual(['guitar', 'drums']);
    });
  });

  describe('createSongSchema', () => {
    it('should validate valid song data', () => {
      const valid = {
        title: 'My Song',
        projectId: 'cm4a0b1c2d3e4f5g6h7i8j9kl',
        key: 'C',
        tempo: 120,
      };

      const result = createSongSchema.parse(valid);
      expect(result.title).toBe('My Song');
      expect(result.tempo).toBe(120);
    });

    it('should require title and projectId', () => {
      expect(() => createSongSchema.parse({})).toThrow();
      expect(() => createSongSchema.parse({ title: 'Song' })).toThrow();
      expect(() => createSongSchema.parse({ projectId: 'cm4a0b1c2d3e4f5g6h7i8j9kl' })).toThrow();
    });

    it('should validate tempo range', () => {
      expect(() =>
        createSongSchema.parse({
          title: 'Song',
          projectId: 'cm4a0b1c2d3e4f5g6h7i8j9kl',
          tempo: 10, // too slow
        })
      ).toThrow();

      expect(() =>
        createSongSchema.parse({
          title: 'Song',
          projectId: 'cm4a0b1c2d3e4f5g6h7i8j9kl',
          tempo: 400, // too fast
        })
      ).toThrow();
    });
  });

  describe('updateSongSchema', () => {
    it('should make all fields optional', () => {
      const result = updateSongSchema.parse({});
      expect(result).toEqual({});
    });
  });

  describe('assistantChatSchema', () => {
    it('should validate valid chat message', () => {
      const result = assistantChatSchema.parse({
        message: 'Hello, how can I improve my song?',
      });
      expect(result.message).toBe('Hello, how can I improve my song?');
    });

    it('should require message', () => {
      expect(() => assistantChatSchema.parse({})).toThrow();
      expect(() => assistantChatSchema.parse({ message: '' })).toThrow();
    });

    it('should validate conversation history', () => {
      const result = assistantChatSchema.parse({
        message: 'Continue',
        conversationHistory: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
        ],
      });
      expect(result.conversationHistory).toHaveLength(2);
    });
  });

  describe('createTourSchema', () => {
    it('should validate valid tour data', () => {
      const result = createTourSchema.parse({
        name: 'Summer Tour 2024',
        status: 'planning',
      });
      expect(result.name).toBe('Summer Tour 2024');
      expect(result.status).toBe('planning');
    });

    it('should require tour name', () => {
      expect(() => createTourSchema.parse({})).toThrow();
    });

    it('should default status to planning', () => {
      const result = createTourSchema.parse({ name: 'Tour' });
      expect(result.status).toBe('planning');
    });

    it('should accept valid status values', () => {
      const statuses = ['planning', 'confirmed', 'in-progress', 'completed', 'cancelled'];
      for (const status of statuses) {
        const result = createTourSchema.parse({ name: 'Tour', status });
        expect(result.status).toBe(status);
      }
    });
  });

  describe('updateTourSchema', () => {
    it('should make all fields optional', () => {
      const result = updateTourSchema.parse({});
      expect(result).toEqual({});
    });
  });

  describe('createShowSchema', () => {
    it('should validate valid show data', () => {
      const result = createShowSchema.parse({
        date: '2024-06-15T20:00:00Z',
        capacity: 500,
        ticketPrice: 25.0,
      });
      expect(result.capacity).toBe(500);
      expect(result.ticketPrice).toBe(25.0);
    });

    it('should require date', () => {
      expect(() => createShowSchema.parse({})).toThrow();
    });

    it('should default status to pending', () => {
      const result = createShowSchema.parse({ date: '2024-06-15T20:00:00Z' });
      expect(result.status).toBe('pending');
    });

    it('should validate capacity is non-negative', () => {
      expect(() =>
        createShowSchema.parse({
          date: '2024-06-15T20:00:00Z',
          capacity: -10,
        })
      ).toThrow();
    });
  });

  describe('updateShowSchema', () => {
    it('should make all fields optional', () => {
      const result = updateShowSchema.parse({});
      expect(result).toEqual({});
    });
  });

  describe('createVenueSchema', () => {
    it('should validate valid venue data', () => {
      const result = createVenueSchema.parse({
        name: 'The Venue',
        city: 'Nashville',
        state: 'TN',
        capacity: 1000,
      });
      expect(result.name).toBe('The Venue');
      expect(result.city).toBe('Nashville');
    });

    it('should require venue name', () => {
      expect(() => createVenueSchema.parse({})).toThrow();
    });

    it('should validate contact email if provided', () => {
      expect(() =>
        createVenueSchema.parse({
          name: 'Venue',
          contactEmail: 'invalid-email',
        })
      ).toThrow();

      const result = createVenueSchema.parse({
        name: 'Venue',
        contactEmail: 'contact@venue.com',
      });
      expect(result.contactEmail).toBe('contact@venue.com');
    });
  });

  describe('updateVenueSchema', () => {
    it('should make all fields optional', () => {
      const result = updateVenueSchema.parse({});
      expect(result).toEqual({});
    });
  });

  describe('parseSearchParams', () => {
    it('should parse string values', () => {
      const params = new URLSearchParams('name=test&category=music');
      const schema = z.object({
        name: z.string(),
        category: z.string().optional(),
      });

      const result = parseSearchParams(params, schema);
      expect(result.name).toBe('test');
      expect(result.category).toBe('music');
    });

    it('should parse boolean values', () => {
      const params = new URLSearchParams('active=true&archived=false');
      const schema = z.object({
        active: z.boolean(),
        archived: z.boolean(),
      });

      const result = parseSearchParams(params, schema);
      expect(result.active).toBe(true);
      expect(result.archived).toBe(false);
    });

    it('should parse integer values', () => {
      const params = new URLSearchParams('page=1&limit=20');
      const schema = z.object({
        page: z.number(),
        limit: z.number(),
      });

      const result = parseSearchParams(params, schema);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should parse float values', () => {
      const params = new URLSearchParams('price=19.99');
      const schema = z.object({
        price: z.number(),
      });

      const result = parseSearchParams(params, schema);
      expect(result.price).toBe(19.99);
    });
  });
});
