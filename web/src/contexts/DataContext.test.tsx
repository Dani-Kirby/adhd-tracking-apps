import React, { useContext, useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { createDataContext } from './DataContext';
import { TrackableItem } from '../types';
import { useAuth } from './AuthContext';

// Define a test data type that extends TrackableItem
interface TestItem extends TrackableItem {
  value: string;
}

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    })
  };
})();

// Replace native localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock useAuth
jest.mock('./AuthContext', () => ({
  useAuth: jest.fn(() => ({
    currentUser: { uid: 'test-user-id' },
    isGuest: false,
  }))
}));

describe('DataContext', () => {
  // Clear localStorage and reset mocks before each test
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('creates a data context with DataProvider and useData', () => {
    const { DataProvider, useData } = createDataContext<TestItem>('testItems');
    expect(DataProvider).toBeDefined();
    expect(useData).toBeDefined();
  });

  it('initializes with empty items array if localStorage is empty', () => {
    const { DataProvider, useData } = createDataContext<TestItem>('testItems');
    
    // Test component to use the context
    const TestComponent = () => {
      const { items } = useData();
      return <div data-testid="items-count">{items.length}</div>;
    };
    
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );
    
    expect(screen.getByTestId('items-count')).toHaveTextContent('0');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('user_test-user-id_testItems');
  });

  it('initializes with items from localStorage if available', () => {
    const testItems = [
      { id: '1', date: '2023-01-01T00:00:00.000Z', tags: [], value: 'test 1' },
      { id: '2', date: '2023-01-02T00:00:00.000Z', tags: [], value: 'test 2' },
    ];
    
    // Set initial localStorage data
    mockLocalStorage.setItem(
      'user_test-user-id_testItems',
      JSON.stringify(testItems)
    );
    
    const { DataProvider, useData } = createDataContext<TestItem>('testItems');
    
    // Test component to use the context
    const TestComponent = () => {
      const { items } = useData();
      return (
        <div>
          <div data-testid="items-count">{items.length}</div>
          {items.map((item) => (
            <div key={item.id} data-testid={`item-${item.id}`}>
              {item.value}
            </div>
          ))}
        </div>
      );
    };
    
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );
    
    expect(screen.getByTestId('items-count')).toHaveTextContent('2');
    expect(screen.getByTestId('item-1')).toHaveTextContent('test 1');
    expect(screen.getByTestId('item-2')).toHaveTextContent('test 2');
  });

  it('adds a new item with addItem function', async () => {
    const { DataProvider, useData } = createDataContext<TestItem>('testItems');
    
    // Test component to use the context
    const TestComponent = () => {
      const { items, addItem } = useData();
      
      // Add an item when component mounts
      useEffect(() => {
        addItem({
          date: '2023-01-01T00:00:00.000Z',
          tags: [],
          value: 'new test item',
        });
      }, [addItem]);
      
      return (
        <div>
          <div data-testid="items-count">{items.length}</div>
          {items.map((item) => (
            <div key={item.id} data-testid={`item-value`}>
              {item.value}
            </div>
          ))}
        </div>
      );
    };
    
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );
    
    // Wait for the state update after addItem
    await waitFor(() => {
      expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    });
    
    // Verify the item was added with the correct data
    expect(screen.getByTestId('item-value')).toHaveTextContent('new test item');
    
    // Verify localStorage was updated
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  it('updates an existing item with updateItem function', async () => {
    const initialItem = {
      id: 'test-id',
      date: '2023-01-01T00:00:00.000Z',
      tags: [],
      value: 'initial value',
    };
    
    // Set initial localStorage data
    mockLocalStorage.setItem(
      'user_test-user-id_testItems',
      JSON.stringify([initialItem])
    );
    
    const { DataProvider, useData } = createDataContext<TestItem>('testItems');
    
    // Test component to use the context
    const TestComponent = () => {
      const { items, updateItem } = useData();
      
      // Update the item when component mounts
      useEffect(() => {
        updateItem({
          ...initialItem,
          value: 'updated value',
        });
      }, [updateItem]);
      
      return (
        <div>
          {items.map((item) => (
            <div key={item.id} data-testid="item-value">
              {item.value}
            </div>
          ))}
        </div>
      );
    };
    
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );
    
    // Wait for the state update after updateItem
    await waitFor(() => {
      expect(screen.getByTestId('item-value')).toHaveTextContent('updated value');
    });
  });

  it('deletes an item with deleteItem function', async () => {
    const testItems = [
      { id: 'item1', date: '2023-01-01T00:00:00.000Z', tags: [], value: 'value 1' },
      { id: 'item2', date: '2023-01-02T00:00:00.000Z', tags: [], value: 'value 2' },
    ];
    
    // Set initial localStorage data
    mockLocalStorage.setItem(
      'user_test-user-id_testItems',
      JSON.stringify(testItems)
    );
    
    const { DataProvider, useData } = createDataContext<TestItem>('testItems');
    
    // Test component to use the context
    const TestComponent = () => {
      const { items, deleteItem } = useData();
      
      // Delete an item when component mounts
      useEffect(() => {
        deleteItem('item1');
      }, [deleteItem]);
      
      return (
        <div>
          <div data-testid="items-count">{items.length}</div>
          {items.map((item) => (
            <div key={item.id} data-testid="remaining-item">
              {item.value}
            </div>
          ))}
        </div>
      );
    };
    
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );
    
    // Wait for the state update after deleteItem
    await waitFor(() => {
      expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    });
    
    // Verify only item2 remains
    expect(screen.getByTestId('remaining-item')).toHaveTextContent('value 2');
  });

  it('creates user-specific storage keys', async () => {
    // Mock useAuth with different user values for this test
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { uid: 'different-user' },
      isGuest: false,
    });
    
    const { DataProvider, useData } = createDataContext<TestItem>('testItems');
    
    // Test component to use the context
    const TestComponent = () => {
      const { addItem } = useData();
      
      // Add an item when component mounts
      useEffect(() => {
        addItem({
          date: '2023-01-01T00:00:00.000Z',
          tags: [],
          value: 'user specific item',
        });
      }, [addItem]);
      
      return <div>Test Component</div>;
    };
    
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );
    
    // Wait for localStorage to be updated
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
    
    // Verify the correct user-specific key was used
    const storageKey = mockLocalStorage.setItem.mock.calls[0][0];
    expect(storageKey).toBe('user_different-user_testItems');
  });
});