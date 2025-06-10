# Authentication Application

A full-stack authentication application with React, TypeScript, Material-UI, Node.js, Express, and MongoDB.

## Features

- Frontend:
  - Login page with field validation
  - Registration page with field validation
  - Email verification page
  - Responsive user interface built with Material-UI
  - Navigation between pages with React Router
  - State management with React Hooks

- Backend:
  - User registration with MongoDB
  - Email verification via SendGrid
  - JWT authentication
  - Password hashing with bcrypt
  - Error handling middleware

## Project Structure

```
auth-app/
  ├── public/                # Frontend public assets
  ├── src/                   # Frontend source code
  │   ├── components/        # React components
  │   │   ├── Login.tsx      
  │   │   ├── Register.tsx   
  │   │   └── Verify.tsx     
  │   ├── App.tsx            
  │   └── index.tsx          
  ├── server/                # Backend code
  │   ├── controllers/       # Request handlers
  │   ├── middleware/        # Express middleware
  │   ├── models/            # Mongoose models
  │   ├── routes/            # API routes
  │   ├── utils/             # Utility functions
  │   └── server.js          # Entry point for the server
  ├── package.json           # Frontend dependencies
  └── server/package.json    # Backend dependencies
```

## Setup

### Prerequisites
- Node.js and npm
- MongoDB (local or Atlas)
- SendGrid API key

### Installation

#### Frontend
```bash
# Install frontend dependencies
cd 2FA
npm install

# Start the frontend development server
npm  run start
```

#### Backend
```bash
# Install backend dependencies
cd 2FA/server
npm install

# Create .env file with the following variables:
# PORT=5001
# MONGODB_URI=mongodb+srv://surveyprosce:NewPassword@cluster0.so2cvlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
# JWT_SECRET=votre_clé_secrète_pour_jwt
# JWT_EXPIRE=30d
# SENDGRID_API_KEY=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
# FROM_EMAIL=surveyprosce@gmail.com
# NODE_ENV=development

# Start the backend server
npm run dev
```

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify-email` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email
- `GET /api/auth/me` - Get current user info (requires auth)

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Material-UI
  - React Router

- Backend:
  - Node.js
  - Express
  - MongoDB/Mongoose
  - JSON Web Tokens
  - SendGrid for email delivery
  - bcrypt for password hashing

## Customization

You can customize the theme by modifying the `theme` object in the `App.tsx` file. 
