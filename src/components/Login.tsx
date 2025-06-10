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
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { InputAdornment, IconButton } from '@mui/material';
import authService from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  // Validate email format
  const isEmailValid = (email: string): boolean => {
    if (!email) return true; // Empty is valid for now (required check happens on submit)
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

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Reset error message
    setError('');
    
    // Validate email on submit
    validateEmail(email);
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    // Validate email format before submission
    if (!isEmailValid(email)) {
      setError('Please correct the errors in the form');
      return;
    }
    
    // Set loading state
    setLoading(true);
    
    try {
      // Call the login API
      const response = await authService.login({
        email,
        password
      });
      
      // Log the response for debugging
      console.log('Login response:', response);
      
      // Handle response
      if (response.success && response.token) {
        // Redirect to home or dashboard page
        navigate('/');
      } else {
        const errorMessage = response.message || response.error || '';
        
        // If the message contains verification or invalid credentials
        if (
          errorMessage.toLowerCase().includes('verify') ||
          errorMessage.toLowerCase().includes('not verified') ||
          errorMessage.toLowerCase().includes('account not verified')
        ) {
          // Account not verified
          setError('Your account is not verified. Please verify your email before logging in.');
          
          // Redirect to verification page immediately
          navigate('/verify', { state: { email } });
        } else {
          setError(errorMessage || 'Invalid email or password. Please check your credentials and try again.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Login error:', err);
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
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
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
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
          <Grid container>
            <Grid item xs>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
};

export default Login; 