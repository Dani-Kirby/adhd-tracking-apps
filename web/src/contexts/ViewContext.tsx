import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { ViewConfig, ViewType } from '../types';
import { useAuth } from './AuthContext';

// Generate a random ID for new views
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Define the context type
interface ViewContextType {
  views: ViewConfig[];
  addView: (type: ViewType, title: string) => void;
  updateView: (view: ViewConfig) => void;
  deleteView: (id: string) => void;
  reorderViews: (orderedIds: string[]) => void;
  toggleViewVisibility: (id: string) => void;
}

// Create the context with a default value
const ViewContext = createContext<ViewContextType>({
  views: [],
  addView: () => {},
  updateView: () => {},
  deleteView: () => {},
  reorderViews: () => {},
  toggleViewVisibility: () => {},
});

// Custom hook to use the view context
export const useViews = () => useContext(ViewContext);

interface ViewProviderProps {
  children: ReactNode;
}

// Provider component
export const ViewProvider: React.FC<ViewProviderProps> = ({ children }) => {
  const [views, setViews] = useState<ViewConfig[]>([]);
  const { currentUser, isGuest } = useAuth();
  
  // Create a user-specific storage key
  const storageKey = useMemo(() => {
    if (currentUser) {
      return `user_${currentUser.uid}_views`;
    } else if (isGuest) {
      return 'guest_views';
    } else {
      return 'views'; // Fallback for not logged in or initializing
    }
  }, [currentUser, isGuest]);

  // Load views from localStorage when component mounts or user changes
  useEffect(() => {
    const storedViews = localStorage.getItem(storageKey);
    if (storedViews) {
      setViews(JSON.parse(storedViews));
    } else {
      // Initialize with default views if none exist
      const defaultViews: ViewConfig[] = [
        { id: generateId(), type: 'sleep', title: 'Sleep Tracker', visible: true, order: 0 },
        { id: generateId(), type: 'screenTime', title: 'Screen Time', visible: true, order: 1 },
        { id: generateId(), type: 'medication', title: 'Medication', visible: true, order: 2 },
        { id: generateId(), type: 'todo', title: 'To-Do List', visible: true, order: 3 },
        { id: generateId(), type: 'calendar', title: 'Calendar', visible: true, order: 4 },
      ];
      setViews(defaultViews);
      localStorage.setItem(storageKey, JSON.stringify(defaultViews));
    }
  }, [storageKey]); // Re-run when user changes (storageKey changes)

  // Debounced save to localStorage
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(views));
    }, 300); // 300ms debounce

    return () => clearTimeout(saveTimeout);
  }, [views, storageKey]);

  // Add a new view with useCallback
  const addView = useCallback((type: ViewType, title: string) => {
    const newView: ViewConfig = {
      id: generateId(),
      type,
      title,
      visible: true,
      order: 0, // Will be calculated based on current views
    };
    
    // Update state immediately
    setViews(prevViews => {
      const newOrder = prevViews.length;
      const updatedViews = [...prevViews, {...newView, order: newOrder}];
      
      // Force immediate localStorage save for new views
      localStorage.setItem(storageKey, JSON.stringify(updatedViews));
      
      return updatedViews;
    });
  }, [storageKey]);

  // Update an existing view with useCallback
  const updateView = useCallback((updatedView: ViewConfig) => {
    setViews(prevViews => 
      prevViews.map(view => view.id === updatedView.id ? updatedView : view)
    );
  }, []);

  // Delete a view with useCallback
  const deleteView = useCallback((id: string) => {
    setViews(prevViews => prevViews.filter(view => view.id !== id));
  }, []);

  // Reorder views with useCallback
  const reorderViews = useCallback((orderedIds: string[]) => {
    setViews(prevViews => {
      const reorderedViews = [...prevViews];
      orderedIds.forEach((id, index) => {
        const viewIndex = reorderedViews.findIndex(view => view.id === id);
        if (viewIndex !== -1) {
          reorderedViews[viewIndex] = { ...reorderedViews[viewIndex], order: index };
        }
      });
      return reorderedViews.sort((a, b) => a.order - b.order);
    });
  }, []);

  // Toggle view visibility with useCallback
  const toggleViewVisibility = useCallback((id: string) => {
    setViews(prevViews => 
      prevViews.map(view => 
        view.id === id ? { ...view, visible: !view.visible } : view
      )
    );
  }, []);

  // Memoize the context value
  const contextValue = useMemo(() => ({
    views, 
    addView, 
    updateView, 
    deleteView, 
    reorderViews,
    toggleViewVisibility
  }), [views, addView, updateView, deleteView, reorderViews, toggleViewVisibility]);

  return (
    <ViewContext.Provider value={contextValue}>
      {children}
    </ViewContext.Provider>
  );
};