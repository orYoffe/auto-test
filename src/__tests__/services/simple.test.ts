import { jest } from '@jest/globals';
import fs from 'fs';

jest.mock('fs');

describe('File System Tests', () => {
  test('should mock fs correctly', () => {
    (fs.readFileSync as jest.Mock).mockReturnValue('mocked content');
    expect(fs.readFileSync('file.txt', 'utf8')).toBe('mocked content');
  });
});
