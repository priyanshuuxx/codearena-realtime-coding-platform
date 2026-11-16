import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import BattlesPage from './pages/BattlesPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DebuggingPage from './pages/DebuggingPage.jsx';
import InterviewPage from './pages/InterviewPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import MCQPage from './pages/MCQPage.jsx';
import ProblemsPage from './pages/ProblemsPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/problems"
        element={
          <ProtectedRoute>
            <ProblemsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/debugging"
        element={
          <ProtectedRoute>
            <DebuggingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mcq"
        element={
          <ProtectedRoute>
            <MCQPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview"
        element={
          <ProtectedRoute>
            <InterviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/battles"
        element={
          <ProtectedRoute>
            <BattlesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
