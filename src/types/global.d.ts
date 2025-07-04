// Jest typings extension to handle our custom mocks
declare namespace jest {
  // Extended mock typing
  interface MockInstance<T = any, Y extends any[] = any[]> {
    mockImplementation(fn: (...args: Y) => T): this;
    mockImplementationOnce(fn: (...args: Y) => T): this;
  }
}
