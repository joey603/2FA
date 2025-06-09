import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  Security as SecurityIcon,
  VerifiedUser as VerifiedUserIcon,
  LockOpen as LockOpenIcon,
  Email as EmailIcon,
  VpnKey as VpnKeyIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Password as PasswordIcon,
  DeleteForever as DeleteForeverIcon
} from '@mui/icons-material';
import authService from '../services/api';
import ChangePassword from './ChangePassword';
import DeleteAccount from './DeleteAccount';

const HomePage: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [changePasswordOpen, setChangePasswordOpen] = useState<boolean>(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response.success && response.data) {
          setUserData(response.data);
        } else if (response.success && response.user) {
          // Fallback au cas où les données sont dans response.user
          setUserData({
            id: response.user.id,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            isVerified: true,
            createdAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleOpenChangePassword = () => {
    setChangePasswordOpen(true);
  };

  const handleCloseChangePassword = () => {
    setChangePasswordOpen(false);
  };

  const handleOpenDeleteAccount = () => {
    setDeleteAccountOpen(true);
  };

  const handleCloseDeleteAccount = () => {
    setDeleteAccountOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          maxWidth: '800px',
          mx: 'auto'
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'primary.main',
              mx: 'auto',
              mb: 2
            }}
          >
            <SecurityIcon fontSize="large" />
          </Avatar>
          <Typography variant="h4" component="h1" gutterBottom>
            Secure Authentication Demo
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Welcome{userData ? `, ${userData.firstName} ${userData.lastName}` : ''}!
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {userData && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Your Account Information
            </Typography>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1">
                      {userData.firstName} {userData.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {userData.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Account Status
                    </Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <VerifiedUserIcon color="success" sx={{ mr: 1 }} fontSize="small" />
                      Verified
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Member Since
                    </Typography>
                    <Typography variant="body1">
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={handleLogout}
                >
                  Log Out
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={handleOpenChangePassword}
                  startIcon={<PasswordIcon />}
                >
                  Change Password
                </Button>
              </Stack>
              
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleOpenDeleteAccount}
                startIcon={<DeleteForeverIcon />}
                sx={{ mt: { xs: 2, sm: 0 } }}
              >
                Delete Account
              </Button>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom>
          About This Project
        </Typography>
        
        <Typography variant="body1" paragraph>
          This authentication demo showcases best practices for secure user authentication in modern web applications. The project demonstrates the implementation of multi-factor authentication using email verification codes, JWT (JSON Web Tokens) for session management, and secure password handling.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                avatar={<EmailIcon color="primary" />}
                title="Email Verification"
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Instead of traditional email links, this system uses a secure 6-digit verification code. When a user registers, a unique code is generated and sent to their email address. This approach provides:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <VerifiedUserIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Use API Sendgrid to send email" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <VerifiedUserIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Protection against email interception" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <VerifiedUserIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Verifies email ownership without opening links" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                avatar={<VpnKeyIcon color="primary" />}
                title="Secure Authentication"
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  The system implements industry-standard security practices:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <LockOpenIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Password hashing using bcrypt" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <LockOpenIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="JWT with secure HTTP-only cookies" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <LockOpenIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="CORS protection against cross-site attacks" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <LockOpenIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Input validation and sanitization" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardHeader
                avatar={<SupervisorAccountIcon color="primary" />}
                title="Learning Objectives"
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                  This project serves as an educational tool to understand:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <VerifiedUserIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Multi-factor authentication implementation" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <VerifiedUserIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="JWT-based authentication flows" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <VerifiedUserIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Secure email verification systems" />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <VerifiedUserIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Backend validation and error handling" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <VerifiedUserIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="React frontend with Material UI" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <VerifiedUserIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="MongoDB integration for user data" />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <ChangePassword 
          open={changePasswordOpen} 
          onClose={handleCloseChangePassword} 
        />
        
        <DeleteAccount
          open={deleteAccountOpen}
          onClose={handleCloseDeleteAccount}
        />
      </Paper>
    </Box>
  );
};

export default HomePage; 