import React, { useState, ChangeEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockResetIcon from '@mui/icons-material/LockReset';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import authService from '../services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Validate email format
  const isEmailValid = (email: string): boolean => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email input change with real-time validation
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Set touched to true once user has entered something
    if (!emailTouched && value) {
      setEmailTouched(true);
    }
    
    // Validate in real-time after first input
    if (emailTouched) {
      validateEmail(value);
    }
  };
  
  // Handle email field blur - validate when user leaves the field
  const handleEmailBlur = () => {
    setEmailTouched(true);
    validateEmail(email);
  };
  
  // Email validation function
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('Email is required');
    } else if (!isEmailValid(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess(false);
    
    // Validate email on submit
    validateEmail(email);
    
    // Basic validation
    if (!email || !isEmailValid(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Set loading state
    setLoading(true);
    
    try {
      // Call the forgot password API
      const response = await authService.forgotPassword({
        email
      });
      
      // Always show success for security (even if email not found)
      if (response.success) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(response.message || 'An error occurred. Please try again later.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={6} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockResetIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
            If your email is registered, you will receive a password reset link. Please check your inbox and spam folder.
          </Alert>
        )}
        
        {!success && (
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter your email address below and we'll send you a link to reset your password.
            </Typography>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              error={!!emailError}
              helperText={emailError}
              disabled={loading}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
            </Button>
            
            <Grid container justifyContent="center">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  Back to login
                </Link>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ForgotPassword; 