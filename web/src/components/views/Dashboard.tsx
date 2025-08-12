import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper,
  Typography, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Tooltip
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import { useViews, useTags } from '../../contexts/AppProvider';
import { ViewType, ViewConfig, Tag } from '../../types';
// Import components from parent directory
import SleepTracker from '../views/SleepTracker';
import ScreenTimeTracker from '../views/ScreenTimeTracker';
import MedicationTracker from '../views/MedicationTracker';
import TodoList from '../views/TodoList';
import Calendar from '../views/Calendar';
import { TagFilter } from '../common/TagComponents';

const Dashboard: React.FC = () => {
  const { views, addView, updateView, deleteView, toggleViewVisibility } = useViews();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [isAddViewDialogOpen, setIsAddViewDialogOpen] = useState(false);
  const [isEditViewDialogOpen, setIsEditViewDialogOpen] = useState(false);
  const [newViewTitle, setNewViewTitle] = useState('');
  const [newViewType, setNewViewType] = useState<ViewType>('sleep');
  const [globalFilterTags, setGlobalFilterTags] = useState<Tag[]>([]);
  const [expandedViews, setExpandedViews] = useState<Set<string>>(new Set());
  const [scrollableViews, setScrollableViews] = useState<Set<string>>(new Set());

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, viewId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveViewId(viewId);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveViewId(null);
  };

  // Handle view visibility toggle
  const handleToggleVisibility = () => {
    if (activeViewId) {
      toggleViewVisibility(activeViewId);
    }
    handleMenuClose();
  };

  // Handle view deletion
  const handleDeleteView = () => {
    if (activeViewId) {
      deleteView(activeViewId);
    }
    handleMenuClose();
  };

  // Handle view edit
  const handleEditView = () => {
    if (activeViewId) {
      const view = views.find(v => v.id === activeViewId);
      if (view) {
        setNewViewTitle(view.title);
        setNewViewType(view.type);
        setIsEditViewDialogOpen(true);
      }
    }
    handleMenuClose();
  };

  // Handle add view dialog open
  const handleAddViewDialogOpen = () => {
    setNewViewTitle('');
    setNewViewType('sleep');
    setIsAddViewDialogOpen(true);
  };

  // Handle add view dialog close
  const handleAddViewDialogClose = () => {
    setIsAddViewDialogOpen(false);
  };

  // Handle edit view dialog close
  const handleEditViewDialogClose = () => {
    setIsEditViewDialogOpen(false);
  };

  // Handle add view
  const handleAddView = () => {
    addView(newViewType, newViewTitle);
    setIsAddViewDialogOpen(false);
  };

  // Handle edit view
  const handleSaveEditView = () => {
    if (activeViewId) {
      const view = views.find(v => v.id === activeViewId);
      if (view) {
        updateView({
          ...view,
          title: newViewTitle,
          type: newViewType
        });
      }
    }
    setIsEditViewDialogOpen(false);
  };

  // Handle view type change
  const handleViewTypeChange = (event: SelectChangeEvent) => {
    setNewViewType(event.target.value as ViewType);
  };

  // Handle expanding/collapsing a view
  const handleToggleExpand = (viewId: string) => {
    setExpandedViews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(viewId)) {
        newSet.delete(viewId);
      } else {
        newSet.add(viewId);
      }
      return newSet;
    });
  };

  // Check if a view is scrollable by comparing content height to container height
  const checkScrollable = (viewId: string, containerEl: HTMLElement | null) => {
    if (containerEl) {
      // Check if content height > container height
      if (containerEl.scrollHeight > containerEl.clientHeight) {
        setScrollableViews(prev => {
          const newSet = new Set(prev);
          newSet.add(viewId);
          return newSet;
        });
      } else {
        setScrollableViews(prev => {
          const newSet = new Set(prev);
          newSet.delete(viewId);
          return newSet;
        });
      }
    }
  };

  // Create a ref for each content container to check for scrollability
  const contentRefs = React.useRef<{[key: string]: HTMLElement | null}>({});
  
  // Properly typed ref callback
  const setContentRef = (viewId: string) => (el: HTMLElement | null) => {
    contentRefs.current[viewId] = el;
  };
  
  // Render the appropriate component based on view type
  const renderViewComponent = (view: ViewConfig) => {
    // Pass global filter tags to each component
    switch (view.type) {
      case 'sleep':
        return <SleepTracker globalFilterTags={globalFilterTags} />;
      case 'screenTime':
        return <ScreenTimeTracker globalFilterTags={globalFilterTags} />;
      case 'medication':
        return <MedicationTracker globalFilterTags={globalFilterTags} />;
      case 'todo':
        return <TodoList globalFilterTags={globalFilterTags} />;
      case 'calendar':
        return <Calendar globalFilterTags={globalFilterTags} />;
      default:
        return <Typography>Unknown view type</Typography>;
    }
  };

  // State for drag and drop
  const [draggedView, setDraggedView] = useState<ViewConfig | null>(null);
  const [dragOverViewId, setDragOverViewId] = useState<string | null>(null);

  // Handle drag start
  const handleDragStart = (view: ViewConfig) => {
    setDraggedView(view);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, viewId: string) => {
    e.preventDefault();
    if (draggedView && viewId !== draggedView.id) {
      setDragOverViewId(viewId);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedView(null);
    setDragOverViewId(null);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetViewId: string) => {
    e.preventDefault();
    if (!draggedView || targetViewId === draggedView.id) return;

    const sourceOrder = draggedView.order;
    const targetView = views.find(v => v.id === targetViewId);
    if (!targetView) return;

    const targetOrder = targetView.order;
    const isMovingDown = sourceOrder < targetOrder;

    // Update orders for all affected views
    const updatedViews = views.map(view => {
      if (view.id === draggedView.id) {
        return { ...view, order: targetOrder };
      }
      if (isMovingDown) {
        if (view.order > sourceOrder && view.order <= targetOrder) {
          return { ...view, order: view.order - 1 };
        }
      } else {
        if (view.order >= targetOrder && view.order < sourceOrder) {
          return { ...view, order: view.order + 1 };
        }
      }
      return view;
    });

    // Update all affected views
    updatedViews.forEach(view => {
      updateView(view);
    });

    setDraggedView(null);
    setDragOverViewId(null);
  };

  // Get visible views sorted by order
  const visibleViews = views
    .filter(view => view.visible)
    .sort((a, b) => a.order - b.order);

  // Check scrollable status after render and when views change
  useEffect(() => {
    // Small delay to ensure content has rendered
    const timer = setTimeout(() => {
      visibleViews.forEach(view => {
        checkScrollable(view.id, contentRefs.current[view.id]);
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [visibleViews, globalFilterTags, expandedViews]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          ADHD Tracker Dashboard
        </Typography>
        <Fab color="primary" aria-label="add" onClick={handleAddViewDialogOpen}>
          <AddIcon />
        </Fab>
      </Box>

      {/* Global Tag Filter */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Global Filter</Typography>
        </Box>
        <TagFilter 
          selectedTags={globalFilterTags} 
          onChange={setGlobalFilterTags}
        />
        {globalFilterTags.length > 0 && (
          <Typography variant="body2" color="text.secondary" mt={1}>
            Filtering all cards with {globalFilterTags.length} {globalFilterTags.length === 1 ? 'tag' : 'tags'}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        {visibleViews.map((view) => (
          <Box 
            key={view.id} 
            draggable
            onDragStart={() => handleDragStart(view)}
            onDragOver={(e) => handleDragOver(e, view.id)}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, view.id)}
            sx={{ 
              width: { 
                xs: '100%', 
                md: 'calc(50% - 24px)', 
                lg: 'calc(33.33% - 24px)' 
              },
              cursor: 'move',
              opacity: draggedView?.id === view.id ? 0.5 : 1,
              transform: dragOverViewId === view.id ? 'scale(1.02)' : 'none',
              transition: 'transform 0.2s ease, opacity 0.2s ease',
            }}
          >
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 'auto',
                position: 'relative',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.shadows[4],
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  {view.title}
                </Typography>
                <Box sx={{ display: 'flex' }}>
                  {/* Only show expand button if content is scrollable */}
                  {scrollableViews.has(view.id) && (
                    <Tooltip title={expandedViews.has(view.id) ? "Collapse" : "Expand"}>
                      <IconButton 
                        aria-label="expand" 
                        onClick={() => handleToggleExpand(view.id)}
                        sx={{
                          transform: expandedViews.has(view.id) ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease',
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <IconButton 
                    aria-label="more" 
                    onClick={(e) => handleMenuOpen(e, view.id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Box>
              <Box 
                ref={setContentRef(view.id)}
                sx={{ 
                  flexGrow: 1,
                  position: 'relative',
                  mb: 1,
                }}
              >
                {renderViewComponent(view)}
              </Box>
            </Paper>
          </Box>
        ))}
      </Box>

      {/* View options menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditView}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleToggleVisibility}>
          {activeViewId && views.find(v => v.id === activeViewId)?.visible ? (
            <>
              <VisibilityOffIcon fontSize="small" sx={{ mr: 1 }} />
              Hide
            </>
          ) : (
            <>
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
              Show
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleDeleteView}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add View Dialog */}
      <Dialog open={isAddViewDialogOpen} onClose={handleAddViewDialogClose}>
        <DialogTitle>Add New View</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="View Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newViewTitle}
            onChange={(e) => setNewViewTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel id="view-type-label">View Type</InputLabel>
            <Select
              labelId="view-type-label"
              id="view-type"
              value={newViewType}
              label="View Type"
              onChange={handleViewTypeChange}
            >
              <MenuItem value="sleep">Sleep Tracker</MenuItem>
              <MenuItem value="screenTime">Screen Time</MenuItem>
              <MenuItem value="medication">Medication</MenuItem>
              <MenuItem value="todo">To-Do List</MenuItem>
              <MenuItem value="calendar">Calendar</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddViewDialogClose}>Cancel</Button>
          <Button onClick={handleAddView} disabled={!newViewTitle}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit View Dialog */}
      <Dialog open={isEditViewDialogOpen} onClose={handleEditViewDialogClose}>
        <DialogTitle>Edit View</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="edit-title"
            label="View Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newViewTitle}
            onChange={(e) => setNewViewTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel id="edit-view-type-label">View Type</InputLabel>
            <Select
              labelId="edit-view-type-label"
              id="edit-view-type"
              value={newViewType}
              label="View Type"
              onChange={handleViewTypeChange}
            >
              <MenuItem value="sleep">Sleep Tracker</MenuItem>
              <MenuItem value="screenTime">Screen Time</MenuItem>
              <MenuItem value="medication">Medication</MenuItem>
              <MenuItem value="todo">To-Do List</MenuItem>
              <MenuItem value="calendar">Calendar</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditViewDialogClose}>Cancel</Button>
          <Button onClick={handleSaveEditView} disabled={!newViewTitle}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;