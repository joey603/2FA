import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';

const TestConnection: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [testResults, setTestResults] = useState<any>(null);

  // Fonction pour tester la connexion au backend
  const testBackendConnection = async () => {
    setLoading(true);
    setError('');
    setTestResults(null);
    
    try {
      const response = await axios.get('http://localhost:5001/api/test-cors');
      setBackendStatus('Connecté');
      setTestResults(response.data);
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      setBackendStatus('Déconnecté');
      setError(err.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour tester l'API d'authentification
  const testAuthApi = async () => {
    setLoading(true);
    setError('');
    setTestResults(null);
    
    try {
      const testData = {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Math.floor(Math.random() * 10000)}@example.com`,
        password: 'TestPassword123'
      };
      
      console.log('Envoi de données de test:', testData);
      
      const response = await axios.post('http://localhost:5001/api/debug', testData);
      setTestResults(response.data);
    } catch (err: any) {
      console.error('Erreur de test API:', err);
      setError(err.message || 'Erreur lors du test de l\'API');
      
      if (err.response) {
        setTestResults({
          error: true,
          status: err.response.status,
          data: err.response.data
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Test initial de la connexion
    testBackendConnection();
  }, []);

  return (
    <Paper elevation={6} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 2 
      }}>
        <Typography component="h1" variant="h5">
          Test de Connexion Frontend-Backend
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'row',
          alignItems: 'center', 
          gap: 2, 
          mb: 2 
        }}>
          <Typography variant="body1">
            Statut du backend:
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 'bold', 
              color: backendStatus === 'Connecté' ? 'success.main' : 'error.main'
            }}
          >
            {loading ? <CircularProgress size={20} /> : backendStatus || 'Inconnu'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={testBackendConnection}
            disabled={loading}
          >
            Tester la Connexion
          </Button>
          
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={testAuthApi}
            disabled={loading}
          >
            Tester l'API Debug
          </Button>
        </Box>
        
        {testResults && (
          <Box sx={{ mt: 4, width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Résultats du Test:
            </Typography>
            
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                bgcolor: 'grey.100', 
                borderRadius: 1,
                maxHeight: '300px',
                overflow: 'auto'
              }}
            >
              <pre>{JSON.stringify(testResults, null, 2)}</pre>
            </Paper>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default TestConnection; 