import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { BloodPressureEntry } from '../../types';
import { BloodPressureContext } from '../../contexts/DataContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const BloodPressureTracker: React.FC = () => {
  const { items, addItem, deleteItem } = BloodPressureContext.useData();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [newReading, setNewReading] = useState({
    systolic: '',
    diastolic: '',
    heartRate: '',
    timeOfDay: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  // Filter readings by time of day
  const filteredReadings = useMemo(() => {
    return items.filter((item: BloodPressureEntry) => {
      if (timeFilter === 'all') return true;
      const hour = parseISO(item.timeOfDay).getHours();
      switch (timeFilter) {
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
    });
  }, [items, timeFilter]);

  // Prepare data for the chart
  const chartData = useMemo(() => {
    return filteredReadings.map((reading: BloodPressureEntry) => ({
      time: format(parseISO(reading.timeOfDay), 'MM/dd HH:mm'),
      systolic: reading.systolic,
      diastolic: reading.diastolic,
      heartRate: reading.heartRate,
    }));
  }, [filteredReadings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const systolicNum = parseInt(newReading.systolic);
    const diastolicNum = parseInt(newReading.diastolic);

    const heartRateNum = parseInt(newReading.heartRate);
    if (systolicNum && diastolicNum && heartRateNum) {
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
    }
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete);
      setItemToDelete(null);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add Blood Pressure Reading
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' } }}>
              <Grid sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
                <TextField
                  label="Systolic"
                  type="number"
                  value={newReading.systolic}
                  onChange={(e) => setNewReading(prev => ({ ...prev, systolic: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
                <TextField
                  label="Diastolic"
                  type="number"
                  value={newReading.diastolic}
                  onChange={(e) => setNewReading(prev => ({ ...prev, diastolic: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
                <TextField
                  label="Heart Rate"
                  type="number"
                  value={newReading.heartRate}
                  onChange={(e) => setNewReading(prev => ({ ...prev, heartRate: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
                <TextField
                  label="Time"
                  type="datetime-local"
                  value={newReading.timeOfDay}
                  onChange={(e) => setNewReading(prev => ({ ...prev, timeOfDay: e.target.value }))}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid sx={{ gridColumn: '1 / -1' }}>
                <Button type="submit" variant="contained" color="primary">
                  Add Reading
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Blood Pressure Trends</Typography>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Time Filter</InputLabel>
              <Select
                value={timeFilter}
                label="Time Filter"
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <MenuItem value="all">All Times</MenuItem>
                <MenuItem value="morning">Morning</MenuItem>
                <MenuItem value="afternoon">Afternoon</MenuItem>
                <MenuItem value="evening">Evening</MenuItem>
                <MenuItem value="night">Night</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="systolic" stroke="#8884d8" name="Systolic" />
              <Line type="monotone" dataKey="diastolic" stroke="#82ca9d" name="Diastolic" />
              <Line type="monotone" dataKey="heartRate" stroke="#ffc658" name="Heart Rate" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Readings
          </Typography>
          <Grid sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
            {filteredReadings.map((reading) => (
              <Grid key={reading.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {reading.systolic}/{reading.diastolic} - {reading.heartRate} bpm
                    </Typography>
                    <Typography color="textSecondary">
                      {format(parseISO(reading.timeOfDay), 'PPpp')}
                    </Typography>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(reading.id)}
                      sx={{ mt: 1 }}
                    >
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

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
    </div>
  );
};