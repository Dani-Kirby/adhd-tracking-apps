// Common tag interface
export interface Tag {
  id: string;
  name: string;
  color: string;
}

// Base interface for all trackable items
export interface TrackableItem {
  id: string;
  viewId: string; // ID of the dashboard view/card this item belongs to
  date: string; // ISO string format
  tags: Tag[];
  notes?: string;
}

// Sleep tracking
export interface SleepEntry extends TrackableItem {
  // Sleep can be logged either by start/end time or by duration
  startTime?: string; // ISO string format
  endTime?: string; // ISO string format
  duration?: {
    hours: number;
    minutes: number;
  };
  entryType: 'time' | 'duration'; // Indicates which input method was used
  quality: number; // 1-5 scale
}

// Screen time tracking
export interface ScreenTimeEntry extends TrackableItem {
  duration: number; // in minutes
  device?: string;
  category?: string;
  logDate: string; // ISO string format - specific date this entry is for
  loggedAt: string; // ISO string format - when this entry was created
}

// Days of week for recurring items
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Recurrence pattern for scheduled items
export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'specificDays';
  interval?: number; // For daily (every X days) or weekly (every X weeks)
  daysOfWeek?: DayOfWeek[]; // For specificDays type
  endDate?: string; // Optional end date for recurrence
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
  recurrencePattern?: RecurrencePattern; // Optional recurrence pattern for recurring medications
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

// Blood pressure tracking
export interface BloodPressureEntry extends TrackableItem {
  systolic: number;
  diastolic: number;
  heartRate: number;
  timeOfDay: string; // ISO string format
}

// View types for the dashboard
export type ViewType = 'sleep' | 'screenTime' | 'medication' | 'todo' | 'calendar' | 'bloodPressure';

// View configuration
export interface ViewConfig {
  id: string;
  type: ViewType;
  title: string;
  visible: boolean;
  order: number;
}