import axios from 'axios';

// Création d'une instance axios avec l'URL de base de l'API
const API = axios.create({
  baseURL: 'http://localhost:5001/api'
});

// Intercepteur pour ajouter le token JWT à chaque requête
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteurs pour afficher les requêtes et réponses (debugging)
API.interceptors.request.use(request => {
  console.log('Starting Request', {
    url: request.url,
    method: request.method,
    data: request.data,
    headers: request.headers
  });
  return request;
});

API.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
      url: response.config.url
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response',
      request: error.request ? 'Request sent but no response' : 'Request setup error'
    });
    return Promise.reject(error);
  }
);

// Types pour les données d'inscription
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Types pour les données de connexion
export interface LoginData {
  email: string;
  password: string;
}

// Types pour les données de changement de mot de passe
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Types pour les données de suppression de compte
export interface DeleteAccountData {
  password: string;
}

// Types pour les données de demande de réinitialisation de mot de passe
export interface ForgotPasswordData {
  email: string;
}

// Types pour les données de réinitialisation de mot de passe
export interface ResetPasswordData {
  password: string;
}

// Types pour les réponses de l'API
export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  data?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
  };
}

// Service d'authentification
const authService = {
  // Inscription d'un nouvel utilisateur
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await API.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: error.message || 'Une erreur est survenue lors de l\'inscription' 
      };
    }
  },

  // Connexion d'un utilisateur
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    try {
      const response = await API.post('/auth/login', credentials);
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: error.message || 'Une erreur est survenue lors de la connexion' 
      };
    }
  },

  // Vérification de l'email
  verifyEmail: async (email: string, code: string): Promise<AuthResponse> => {
    try {
      const response = await API.post('/auth/verify-email', { email, code });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: error.message || 'Une erreur est survenue lors de la vérification de l\'email' 
      };
    }
  },

  // Renvoi de l'email de vérification
  resendVerification: async (email: string): Promise<AuthResponse> => {
    try {
      const response = await API.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: error.message || 'Une erreur est survenue lors du renvoi de l\'email de vérification'
      };
    }
  },

  // Récupération des informations de l'utilisateur connecté
  getCurrentUser: async (): Promise<AuthResponse> => {
    try {
      const response = await API.get('/auth/me');
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: error.message || 'Une erreur est survenue lors de la récupération des informations utilisateur'
      };
    }
  },

  // Déconnexion (suppression du token)
  logout: () => {
    localStorage.removeItem('token');
  },

  // Vérification si l'utilisateur est connecté
  isLoggedIn: (): boolean => {
    return localStorage.getItem('token') !== null;
  },

  // Changement de mot de passe
  changePassword: async (passwordData: ChangePasswordData): Promise<AuthResponse> => {
    try {
      const response = await API.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: error.message || 'An error occurred while changing the password' 
      };
    }
  },

  // Suppression de compte
  deleteAccount: async (data: DeleteAccountData): Promise<AuthResponse> => {
    try {
      const response = await API.delete('/auth/delete-account', { 
        data // Axios requires using the 'data' property for DELETE requests with body
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: error.message || 'An error occurred while deleting your account' 
      };
    }
  },

  // Demande de réinitialisation de mot de passe
  forgotPassword: async (data: ForgotPasswordData): Promise<AuthResponse> => {
    try {
      const response = await API.post('/auth/forgot-password', data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: error.message || 'An error occurred while processing your request' 
      };
    }
  },

  // Réinitialisation de mot de passe
  resetPassword: async (token: string, data: ResetPasswordData): Promise<AuthResponse> => {
    try {
      const response = await API.put(`/auth/reset-password/${token}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: error.message || 'An error occurred while resetting your password' 
      };
    }
  }
};

export default authService; 