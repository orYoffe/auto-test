/**
 * Calculator utility functions
 */

/**
 * Add two numbers
 * @param a First number
 * @param b Second number
 * @returns Sum of the two numbers
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Subtract b from a
 * @param a First number
 * @param b Number to subtract
 * @returns Difference of the two numbers
 */
export function subtract(a: number, b: number): number {
  return a - b;
}

/**
 * Multiply two numbers
 * @param a First number
 * @param b Second number
 * @returns Product of the two numbers
 */
export function multiply(a: number, b: number): number {
  return a * b;
}

/**
 * Divide a by b
 * @param a Dividend
 * @param b Divisor
 * @returns Quotient of the two numbers
 * @throws Error if b is zero
 */
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Division by zero is not allowed");
  }
  return a / b;
}

/**
 * Calculate the power of a number
 * @param base The base number
 * @param exponent The exponent
 * @returns The base raised to the power of the exponent
 */
export function power(base: number, exponent: number): number {
  return Math.pow(base, exponent);
}
