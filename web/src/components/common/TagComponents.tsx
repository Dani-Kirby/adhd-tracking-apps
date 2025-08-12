import React, { useState } from 'react';
import {
  Chip,
  Box,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  IconButton,
  Button,
  Tooltip,
  Typography,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Label as LabelIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useTags } from '../../contexts/AppProvider';
import { Tag } from '../../types';

// Component for selecting and adding tags to an item
export const TagSelector: React.FC<{
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
  label?: string;
}> = ({ selectedTags, onChange, label = 'Tags' }) => {
  const { tags, addTag } = useTags();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [showNewTagDialog, setShowNewTagDialog] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleTag = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    
    if (isSelected) {
      onChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const handleNewTagDialogOpen = () => {
    setShowNewTagDialog(true);
    handleClose();
  };

  const handleNewTagDialogClose = () => {
    setShowNewTagDialog(false);
    setNewTagName('');
  };

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      addTag(newTagName.trim());
      // The new tag will appear in the tags list from context
      handleNewTagDialogClose();
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'tag-selector-popover' : undefined;

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        {selectedTags.map((tag) => (
          <Chip
            key={tag.id}
            label={tag.name}
            sx={{ backgroundColor: tag.color, color: 'white' }}
            onDelete={() => handleToggleTag(tag)}
            size="small"
          />
        ))}
        <Tooltip title="Add Tags">
          <Chip
            component="div"
            icon={<AddIcon />}
            label="Add Tags"
            variant="outlined"
            onClick={handleClick}
            size="small"
          />
        </Tooltip>
      </Box>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ width: 250, maxHeight: 300 }}>
          <List dense>
            {tags.map((tag) => (
              <ListItem key={tag.id} disablePadding>
                <ListItemButton onClick={() => handleToggleTag(tag)}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: tag.color,
                      mr: 1,
                    }}
                  />
                  <ListItemText primary={tag.name} />
                  {selectedTags.some(t => t.id === tag.id) && (
                    <Chip size="small" label="Added" />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
            <Divider />
            <ListItem>
              <Button
                fullWidth
                startIcon={<AddIcon />}
                onClick={handleNewTagDialogOpen}
                size="small"
              >
                Create New Tag
              </Button>
            </ListItem>
          </List>
        </Box>
      </Popover>

      <Dialog open={showNewTagDialog} onClose={handleNewTagDialogClose}>
        <DialogTitle>Create New Tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tag Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNewTagDialogClose}>Cancel</Button>
          <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Component for filtering items by tags
export const TagFilter: React.FC<{
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
}> = ({ selectedTags, onChange }) => {
  const { tags } = useTags();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleTag = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    
    if (isSelected) {
      onChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'tag-filter-popover' : undefined;

  return (
    <Box>
      <Button
        startIcon={<FilterIcon />}
        endIcon={selectedTags.length > 0 ? <Chip size="small" label={selectedTags.length} /> : null}
        onClick={handleClick}
        variant={selectedTags.length > 0 ? "contained" : "outlined"}
        size="small"
      >
        Filter by Tags
      </Button>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ width: 250, maxHeight: 300, p: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Filter by Tags
          </Typography>
          
          <List dense>
            {tags.map((tag) => (
              <ListItem key={tag.id} disablePadding>
                <ListItemButton onClick={() => handleToggleTag(tag)}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: tag.color,
                      mr: 1,
                    }}
                  />
                  <ListItemText primary={tag.name} />
                  {selectedTags.some(t => t.id === tag.id) && (
                    <Chip size="small" label="Selected" />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          {selectedTags.length > 0 && (
            <Button
              fullWidth
              startIcon={<CloseIcon />}
              onClick={handleClearAll}
              size="small"
              sx={{ mt: 1 }}
            >
              Clear All Filters
            </Button>
          )}
        </Box>
      </Popover>
      
      {selectedTags.length > 0 && (
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selectedTags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              size="small"
              sx={{ backgroundColor: tag.color, color: 'white' }}
              onDelete={() => handleToggleTag(tag)}
            />
          ))}
          <Chip
            component="div"
            label="Clear All"
            size="small"
            variant="outlined"
            onClick={handleClearAll}
          />
        </Box>
      )}
    </Box>
  );
};

// Component to display a list of tags
export const TagList: React.FC<{
  tags: Tag[];
  small?: boolean;
}> = ({ tags, small = false }) => {
  if (tags.length === 0) return null;
  
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: small ? 0 : 1 }}>
      {tags.map((tag) => (
        <Chip
          key={tag.id}
          label={tag.name}
          size={small ? "small" : "medium"}
          sx={{ backgroundColor: tag.color, color: 'white' }}
        />
      ))}
    </Box>
  );
};