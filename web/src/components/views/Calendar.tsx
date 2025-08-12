import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import { useCalendarData, useTags } from '../../contexts/AppProvider';
import { CalendarEvent, Tag } from '../../types';
import { format, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';
import { TagSelector, TagFilter, TagList } from '../common/TagComponents';

interface CalendarProps {
  globalFilterTags?: Tag[];
}

const Calendar: React.FC<CalendarProps> = ({ globalFilterTags = [] }) => {
  const { items: allCalendarEvents, addItem, updateItem, deleteItem } = useCalendarData();
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [filterTags, setFilterTags] = useState<Tag[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(allCalendarEvents);
  
  // Filter events by tags (both local and global)
  useEffect(() => {
    const activeTags = [...filterTags, ...globalFilterTags];
    
    if (activeTags.length === 0) {
      // No filters, show all events
      setCalendarEvents(allCalendarEvents);
    } else {
      // Filter events that have at least one of the selected tags
      setCalendarEvents(allCalendarEvents.filter(event => 
        event.tags.some(eventTag => 
          activeTags.some(filterTag => filterTag.id === eventTag.id)
        )
      ));
    }
  }, [filterTags, globalFilterTags, allCalendarEvents]);
  
  // New event form state
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [allDay, setAllDay] = useState(false);

  const handleSaveEvent = () => {
    if (title && (allDay || (startTime && endTime))) {
      if (editMode && selectedEvent) {
        // Update existing event
        const updatedEvent = {
          ...selectedEvent,
          title,
          startTime: allDay ? `${selectedDate}T00:00:00` : startTime,
          endTime: allDay ? `${selectedDate}T23:59:59` : endTime,
          location: location || undefined,
          allDay,
          tags: selectedTags,
        };
        updateItem(updatedEvent);
      } else {
        // Create new event
        const newEvent: Omit<CalendarEvent, 'id'> = {
          date: selectedDate,
          title,
          startTime: allDay ? `${selectedDate}T00:00:00` : startTime,
          endTime: allDay ? `${selectedDate}T23:59:59` : endTime,
          location: location || undefined,
          allDay,
          tags: selectedTags,
        };
        addItem(newEvent);
      }
      resetForm();
      setIsEventDialogOpen(false);
      setEditMode(false);
      setSelectedEvent(null);
    }
  };

  const resetForm = () => {
    setTitle('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setAllDay(false);
    setSelectedTags([]);
  };

  const handleOpenEventDialog = (isEdit: boolean = false) => {
    resetForm();
    setEditMode(isEdit);
    setIsEventDialogOpen(true);
  };

  const handleCloseEventDialog = () => {
    setIsEventDialogOpen(false);
    setEditMode(false);
    if (!isViewEventDialogOpen) {
      setSelectedEvent(null);
    }
  };
  
  const handleEditEvent = () => {
    if (selectedEvent) {
      // Populate form with selected event data
      setTitle(selectedEvent.title);
      setAllDay(selectedEvent.allDay);
      setStartTime(selectedEvent.startTime);
      setEndTime(selectedEvent.endTime);
      setLocation(selectedEvent.location || '');
      setSelectedTags(selectedEvent.tags);
      
      // Close view dialog and open edit dialog
      handleCloseViewEventDialog();
      setEditMode(true);
      setIsEventDialogOpen(true);
    }
  };

  const handleViewEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
  };

  const handleCloseViewEventDialog = () => {
    setIsViewEventDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteItem(selectedEvent.id);
      handleCloseViewEventDialog();
    }
  };

  const formatDateTime = (isoString: string) => {
    try {
      return format(parseISO(isoString), 'h:mm a');
    } catch (error) {
      return isoString;
    }
  };

  // Filter events for the selected date
  const eventsForSelectedDate = calendarEvents.filter(event => {
    try {
      const eventStart = parseISO(event.startTime);
      const eventEnd = parseISO(event.endTime);
      const dayStart = startOfDay(parseISO(selectedDate));
      const dayEnd = endOfDay(parseISO(selectedDate));
      
      return isWithinInterval(eventStart, { start: dayStart, end: dayEnd }) ||
             isWithinInterval(eventEnd, { start: dayStart, end: dayEnd }) ||
             (eventStart <= dayStart && eventEnd >= dayEnd);
    } catch (error) {
      return false;
    }
  });

  // Sort events by start time
  const sortedEvents = [...eventsForSelectedDate].sort((a, b) => {
    try {
      return parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime();
    } catch (error) {
      return 0;
    }
  });

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          size="small"
        />
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <TagFilter 
          selectedTags={filterTags} 
          onChange={setFilterTags} 
        />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleOpenEventDialog(false)}
        >
          Add Event
        </Button>
      </Box>

      {sortedEvents.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No events scheduled for this day.
          </Typography>
        </Box>
      ) : (
        <Box>
          {sortedEvents.map((event) => (
            <Paper
              key={event.id}
              sx={{
                p: 1.5,
                mb: 1,
                cursor: 'pointer',
                borderLeft: event.allDay ? '4px solid #2196f3' : 'none',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => handleViewEvent(event)}
            >
              <Typography variant="subtitle2">{event.title}</Typography>
              {event.allDay ? (
                <Typography variant="body2" color="primary">All day</Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {formatDateTime(event.startTime)} - {formatDateTime(event.endTime)}
                </Typography>
              )}
              {event.location && (
                <Typography variant="body2" color="text.secondary">
                  {event.location}
                </Typography>
              )}
              
              {event.tags.length > 0 && (
                <Box sx={{ mt: 0.5 }}>
                  <TagList tags={event.tags} small />
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      )}

      {/* Add/Edit Event Dialog */}
      <Dialog open={isEventDialogOpen} onClose={handleCloseEventDialog}>
        <DialogTitle>{editMode ? 'Edit Event' : 'Add Event'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            variant="outlined"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={allDay} 
                onChange={(e) => setAllDay(e.target.checked)} 
              />
            }
            label="All day"
          />
          {!allDay && (
            <>
              <TextField
                margin="dense"
                label="Start Time"
                type="datetime-local"
                fullWidth
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
              <TextField
                margin="dense"
                label="End Time"
                type="datetime-local"
                fullWidth
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </>
          )}
          <TextField
            margin="dense"
            label="Location"
            type="text"
            fullWidth
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            variant="outlined"
          />
          
          <Box sx={{ mt: 2 }}>
            <TagSelector 
              selectedTags={selectedTags} 
              onChange={setSelectedTags}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEventDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveEvent}
            disabled={!title || (!allDay && (!startTime || !endTime))}
          >
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewEventDialogOpen} onClose={handleCloseViewEventDialog}>
        {selectedEvent && (
          <>
            <DialogTitle>{selectedEvent.title}</DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                {format(parseISO(selectedEvent.date), 'EEEE, MMMM d, yyyy')}
              </Typography>
              {selectedEvent.allDay ? (
                <Typography variant="body2" color="primary" gutterBottom>
                  All day
                </Typography>
              ) : (
                <Typography variant="body2" gutterBottom>
                  {formatDateTime(selectedEvent.startTime)} - {formatDateTime(selectedEvent.endTime)}
                </Typography>
              )}
              {selectedEvent.location && (
                <Typography variant="body2" gutterBottom>
                  Location: {selectedEvent.location}
                </Typography>
              )}
              {selectedEvent.notes && (
                <Typography variant="body2" gutterBottom>
                  Notes: {selectedEvent.notes}
                </Typography>
              )}
              
              {selectedEvent.tags.length > 0 && (
                <Box sx={{ mt: 1, mb: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    Tags:
                  </Typography>
                  <TagList tags={selectedEvent.tags} />
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditEvent} color="primary">Edit</Button>
              <Button onClick={handleDeleteEvent} color="error">Delete</Button>
              <Button onClick={handleCloseViewEventDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Calendar;