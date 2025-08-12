import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { auth } from '../firebase/config';

// Define the Auth context type
interface AuthContextType {
  currentUser: User | null;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
}

// Create the Auth context with a default value
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isGuest: false,
  signInWithGoogle: async () => {},
  continueAsGuest: () => {},
  logout: async () => {},
});

// Create a provider component
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Handle migrating guest data to authenticated user
  const migrateGuestData = useCallback((user: User) => {
    // Get all keys in localStorage
    const allKeys = Object.keys(localStorage);
    
    // Prefix for guest data
    const guestPrefix = 'guest_';
    
    // For each key that starts with 'guest_'
    allKeys.forEach(key => {
      if (key.startsWith(guestPrefix)) {
        const data = localStorage.getItem(key);
        
        if (data) {
          // Remove guest prefix and add user prefix
          const newKey = `user_${user.uid}_${key.substring(guestPrefix.length)}`;
          
          // Only copy data if it doesn't already exist for the user
          if (!localStorage.getItem(newKey)) {
            localStorage.setItem(newKey, data);
          }
          
          // Clean up guest data
          localStorage.removeItem(key);
        }
      }
    });
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // If user was previously in guest mode, migrate their data
      if (isGuest) {
        migrateGuestData(result.user);
        setIsGuest(false);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  }, [isGuest, migrateGuestData]);

  // Continue as guest
  const continueAsGuest = useCallback(() => {
    setIsGuest(true);
    localStorage.setItem('isGuestUser', 'true');
  }, []);

  // Log out
  const logout = useCallback(async () => {
    try {
      if (isGuest) {
        // For guest, just set state
        setIsGuest(false);
        localStorage.removeItem('isGuestUser');
      } else {
        // For authenticated users, sign out from Firebase
        await signOut(auth);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }, [isGuest]);

  // Set up authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      // Check if user was in guest mode
      const wasGuest = localStorage.getItem('isGuestUser') === 'true';
      setIsGuest(user === null && wasGuest);
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    isGuest,
    signInWithGoogle,
    continueAsGuest,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Create a hook for easy access to the Auth context
export const useAuth = () => useContext(AuthContext);