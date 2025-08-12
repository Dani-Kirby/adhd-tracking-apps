import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { TrackableItem } from '../types';
import { useAuth } from './AuthContext';

// Generate a random ID for new items
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
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
  });

  // Custom hook to use the data context
  const useData = () => useContext(Context);

  interface DataProviderProps {
    children: ReactNode;
    initialItems?: T[];
  }

  // Provider component
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

    // Load items from localStorage when component mounts or user changes
    useEffect(() => {
      const storedItems = localStorage.getItem(userStorageKey);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      } else if (initialItems.length > 0) {
        setItems(initialItems);
        localStorage.setItem(userStorageKey, JSON.stringify(initialItems));
      } else {
        // Clear items when switching users if no data exists for new user
        setItems([]);
      }
    }, [initialItems, userStorageKey]); // Re-run when user changes (userStorageKey changes)

    // Save items to localStorage - debounced implementation
    const saveToLocalStorage = useCallback(() => {
      localStorage.setItem(userStorageKey, JSON.stringify(items));
    }, [items, userStorageKey]);

    // Use a debounced version of localStorage saving to prevent excessive writes
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage();
      }, 300); // 300ms debounce time
      
      return () => clearTimeout(timeoutId);
    }, [saveToLocalStorage]);

    // Add a new item - memoized with useCallback
    const addItem = useCallback((item: Omit<T, 'id'>) => {
      const newItem = {
        ...item,
        id: generateId(),
      } as T;
      
      // Update state immediately
      setItems(prevItems => {
        const updatedItems = [...prevItems, newItem];
        
        // Force immediate localStorage save for new items
        // This ensures items persist immediately while still using
        // debounced saves for other operations
        localStorage.setItem(userStorageKey, JSON.stringify(updatedItems));
        
        return updatedItems;
      });
      
      return newItem;
    }, [userStorageKey]);

    // Update an existing item - memoized with useCallback
    const updateItem = useCallback((updatedItem: T) => {
      setItems(prevItems => {
        const updatedItems = prevItems.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        );
        
        // Force immediate localStorage save for updates
        localStorage.setItem(userStorageKey, JSON.stringify(updatedItems));
        
        return updatedItems;
      });
    }, [userStorageKey]);

    // Delete an item - memoized with useCallback
    const deleteItem = useCallback((id: string) => {
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    }, []);

    // Get an item by ID - memoized with useCallback
    const getItemById = useCallback((id: string) => {
      return items.find(item => item.id === id);
    }, [items]);

    // Get items by tag - memoized with useCallback
    const getItemsByTag = useCallback((tagId: string) => {
      return items.filter(item => item.tags.some(tag => tag.id === tagId));
    }, [items]);

    // Get items by date - memoized with useCallback
    const getItemsByDate = useCallback((date: string) => {
      // Compare only the date part (YYYY-MM-DD)
      const dateOnly = date.split('T')[0];
      return items.filter(item => item.date.split('T')[0] === dateOnly);
    }, [items]);

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
      items, 
      addItem, 
      updateItem, 
      deleteItem, 
      getItemById,
      getItemsByTag,
      getItemsByDate
    }), [
      items, 
      addItem, 
      updateItem, 
      deleteItem, 
      getItemById,
      getItemsByTag,
      getItemsByDate
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
export const CalendarContext = createDataContext<import('../types').CalendarEvent>('calendarEvents');