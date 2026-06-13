import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import TaxpayerLogin from './pages/TaxpayerLogin';
import GovLogin from './pages/GovLogin';
import TaxpayerDashboard from './pages/TaxpayerDashboard';
import GovDashboard from './pages/GovDashboard';
import PayTax from './pages/PayTax';
import TrackPayment from './pages/TrackPayment';
import Landing from './pages/Landing';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/taxpayer/login" element={<TaxpayerLogin />} />
          <Route path="/gov/login" element={<GovLogin />} />
          <Route path="/taxpayer/dashboard" element={
            <ProtectedRoute role="taxpayer"><TaxpayerDashboard /></ProtectedRoute>
          } />
          <Route path="/taxpayer/pay" element={
            <ProtectedRoute role="taxpayer"><PayTax /></ProtectedRoute>
          } />
          <Route path="/taxpayer/track" element={
            <ProtectedRoute role="taxpayer"><TrackPayment /></ProtectedRoute>
          } />
          <Route path="/gov/dashboard" element={
            <ProtectedRoute role="government"><GovDashboard /></ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
