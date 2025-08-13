import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SleepTracker from './SleepTracker';
import { SleepContext } from '../../contexts/DataContext';
import type { SleepEntry, Tag } from '../../types';

const mockAddItem = jest.fn();
const mockDeleteItem = jest.fn();
const mockUpdateItem = jest.fn();

// Mock the useData hook from SleepContext
jest.mock('../../contexts/AppProvider', () => ({
  useSleepData: () => ({
    items: [],
  addItem: mockAddItem,
  deleteItem: mockDeleteItem,
  updateItem: mockUpdateItem,
  getItemById: jest.fn(),
  getItemsByTag: jest.fn(),
  getItemsByDate: jest.fn(),
  deleteItemsByViewId: jest.fn()
  }),
  useTags: () => ({
    tags: [],
    addTag: jest.fn(),
    updateTag: jest.fn(),
    deleteTag: jest.fn()
  })
}));

// Helper to create test sleep entries
const createTestSleepEntry = (overrides?: Partial<SleepEntry>): SleepEntry => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  
  return {
    id: '1',
    viewId: overrides?.viewId ?? 'test-view-id',
    date: now.toISOString(),
    startTime: yesterday.toISOString(),
    endTime: now.toISOString(),
    quality: 4,
    tags: [],
    entryType: 'time',
    ...overrides
  };
};

// Helper to create test tags
const createTestTag = (id: string, name: string, color: string): Tag => ({
  id,
  name,
  color
});

