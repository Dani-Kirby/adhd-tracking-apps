import '@testing-library/jest-dom';

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverMock;

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => children,
  LineChart: ({ children }: any) => ({ type: 'LineChart', props: { children } }),
  Line: () => ({ type: 'Line' }),
  XAxis: () => ({ type: 'XAxis' }),
  YAxis: () => ({ type: 'YAxis' }),
  CartesianGrid: () => ({ type: 'CartesianGrid' }),
  Tooltip: () => ({ type: 'Tooltip' }),
  Legend: () => ({ type: 'Legend' })
}));