import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
  Paper
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { useTodoData, useTags } from '../../contexts/AppProvider';
import { TodoItem, Tag } from '../../types';
import { format } from 'date-fns';
import { TagSelector, TagFilter, TagList } from '../common/TagComponents';

interface TodoListProps {
  globalFilterTags?: Tag[];
  viewTitle?: string;
  viewId: string;
}

const TodoList: React.FC<TodoListProps> = ({ globalFilterTags = [], viewTitle, viewId }) => {
  const { items: allTodoItems, addItem, updateItem, deleteItem } = useTodoData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [filterTags, setFilterTags] = useState<Tag[]>([]);
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<TodoItem | null>(null);

  // Memoized filtered and sorted items
  const filteredAndSortedItems = React.useMemo(() => {
    const filteredByView = allTodoItems.filter(item => item.viewId === viewId);
    const activeTags = [...filterTags, ...globalFilterTags];
    let filtered = filteredByView;
    if (activeTags.length > 0) {
      filtered = filteredByView.filter(item =>
        item.tags.some(itemTag =>
          activeTags.some(filterTag => filterTag.id === itemTag.id)
        )
      );
    }
    // Sort items: incomplete first, then by priority
    return [...filtered].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [allTodoItems, filterTags, globalFilterTags, viewId]);

  const handlePriorityChange = (event: SelectChangeEvent) => {
    setPriority(event.target.value as 'low' | 'medium' | 'high');
  };

  const resetForm = () => {
    setTitle('');
    setDueDate('');
    setPriority('medium');
    setNotes('');
    setSelectedTags([]);
    setEditMode(false);
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleAddItem = () => {
    if (title) {
      if (editMode && editingItem) {
        // Update existing item
        const updatedItem = {
          ...editingItem,
          title,
          dueDate: dueDate || undefined,
          priority,
          notes,
          tags: selectedTags,
          // Update the date to trigger a re-render
          date: new Date().toISOString()
        };
        
        updateItem(updatedItem);
        setEditMode(false);
        setEditingItem(null);
      } else {
        // Create new item
        const newItem: Omit<TodoItem, 'id'> = {
          viewId,
          date: new Date().toISOString(),
          title,
          completed: false,
          dueDate: dueDate || undefined,
          priority,
          notes,
          tags: selectedTags,
        };
        addItem(newItem);
      }
      resetForm();
    }
  };
  
  // Function to edit an existing item
  const handleEditItem = (item: TodoItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    setTitle(item.title);
    setDueDate(item.dueDate || '');
    setPriority(item.priority);
    setNotes(item.notes || '');
    setSelectedTags(item.tags);
    
    setEditMode(true);
    setEditingItem(item);
    setShowAddForm(true);
  };

  // Handle todo item completion
  const handleToggleComplete = (
    item: TodoItem,
    event?: React.MouseEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    const updatedItem = {
      ...item,
      completed: !item.completed,
      date: new Date().toISOString()
    };
    
    // Immediately update the item in context
    updateItem(updatedItem);
  };

  const handleDeleteItem = (id: string) => {
    deleteItem(id);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#f44336'; // Red
      case 'medium': return '#ff9800'; // Orange
      case 'low': return '#4caf50'; // Green
      default: return '#9e9e9e'; // Grey
    }
  };



  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <TagFilter 
              selectedTags={filterTags} 
              onChange={setFilterTags} 
            />
          </Box>
          {!showAddForm && (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => setShowAddForm(true)}
            >
              Add Task
            </Button>
          )}
        </Box>

        {showAddForm && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" gutterBottom>
              {editMode ? 'Edit To-Do Item' : 'Add To-Do Item'}
            </Typography>
            <TextField
              label="Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              margin="dense"
              size="small"
            />
            <TextField
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin="dense"
              size="small"
            />
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                id="priority"
                value={priority}
                label="Priority"
                onChange={handlePriorityChange}
              >
                <MenuItem 
                  value="low"
                  sx={{
                    '&::before': {
                      content: '""',
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: getPriorityColor('low'),
                      marginRight: '8px',
                      verticalAlign: 'middle'
                    }
                  }}
                >
                  Low
                </MenuItem>
                <MenuItem 
                  value="medium"
                  sx={{
                    '&::before': {
                      content: '""',
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: getPriorityColor('medium'),
                      marginRight: '8px',
                      verticalAlign: 'middle'
                    }
                  }}
                >
                  Medium
                </MenuItem>
                <MenuItem 
                  value="high"
                  sx={{
                    '&::before': {
                      content: '""',
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: getPriorityColor('high'),
                      marginRight: '8px',
                      verticalAlign: 'middle'
                    }
                  }}
                >
                  High
                </MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Notes"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              margin="dense"
              size="small"
              placeholder="Add any additional notes here..."
            />
            
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
                onClick={handleAddItem}
                size="small"
                disabled={!title}
              >
                {editMode ? 'Update' : 'Add'}
              </Button>
            </Box>
          </Box>
        )}

  {filteredAndSortedItems.length === 0 && filterTags.length === 0 && globalFilterTags.length === 0 && !showAddForm ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No to-do items yet. Add some tasks to get started!
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => setShowAddForm(true)}
              sx={{ mt: 2 }}
            >
              Add Task
            </Button>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredAndSortedItems.map((item) => (
              <ListItem
                key={item.id}
                dense
                onClick={() => handleToggleComplete(item)}
                sx={{
                  textDecoration: item.completed ? 'line-through' : 'none',
                  opacity: item.completed ? 0.7 : 1,
                  borderLeft: `4px solid ${getPriorityColor(item.priority)}`,
                  mb: 1,
                  bgcolor: item.completed ? 'action.selected' : 'background.paper',
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    background: `linear-gradient(${getPriorityColor(item.priority)}80, ${getPriorityColor(item.priority)})`,
                    borderRadius: '4px 0 0 4px',
                  },
                  '&:hover': {
                    bgcolor: item.completed ? 'action.selected' : 'action.hover',
                    opacity: item.completed ? 0.8 : 1,
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    edge="start"
                    checked={item.completed}
                    onChange={(e) => handleToggleComplete(item, e)}
                    onClick={(e) => handleToggleComplete(item, e)}
                    sx={{
                      '&.Mui-checked': {
                        color: 'success.main',
                      },
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderRadius: '50%',
                      },
                      transition: 'all 0.2s ease',
                      padding: '12px',
                      margin: '-12px',
                    }}
                  />
                </ListItemIcon>
                <Box sx={{ width: '100%', mr: 8 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ListItemText
                      sx={{ ml: -1 }}
                      primary={item.title}
                      secondary={
                        <>
                          {item.dueDate && `Due: ${formatDate(item.dueDate)}`}
                          {item.dueDate && item.notes && " • "}
                          {item.notes && (
                            <Typography 
                              component="span" 
                              variant="body2" 
                              sx={{ 
                                display: 'block',
                                mt: item.dueDate ? 0.5 : 0,
                                color: 'text.secondary',
                                fontStyle: 'italic'
                              }}
                            >
                              {item.notes}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction sx={{ right: 8 }}>
                      <IconButton 
                        edge="end" 
                        aria-label="edit"
                        onClick={(e) => handleEditItem(item, e)}
                        size="small"
                        sx={{ 
                          mr: -0.5,
                          '& svg': { fontSize: '1.2rem' }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleDeleteItem(item.id)}
                        size="small"
                        sx={{ 
                          '& svg': { fontSize: '1.2rem' }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </Box>
                  {item.tags.length > 0 && (
                    <Box sx={{ ml: -6, mb: 0.5, mt: 0.5 }}>
                      <TagList tags={item.tags} small />
                    </Box>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default TodoList;