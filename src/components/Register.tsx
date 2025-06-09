import React, { useState, ChangeEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import authService from '../services/api';

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Field validation states
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // Track if fields have been touched (interacted with)
  const [emailTouched, setEmailTouched] = useState(false);
  
  const navigate = useNavigate();

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validate email format
  const isEmailValid = (email: string): boolean => {
    if (!email) return true; // Empty is valid for now (required check happens on submit)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const isPasswordStrong = (password: string): boolean => {
    // At least 8 characters, contains at least one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  // Validate individual field
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'firstName':
        return value.trim() === '' ? 'First name is required' : 
               value.length < 2 ? 'First name must be at least 2 characters' : '';
      case 'lastName':
        return value.trim() === '' ? 'Last name is required' : 
               value.length < 2 ? 'Last name must be at least 2 characters' : '';
      case 'email':
        return value.trim() === '' ? 'Email is required' : 
               !isEmailValid(value) ? 'Please enter a valid email address' : '';
      case 'password':
        return value.trim() === '' ? 'Password is required' : 
               !isPasswordStrong(value) ? 'Password must be at least 8 characters and contain uppercase, lowercase, and numbers' : '';
      case 'confirmPassword':
        return value.trim() === '' ? 'Please confirm your password' : 
               value !== password ? 'Passwords do not match' : '';
      default:
        return '';
    }
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

  // Handle input change and validate in real-time
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    const { value } = e.target;
    
    // Update field value
    switch (field) {
      case 'firstName':
        setFirstName(value);
        setFirstNameError(validateField(field, value));
        break;
      case 'lastName':
        setLastName(value);
        setLastNameError(validateField(field, value));
        break;
      case 'password':
        setPassword(value);
        setPasswordError(validateField(field, value));
        // Also validate confirm password since it depends on password
        if (confirmPassword) {
          setConfirmPasswordError(validateField('confirmPassword', confirmPassword));
        }
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        setConfirmPasswordError(validateField(field, value));
        break;
      default:
        break;
    }
  };

  // Reset form
  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setEmailTouched(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess('');
    
    // Validate all fields
    const newFirstNameError = validateField('firstName', firstName);
    const newLastNameError = validateField('lastName', lastName);
    const newEmailError = validateField('email', email);
    const newPasswordError = validateField('password', password);
    const newConfirmPasswordError = validateField('confirmPassword', confirmPassword);
    
    // Update error states
    setFirstNameError(newFirstNameError);
    setLastNameError(newLastNameError);
    setEmailError(newEmailError);
    setPasswordError(newPasswordError);
    setConfirmPasswordError(newConfirmPasswordError);
    
    // Check if there are any validation errors
    if (newFirstNameError || newLastNameError || newEmailError || 
        newPasswordError || newConfirmPasswordError) {
      setError('Please fix the errors in the form');
      return;
    }
    
    // Set loading state
    setLoading(true);
    
    try {
      // Log the data being sent to the API (for debugging)
      console.log('Sending registration data:', {
        firstName,
        lastName,
        email,
        password
      });
      
      // Call the register API
      const response = await authService.register({
        firstName,
        lastName,
        email,
        password
      });
      
      console.log('Registration response:', response);
      
      // Handle response
      if (response.success) {
        setSuccess(response.message || 'Registration successful! Please check your email to verify your account.');
        resetForm(); // Clear the form on success
        
        // Wait 2 seconds then redirect to verification page
        setTimeout(() => {
          navigate('/verify', { state: { email } });
        }, 2000);
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Try to extract more detailed error information
      let errorMessage = 'An unexpected error occurred. Please try again later.';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        
        if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your internet connection.';
      } else if (err.message) {
        // Something happened in setting up the request that triggered an Error
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
            {success}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
                value={firstName}
                onChange={(e) => handleInputChange(e, 'firstName')}
                error={!!firstNameError}
                helperText={firstNameError}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => handleInputChange(e, 'lastName')}
                error={!!lastNameError}
                helperText={lastNameError}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                error={!!emailError}
                helperText={emailError}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => handleInputChange(e, 'password')}
                error={!!passwordError}
                helperText={passwordError || 'Password must be at least 8 characters with uppercase, lowercase, and numbers'}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => handleInputChange(e, 'confirmPassword')}
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
                disabled={loading}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
};

export default Register; 