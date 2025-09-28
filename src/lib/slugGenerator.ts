/**
 * Generate a unique slug from a given string
 * Sanitizes input and ensures uniqueness
 */

export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

export function generateSlug(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }
  
  const sanitized = sanitizeSlug(input);
  
  if (sanitized.length < 3) {
    throw new Error('Slug must be at least 3 characters long');
  }
  
  if (sanitized.length > 50) {
    throw new Error('Slug must be no more than 50 characters long');
  }
  
  return sanitized;
}

export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') {
    return false;
  }
  
  // Check length
  if (slug.length < 3 || slug.length > 50) {
    return false;
  }
  
  // Check format (only lowercase letters, numbers, and hyphens)
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return false;
  }
  
  // Check no leading/trailing hyphens
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return false;
  }
  
  // Check no consecutive hyphens
  if (slug.includes('--')) {
    return false;
  }
  
  return true;
}
