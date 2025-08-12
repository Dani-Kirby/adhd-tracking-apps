import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BloodPressureTracker } from './BloodPressureTracker';
import { BloodPressureContext } from '../../contexts/DataContext';
import type { BloodPressureEntry } from '../../types';

const mockAddItem = jest.fn();
const mockDeleteItem = jest.fn();
const mockUpdateItem = jest.fn();

// Mock the useData hook
jest.mock('../../contexts/DataContext', () => ({
  BloodPressureContext: {
    useData: () => ({
      items: [],
      addItem: mockAddItem,
      deleteItem: mockDeleteItem,
      updateItem: mockUpdateItem,
      getItemById: jest.fn(),
      getItemsByTag: jest.fn(),
      getItemsByDate: jest.fn()
    }),
    DataProvider: ({ children }: { children: React.ReactNode }) => children
  }
}));

const createTestReading = (overrides?: Partial<BloodPressureEntry>): BloodPressureEntry => ({
  id: '1',
  date: new Date().toISOString(),
  timeOfDay: new Date().toISOString(),
  systolic: 120,
  diastolic: 80,
  heartRate: 72,
  tags: [],
  ...overrides
});

describe('BloodPressureTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<BloodPressureTracker />);

    expect(screen.getByLabelText(/systolic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/diastolic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/heart rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time/i)).toBeInTheDocument();
  });

  it('validates form inputs before submission', async () => {
    render(<BloodPressureTracker />);

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/systolic pressure is required/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/diastolic pressure is required/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/heart rate is required/i)).toBeInTheDocument();
    });

    expect(mockAddItem).not.toHaveBeenCalled();
  });

  it('successfully submits a new reading', async () => {
    render(<BloodPressureTracker />);

    await userEvent.type(screen.getByLabelText(/systolic/i), '120');
    await userEvent.type(screen.getByLabelText(/diastolic/i), '80');
    await userEvent.type(screen.getByLabelText(/heart rate/i), '72');
    
    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith(expect.objectContaining({
        systolic: 120,
        diastolic: 80,
        heartRate: 72,
        tags: []
      }));
    });
  });

  it('shows delete confirmation dialog', async () => {
    const testReading = createTestReading();
    
    // Mock items for this test
    jest.spyOn(BloodPressureContext, 'useData').mockImplementation(() => ({
      items: [testReading],
      addItem: mockAddItem,
      deleteItem: mockDeleteItem,
      updateItem: mockUpdateItem,
      getItemById: jest.fn(),
      getItemsByTag: jest.fn(),
      getItemsByDate: jest.fn()
    }));

    render(<BloodPressureTracker />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteItem).toHaveBeenCalledWith(testReading.id);
    });
  });

  it('filters readings by time of day', async () => {
    const morningReading = createTestReading({
      id: '1',
      timeOfDay: '2024-01-01T08:00:00'
    });

    const eveningReading = createTestReading({
      id: '2',
      timeOfDay: '2024-01-01T20:00:00',
      systolic: 118,
      diastolic: 78,
      heartRate: 70
    });

    // Mock items for this test
    jest.spyOn(BloodPressureContext, 'useData').mockImplementation(() => ({
      items: [morningReading, eveningReading],
      addItem: mockAddItem,
      deleteItem: mockDeleteItem,
      updateItem: mockUpdateItem,
      getItemById: jest.fn(),
      getItemsByTag: jest.fn(),
      getItemsByDate: jest.fn()
    }));

    render(<BloodPressureTracker />);

    const filterSelect = screen.getByLabelText(/filter by time/i);
    fireEvent.change(filterSelect, { target: { value: 'morning' } });

    await waitFor(() => {
      expect(screen.getByText('120/80')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText('118/78')).not.toBeInTheDocument();
    });
  });

  it('validates heart rate input', async () => {
    render(<BloodPressureTracker />);

    const heartRateInput = screen.getByLabelText(/heart rate/i);
    await userEvent.type(heartRateInput, '200');

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/heart rate must be between 40 and 180/i)).toBeInTheDocument();
    });

    expect(mockAddItem).not.toHaveBeenCalled();
  });

  it('persists heart rate data between renders', async () => {
    const testReading = createTestReading();

    // Mock items for this test
    jest.spyOn(BloodPressureContext, 'useData').mockImplementation(() => ({
      items: [testReading],
      addItem: mockAddItem,
      deleteItem: mockDeleteItem,
      updateItem: mockUpdateItem,
      getItemById: jest.fn(),
      getItemsByTag: jest.fn(),
      getItemsByDate: jest.fn()
    }));

    const { rerender } = render(<BloodPressureTracker />);

    expect(screen.getByText('72 BPM')).toBeInTheDocument();

    rerender(<BloodPressureTracker />);

    expect(screen.getByText('72 BPM')).toBeInTheDocument();
  });
});