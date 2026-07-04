import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MeetingPage from './pages/MeetingPage'
import PostMeetingPage from './pages/PostMeetingPage'
import TasksPage from './pages/TasksPage'
import AnalyticsPage from './pages/AnalyticsPage'
import RegisterPage from './pages/RegisterPage'
import ScheduleMeetingPage from './pages/ScheduleMeetingPage'
import LandingPage from './pages/LandingPage'
import SettingsPage from './pages/SettingsPage'
import ProtectedRoute from './components/ProtectedRoute'
import CreateTask from './pages/CreateTask'
import MeetingDetailsPage from './pages/MeetingDetails'
import Meetings from './pages/Meetings'
export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/meeting/:id" element={<ProtectedRoute><MeetingPage /></ProtectedRoute>} />
         <Route path="/CreateTask" element={<ProtectedRoute><CreateTask /></ProtectedRoute>} />
         <Route   path="/meetings/:id" element={<ProtectedRoute><MeetingDetailsPage /></ProtectedRoute>} />
        <Route path="/post-meeting/:id" element={<ProtectedRoute><PostMeetingPage /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
           <Route path="/meetings" element={<ProtectedRoute><Meetings/></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/schedule-meeting" element={<ProtectedRoute><ScheduleMeetingPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  
    </BrowserRouter>
  )
}


