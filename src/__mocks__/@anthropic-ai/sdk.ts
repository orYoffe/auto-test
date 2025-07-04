import { jest } from '@jest/globals';

const mockAnthropicMessages = jest.fn().mockResolvedValue({
  content: [
    {
      text: 'describe("test", () => { it("should work", () => { expect(true).toBe(true); }); });'
    }
  ]
});

const mockClient = {
  messages: {
    create: mockAnthropicMessages
  }
};

export default jest.fn(() => mockClient);
