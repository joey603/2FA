import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import authService from '../services/api';

interface LocationState {
  email?: string;
}

const Verify: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from location state if available
  useEffect(() => {
    const state = location.state as LocationState;
    if (state && state.email) {
      setEmail(state.email);
    }
  }, [location]);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Basic validation
    if (!verificationCode) {
      setError('Please enter the verification code');
      setSuccess('');
      return;
    }
    
    if (!email) {
      setError('Please enter your email address');
      setSuccess('');
      return;
    }
    
    // Format the verification code (trim spaces and ensure it's a string)
    const formattedCode = verificationCode.trim();
    
    console.log('Submitting verification:', {
      email,
      code: formattedCode
    });
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await authService.verifyEmail(email, formattedCode);
      
      if (response.success) {
        setSuccess(response.message || 'Email verified successfully! You can now login.');
        
        // Redirect to login page after successful verification
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        console.error('Verification failed:', response);
        setError(response.message || 'Invalid verification code. Please check your email and try again.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setResendLoading(true);
    setError('');
    
    try {
      const response = await authService.resendVerification(email);
      
      if (response.success) {
        setSuccess(response.message || 'Verification code resent successfully!');
      } else {
        setError(response.message || 'Failed to send verification code. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Resend verification error:', err);
    } finally {
      setResendLoading(false);
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
        <Avatar sx={{ m: 1, bgcolor: 'success.main' }}>
          <VerifiedUserIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Verify your email
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2, textAlign: 'center' }}>
          We have sent a verification code to your email address.
          Please enter it below to verify your account.
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
        
        {!success && (
          <>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                required
                  fullWidth
                  id="email"
                label="Your Email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || resendLoading}
                />
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="verificationCode"
                label="Verification Code"
                name="verificationCode"
                autoComplete="off"
                autoFocus
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\s/g, ''))}
                placeholder="Enter your 6-digit code"
                disabled={loading}
                inputProps={{ 
                  maxLength: 6,
                  pattern: '[0-9]*',
                  inputMode: 'numeric'
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                color="success"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify'}
              </Button>
              
              <Grid container>
                <Grid item xs>
                  <Button
                    variant="text"
                    onClick={handleResendCode}
                    disabled={resendLoading || !email}
                    sx={{ textTransform: 'none' }}
                  >
                    {resendLoading ? <CircularProgress size={16} /> : 'Resend verification code'}
                  </Button>
                </Grid>
                <Grid item>
                  <Link component={RouterLink} to="/login" variant="body2">
                    Back to login
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default Verify; 