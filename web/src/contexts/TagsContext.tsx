import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Tag } from '../types';
import { useAuth } from './AuthContext';

// Generate a random ID for new tags
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Generate a random color for new tags
const generateRandomColor = (): string => {
  const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
    '#FF5722', '#795548', '#9E9E9E', '#607D8B'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Define the context type
interface TagsContextType {
  tags: Tag[];
  addTag: (name: string) => void;
  updateTag: (tag: Tag) => void;
  deleteTag: (id: string) => void;
  getTagById: (id: string) => Tag | undefined;
}

// Create the context with a default value
const TagsContext = createContext<TagsContextType>({
  tags: [],
  addTag: () => {},
  updateTag: () => {},
  deleteTag: () => {},
  getTagById: () => undefined,
});

// Custom hook to use the tags context
export const useTags = () => useContext(TagsContext);

interface TagsProviderProps {
  children: ReactNode;
}

// Provider component
export const TagsProvider: React.FC<TagsProviderProps> = ({ children }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const { currentUser, isGuest } = useAuth();
  
  // Create a user-specific storage key
  const storageKey = useMemo(() => {
    if (currentUser) {
      return `user_${currentUser.uid}_tags`;
    } else if (isGuest) {
      return 'guest_tags';
    } else {
      return 'tags'; // Fallback for not logged in or initializing
    }
  }, [currentUser, isGuest]);

  // Load tags from localStorage when component mounts or user changes
  useEffect(() => {
    const storedTags = localStorage.getItem(storageKey);
    if (storedTags) {
      setTags(JSON.parse(storedTags));
    } else {
      // Initialize with some default tags if none exist
      const defaultTags: Tag[] = [
        { id: generateId(), name: 'Important', color: '#F44336' },
        { id: generateId(), name: 'Work', color: '#2196F3' },
        { id: generateId(), name: 'Personal', color: '#4CAF50' },
        { id: generateId(), name: 'Health', color: '#FF9800' },
      ];
      setTags(defaultTags);
      localStorage.setItem(storageKey, JSON.stringify(defaultTags));
    }
  }, [storageKey]); // Re-run when user changes (storageKey changes)

  // Debounced save to localStorage
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(tags));
    }, 300); // 300ms debounce

    return () => clearTimeout(saveTimeout);
  }, [tags, storageKey]);

  // Add a new tag with useCallback
  const addTag = useCallback((name: string) => {
    const newTag: Tag = {
      id: generateId(),
      name,
      color: generateRandomColor(),
    };
    
    // Update state immediately
    setTags(prevTags => {
      const updatedTags = [...prevTags, newTag];
      
      // Force immediate localStorage save for new tags
      localStorage.setItem(storageKey, JSON.stringify(updatedTags));
      
      return updatedTags;
    });
  }, [storageKey]);

  // Update an existing tag with useCallback
  const updateTag = useCallback((updatedTag: Tag) => {
    setTags(prevTags => 
      prevTags.map(tag => tag.id === updatedTag.id ? updatedTag : tag)
    );
  }, []);

  // Delete a tag with useCallback
  const deleteTag = useCallback((id: string) => {
    setTags(prevTags => prevTags.filter(tag => tag.id !== id));
  }, []);

  // Get a tag by ID with useCallback
  const getTagById = useCallback((id: string) => {
    return tags.find(tag => tag.id === id);
  }, [tags]);

  // Memoize the context value
  const contextValue = useMemo(() => ({
    tags,
    addTag,
    updateTag,
    deleteTag,
    getTagById
  }), [tags, addTag, updateTag, deleteTag, getTagById]);

  return (
    <TagsContext.Provider value={contextValue}>
      {children}
    </TagsContext.Provider>
  );
};