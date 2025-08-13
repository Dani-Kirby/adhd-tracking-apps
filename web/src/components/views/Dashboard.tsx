import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper,
  Typography, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem,
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
import { BloodPressureTracker } from '../views/BloodPressureTracker';
import { TagFilter } from '../common/TagComponents';

const Dashboard: React.FC = () => {
  const { views, addView, updateView, deleteView, toggleViewVisibility } = useViews();
  const renderCount = React.useRef(0);
  
  // Component state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [isAddViewDialogOpen, setIsAddViewDialogOpen] = useState(false);
  const [isEditViewDialogOpen, setIsEditViewDialogOpen] = useState(false);
  const [newViewTitle, setNewViewTitle] = useState('');
  const [newViewType, setNewViewType] = useState<ViewType>('sleep');
  const [globalFilterTags, setGlobalFilterTags] = useState<Tag[]>([]);
  const [expandedViews, setExpandedViews] = useState<Set<string>>(new Set());
  const [scrollableViews, setScrollableViews] = useState<Set<string>>(new Set());
  const [showHiddenViews, setShowHiddenViews] = useState(false);
  
  // Memoize views lists to prevent unnecessary re-renders
  const visibleViews = React.useMemo(() => 
    views.filter(v => v.visible).sort((a, b) => a.order - b.order),
    [views]
  );
  
  const hiddenViews = React.useMemo(() => 
    views.filter(v => !v.visible).sort((a, b) => a.order - b.order),
    [views]
  );
  
  // Track renders and state changes
  React.useEffect(() => {
    renderCount.current += 1;
    console.log(`[Dashboard] Render #${renderCount.current}`, {
      reason: 'views or visible state changed',
      views,
      visibleViews,
      hiddenViews,
      expandedViews: Array.from(expandedViews),
      scrollableViews: Array.from(scrollableViews)
    });
  }, [views, visibleViews, hiddenViews, expandedViews, scrollableViews]);
  
  // Debug: Clear all localStorage and reload
  const handleClearAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, viewId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveViewId(viewId);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    // Only clear activeViewId if we're not showing the delete dialog
    if (!isDeleteConfirmOpen) {
      setActiveViewId(null);
    }
  };

  // Handle view visibility toggle
  const handleToggleVisibility = () => {
    if (activeViewId) {
      toggleViewVisibility(activeViewId);
    }
    setMenuAnchorEl(null);
  };

  // Handle view deletion
  // Open the delete confirmation dialog
  const handleDeleteView = () => {
    // Keep the activeViewId but close the menu
    setIsDeleteConfirmOpen(true);
    setMenuAnchorEl(null);
  };

  // Confirm deletion with proper cleanup
  const handleConfirmDeleteView = () => {
    // Capture the ID first since we're about to close dialogs
    const viewToDelete = activeViewId;
    
    if (!viewToDelete) {
      console.warn('[Dashboard] No active view ID for deletion');
      return;
    }
    
    console.log('[Dashboard] Deleting view:', viewToDelete);
    
    // Close UI elements first
    setIsDeleteConfirmOpen(false);
    setActiveViewId(null);
    setMenuAnchorEl(null);
    
    // Use a small delay to ensure UI updates complete before deletion
    requestAnimationFrame(() => {
      deleteView(viewToDelete);
    });
  };

  // Cancel deletion
  const handleCancelDeleteView = () => {
    setIsDeleteConfirmOpen(false);
    setActiveViewId(null);
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

  // Handle dialogs with proper focus management
  const handleAddViewDialogOpen = React.useCallback(() => {
    setNewViewTitle('');
    setNewViewType('sleep');
    setIsAddViewDialogOpen(true);
  }, []);

  const handleAddViewDialogClose = React.useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    setIsAddViewDialogOpen(false);
    // Wait for dialog to close before restoring focus
    setTimeout(() => {
      if (activeElement) {
        activeElement.blur();
      }
    }, 0);
  }, []);

  const handleEditViewDialogClose = React.useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    setIsEditViewDialogOpen(false);
    // Wait for dialog to close before restoring focus
    setTimeout(() => {
      if (activeElement) {
        activeElement.blur();
      }
    }, 0);
  }, []);

  // Handle add view with proper cleanup
  const handleAddView = () => {
    if (!newViewTitle.trim() || !newViewType) return;
    
    // Add the view first
    addView(newViewType, newViewTitle);
    
    // Then reset form and close dialog
    setNewViewTitle('');
    setNewViewType('sleep');
    setIsAddViewDialogOpen(false);
  };

  // Handle edit view with proper cleanup
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
    // Reset form state
    setNewViewTitle('');
    setNewViewType('sleep');
    // Close dialog with proper focus management
    const activeElement = document.activeElement as HTMLElement;
    setIsEditViewDialogOpen(false);
    // Wait for dialog to close before restoring focus
    setTimeout(() => {
      if (activeElement) {
        activeElement.blur();
      }
    }, 0);
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

  // Create a ref to store contentRefs
  const contentRefs = React.useRef<{[key: string]: HTMLElement | null}>({});

  // Create a stable ref callback
  const setContentRef = React.useCallback((viewId: string) => (el: HTMLElement | null) => {
    contentRefs.current[viewId] = el;
  }, []);
  
  // Memoized view components to prevent unnecessary re-renders
  // Render the appropriate component based on view type, passing the user-specified title as a prop
  const renderViewComponent = React.useCallback((view: ViewConfig) => {
    switch (view.type) {
      case 'sleep':
        return <SleepTracker globalFilterTags={globalFilterTags} viewId={view.id} />;
      case 'screenTime':
        return <ScreenTimeTracker globalFilterTags={globalFilterTags} viewId={view.id} />;
      case 'medication':
        return <MedicationTracker globalFilterTags={globalFilterTags} viewId={view.id} />;
      case 'todo':
        return <TodoList globalFilterTags={globalFilterTags} viewTitle={view.title} viewId={view.id} />;
      case 'calendar':
        return <Calendar globalFilterTags={globalFilterTags} viewTitle={view.title} viewId={view.id} />;
      case 'bloodPressure':
        return <BloodPressureTracker globalFilterTags={globalFilterTags} viewId={view.id} />;
      default:
        return <Typography>Unknown view type</Typography>;
    }
  }, [globalFilterTags]);

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

  // Separate effects to avoid unnecessary re-runs
  
  // Memoized scrollable check to prevent unnecessary updates
  const debouncedCheckScrollable = React.useCallback(() => {
    console.log('[Dashboard] Checking scrollable status for views');
    const updates = new Set<string>();
    
    visibleViews.forEach(view => {
      const containerEl = contentRefs.current[view.id];
      if (containerEl) {
        const isScrollable = containerEl.scrollHeight > containerEl.clientHeight;
        if (isScrollable) {
          updates.add(view.id);
        }
      }
    });

    // Only update state if the scrollable views have actually changed
    setScrollableViews(prev => {
      const prevArray = Array.from(prev);
      const updatesArray = Array.from(updates);
      
      if (prevArray.length !== updatesArray.length || 
          !prevArray.every(id => updates.has(id))) {
        console.log('[Dashboard] Updating scrollable views:', updatesArray);
        return updates;
      }
      return prev;
    });
  }, [visibleViews]);

  // Only check scrollable status when views are added/removed or expanded/collapsed
  useEffect(() => {
    // Skip the initial mount
    if (renderCount.current === 0) {
      renderCount.current = 1;
      return;
    }

    const timer = setTimeout(() => {
      console.log('[Dashboard] Running delayed scrollable check');
      debouncedCheckScrollable();
    }, 100);

    return () => clearTimeout(timer);
  }, [visibleViews, expandedViews, debouncedCheckScrollable]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        position: 'relative'
      }}>
        <Typography variant="h4" component="h1">
          ADHD Tracker Dashboard
        </Typography>
      </Box>

      {/* Global Tag Filter with Add View Fab */}
      <Box 
        sx={{ 
          mb: 4, 
          p: 3, 
          bgcolor: 'background.paper', 
          borderRadius: 2,
          boxShadow: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <FilterListIcon sx={{ mr: 1.5, color: 'primary.main' }} />
            <Typography 
              variant="h6" 
              sx={{ 
                mr: 3, 
                minWidth: 110,
                fontWeight: 500,
                color: 'text.primary'
              }}
            >
              Global Filter
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            aria-label="Add new dashboard view"
            onClick={handleAddViewDialogOpen}
            sx={{
              px: 3,
              py: 1,
              fontWeight: 500,
              textTransform: 'none',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              borderRadius: 2,
              whiteSpace: 'nowrap',
              minHeight: 40,
              ml: { xs: 1, sm: 2 },
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 1
              }
            }}
          >
            Add View
          </Button>
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

      {/* Hidden Views Toggle */}
      <Box sx={{ mb: 3 }}>
        <Button
          onClick={() => setShowHiddenViews(!showHiddenViews)}
          startIcon={showHiddenViews ? <VisibilityOffIcon /> : <VisibilityIcon />}
          variant="text"
          color="inherit"
          sx={{ mb: 2 }}
        >
          {showHiddenViews ? "Hide Hidden Views" : "Show Hidden Views"}
          {hiddenViews.length > 0 && ` (${hiddenViews.length})`}
        </Button>
      </Box>

      {/* Hidden Views Section */}
      {showHiddenViews && hiddenViews.length > 0 && (
        <Box sx={{ 
          mb: 4,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: '1px dashed',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Hidden Views</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {hiddenViews.map((view) => (
              <Paper
                key={view.id}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: { xs: '100%', sm: 'auto', minWidth: 250 },
                  opacity: 0.8,
                  '&:hover': {
                    opacity: 1
                  }
                }}
              >
                <Typography variant="body1" sx={{ mr: 2 }}>{view.title}</Typography>
                <Button
                  startIcon={<VisibilityIcon />}
                  size="small"
                  onClick={() => toggleViewVisibility(view.id)}
                >
                  Show
                </Button>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {/* Main Views Grid */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'repeat(2, 1fr)',
            xl: 'repeat(3, 1fr)'
          },
          gap: { xs: 2, sm: 3, md: 4 },
          mb: 4
        }}
      >
        {visibleViews.map((view) => (
          <Box 
            key={view.id} 
            draggable
            onDragStart={() => handleDragStart(view)}
            onDragOver={(e) => handleDragOver(e, view.id)}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, view.id)}
            sx={{ 
              width: '100%',
              cursor: 'move',
              opacity: draggedView?.id === view.id ? 0.5 : 1,
              transform: dragOverViewId === view.id ? 'scale(1.02)' : 'none',
              transition: 'transform 0.2s ease, opacity 0.2s ease',
              mb: 1,
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: { xs: 3, sm: 4 },
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                borderRadius: 2,
                bgcolor: 'background.paper',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.shadows[3],
                },
                '& > *:not(:last-child)': {
                  mb: 3
                }
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  pb: 2,
                  position: 'relative',
                  zIndex: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box>
                  <Typography 
                    variant="h6" 
                    component="h2"
                    sx={{ 
                      fontWeight: 500,
                      color: 'text.primary'
                    }}
                  >
                    {view.title}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {/* Only show expand button if content is scrollable */}
                  {scrollableViews.has(view.id) && (
                    <Tooltip title={expandedViews.has(view.id) ? "Collapse" : "Expand"}>
                      <IconButton 
                        aria-label="expand" 
                        onClick={() => handleToggleExpand(view.id)}
                        size="small"
                        sx={{
                          transform: expandedViews.has(view.id) ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease',
                          mr: 0.5,
                          color: 'text.secondary'
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <IconButton 
                    aria-label="more" 
                    onClick={(e) => handleMenuOpen(e, view.id)}
                    size="small"
                    sx={{ color: 'text.secondary' }}
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
                  mb: 2,
                  overflow: 'hidden',
                  '& > *': {
                    // Apply to all direct children of the content box
                    mb: { xs: 1, sm: 2 }
                  }
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

      {/* Debug: Clear all data button (visible only in development) */}
      {process.env.NODE_ENV !== 'production' && (
        <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 2000 }}>
          <Button variant="contained" color="warning" onClick={handleClearAllData}>
            Clear All Data (Debug)
          </Button>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={isDeleteConfirmOpen} 
        onClose={handleCancelDeleteView}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        disableEscapeKeyDown
      >
        <DialogTitle id="delete-dialog-title">Delete View</DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            Are you sure you want to delete this view? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDeleteView} autoFocus>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDeleteView} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
              <MenuItem value="bloodPressure">Blood Pressure</MenuItem>
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
              <MenuItem value="bloodPressure">Blood Pressure</MenuItem>
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