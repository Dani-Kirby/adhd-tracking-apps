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

  // Provider component with stable reference optimization
  const DataProvider: React.FC<DataProviderProps> = ({ children, initialItems = [] }) => {
    // Use reducer instead of useState to avoid potential circular updates
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

    // Reference to track if we should save to localStorage
    const isInitialMount = React.useRef(true);
    
    // Load items from localStorage when component mounts or user changes
    useEffect(() => {
      const storedItems = localStorage.getItem(userStorageKey);
      if (storedItems) {
        try {
          setItems(JSON.parse(storedItems));
        } catch (e) {
          console.error("Failed to parse stored items:", e);
          // Fallback to empty array on parse error
          setItems([]);
        }
      } else if (initialItems.length > 0) {
        setItems(initialItems);
        // Save initial items directly without triggering effects
        localStorage.setItem(userStorageKey, JSON.stringify(initialItems));
      } else {
        // Clear items when switching users if no data exists for new user
        setItems([]);
      }
      
      // After initial mount, we want to save changes
      isInitialMount.current = false;
    }, [userStorageKey]); // Only re-run when user changes (userStorageKey changes)

    // Separate effect for localStorage updates to break circular dependencies
    useEffect(() => {
      // Skip during initial mount to avoid duplicate saves
      if (isInitialMount.current) return;
      
      // Debounce localStorage writes
      const timeoutId = setTimeout(() => {
        localStorage.setItem(userStorageKey, JSON.stringify(items));
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }, [items, userStorageKey]);

    // Create stable action callbacks that don't depend on state
    // This is crucial to avoid unnecessary re-renders and potential loops
    
    // Add a new item
    const addItem = useCallback((item: Omit<T, 'id'>) => {
      const newItem = { ...item, id: generateId() } as T;
      setItems(prevItems => [...prevItems, newItem]);
      return newItem;
    }, []);

    // Update an existing item
    const updateItem = useCallback((updatedItem: T) => {
      setItems(prevItems => 
        prevItems.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
    }, []);

    // Delete an item
    const deleteItem = useCallback((id: string) => {
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    }, []);

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
export const BloodPressureContext = createDataContext<import('../types').BloodPressureEntry>('bloodPressureEntries');