import 'jest-preset-angular/setup-jest';
import './globalMocks';

// Mock para Chart.js
jest.mock('chart.js', () => ({
  Chart: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
    data: {
      labels: [],
      datasets: [{
        data: []
      }]
    }
  })),
  registerables: []
}));