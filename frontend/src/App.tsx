import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/useAuth';
import { Toaster } from './components/ui/Toast';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { HackathonDetail } from './pages/HackathonDetail';
import { AdminDashboard } from './pages/AdminDashboard';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/hackathons/:id" element={<HackathonDetail />} />

            {/* Protected Admin Route */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
