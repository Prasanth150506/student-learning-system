import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import SystemAdminDashboard from './pages/SystemAdminDashboard';
import TestTaking from './pages/TestTaking';
import ResultDashboard from './pages/ResultDashboard';
import Layout from './components/Layout';

function App() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-blue-100 dark:selection:bg-blue-900/30 transition-colors duration-300">
        <Routes>
          <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/system-admin' : user.role === 'faculty' ? '/faculty' : '/dashboard'} /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          
          {/* Protected Student Routes */}
          <Route path="/dashboard" element={
            user && user.role === 'student' ? (
              <Layout user={user} setUser={setUser}>
                <Dashboard user={user} />
              </Layout>
            ) : <Navigate to="/login" />
          } />
          
          <Route path="/test/:testId" element={
            user && user.role === 'student' ? <TestTaking user={user} /> : <Navigate to="/login" />
          } />
          
          <Route path="/results/:testId?/:resultId?" element={
            user ? (
              <Layout user={user} setUser={setUser}>
                <ResultDashboard user={user} />
              </Layout>
            ) : <Navigate to="/login" />
          } />
          
          {/* Protected Faculty Routes */}
          <Route path="/faculty" element={
            user && user.role === 'faculty' ? (
              <Layout user={user} setUser={setUser}>
                <FacultyDashboard user={user} />
              </Layout>
            ) : <Navigate to="/login" />
          } />

          {/* Protected Admin Routes */}
          <Route path="/system-admin" element={
            user && user.role === 'admin' ? (
              <Layout user={user} setUser={setUser}>
                <SystemAdminDashboard user={user} />
              </Layout>
            ) : <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

