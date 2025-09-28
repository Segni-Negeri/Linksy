import { sanitizeSlug, generateSlug, isValidSlug } from '../lib/slugGenerator';

describe('slugGenerator', () => {
  describe('sanitizeSlug', () => {
    it('should convert to lowercase', () => {
      expect(sanitizeSlug('HELLO')).toBe('hello');
    });

    it('should replace spaces with hyphens', () => {
      expect(sanitizeSlug('hello world')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(sanitizeSlug('hello@world!')).toBe('hello-world');
    });

    it('should handle multiple hyphens', () => {
      expect(sanitizeSlug('hello---world')).toBe('hello-world');
    });

    it('should remove leading/trailing hyphens', () => {
      expect(sanitizeSlug('-hello-world-')).toBe('hello-world');
    });

    it('should handle empty string', () => {
      expect(sanitizeSlug('')).toBe('');
    });
  });

  describe('generateSlug', () => {
    it('should generate valid slug from normal input', () => {
      expect(generateSlug('My Awesome Link')).toBe('my-awesome-link');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Hello@World!')).toBe('hello-world');
    });

    it('should throw error for empty input', () => {
      expect(() => generateSlug('')).toThrow('Input must be a non-empty string');
    });

    it('should throw error for non-string input', () => {
      expect(() => generateSlug(null as any)).toThrow('Input must be a non-empty string');
    });

    it('should throw error for too short slug', () => {
      expect(() => generateSlug('ab')).toThrow('Slug must be at least 3 characters long');
    });

    it('should throw error for too long slug', () => {
      const longInput = 'a'.repeat(51);
      expect(() => generateSlug(longInput)).toThrow('Slug must be no more than 50 characters long');
    });

    it('should handle minimum valid length', () => {
      expect(generateSlug('abc')).toBe('abc');
    });

    it('should handle maximum valid length', () => {
      const longInput = 'a'.repeat(50);
      expect(generateSlug(longInput)).toBe(longInput);
    });
  });

  describe('isValidSlug', () => {
    it('should return true for valid slugs', () => {
      expect(isValidSlug('hello-world')).toBe(true);
      expect(isValidSlug('my-awesome-link')).toBe(true);
      expect(isValidSlug('test123')).toBe(true);
      expect(isValidSlug('a-b-c')).toBe(true);
    });

    it('should return false for invalid slugs', () => {
      expect(isValidSlug('')).toBe(false);
      expect(isValidSlug('ab')).toBe(false); // too short
      expect(isValidSlug('a'.repeat(51))).toBe(false); // too long
      expect(isValidSlug('Hello-World')).toBe(false); // uppercase
      expect(isValidSlug('hello_world')).toBe(false); // underscore
      expect(isValidSlug('hello@world')).toBe(false); // special char
      expect(isValidSlug('-hello')).toBe(false); // leading hyphen
      expect(isValidSlug('hello-')).toBe(false); // trailing hyphen
      expect(isValidSlug('hello--world')).toBe(false); // consecutive hyphens
    });

    it('should return false for non-string input', () => {
      expect(isValidSlug(null as any)).toBe(false);
      expect(isValidSlug(undefined as any)).toBe(false);
      expect(isValidSlug(123 as any)).toBe(false);
    });
  });
});
