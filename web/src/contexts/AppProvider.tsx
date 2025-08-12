import React, { ReactNode } from 'react';
import { TagsProvider } from './TagsContext';
import { ViewProvider } from './ViewContext';
import { AuthProvider, useAuth } from './AuthContext';
import { 
  SleepContext, 
  ScreenTimeContext, 
  MedicationContext, 
  TodoContext, 
  CalendarContext,
  BloodPressureContext
} from './DataContext';

interface AppProviderProps {
  children: ReactNode;
}

// Data providers that depend on the authenticated user
const DataProviders: React.FC<AppProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  
  // We'll use user ID as part of localStorage keys in the future
  // For now, just ensuring the structure is in place
  
  return (
    <TagsProvider>
      <ViewProvider>
        <SleepContext.DataProvider>
          <ScreenTimeContext.DataProvider>
            <MedicationContext.DataProvider>
              <TodoContext.DataProvider>
                <CalendarContext.DataProvider>
                  <BloodPressureContext.DataProvider>
                    {children}
                  </BloodPressureContext.DataProvider>
                </CalendarContext.DataProvider>
              </TodoContext.DataProvider>
            </MedicationContext.DataProvider>
          </ScreenTimeContext.DataProvider>
        </SleepContext.DataProvider>
      </ViewProvider>
    </TagsProvider>
  );
};

// Combined provider component that wraps all context providers
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <DataProviders>
        {children}
      </DataProviders>
    </AuthProvider>
  );
};

// Export all context hooks for easy access
export { useTags } from './TagsContext';
export { useViews } from './ViewContext';
export { useAuth } from './AuthContext';
export const useSleepData = SleepContext.useData;
export const useScreenTimeData = ScreenTimeContext.useData;
export const useMedicationData = MedicationContext.useData;
export const useTodoData = TodoContext.useData;
export const useCalendarData = CalendarContext.useData;
export const useBloodPressureData = BloodPressureContext.useData;