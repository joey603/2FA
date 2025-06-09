import React, { useState } from 'react';
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
  Link,
  Typography,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import authService from '../services/api';

interface ChangePasswordProps {
  open: boolean;
  onClose: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ open, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Toggle password visibility
  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };
  
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };
  
  // Validation for password strength
  const isPasswordStrong = (password: string): boolean => {
    // At least 8 characters, contains at least one number and one letter
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess('');
    
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    // Check password strength
    if (!isPasswordStrong(newPassword)) {
      setError('New password must be at least 8 characters long and contain at least one letter and one number');
      return;
    }
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    // Check if new password is different from current
    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword
      });
      
      if (response.success) {
        setSuccess(response.message || 'Password changed successfully');
        
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Close dialog after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        // Check for specific error messages
        if (response.message && response.message.includes('Current password is incorrect')) {
          setError('The current password you entered is incorrect. Please try again.');
        } else {
          setError(response.message || 'Failed to change password');
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
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="currentPassword"
            label="Current Password"
            type={showCurrentPassword ? 'text' : 'password'}
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={loading}
            error={typeof error === 'string' && error.toLowerCase().includes('current password')}
            helperText={typeof error === 'string' && error.toLowerCase().includes('current password') 
              ? "Please enter your current password correctly" 
              : "Enter your current password to authorize this change"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleCurrentPasswordVisibility}
                    edge="end"
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'small' }}>
            <Link component={RouterLink} to="/forgot-password" onClick={handleClose} variant="body2">
              Forgot your password?
            </Link>
          </Typography>
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            helperText="Password must be at least 8 characters and contain at least one letter and one number"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleNewPasswordVisibility}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Change Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePassword; 