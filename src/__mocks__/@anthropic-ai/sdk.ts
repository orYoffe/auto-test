import { jest } from '@jest/globals';

// Simple mock for Anthropic SDK
const mockClient = {
  messages: {
    create: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        content: [
          {
            text: 'describe("test", () => { it("should work", () => { expect(true).toBe(true); }); });'
          }
        ]
      });
    })
  }
};

export default jest.fn().mockImplementation(() => mockClient);
