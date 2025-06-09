import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  Alert,
  Box,
  CircularProgress,
  Typography,
  DialogContentText
} from '@mui/material';
import authService from '../services/api';

interface DeleteAccountProps {
  open: boolean;
  onClose: () => void;
}

const DeleteAccount: React.FC<DeleteAccountProps> = ({ open, onClose }) => {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error
    setError('');
    
    // Validate inputs
    if (!password) {
      setError('Please enter your password to confirm deletion');
      return;
    }
    
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE in capital letters to confirm');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.deleteAccount({
        password
      });
      
      if (response.success) {
        // Logout and redirect to login page
        authService.logout();
        navigate('/login');
      } else {
        // Check for specific error messages
        if (response.message && response.message.includes('Password is incorrect')) {
          setError('The password you entered is incorrect. Account deletion canceled.');
        } else {
          setError(response.message || 'Failed to delete account');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    // Clear form and errors when closing
    setPassword('');
    setConfirmText('');
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderTop: '4px solid #f44336'
        }
      }}
    >
      <DialogTitle sx={{ color: '#f44336' }}>Delete Your Account</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          <Typography variant="body1" paragraph>
            <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            To confirm deletion, please enter your password and type DELETE in capital letters in the confirmation field.
          </Typography>
        </DialogContentText>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Your Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            error={typeof error === 'string' && error.toLowerCase().includes('password')}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmText"
            label="Type DELETE to confirm"
            type="text"
            id="confirmText"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={loading}
            error={typeof error === 'string' && error.toLowerCase().includes('delete')}
            helperText="Please type DELETE in capital letters"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="error" 
          variant="contained"
          disabled={loading || confirmText !== 'DELETE'}
          sx={{ 
            bgcolor: '#f44336',
            '&:hover': {
              bgcolor: '#d32f2f'
            }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Delete Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAccount; 