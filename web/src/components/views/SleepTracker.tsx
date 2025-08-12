import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Rating, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSleepData, useTags } from '../../contexts/AppProvider';
import { SleepEntry, Tag } from '../../types';
import { format } from 'date-fns';
import { TagSelector, TagFilter, TagList } from '../common/TagComponents';

interface SleepTrackerProps {
  globalFilterTags?: Tag[];
}

const SleepTracker: React.FC<SleepTrackerProps> = ({ globalFilterTags = [] }) => {
  const { items: allSleepEntries, addItem, updateItem, deleteItem } = useSleepData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [quality, setQuality] = useState<number | null>(3);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [filterTags, setFilterTags] = useState<Tag[]>([]);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>(allSleepEntries);
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SleepEntry | null>(null);
  
  // Filter sleep entries by tags (both local and global)
  useEffect(() => {
    const activeTags = [...filterTags, ...globalFilterTags];
    
    if (activeTags.length === 0) {
      // No filters, show all entries
      setSleepEntries(allSleepEntries);
    } else {
      // Filter entries that have at least one of the selected tags
      setSleepEntries(allSleepEntries.filter(entry => 
        entry.tags.some(entryTag => 
          activeTags.some(filterTag => filterTag.id === entryTag.id)
        )
      ));
    }
  }, [filterTags, globalFilterTags, allSleepEntries]);

  const resetForm = () => {
    setStartTime('');
    setEndTime('');
    setQuality(3);
    setSelectedTags([]);
    setEditMode(false);
    setEditingEntry(null);
    setShowAddForm(false);
  };

  const handleAddEntry = () => {
    if (startTime && endTime && quality) {
      if (editMode && editingEntry) {
        // Update existing entry
        const updatedEntry = {
          ...editingEntry,
          startTime,
          endTime,
          quality,
          tags: selectedTags,
          // Update the date to trigger a re-render
          date: new Date().toISOString()
        };
        
        updateItem(updatedEntry);
        setEditMode(false);
        setEditingEntry(null);
      } else {
        // Create new entry
        const newEntry: Omit<SleepEntry, 'id'> = {
          date: new Date().toISOString(),
          startTime,
          endTime,
          quality,
          tags: selectedTags,
        };
        addItem(newEntry);
      }
      resetForm();
    }
  };
  
  // Function to edit an existing entry
  const handleEditEntry = (entry: SleepEntry) => {
    setStartTime(entry.startTime);
    setEndTime(entry.endTime);
    setQuality(entry.quality);
    setSelectedTags(entry.tags);
    
    setEditMode(true);
    setEditingEntry(entry);
    setShowAddForm(true);
  };
  
  // Function to delete an entry
  const handleDeleteEntry = (entryId: string) => {
    deleteItem(entryId);
  };

  const formatDateTime = (isoString: string) => {
    try {
      return format(new Date(isoString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return isoString;
    }
  };

  // Calculate sleep duration in hours
  const calculateDuration = (start: string, end: string) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      return durationHours.toFixed(1);
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <Box>
      {sleepEntries.length === 0 && !showAddForm ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" gutterBottom>
            No sleep data recorded yet.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setShowAddForm(true)}
            size="small"
          >
            Add Sleep Entry
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TagFilter 
              selectedTags={filterTags} 
              onChange={setFilterTags} 
            />
            
            {!showAddForm && (
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => setShowAddForm(true)}
                size="small"
              >
                Add Sleep Entry
              </Button>
            )}
          </Box>

          {showAddForm && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {editMode ? 'Edit Sleep Entry' : 'Add Sleep Entry'}
              </Typography>
              <TextField
                label="Sleep Time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                margin="dense"
                size="small"
              />
              <TextField
                label="Wake Time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                margin="dense"
                size="small"
              />
              <Box sx={{ mt: 1 }}>
                <Typography component="legend" variant="body2">
                  Sleep Quality
                </Typography>
                <Rating
                  name="sleep-quality"
                  value={quality}
                  onChange={(_, newValue) => setQuality(newValue)}
                />
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <TagSelector 
                  selectedTags={selectedTags} 
                  onChange={setSelectedTags}
                />
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="text" 
                  onClick={resetForm}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleAddEntry}
                  size="small"
                  disabled={!startTime || !endTime || !quality}
                >
                  {editMode ? 'Update' : 'Save'}
                </Button>
              </Box>
            </Box>
          )}

          {sleepEntries.length > 0 && (
            <Box sx={{ mt: 2 }}>
              {sleepEntries.map((entry) => (
                <Box 
                  key={entry.id} 
                  sx={{ 
                    mb: 1, 
                    p: 1, 
                    bgcolor: 'background.paper', 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(entry.date)}
                      </Typography>
                      <Typography variant="body1">
                        {calculateDuration(entry.startTime, entry.endTime)} hours
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Quality:
                        </Typography>
                        <Rating value={entry.quality} readOnly size="small" />
                      </Box>
                      
                      {entry.tags.length > 0 && (
                        <Box sx={{ mt: 0.5 }}>
                          <TagList tags={entry.tags} small />
                        </Box>
                      )}
                    </Box>
                    <Box>
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleEditEntry(entry)}
                        title="Edit sleep entry"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteEntry(entry.id)}
                        title="Delete sleep entry"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default SleepTracker;