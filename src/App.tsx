import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Teachers } from './pages/Teachers';
import { Classes } from './pages/Classes';
import { Finances } from './pages/Finances';
import { Grades } from './pages/Grades';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { AuthGuard } from './components/auth/AuthGuard';
import { PublicRoute } from './components/auth/PublicRoute';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Layout>
                  <Dashboard />
                </Layout>
              </AuthGuard>
            }
          />
          
          <Route
            path="/students"
            element={
              <AuthGuard>
                <Layout>
                  <Students />
                </Layout>
              </AuthGuard>
            }
          />
          
          <Route
            path="/teachers"
            element={
              <AuthGuard>
                <Layout>
                  <Teachers />
                </Layout>
              </AuthGuard>
            }
          />
          
          <Route
            path="/classes"
            element={
              <AuthGuard>
                <Layout>
                  <Classes />
                </Layout>
              </AuthGuard>
            }
          />
          
          <Route
            path="/grades"
            element={
              <AuthGuard>
                <Layout>
                  <Grades />
                </Layout>
              </AuthGuard>
            }
          />
          
          <Route
            path="/finances"
            element={
              <AuthGuard>
                <Layout>
                  <Finances />
                </Layout>
              </AuthGuard>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;