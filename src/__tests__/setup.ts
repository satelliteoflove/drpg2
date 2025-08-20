import { jest } from '@jest/globals';

// Setup global test environment
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
  
  // Mock console methods to avoid noisy test output
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
  
  // Mock performance API
  Object.defineProperty(window, 'performance', {
    value: {
      now: jest.fn(() => Date.now()),
    },
  });
  
  // Mock requestAnimationFrame
  Object.defineProperty(window, 'requestAnimationFrame', {
    value: jest.fn((callback: FrameRequestCallback) => {
      return setTimeout(() => callback(performance.now()), 16);
    }),
  });
  
  // Mock crypto API
  Object.defineProperty(window, 'crypto', {
    value: {
      randomUUID: jest.fn(() => 'test-uuid-12345'),
      getRandomValues: jest.fn((array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      }),
    },
  });
  
  // Mock canvas and 2D context
  const mockContext = {
    fillRect: jest.fn(),
    fillText: jest.fn(),
    strokeRect: jest.fn(),
    strokeText: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    arc: jest.fn(),
    rect: jest.fn(),
    clearRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    drawImage: jest.fn(),
    measureText: jest.fn(() => ({ width: 100 })),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    resetTransform: jest.fn(),
    isPointInPath: jest.fn(),
    isPointInStroke: jest.fn(),
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    font: '12px sans-serif',
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
  };
  
  HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext) as any;
  HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mock');
  
  // Mock document methods
  const originalCreateElement = document.createElement;
  document.createElement = jest.fn((tagName: string) => {
    if (tagName === 'canvas') {
      const canvas = {
        width: 1024,
        height: 768,
        getContext: jest.fn(() => mockContext),
        toDataURL: jest.fn(() => 'data:image/png;base64,mock'),
      } as unknown as HTMLCanvasElement;
      return canvas;
    }
    return originalCreateElement.call(document, tagName);
  }) as any;
});