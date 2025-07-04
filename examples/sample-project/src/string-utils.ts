/**
 * String utility functions
 */

/**
 * Capitalize the first letter of a string
 * @param str Input string
 * @returns String with first letter capitalized
 */
export function capitalize(str: string): string {
  if (!str || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Reverse a string
 * @param str Input string
 * @returns Reversed string
 */
export function reverse(str: string): string {
  return str.split("").reverse().join("");
}

/**
 * Count occurrences of a substring in a string
 * @param str Input string
 * @param substr Substring to count
 * @returns Number of occurrences
 */
export function countOccurrences(str: string, substr: string): number {
  if (!substr) return 0;
  
  let count = 0;
  let position = str.indexOf(substr);
  
  while (position !== -1) {
    count++;
    position = str.indexOf(substr, position + 1);
  }
  
  return count;
}

/**
 * Truncate a string to a specific length and add ellipsis if truncated
 * @param str Input string
 * @param maxLength Maximum length
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

/**
 * Format a string template with values
 * @param template String template with {placeholder} format
 * @param values Object with values to replace placeholders
 * @returns Formatted string
 */
export function format(template: string, values: Record<string, any>): string {
  return template.replace(/\{([^{}]+)\}/g, (match, key) => {
    const value = values[key];
    return value !== undefined ? String(value) : match;
  });
}
