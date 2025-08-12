// Common tag interface
export interface Tag {
  id: string;
  name: string;
  color: string;
}

// Base interface for all trackable items
export interface TrackableItem {
  id: string;
  date: string; // ISO string format
  tags: Tag[];
  notes?: string;
}

// Sleep tracking
export interface SleepEntry extends TrackableItem {
  startTime: string; // ISO string format
  endTime: string; // ISO string format
  quality: number; // 1-5 scale
}

// Screen time tracking
export interface ScreenTimeEntry extends TrackableItem {
  duration: number; // in minutes
  device?: string;
  category?: string;
}

// Medication tracking
export interface MedicationDose {
  scheduledTime: string; // Original scheduled time (preserved)
  takenTime?: string;    // Time when medication was taken (optional)
  taken: boolean;
}

export interface MedicationEntry extends TrackableItem {
  medication: string;
  dosage: string;
  isAsNeeded: boolean;
  scheduledDoses: MedicationDose[]; // For scheduled medications with multiple times
  asNeededDoses: MedicationDose[]; // For tracking as-needed medication doses that were taken
}

// To-do item
export interface TodoItem extends TrackableItem {
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

// Calendar event
export interface CalendarEvent extends TrackableItem {
  title: string;
  startTime: string; // ISO string format
  endTime: string; // ISO string format
  location?: string;
  allDay: boolean;
}

// View types for the dashboard
export type ViewType = 'sleep' | 'screenTime' | 'medication' | 'todo' | 'calendar';

// View configuration
export interface ViewConfig {
  id: string;
  type: ViewType;
  title: string;
  visible: boolean;
  order: number;
}