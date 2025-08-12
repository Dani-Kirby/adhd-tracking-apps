import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useScreenTimeData, useTags } from '../../contexts/AppProvider';
import { ScreenTimeEntry, Tag } from '../../types';
import { format } from 'date-fns';
import { TagSelector, TagFilter, TagList } from '../common/TagComponents';

interface ScreenTimeTrackerProps {
  globalFilterTags?: Tag[];
}

const ScreenTimeTracker: React.FC<ScreenTimeTrackerProps> = ({ globalFilterTags = [] }) => {
  const { items: allScreenTimeEntries, addItem, updateItem, deleteItem } = useScreenTimeData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [device, setDevice] = useState('');
  const [category, setCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [filterTags, setFilterTags] = useState<Tag[]>([]);
  const [screenTimeEntries, setScreenTimeEntries] = useState<ScreenTimeEntry[]>(allScreenTimeEntries);
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScreenTimeEntry | null>(null);
  
  // State for custom categories
  const [categories, setCategories] = useState<string[]>([
    'Social Media',
    'Entertainment',
    'Productivity',
    'Gaming',
    'Education',
    'Communication',
    'Other'
  ]);
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Filter screen time entries by tags
  useEffect(() => {
    const activeTags = [...filterTags, ...globalFilterTags];
    
    if (activeTags.length === 0) {
      setScreenTimeEntries(allScreenTimeEntries);
    } else {
      setScreenTimeEntries(allScreenTimeEntries.filter(entry => 
        entry.tags.some(entryTag => 
          activeTags.some(filterTag => filterTag.id === entryTag.id)
        )
      ));
    }
  }, [filterTags, globalFilterTags, allScreenTimeEntries]);

  const resetForm = () => {
    setHours('');
    setMinutes('');
    setDevice('');
    setCategory('');
    setSelectedTags([]);
    setEditMode(false);
    setEditingEntry(null);
    setShowAddForm(false);
  };

  const handleAddEntry = () => {
    if (hours || minutes) { // At least one field must have a value
      const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
      
      if (editMode && editingEntry) {
        const updatedEntry = {
          ...editingEntry,
          duration: totalMinutes,
          device: device || undefined,
          category: category || undefined,
          tags: selectedTags,
          date: new Date().toISOString()
        };
        
        updateItem(updatedEntry);
        setEditMode(false);
        setEditingEntry(null);
      } else {
        const newEntry: Omit<ScreenTimeEntry, 'id'> = {
          date: new Date().toISOString(),
          duration: totalMinutes,
          device: device || undefined,
          category: category || undefined,
          tags: selectedTags,
        };
        addItem(newEntry);
      }
      resetForm();
    }
  };
  
  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setCategory(newCategory);
      setNewCategory('');
      setShowAddCategory(false);
    }
  };
  
  const handleDeleteCategory = (categoryToDelete: string) => {
    setCategories(categories.filter(cat => cat !== categoryToDelete));
    if (category === categoryToDelete) {
      setCategory('');
    }
  };
  
  const handleEditEntry = (entry: ScreenTimeEntry) => {
    const hours = Math.floor(entry.duration / 60);
    const minutes = entry.duration % 60;
    
    setHours(hours.toString());
    setMinutes(minutes.toString());
    setDevice(entry.device || '');
    setCategory(entry.category || '');
    setSelectedTags(entry.tags);
    
    setEditMode(true);
    setEditingEntry(entry);
    setShowAddForm(true);
  };
  
  const handleDeleteEntry = (entryId: string) => {
    deleteItem(entryId);
  };

  const formatDateTime = (isoString: string) => {
    try {
      return format(new Date(isoString), 'MMM d, yyyy');
    } catch (error) {
      return isoString;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value);
  };

  return (
    <Box>
      {screenTimeEntries.length === 0 && !showAddForm ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" gutterBottom>
            No screen time data recorded yet.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setShowAddForm(true)}
            size="small"
          >
            Add Screen Time
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
                Add Screen Time
              </Button>
            )}
          </Box>

          {showAddForm && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {editMode ? 'Edit Screen Time' : 'Add Screen Time'}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                <TextField
                  label="Hours"
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ flex: 1 }}
                  size="small"
                />
                <TextField
                  label="Minutes"
                  type="number"
                  value={minutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                      if (val >= 60) {
                        const additionalHours = Math.floor(val / 60);
                        const remainingMinutes = val % 60;
                        setHours(prev => ((parseInt(prev) || 0) + additionalHours).toString());
                        setMinutes(remainingMinutes.toString());
                      } else {
                        setMinutes(val.toString());
                      }
                    } else {
                      setMinutes('');
                    }
                  }}
                  InputProps={{ inputProps: { min: 0, max: 59 } }}
                  sx={{ flex: 1 }}
                  size="small"
                />
              </Box>

              <TextField
                label="Device (Optional)"
                type="text"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                fullWidth
                margin="dense"
                size="small"
              />
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <FormControl fullWidth margin="dense" size="small" sx={{ mr: 1 }}>
                  <InputLabel id="category-label">Category (Optional)</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    value={category}
                    label="Category (Optional)"
                    onChange={handleCategoryChange}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <span>{cat}</span>
                          {cat !== 'Other' && (
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(cat);
                              }}
                              sx={{ ml: 1 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => setShowAddCategory(true)}
                  sx={{ mt: 1 }}
                >
                  Add Category
                </Button>
              </Box>
              
              {showAddCategory && (
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <TextField 
                    label="New Category" 
                    size="small" 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    sx={{ mr: 1 }}
                  />
                  <Button 
                    variant="contained" 
                    size="small" 
                    onClick={handleAddCategory}
                    disabled={!newCategory}
                  >
                    Add
                  </Button>
                  <Button 
                    variant="text" 
                    size="small" 
                    onClick={() => {
                      setNewCategory('');
                      setShowAddCategory(false);
                    }}
                    sx={{ ml: 1 }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
              
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
                  disabled={!hours && !minutes}
                >
                  {editMode ? 'Update' : 'Save'}
                </Button>
              </Box>
            </Box>
          )}

          {screenTimeEntries.length > 0 && (
            <Box sx={{ mt: 2 }}>
              {screenTimeEntries.map((entry) => (
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
                        {entry.device ? `${entry.device} - ` : ''}{formatDuration(entry.duration)}
                      </Typography>
                      {entry.category && (
                        <Typography variant="body2" color="text.secondary">
                          Category: {entry.category}
                        </Typography>
                      )}
                      
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
                        title="Edit screen time entry"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteEntry(entry.id)}
                        title="Delete screen time entry"
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

export default ScreenTimeTracker;