describe('SleepTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields when add button is clicked', async () => {
  render(<SleepTracker viewId="test-view-id" />);
    expect(screen.getByText(/Add Sleep Entry/)).toBeInTheDocument();
    
    // Click the "Add Sleep Entry" button
    const addButton = screen.getByRole('button', { name: /add sleep entry/i });
    fireEvent.click(addButton);
    
    // Check that form fields are rendered
    expect(screen.getByLabelText(/sleep time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wake time/i)).toBeInTheDocument();
    expect(screen.getByText(/sleep quality/i)).toBeInTheDocument();
  });

  it('validates form inputs before submission', async () => {
  render(<SleepTracker viewId="test-view-id" />);
    const addButton = screen.getByRole('button', { name: /add sleep entry/i });
    fireEvent.click(addButton);
    
    // Try to submit without entering data
    const saveButton = screen.getByRole('button', { name: /save/i });
    
    // Save button should be disabled
    expect(saveButton).toBeDisabled();
    
    // Enter only partial data
    const sleepTimeInput = screen.getByLabelText(/sleep time/i);
    await userEvent.type(sleepTimeInput, '2023-01-01T22:00');
    
    // Button should still be disabled
    expect(saveButton).toBeDisabled();
    
    // Verify that addItem was not called
    expect(mockAddItem).not.toHaveBeenCalled();
  });

  it('successfully submits a new sleep entry', async () => {
  render(<SleepTracker viewId="test-view-id" />);
    const addButton = screen.getByRole('button', { name: /add sleep entry/i });
    fireEvent.click(addButton);
    
    // Fill out the form
    const sleepTimeInput = screen.getByLabelText(/sleep time/i);
    const wakeTimeInput = screen.getByLabelText(/wake time/i);
    
    await userEvent.type(sleepTimeInput, '2023-01-01T22:00');
    await userEvent.type(wakeTimeInput, '2023-01-02T06:00');
    
    // Select quality (already set to default 3)
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Verify that addItem was called with the correct data
    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith(expect.objectContaining({
        startTime: '2023-01-01T22:00',
        endTime: '2023-01-02T06:00',
        quality: 3,
        tags: [],
        entryType: 'time'
      }));
    });
  });

  it('allows editing an existing entry', async () => {
    const testEntry = createTestSleepEntry();
    
    // Mock items for this test
    jest.spyOn(SleepContext, 'useData').mockImplementation(() => ({
      items: [testEntry],
  addItem: mockAddItem,
  deleteItem: mockDeleteItem,
  updateItem: mockUpdateItem,
  getItemById: jest.fn(),
  getItemsByTag: jest.fn(),
  getItemsByDate: jest.fn(),
  deleteItemsByViewId: jest.fn()
    }));
    
  render(<SleepTracker viewId="test-view-id" />);
    const editButton = screen.getByTitle(/edit sleep entry/i);
    fireEvent.click(editButton);
    
    // Form should be populated with existing data
    const wakeTimeInput = screen.getByLabelText(/wake time/i);
    
    // Change the wake time
    await userEvent.clear(wakeTimeInput);
    await userEvent.type(wakeTimeInput, '2023-01-02T07:00');
    
    // Submit the form
    const updateButton = screen.getByRole('button', { name: /update/i });
    fireEvent.click(updateButton);
    
    // Verify that updateItem was called with the updated data
    await waitFor(() => {
      expect(mockUpdateItem).toHaveBeenCalledWith(expect.objectContaining({
        id: testEntry.id,
        endTime: '2023-01-02T07:00',
        entryType: 'time'
      }));
    });
  });

  it('allows deleting an entry', async () => {
    const testEntry = createTestSleepEntry();
    
    // Mock items for this test
    jest.spyOn(SleepContext, 'useData').mockImplementation(() => ({
      items: [testEntry],
  addItem: mockAddItem,
  deleteItem: mockDeleteItem,
  updateItem: mockUpdateItem,
  getItemById: jest.fn(),
  getItemsByTag: jest.fn(),
  getItemsByDate: jest.fn(),
  deleteItemsByViewId: jest.fn()
    }));
    
  render(<SleepTracker viewId="test-view-id" />);
    const deleteButton = screen.getByTitle(/delete sleep entry/i);
    fireEvent.click(deleteButton);
    
    // Verify that deleteItem was called with the correct ID
    expect(mockDeleteItem).toHaveBeenCalledWith(testEntry.id);
  });

  it('calculates and displays sleep duration correctly', async () => {
    // Create entry with 8 hours duration
    const startTime = new Date('2023-01-01T22:00:00').toISOString();
    const endTime = new Date('2023-01-02T06:00:00').toISOString();
    
    const testEntry = createTestSleepEntry({
      startTime,
      endTime
    });
    
    // Mock items for this test
    jest.spyOn(SleepContext, 'useData').mockImplementation(() => ({
  items: [testEntry],
  addItem: mockAddItem,
  deleteItem: mockDeleteItem,
  updateItem: mockUpdateItem,
  getItemById: jest.fn(),
  getItemsByTag: jest.fn(),
  getItemsByDate: jest.fn(),
  deleteItemsByViewId: jest.fn()
    }));
    
  render(<SleepTracker viewId="test-view-id" />);
    expect(screen.getByText(/8.0 hours/i)).toBeInTheDocument();
  });

  it('filters entries by tags', async () => {
    const tag1 = createTestTag('tag1', 'Good Night', 'blue');
    const tag2 = createTestTag('tag2', 'Bad Night', 'red');
    
    const entry1 = createTestSleepEntry({
      id: '1',
      tags: [tag1]
    });
    
    const entry2 = createTestSleepEntry({
      id: '2',
      quality: 2,
      tags: [tag2]
    });
    
    // Mock items and tags for this test
    jest.spyOn(SleepContext, 'useData').mockImplementation(() => ({
  items: [entry1, entry2],
  addItem: mockAddItem,
  deleteItem: mockDeleteItem,
  updateItem: mockUpdateItem,
  getItemById: jest.fn(),
  getItemsByTag: jest.fn(),
  getItemsByDate: jest.fn(),
  deleteItemsByViewId: jest.fn()
    }));
    
    // Mock the TagFilter component behavior
  const { rerender } = render(<SleepTracker viewId="test-view-id" globalFilterTags={[tag1]} />);
    // Only entry1 should be visible with the global filter
    expect(screen.getByText(/4\/5/i)).toBeInTheDocument();
    expect(screen.queryByText(/2\/5/i)).not.toBeInTheDocument();
    
    // Change the filter
  rerender(<SleepTracker viewId="test-view-id" globalFilterTags={[tag2]} />);
    
    // Now only entry2 should be visible
    expect(screen.queryByText(/4\/5/i)).not.toBeInTheDocument();
    expect(screen.getByText(/2\/5/i)).toBeInTheDocument();
  });

  it('displays quality rating correctly', async () => {
    const testEntry = createTestSleepEntry({
      quality: 5
    });
    
    // Mock items for this test
    jest.spyOn(SleepContext, 'useData').mockImplementation(() => ({
  items: [testEntry],
  addItem: mockAddItem,
  deleteItem: mockDeleteItem,
  updateItem: mockUpdateItem,
  getItemById: jest.fn(),
  getItemsByTag: jest.fn(),
  getItemsByDate: jest.fn(),
  deleteItemsByViewId: jest.fn()
    }));
    
  render(<SleepTracker viewId="test-view-id" />);
    // Check for the quality text
    expect(screen.getByText(/quality/i)).toBeInTheDocument();
    
    // Testing the rating display would depend on how the Rating component is implemented
    // For example, if the Rating component shows the rating value as text:
    expect(screen.getByText(/5/i)).toBeInTheDocument();
    
    // Or alternatively, if we can't test the stars directly, we can verify that
    // the component received the correct props in our mock
  });

  it('shows empty state when no entries', async () => {
    // Mock empty items array
    jest.spyOn(SleepContext, 'useData').mockImplementation(() => ({
  items: [],
  addItem: mockAddItem,
  deleteItem: mockDeleteItem,
  updateItem: mockUpdateItem,
  getItemById: jest.fn(),
  getItemsByTag: jest.fn(),
  getItemsByDate: jest.fn(),
  deleteItemsByViewId: jest.fn()
    }));
    
  render(<SleepTracker viewId="test-view-id" />);
    // Check for empty state message
    expect(screen.getByText(/no sleep data recorded yet/i)).toBeInTheDocument();
  });
});