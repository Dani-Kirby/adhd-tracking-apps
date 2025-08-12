import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Avatar,
  Container,
  Divider,
  Stack,
  Tooltip
} from '@mui/material';
import { 
  Google as GoogleIcon,
  Logout as LogoutIcon,
  PersonOutline as GuestIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AppProvider';

interface LoginProps {
  children: React.ReactNode;
}

const Login: React.FC<LoginProps> = ({ children }) => {
  const { currentUser, isGuest, signInWithGoogle, continueAsGuest, logout } = useAuth();

  // User is not logged in or in guest mode, show login screen
  if (!currentUser && !isGuest) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center'
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            ADHD Tracker
          </Typography>
          
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Sign in to access your personalized ADHD tracking dashboard
          </Typography>
          
          <Stack spacing={2} width="100%">
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={signInWithGoogle}
              size="large"
              sx={{ py: 1 }}
            >
              Sign in with Google
            </Button>
            
            <Divider>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>
            
            <Button 
              variant="outlined"
              color="secondary"
              fullWidth
              startIcon={<GuestIcon />}
              onClick={continueAsGuest}
              size="large"
              sx={{ py: 1 }}
            >
              Continue as Guest
            </Button>
            
            <Typography variant="caption" color="text.secondary" align="center">
              Guest data is stored locally and will be migrated if you sign in later
            </Typography>
          </Stack>
          
          <Box sx={{ mt: 4, width: '100%' }}>
            <Divider sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Features
              </Typography>
            </Divider>
            
            <Typography variant="body2" paragraph>
              • Track sleep, screen time, medication, to-dos, and calendar events
            </Typography>
            <Typography variant="body2" paragraph>
              • Customizable dashboard views
            </Typography>
            <Typography variant="body2" paragraph>
              • Multi-user support with Google login or guest mode
            </Typography>
            <Typography variant="body2" paragraph>
              • Tag and filter your data
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  // User is logged in or in guest mode, render the main app with a user info/logout option
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16, 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center',
          gap: 1
        }}
      >
        {isGuest ? (
          <>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              <GuestIcon fontSize="small" />
            </Avatar>
            <Typography variant="body2" sx={{ mr: 1 }}>
              Guest User
            </Typography>
            <Tooltip title="Sign in to save your data to the cloud">
              <Button 
                variant="outlined" 
                size="small" 
                color="primary"
                onClick={signInWithGoogle}
                startIcon={<GoogleIcon />}
                sx={{ mr: 1 }}
              >
                Sign In
              </Button>
            </Tooltip>
          </>
        ) : currentUser && (
          <>
            {currentUser.photoURL ? (
              <Avatar 
                src={currentUser.photoURL} 
                alt={currentUser.displayName || 'User'} 
                sx={{ width: 32, height: 32 }}
              />
            ) : (
              <Avatar sx={{ width: 32, height: 32 }}>
                {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
              </Avatar>
            )}
            <Typography variant="body2" sx={{ mr: 1 }}>
              {currentUser.displayName || currentUser.email}
            </Typography>
          </>
        )}
        
        <Button 
          variant="outlined" 
          size="small" 
          onClick={logout} 
          startIcon={<LogoutIcon />}
        >
          Logout
        </Button>
      </Box>
      
      {/* Render the main app content */}
      {children}
    </Box>
  );
};

export default Login;