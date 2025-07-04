import { jest } from '@jest/globals';

const fetch = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      candidates: [{
        content: {
          parts: [{
            text: 'import { describe, it, expect } from "jest";\n\ndescribe("add", () => {\n  it("should add two numbers", () => {\n    expect(add(1, 2)).toBe(3);\n  });\n});'
          }]
        }
      }]
    })
  });
});

export default fetch;
