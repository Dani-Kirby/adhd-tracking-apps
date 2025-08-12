import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Checkbox,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  Divider,
  Chip,
  Switch,
  Paper,
  Grid,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  DeleteOutline, 
  AddCircleOutline,
  ScheduleOutlined,
  MedicationOutlined,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useMedicationData, useTags } from '../../contexts/AppProvider';
import { MedicationEntry, MedicationDose, Tag } from '../../types';
import { format, parse } from 'date-fns';
import { TagSelector, TagFilter, TagList } from '../common/TagComponents';

interface MedicationTrackerProps {
  globalFilterTags?: Tag[];
}

const MedicationTracker: React.FC<MedicationTrackerProps> = ({ globalFilterTags = [] }) => {
  const { items: allMedicationEntries, addItem, updateItem, deleteItem } = useMedicationData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [filterTags, setFilterTags] = useState<Tag[]>([]);
  const [medicationEntries, setMedicationEntries] = useState<MedicationEntry[]>(allMedicationEntries);
  
  // Filter medications by tags (both local and global)
  useEffect(() => {
    const activeTags = [...filterTags, ...globalFilterTags];
    
    if (activeTags.length === 0) {
      // No filters, show all medications
      setMedicationEntries(allMedicationEntries);
    } else {
      // Filter medications that have at least one of the selected tags
      setMedicationEntries(allMedicationEntries.filter(med => 
        med.tags.some(medTag => 
          activeTags.some(filterTag => filterTag.id === medTag.id)
        )
      ));
    }
  }, [filterTags, globalFilterTags, allMedicationEntries]);
  
  // Form state
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [isAsNeeded, setIsAsNeeded] = useState(false);
  
  // State for scheduled doses
  const [scheduledDoses, setScheduledDoses] = useState<MedicationDose[]>([
    { scheduledTime: '', takenTime: undefined, taken: false }
  ]);
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MedicationEntry | null>(null);
  
  const resetForm = () => {
    setMedication('');
    setDosage('');
    setIsAsNeeded(false);
    setScheduledDoses([{ scheduledTime: '', takenTime: undefined, taken: false }]);
    setSelectedTags([]);
    setShowAddForm(false);
  };

  const addDoseTime = () => {
    setScheduledDoses([...scheduledDoses, { scheduledTime: '', takenTime: undefined, taken: false }]);
  };

  const removeDoseTime = (index: number) => {
    const newDoses = [...scheduledDoses];
    newDoses.splice(index, 1);
    setScheduledDoses(newDoses);
  };

  const updateDoseTime = (index: number, time: string) => {
    const newDoses = [...scheduledDoses];
    newDoses[index] = { ...newDoses[index], scheduledTime: time };
    setScheduledDoses(newDoses);
  };

  const handleAddEntry = () => {
    if (medication && dosage && (isAsNeeded || scheduledDoses.some(dose => dose.scheduledTime))) {
      if (editMode && editingEntry) {
        // Update existing entry
        const updatedEntry = {
          ...editingEntry,
          medication,
          dosage,
          isAsNeeded,
          scheduledDoses: isAsNeeded ? [] : scheduledDoses.filter(dose => dose.scheduledTime),
          tags: selectedTags,
        };
        
        updateItem(updatedEntry);
        setEditMode(false);
        setEditingEntry(null);
      } else {
        // Create new entry
        const newEntry: Omit<MedicationEntry, 'id'> = {
          date: new Date().toISOString(),
          medication,
          dosage,
          isAsNeeded,
          scheduledDoses: isAsNeeded ? [] : scheduledDoses.filter(dose => dose.scheduledTime),
          asNeededDoses: [],
          tags: selectedTags,
        };
        
        addItem(newEntry);
      }
      resetForm();
    }
  };

  // State for time selection dialog
  const [timeSelectionOpen, setTimeSelectionOpen] = useState(false);
  const [selectedDoseInfo, setSelectedDoseInfo] = useState<{
    entry: MedicationEntry | null;
    index: number;
    isAsNeeded: boolean;
    currentStatus: boolean;
  }>({ entry: null, index: 0, isAsNeeded: false, currentStatus: false });
  const [selectedTime, setSelectedTime] = useState('');
  const [useCurrentTime, setUseCurrentTime] = useState(true);

  // Opens time selection dialog
  const openTimeSelectionDialog = (
    entry: MedicationEntry, 
    doseIndex: number, 
    isAsNeeded: boolean,
    currentStatus: boolean,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    
    // If toggling from taken to not taken, just do it directly
    if (currentStatus) {
      if (isAsNeeded) {
        handleToggleAsNeededDoseImpl(entry, doseIndex, false, undefined);
      } else {
        handleToggleScheduledDoseImpl(entry, doseIndex, false, undefined);
      }
      return;
    }
    
    // Initialize time to current time
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setSelectedTime(`${hours}:${minutes}`);
    setUseCurrentTime(true);
    
    // Set dose info for the dialog
    setSelectedDoseInfo({
      entry,
      index: doseIndex,
      isAsNeeded,
      currentStatus
    });
    
    // Open dialog
    setTimeSelectionOpen(true);
  };

  // Handles confirmation from time selection dialog
  const handleTimeSelectionConfirm = () => {
    if (!selectedDoseInfo.entry) return;
    
    const timeToUse = useCurrentTime ? new Date().toISOString() : 
      parse(selectedTime, 'HH:mm', new Date()).toISOString();
    
    if (selectedDoseInfo.isAsNeeded) {
      handleToggleAsNeededDoseImpl(
        selectedDoseInfo.entry, 
        selectedDoseInfo.index, 
        true, 
        timeToUse
      );
    } else {
      handleToggleScheduledDoseImpl(
        selectedDoseInfo.entry, 
        selectedDoseInfo.index, 
        true, 
        timeToUse
      );
    }
    
    setTimeSelectionOpen(false);
  };
  
  // Implementation of toggling scheduled dose
  const handleToggleScheduledDoseImpl = (
    entry: MedicationEntry, 
    doseIndex: number, 
    newTakenStatus: boolean,
    takenTimeOverride?: string
  ) => {
    const updatedDoses = [...entry.scheduledDoses];
    
    updatedDoses[doseIndex] = {
      ...updatedDoses[doseIndex],
      taken: newTakenStatus,
      // Use provided time or current time if taking, or undefined if untaking
      takenTime: newTakenStatus ? (takenTimeOverride || new Date().toISOString()) : undefined
    };
    
    const updatedEntry = {
      ...entry,
      scheduledDoses: updatedDoses,
      // Update entry date to trigger a re-render
      date: new Date().toISOString()
    };
    
    // Update state first for immediate feedback
    setMedicationEntries(prev => 
      prev.map(item => item.id === entry.id ? updatedEntry : item)
    );
    
    // Then update with persistence
    updateItem(updatedEntry);
  };

  // Wrapper function for scheduled dose toggle that opens dialog
  const handleToggleScheduledDose = (entry: MedicationEntry, doseIndex: number, e?: React.MouseEvent) => {
    const currentStatus = entry.scheduledDoses[doseIndex].taken;
    openTimeSelectionDialog(entry, doseIndex, false, currentStatus, e);
  };
  
  // Implementation of toggling as-needed dose
  const handleToggleAsNeededDoseImpl = (
    entry: MedicationEntry, 
    doseIndex: number, 
    newTakenStatus: boolean,
    takenTimeOverride?: string
  ) => {
    const updatedDoses = [...entry.asNeededDoses];
    
    updatedDoses[doseIndex] = {
      ...updatedDoses[doseIndex],
      taken: newTakenStatus,
      // Use provided time or current time if taking, or undefined if untaking
      takenTime: newTakenStatus ? (takenTimeOverride || new Date().toISOString()) : undefined
    };
    
    const updatedEntry = {
      ...entry,
      asNeededDoses: updatedDoses,
      // Update entry date to trigger a re-render
      date: new Date().toISOString()
    };
    
    // Update state first for immediate feedback
    setMedicationEntries(prev => 
      prev.map(item => item.id === entry.id ? updatedEntry : item)
    );
    
    // Then update with persistence
    updateItem(updatedEntry);
  };
  
  // Wrapper function for as-needed dose toggle that opens dialog
  const handleToggleAsNeededDose = (entry: MedicationEntry, doseIndex: number, e?: React.MouseEvent) => {
    const currentStatus = entry.asNeededDoses[doseIndex].taken;
    openTimeSelectionDialog(entry, doseIndex, true, currentStatus, e);
  };
  
  // Implementation of adding as-needed dose
  const handleAddAsNeededDoseImpl = (entry: MedicationEntry, takenTimeOverride?: string) => {
    const now = new Date();
    const newDose: MedicationDose = {
      scheduledTime: now.toISOString(), // For as-needed, scheduled time is when it was recorded
      takenTime: takenTimeOverride || now.toISOString(), // Use provided time or current time
      taken: true
    };
    
    const updatedEntry = {
      ...entry,
      asNeededDoses: [...entry.asNeededDoses, newDose],
      date: new Date().toISOString()
    };
    
    // Update state first for immediate feedback
    setMedicationEntries(prev => 
      prev.map(item => item.id === entry.id ? updatedEntry : item)
    );
    
    // Then update with persistence
    updateItem(updatedEntry);
  };
  
  // Wrapper function for adding as-needed dose that opens dialog
  const handleAddAsNeededDose = (entry: MedicationEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    // Initialize time to current time
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setSelectedTime(`${hours}:${minutes}`);
    setUseCurrentTime(true);
    
    // Set dose info for the dialog
    setSelectedDoseInfo({
      entry,
      index: -1, // Not used for adding, but need to set something
      isAsNeeded: true,
      currentStatus: false
    });
    
    // Open dialog
    setTimeSelectionOpen(true);
  };
  // Handler for the Add button on the time selection dialog
  const handleAddAsNeededDoseWithTime = () => {
    if (!selectedDoseInfo.entry) return;
    
    const timeToUse = useCurrentTime ? new Date().toISOString() : 
      parse(selectedTime, 'HH:mm', new Date()).toISOString();
    
    handleAddAsNeededDoseImpl(selectedDoseInfo.entry, timeToUse);
    setTimeSelectionOpen(false);
  };
  const formatDateTime = (isoString: string) => {
    try {
      return format(new Date(isoString), 'MMM d, yyyy');
    } catch (error) {
      return isoString;
    }
  };
  // Cancel time selection dialog
  const handleTimeSelectionCancel = () => {
    setTimeSelectionOpen(false);
  };
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    
    try {
      // If it's an ISO string, format it
      if (timeString.includes('T')) {
        return format(new Date(timeString), 'h:mm a');
      }
      // If it's just a time string from input, return as is
      return format(parse(timeString, 'HH:mm', new Date()), 'h:mm a');
    } catch (error) {
      return timeString;
    }
  };
  
  // Function to edit an existing entry
  const handleEditEntry = (entry: MedicationEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    setMedication(entry.medication);
    setDosage(entry.dosage);
    setIsAsNeeded(entry.isAsNeeded);
    setSelectedTags(entry.tags);
    
    if (!entry.isAsNeeded) {
      setScheduledDoses(entry.scheduledDoses);
    }
    
    setEditMode(true);
    setEditingEntry(entry);
    setShowAddForm(true);
  };
  
  // Function to delete an entry
  const handleDeleteEntry = (entryId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    // Use the context's deleteItem function
    deleteItem(entryId);
  };

  const isAllScheduledTaken = (entry: MedicationEntry): boolean => {
    return entry.scheduledDoses.length > 0 && 
           entry.scheduledDoses.every(dose => dose.taken);
  };

  const getScheduledProgress = (entry: MedicationEntry): string => {
    const taken = entry.scheduledDoses.filter(dose => dose.taken).length;
    const total = entry.scheduledDoses.length;
    return `${taken}/${total} taken`;
  };

  // Time selection dialog
  const renderTimeSelectionDialog = () => {
    if (!timeSelectionOpen) return null;
    
    return (
      <Dialog open={timeSelectionOpen} onClose={handleTimeSelectionCancel}>
        <DialogTitle>
          {selectedDoseInfo.isAsNeeded && selectedDoseInfo.index === -1 
            ? "Record As-Needed Medication" 
            : "Mark Medication as Taken"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={useCurrentTime}
                  onChange={(e) => setUseCurrentTime(e.target.checked)}
                  color="primary"
                />
              }
              label="Use current time"
            />
            
            {!useCurrentTime && (
              <TextField
                label="Time taken"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTimeSelectionCancel} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={
              selectedDoseInfo.isAsNeeded && selectedDoseInfo.index === -1
                ? handleAddAsNeededDoseWithTime
                : handleTimeSelectionConfirm
            } 
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  return (
    <Box>
      {medicationEntries.length === 0 && !showAddForm ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" gutterBottom>
            No medications tracked yet.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setShowAddForm(true)}
            size="small"
          >
            Add Medication
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
                Add Medication
              </Button>
            )}
          </Box>
          {/* Time selection dialog */}
          {renderTimeSelectionDialog()}
          {showAddForm && (
            <Paper sx={{ mb: 2, p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {editMode ? 'Edit Medication' : 'Add Medication'}
              </Typography>
              
              <TextField
                label="Medication Name"
                type="text"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                fullWidth
                margin="dense"
                size="small"
              />
              
              <TextField
                label="Dosage"
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                fullWidth
                margin="dense"
                size="small"
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={isAsNeeded} 
                    onChange={(e) => setIsAsNeeded(e.target.checked)} 
                  />
                }
                label="As-needed medication (PRN)"
              />
              
              {!isAsNeeded && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Scheduled Times
                  </Typography>
                  
                  {scheduledDoses.map((dose, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TextField
                        label={`Dose ${index + 1} Time`}
                        type="time"
                        value={dose.scheduledTime}
                        onChange={(e) => updateDoseTime(index, e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ flexGrow: 1, mr: 1 }}
                        size="small"
                      />
                      {scheduledDoses.length > 1 && (
                        <IconButton 
                          onClick={() => removeDoseTime(index)}
                          color="error"
                          size="small"
                        >
                          <DeleteOutline />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  
                  <Button
                    startIcon={<AddCircleOutline />}
                    onClick={addDoseTime}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Add Another Time
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
                  disabled={!medication || !dosage || (!isAsNeeded && !scheduledDoses.some(dose => dose.scheduledTime))}
                >
                  {editMode ? 'Update' : 'Save'}
                </Button>
              </Box>
            </Paper>
          )}

          {medicationEntries.length > 0 && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {medicationEntries.map((entry) => (
                <Paper 
                  key={entry.id} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                  elevation={1}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1
                  }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(entry.date)}
                      </Typography>
                      <Typography variant="h6" sx={{ mt: 0 }}>
                        {entry.medication} - {entry.dosage}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        <Chip 
                          icon={entry.isAsNeeded ? <MedicationOutlined /> : <ScheduleOutlined />}
                          label={entry.isAsNeeded ? "As Needed" : getScheduledProgress(entry)}
                          color={entry.isAsNeeded ? "info" : (isAllScheduledTaken(entry) ? "success" : "primary")}
                          size="small"
                        />
                        
                        {entry.tags.length > 0 && (
                          <TagList tags={entry.tags} small />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={(e) => handleEditEntry(entry, e)}
                          title="Edit medication"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={(e) => handleDeleteEntry(entry.id, e)}
                          title="Delete medication"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    {entry.isAsNeeded && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddCircleOutline />}
                        onClick={(e) => handleAddAsNeededDose(entry, e)}
                      >
                        Take Dose
                      </Button>
                    )}
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  {/* Scheduled doses section */}
                  {!entry.isAsNeeded && entry.scheduledDoses.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Scheduled Doses
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {entry.scheduledDoses.map((dose, index) => (
                          <Box key={index} sx={{ width: { xs: 'calc(50% - 4px)', sm: 'calc(33.333% - 4px)' } }}>
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  justifyContent: 'space-between', 
                                  p: 1,
                                  border: '1px solid',
                                  borderColor: dose.taken ? 'success.main' : 'divider',
                                  borderRadius: 1,
                                  backgroundColor: dose.taken ? 'success.50' : 'background.default',
                                  transition: 'all 0.2s ease',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: dose.taken ? 'success.100' : 'action.hover',
                                    borderColor: dose.taken ? 'success.dark' : 'primary.main',
                                  }
                                }}
                                onClick={(e) => handleToggleScheduledDose(entry, index, e)}
                              >
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {formatTime(dose.scheduledTime)}
                                </Typography>
                                {dose.taken && dose.takenTime && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Taken: {formatTime(dose.takenTime)}
                                  </Typography>
                                )}
                              </Box>
                              <Tooltip title={dose.taken ? "Mark as not taken" : "Mark as taken"}>
                                <IconButton 
                                  onClick={(e) => handleToggleScheduledDose(entry, index, e)}
                                  color={dose.taken ? "success" : "default"}
                                  size="small"
                                >
                                  {dose.taken ? <CheckCircle /> : <Cancel />}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {/* As-needed doses section */}
                  {entry.isAsNeeded && entry.asNeededDoses.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Doses Taken
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {entry.asNeededDoses.map((dose, index) => (
                          <Box key={index} sx={{ width: { xs: 'calc(50% - 4px)', sm: 'calc(33.333% - 4px)' } }}>
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                justifyContent: 'space-between', 
                                p: 1,
                                border: '1px solid',
                                borderColor: dose.taken ? 'success.main' : 'divider',
                                borderRadius: 1,
                                backgroundColor: dose.taken ? 'success.50' : 'background.default',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                  backgroundColor: dose.taken ? 'success.100' : 'action.hover',
                                  borderColor: dose.taken ? 'success.dark' : 'primary.main',
                                }
                              }}
                              onClick={(e) => handleToggleAsNeededDose(entry, index, e)}
                            >
                              <Box>
                                <Typography variant="body2">
                                  {formatTime(dose.scheduledTime)}
                                </Typography>
                                {dose.taken && dose.takenTime && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Taken: {formatTime(dose.takenTime)}
                                  </Typography>
                                )}
                              </Box>
                              <Tooltip title={dose.taken ? "Remove this dose" : "Mark as taken"}>
                                <IconButton 
                                  onClick={(e) => handleToggleAsNeededDose(entry, index, e)}
                                  color={dose.taken ? "success" : "default"}
                                  size="small"
                                >
                                  {dose.taken ? <CheckCircle /> : <Cancel />}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Paper>
              ))}
            </Stack>
          )}
        </>
      )}
    </Box>
  );
};

export default MedicationTracker;