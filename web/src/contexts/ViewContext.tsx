import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ViewConfig, ViewType } from '../types';
import { useAuth } from './AuthContext';
import { useTodoDataWithDeleteByView } from './DataContext';

// Type-safe deep equality check
function deepEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;
  return JSON.stringify(a) === JSON.stringify(b);
}

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
  const { currentUser, isGuest } = useAuth();
  const { deleteItemsByViewId } = useTodoDataWithDeleteByView();
  
  // Track which storage key was last loaded to prevent double-loading
  const loadedStorageKeyRef = React.useRef<string | undefined>(undefined);
  
  // Initialize state and create storage key
  const [views, setViews] = useState<ViewConfig[]>([]);
  const storageKey = React.useMemo(() => {
    const key = currentUser ? `user_${currentUser.uid}_views` 
              : isGuest ? 'guest_views' 
              : 'views';
    console.log('[ViewContext] Using storage key:', key);
    return key;
  }, [currentUser, isGuest]);

  // Load views from localStorage when component mounts or user changes
  useEffect(() => {
    if (!storageKey) {
      console.log('[ViewContext] No storage key available');
      return;
    }

    if (loadedStorageKeyRef.current === storageKey) {
      console.log('[ViewContext] Views already loaded for this key:', storageKey);
      return;
    }

    console.log('[ViewContext] Loading views for key:', storageKey);
    
    try {
      const storedViews = localStorage.getItem(storageKey);
      
      if (storedViews) {
        const parsed = JSON.parse(storedViews);
        console.log('[ViewContext] Found stored views:', parsed);
        
        if (Array.isArray(parsed)) {
          setViews(prev => deepEqual(prev, parsed) ? prev : parsed);
        } else {
          console.error('[ViewContext] Stored views is not an array:', parsed);
          setViews([]);
        }
      } else {
        console.log('[ViewContext] No stored views found, checking for first load');
        
        // Only create defaults on first load (no previous storage key)
        if (!loadedStorageKeyRef.current) {
          console.log('[ViewContext] Creating default views');
          const defaultViews: ViewConfig[] = [
            { id: generateId(), type: 'sleep', title: 'Sleep Tracker', visible: true, order: 0 },
            { id: generateId(), type: 'screenTime', title: 'Screen Time', visible: true, order: 1 },
            { id: generateId(), type: 'medication', title: 'Medication', visible: true, order: 2 },
            { id: generateId(), type: 'todo', title: 'To-Do List', visible: true, order: 3 },
            { id: generateId(), type: 'calendar', title: 'Calendar', visible: true, order: 4 },
          ];
          setViews(defaultViews);
          localStorage.setItem(storageKey, JSON.stringify(defaultViews));
        } else {
          // If we're switching users and no views found, start with empty array
          console.log('[ViewContext] No views found for current user, starting fresh');
          setViews([]);
        }
      }
      
      loadedStorageKeyRef.current = storageKey;
    } catch (error) {
      console.error('[ViewContext] Error loading views:', error);
      setViews([]);
      loadedStorageKeyRef.current = storageKey;
    }
  }, [storageKey]);

  // Debounced save to localStorage
  useEffect(() => {
    if (!storageKey || !Array.isArray(views)) return;
    
    const saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(views));
        console.log('[ViewContext] Saved views to localStorage:', views.length);
      } catch (error) {
        console.error('[ViewContext] Failed to save views to localStorage:', error);
      }
    }, 300);

    return () => clearTimeout(saveTimeout);
  }, [views, storageKey]);

  // Memoized callbacks with improved error handling and logging
  const addView = React.useCallback((type: ViewType, title: string) => {
    console.log('[ViewContext] Adding new view:', { type, title });
    
    try {
      const newView: ViewConfig = {
        id: generateId(),
        type,
        title: title.trim(),
        visible: true,
        order: 0, // Will be calculated based on current views
      };
      
      setViews(prevViews => {
        // Handle empty or invalid prev state
        const validPrevViews = Array.isArray(prevViews) ? prevViews : [];
        const newOrder = validPrevViews.length;
        return [...validPrevViews, { ...newView, order: newOrder }];
      });
    } catch (error) {
      console.error('[ViewContext] Error adding view:', error);
    }
  }, []);

  const updateView = React.useCallback((updatedView: ViewConfig) => {
    console.log('[ViewContext] Updating view:', updatedView);
    
    try {
      setViews(prevViews => {
        if (!Array.isArray(prevViews)) return [];
        return prevViews.map(view => view.id === updatedView.id ? updatedView : view);
      });
    } catch (error) {
      console.error('[ViewContext] Error updating view:', error);
    }
  }, []);

  const deleteView = React.useCallback((id: string) => {
    if (!id) {
      console.error('[ViewContext] Cannot delete view: Invalid ID');
      return;
    }

    try {
      // First clean up associated items
      deleteItemsByViewId(id);
      
      // Then update views state
      setViews(prevViews => {
        if (!Array.isArray(prevViews)) return [];

        const viewToDelete = prevViews.find(view => view.id === id);
        if (!viewToDelete) return prevViews;

        // Remove the view and update orders
        return prevViews
          .filter(view => view.id !== id)
          .map((view, index) => ({
            ...view,
            order: index
          }));
      });

      console.log('[ViewContext] View deletion completed:', id);
    } catch (error) {
      console.error('[ViewContext] Error deleting view:', error);
    }
  }, [deleteItemsByViewId]);

  const reorderViews = React.useCallback((orderedIds: string[]) => {
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

  const toggleViewVisibility = React.useCallback((id: string) => {
    setViews(prevViews =>
      prevViews.map(view =>
        view.id === id ? { ...view, visible: !view.visible } : view
      )
    );
  }, []);

  // Create a stable context value that only changes when necessary
  const contextValue = React.useMemo(() => ({
    views,
    addView,
    updateView,
    deleteView,
    reorderViews,
    toggleViewVisibility
  }), [
    // Only include truly required dependencies
    views,
    // These callbacks are stable and don't need to be dependencies
    // as they're wrapped in useCallback
    addView, updateView, deleteView, reorderViews, toggleViewVisibility
  ]);

  return (
    <ViewContext.Provider value={contextValue}>
      {children}
    </ViewContext.Provider>
  );
};