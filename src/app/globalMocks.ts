// Mock para localStorage
Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
  });
  
  // Mock para Date
  global.Date.now = jest.fn(() => new Date('2023-01-01T00:00:00Z').getTime());