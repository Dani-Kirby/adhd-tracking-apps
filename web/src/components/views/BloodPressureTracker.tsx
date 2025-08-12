import React, { useState, useMemo, useCallback } from 'react';
import {
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,

  SelectChangeEvent,
  Collapse,
  IconButton,
  Paper,
  Divider,
  Stack,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfDay, subDays, subMonths, isAfter } from 'date-fns';
import { BloodPressureEntry, Tag } from '../../types';
import { BloodPressureContext } from '../../contexts/DataContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface BloodPressureTrackerProps {
  globalFilterTags?: Tag[];
}

export const BloodPressureTracker: React.FC<BloodPressureTrackerProps> = ({ globalFilterTags = [] }) => {
  // Get context data directly like other components
  const { items, addItem, deleteItem } = BloodPressureContext.useData();
  
  // UI state
  const [showAddForm, setShowAddForm] = useState(false);
  const [showChartSection, setShowChartSection] = useState(true);
  const [showReadingsSection, setShowReadingsSection] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  // Filters
  const [timeOfDayFilter, setTimeOfDayFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('last7days');
  
  // Form state
  const [newReading, setNewReading] = useState({
    systolic: '',
    diastolic: '',
    heartRate: '',
    timeOfDay: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  // Form validation states
  const [errors, setErrors] = useState({
    systolic: '',
    diastolic: '',
    heartRate: '',
  });

  // Create a stable tags reference with useMemo
  const stableTags = useMemo(() => globalFilterTags, [globalFilterTags]);
  // Filter readings by date range, time of day, and tags
  const filteredItems = useMemo(() => {
    if (!items) return [];
    
    let filtered = [...items];
    const now = new Date();
    
    // First apply date range filtering
    filtered = filtered.filter((item: BloodPressureEntry) => {
      try {
        const itemDate = parseISO(item.timeOfDay);
        
        switch (dateRangeFilter) {
          case 'today':
            return isAfter(itemDate, startOfDay(now));
          case 'last7days':
            return isAfter(itemDate, subDays(now, 7));
          case 'lastMonth':
            return isAfter(itemDate, subMonths(now, 1));
          case 'last6months':
            return isAfter(itemDate, subMonths(now, 6));
          case 'all':
          default:
            return true;
        }
      } catch (e) {
        return true;
      }
    });
    
    // Apply tag filtering if there are any global filter tags
    if (stableTags.length > 0) {
      filtered = filtered.filter(item => 
        item.tags.some(itemTag => 
          stableTags.some(filterTag => filterTag.id === itemTag.id)
        )
      );
    }
    
    // Then apply time-of-day filtering
    if (timeOfDayFilter !== 'all') {
      filtered = filtered.filter((item: BloodPressureEntry) => {
        try {
          const hour = parseISO(item.timeOfDay).getHours();
          switch (timeOfDayFilter) {
            case 'morning':
              return hour >= 6 && hour < 12;
            case 'afternoon':
              return hour >= 12 && hour < 18;
            case 'evening':
              return hour >= 18 && hour < 22;
            case 'night':
              return hour >= 22 || hour < 6;
            default:
              return true;
          }
        } catch (e) {
          return true;
        }
      });
    }
    
    // Sort by date, most recent first
    return filtered.sort((a, b) => 
      new Date(b.timeOfDay).getTime() - new Date(a.timeOfDay).getTime()
    );
  }, [items, dateRangeFilter, timeOfDayFilter, stableTags]);

  // Prepare data for the chart - avoid creating new objects on every render
  const chartData = useMemo(() => {
    if (!filteredItems || filteredItems.length === 0) return [];
    
    return filteredItems.map((reading: BloodPressureEntry) => ({
      time: format(parseISO(reading.timeOfDay), 'MM/dd HH:mm'),
      systolic: reading.systolic,
      diastolic: reading.diastolic,
      heartRate: reading.heartRate,
    }));
  }, [filteredItems]);

  const validateForm = () => {
    const newErrors = {
      systolic: '',
      diastolic: '',
      heartRate: '',
    };
    
    // Validate systolic
    if (!newReading.systolic) {
      newErrors.systolic = 'Systolic pressure is required';
    } else {
      const systolicNum = parseInt(newReading.systolic);
      if (isNaN(systolicNum)) {
        newErrors.systolic = 'Must be a valid number';
      } else if (systolicNum < 60 || systolicNum > 220) {
        newErrors.systolic = 'Value should be between 60 and 220';
      }
    }
    
    // Validate diastolic
    if (!newReading.diastolic) {
      newErrors.diastolic = 'Diastolic pressure is required';
    } else {
      const diastolicNum = parseInt(newReading.diastolic);
      if (isNaN(diastolicNum)) {
        newErrors.diastolic = 'Must be a valid number';
      } else if (diastolicNum < 40 || diastolicNum > 120) {
        newErrors.diastolic = 'Value should be between 40 and 120';
      }
    }
    
    // Validate heart rate
    if (!newReading.heartRate) {
      newErrors.heartRate = 'Heart rate is required';
    } else {
      const heartRateNum = parseInt(newReading.heartRate);
      if (isNaN(heartRateNum)) {
        newErrors.heartRate = 'Must be a valid number';
      } else if (heartRateNum < 40 || heartRateNum > 180) {
        newErrors.heartRate = 'Heart rate must be between 40 and 180';
      }
    }
    
    setErrors(newErrors);
    return !newErrors.systolic && !newErrors.diastolic && !newErrors.heartRate;
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const systolicNum = parseInt(newReading.systolic);
      const diastolicNum = parseInt(newReading.diastolic);
      const heartRateNum = parseInt(newReading.heartRate);
      
      addItem({
        date: startOfDay(new Date()).toISOString(),
        timeOfDay: newReading.timeOfDay,
        systolic: systolicNum,
        diastolic: diastolicNum,
        heartRate: heartRateNum,
        tags: [],
      });

      setNewReading({
        systolic: '',
        diastolic: '',
        heartRate: '',
        timeOfDay: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      });
      
      // Clear any errors
      setErrors({
        systolic: '',
        diastolic: '',
        heartRate: '',
      });
      
      // Hide the form after successful submission
      setShowAddForm(false);
    }
  }, [newReading, addItem, validateForm]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleDeleteClick = useCallback((id: string) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (itemToDelete) {
      deleteItem(itemToDelete);
      setItemToDelete(null);
    }
    setShowDeleteConfirm(false);
  }, [itemToDelete, deleteItem]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setNewReading(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const handleTimeOfDayFilterChange = useCallback((e: SelectChangeEvent) => {
    setTimeOfDayFilter(e.target.value);
  }, []);
  
  const handleDateRangeFilterChange = useCallback((e: SelectChangeEvent) => {
    setDateRangeFilter(e.target.value);
  }, []);
  
  const toggleAddForm = useCallback(() => {
    setShowAddForm(prev => !prev);
  }, []);
  
  const toggleChartSection = useCallback(() => {
    setShowChartSection(prev => !prev);
  }, []);
  
  const toggleReadingsSection = useCallback(() => {
    setShowReadingsSection(prev => !prev);
  }, []);

  return (
    <Box>
      {/* Add Reading Button and Form */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: showAddForm ? 2 : 0 }}>
          <Typography variant="h6">Blood Pressure Readings</Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            size="small"
            onClick={toggleAddForm}
          >
            {showAddForm ? "Cancel" : "Add Reading"}
          </Button>
        </Box>
          
        <Collapse in={showAddForm} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 8px)' } }}>
                  <Tooltip title="The top number representing the pressure when your heart beats" arrow placement="top">
                    <TextField
                      label="Systolic (mmHg)"
                      type="number"
                      value={newReading.systolic}
                      onChange={(e) => handleInputChange('systolic', e.target.value)}
                      fullWidth
                      required
                      error={!!errors.systolic}
                      helperText={errors.systolic}
                      InputProps={{ inputProps: { min: 60, max: 220 } }}
                      size="small"
                    />
                  </Tooltip>
                </Box>
                <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 8px)' } }}>
                  <Tooltip title="The bottom number representing the pressure when your heart rests" arrow placement="top">
                    <TextField
                      label="Diastolic (mmHg)"
                      type="number"
                      value={newReading.diastolic}
                      onChange={(e) => handleInputChange('diastolic', e.target.value)}
                      fullWidth
                      required
                      error={!!errors.diastolic}
                      helperText={errors.diastolic}
                      InputProps={{ inputProps: { min: 40, max: 120 } }}
                      size="small"
                    />
                  </Tooltip>
                </Box>
                <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 8px)' } }}>
                  <Tooltip title="Your pulse rate in beats per minute" arrow placement="top">
                    <TextField
                      label="Heart Rate (BPM)"
                      type="number"
                      value={newReading.heartRate}
                      onChange={(e) => handleInputChange('heartRate', e.target.value)}
                      fullWidth
                      required
                      error={!!errors.heartRate}
                      helperText={errors.heartRate}
                      InputProps={{ inputProps: { min: 40, max: 180 } }}
                      size="small"
                    />
                  </Tooltip>
                </Box>
                <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 8px)' } }}>
                  <TextField
                    label="Date & Time"
                    type="datetime-local"
                    value={newReading.timeOfDay}
                    onChange={(e) => handleInputChange('timeOfDay', e.target.value)}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    data-testid="time-input"
                    size="small"
                  />
                </Box>
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Button
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    size="small"
                  >
                    Save Reading
                  </Button>
                </Box>
              </Box>
            </form>
          </Box>
        </Collapse>
      </Paper>

      {/* Chart with Filters */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: showChartSection ? 2 : 0, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6">Blood Pressure Trends</Typography>
            <IconButton 
              onClick={toggleChartSection}
              size="small"
              aria-expanded={showChartSection}
              aria-label="toggle chart section"
              sx={{ ml: 1, transform: showChartSection ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }}
            >
              {showChartSection ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl sx={{ minWidth: 140 }} size="small">
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRangeFilter}
                label="Date Range"
                onChange={handleDateRangeFilterChange}
                size="small"
              >
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="last7days">Last 7 Days</MenuItem>
                <MenuItem value="lastMonth">Last Month</MenuItem>
                <MenuItem value="last6months">Last 6 Months</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel>Time of Day</InputLabel>
              <Select
                value={timeOfDayFilter}
                label="Time of Day"
                onChange={handleTimeOfDayFilterChange}
                size="small"
              >
                <MenuItem value="all">All Times</MenuItem>
                <MenuItem value="morning">Morning</MenuItem>
                <MenuItem value="afternoon">Afternoon</MenuItem>
                <MenuItem value="evening">Evening</MenuItem>
                <MenuItem value="night">Night</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>
        <Collapse in={showChartSection} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            {chartData.length > 0 ? (
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="systolic" stroke="#8884d8" name="Systolic" />
                    <Line type="monotone" dataKey="diastolic" stroke="#82ca9d" name="Diastolic" />
                    <Line type="monotone" dataKey="heartRate" stroke="#ffc658" name="Heart Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No data available for the selected filters. Try changing your filter criteria or add new readings.
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </Paper>

      {/* Recent Readings List */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: showReadingsSection ? 2 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6">Recent Readings</Typography>
            <IconButton 
              onClick={toggleReadingsSection}
              size="small"
              aria-expanded={showReadingsSection}
              aria-label="toggle readings section"
              sx={{ ml: 1, transform: showReadingsSection ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }}
            >
              {showReadingsSection ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>
        <Collapse in={showReadingsSection} timeout="auto" unmountOnExit>
          {filteredItems.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            {filteredItems.map((reading) => (
              <Box 
                key={reading.id}
                sx={{ 
                  width: { 
                    xs: '100%', 
                    sm: 'calc(50% - 8px)', 
                    md: 'calc(33.33% - 11px)' 
                  }
                }}
              >
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {reading.systolic}/{reading.diastolic}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {reading.heartRate} BPM
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    {format(parseISO(reading.timeOfDay), 'PPpp')}
                  </Typography>
                  <Box sx={{ mt: 'auto', pt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(reading.id)}
                      title="Delete reading"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              </Box>
            ))}
            </Box>
          ) : (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No readings found with the current filters. Adjust your filters or add new readings.
              </Typography>
              {!showAddForm && (
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  onClick={toggleAddForm}
                  sx={{ mt: 2 }}
                >
                  Add Your First Reading
                </Button>
              )}
            </Box>
          )}
        </Collapse>
      </Paper>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Confirm Deletion"
        message="Are you sure you want to delete this blood pressure reading? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
      />
    </Box>
  );
};