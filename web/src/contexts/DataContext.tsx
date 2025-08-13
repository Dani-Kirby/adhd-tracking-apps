import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { TrackableItem } from '../types';
import { useAuth } from './AuthContext';

// Generate a cryptographically secure random ID
const generateId = (): string => {
  // Create 6 bytes of randomness (12 hex characters)
  const array = new Uint8Array(6);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Define the context type
interface DataContextType<T extends TrackableItem> {
  items: T[];
  addItem: (item: Omit<T, 'id'>) => T;
  updateItem: (item: T) => void;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => T | undefined;
  getItemsByTag: (tagId: string) => T[];
  getItemsByDate: (date: string) => T[];
  deleteItemsByViewId: (viewId: string) => void;
}

// Create a factory function to create a context for a specific data type
export function createDataContext<T extends TrackableItem>(storageKey: string) {
  // Create the context with a default value
  const Context = createContext<DataContextType<T>>({
    items: [],
    addItem: () => {
      // This is just a placeholder for the default context value
      // The actual implementation is provided by the provider
      throw new Error('addItem not implemented');
      // eslint-disable-next-line no-unreachable
      return {} as T;
    },
    updateItem: () => {},
    deleteItem: () => {},
    getItemById: () => undefined,
    getItemsByTag: () => [],
    getItemsByDate: () => [],
    deleteItemsByViewId: () => {},
  });

  // Custom hook to use the data context
  const useData = () => useContext(Context);

  interface DataProviderProps {
    children: ReactNode;
    initialItems?: T[];
  }

  // Provider component with stable reference optimization
  const DataProvider: React.FC<DataProviderProps> = ({ children, initialItems = [] }) => {
    const [items, setItems] = useState<T[]>([]);
    const { currentUser, isGuest } = useAuth();
    // Create a user-specific storage key
    const userStorageKey = useMemo(() => {
      if (currentUser) {
        return `user_${currentUser.uid}_${storageKey}`;
      } else if (isGuest) {
        return `guest_${storageKey}`;
      } else {
        return storageKey; // Fallback for not logged in or initializing
      }
    }, [currentUser, isGuest]);

    // Helper to delete all items for a given viewId
    const deleteItemsByViewId = useCallback((viewId: string) => {
      setItems(prevItems => prevItems.filter(item => item.viewId !== viewId));
    }, []);

    // Reference to track if we should save to localStorage
    const isInitialMount = React.useRef(true);
    
    // Deep equality check for arrays of objects
    function deepEqual(a: any, b: any): boolean {
      return JSON.stringify(a) === JSON.stringify(b);
    }

    // Load items from localStorage when component mounts or user changes
    useEffect(() => {
      try {
        const storedItems = localStorage.getItem(userStorageKey);
        if (storedItems) {
          try {
            const parsed = JSON.parse(storedItems);
            if (Array.isArray(parsed)) {
              setItems(prev => deepEqual(prev, parsed) ? prev : parsed);
            } else {
              throw new Error('Stored data is not an array');
            }
          } catch (e) {
            console.error(`[DataContext] Failed to parse stored items for ${userStorageKey}:`, e);
            // Fallback to initial items on parse error
            if (initialItems.length > 0) {
              setItems(prev => deepEqual(prev, initialItems) ? prev : initialItems);
            } else {
              setItems([]);
            }
          }
        } else if (initialItems.length > 0) {
          setItems(prev => deepEqual(prev, initialItems) ? prev : initialItems);
          // Save initial items directly without triggering effects
          localStorage.setItem(userStorageKey, JSON.stringify(initialItems));
        } else {
          // Clear items when switching users if no data exists for new user
          setItems([]);
        }
        // After initial mount, we want to save changes
        isInitialMount.current = false;
      } catch (error) {
        console.error(`[DataContext] Failed to access localStorage for ${userStorageKey}:`, error);
        setItems([]);
        isInitialMount.current = false;
      }
    }, [userStorageKey, initialItems]); // Include initialItems in dependencies

    // Log state changes for debugging
    useEffect(() => {
      if (!isInitialMount.current) {
        console.log(`[DataContext] ${storageKey} items updated:`, items.length);
      }
    }, [items]);

    // Create stable action callbacks that don't depend on state
    // This is crucial to avoid unnecessary re-renders and potential loops
    
    // Add a new item with immediate storage
    const addItem = useCallback((item: Omit<T, 'id'>) => {
      try {
        const newItem = { ...item, id: generateId() } as T;
        setItems(prevItems => {
          const updatedItems = [...prevItems, newItem];
          // Immediate save to localStorage
          if (userStorageKey) {
            localStorage.setItem(userStorageKey, JSON.stringify(updatedItems));
          }
          return updatedItems;
        });
        console.log(`[DataContext] Added new item to ${storageKey}:`, newItem);
        return newItem;
      } catch (error) {
        console.error(`[DataContext] Failed to add item to ${storageKey}:`, error);
        throw error;
      }
    }, [userStorageKey]);

    // Update an existing item with immediate storage
    const updateItem = useCallback((updatedItem: T) => {
      try {
        setItems(prevItems => {
          const updatedItems = prevItems.map(item => 
            item.id === updatedItem.id ? updatedItem : item
          );
          // Immediate save to localStorage
          if (userStorageKey) {
            localStorage.setItem(userStorageKey, JSON.stringify(updatedItems));
          }
          return updatedItems;
        });
        console.log(`[DataContext] Updated item in ${storageKey}:`, updatedItem);
      } catch (error) {
        console.error(`[DataContext] Failed to update item in ${storageKey}:`, error);
        throw error;
      }
    }, [userStorageKey]);

    // Delete an item with immediate storage
    const deleteItem = useCallback((id: string) => {
      try {
        setItems(prevItems => {
          const updatedItems = prevItems.filter(item => item.id !== id);
          // Immediate save to localStorage
          if (userStorageKey) {
            localStorage.setItem(userStorageKey, JSON.stringify(updatedItems));
          }
          return updatedItems;
        });
        console.log(`[DataContext] Deleted item from ${storageKey}:`, id);
      } catch (error) {
        console.error(`[DataContext] Failed to delete item from ${storageKey}:`, error);
        throw error;
      }
    }, [userStorageKey]);

    // Stable function references that depend on items state
    // These are separated from the core actions to prevent re-render cascades
    const getItemById = useCallback((id: string) => items.find(item => item.id === id), [items]);
    const getItemsByTag = useCallback((tagId: string) => items.filter(item => 
      item.tags.some(tag => tag.id === tagId)
    ), [items]);
    const getItemsByDate = useCallback((date: string) => {
      const dateOnly = date.split('T')[0];
      return items.filter(item => item.date.split('T')[0] === dateOnly);
    }, [items]);

    // Create a stable context value object that only changes when necessary
    const contextValue = useMemo(() => ({
      items,
      addItem,
      updateItem,
      deleteItem,
      getItemById,
      getItemsByTag,
      getItemsByDate,
      deleteItemsByViewId
    }), [
      items,
      addItem,
      updateItem,
      deleteItem,
      getItemById,
      getItemsByTag,
      getItemsByDate,
      deleteItemsByViewId
    ]);

    return (
      <Context.Provider value={contextValue}>
        {children}
      </Context.Provider>
    );
  };

  return { DataProvider, useData };
}

// Create specific contexts for each data type
export const SleepContext = createDataContext<import('../types').SleepEntry>('sleepEntries');
export const ScreenTimeContext = createDataContext<import('../types').ScreenTimeEntry>('screenTimeEntries');
export const MedicationContext = createDataContext<import('../types').MedicationEntry>('medicationEntries');
export const TodoContext = createDataContext<import('../types').TodoItem>('todoItems');
// Export deleteItemsByViewId for use in view deletion
export const useTodoDataWithDeleteByView = () => {
  const ctx = TodoContext.useData();
  return ctx;
};
export const CalendarContext = createDataContext<import('../types').CalendarEvent>('calendarEvents');
export const BloodPressureContext = createDataContext<import('../types').BloodPressureEntry>('bloodPressureEntries');