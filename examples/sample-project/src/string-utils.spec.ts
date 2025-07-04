
import { capitalize, reverse, countOccurrences, truncate, format } from './string-utils';

describe('String Utility Functions', () => {
  describe('capitalize', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    it('should return empty string when given empty input', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle already capitalized strings', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });
  });

  describe('reverse', () => {
    it('should reverse a string', () => {
      expect(reverse('hello')).toBe('olleh');
      expect(reverse('world')).toBe('dlrow');
    });

    it('should handle empty strings', () => {
      expect(reverse('')).toBe('');
    });
  });

  describe('countOccurrences', () => {
    it('should count occurrences of a substring', () => {
      expect(countOccurrences('hello world', 'l')).toBe(3);
      expect(countOccurrences('banana', 'na')).toBe(2);
      expect(countOccurrences('test string', 'x')).toBe(0);
    });

    it('should handle empty substrings', () => {
      expect(countOccurrences('hello', '')).toBe(0);
    });
  });

  describe('truncate', () => {
    it('should truncate strings longer than maxLength', () => {
      expect(truncate('hello world', 5)).toBe('hello...');
      expect(truncate('testing', 4)).toBe('test...');
    });

    it('should not truncate strings shorter than maxLength', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });
  });

  describe('format', () => {
    it('should format strings with placeholders', () => {
      expect(format('Hello {name}!', { name: 'World' })).toBe('Hello World!');
      expect(format('{greeting} {name}', { greeting: 'Hi', name: 'John' })).toBe('Hi John');
    });

    it('should leave placeholders as-is if no value provided', () => {
      expect(format('Hello {name}!', {})).toBe('Hello {name}!');
    });
  });
});
