import { ReactNode, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { reactToast } from './utils/toast'

// Protected route component
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true })
    }
  }, [session, navigate])

  // Check if loading is done
  if (session === null || role === null) {
    return null
  }

  // Redirect based on role - prevent admins from accessing student/driver only pages
  if (role === 'admin') {
    if (location.pathname === '/student/dashboard') {
      navigate('/admin/overview', { replace: true })
    }
    if (location.pathname === '/driver/dashboard') {
      navigate('/admin/overview', { replace: true })
    }
  }

  if (role === 'student') {
    if (location.pathname === '/admin/overview') {
      navigate('/student/dashboard', { replace: true })
    }
    if (location.pathname === '/driver/dashboard') {
      navigate('/student/dashboard', { replace: true })
    }
  }

  if (role === 'driver') {
    if (location.pathname === '/admin/overview') {
      navigate('/driver/dashboard', { replace: true })
    }
    if (location.pathname === '/student/dashboard') {
      navigate('/driver/dashboard', { replace: true })
    }
  }

  return children
}

// Unauthorized route component
const UnauthorizedRoute = ({ children }: { children: ReactNode }) => {
  const { session, role } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true })
    }
  }, [session, navigate])

  // Show unauthorized page if someone tries to access a role-specific page without proper role
  if (!role) {
    return null
  }

  // If the user has a role but is trying to access a page that doesn't match,
  // redirect them appropriately
  if (role === 'student' && children.props?.path !== undefined) {
    // Student trying to access admin page - redirect
    navigate('/student/dashboard', { replace: true })
    return null
  }

  return null
}

const LandingPage = lazy(() => import('./pages/LandingPage').then(mod => ({ default: mod.LandingPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then(mod => ({ default: mod.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(mod => ({ default: mod.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(mod => ({ default: mod.ForgotPasswordPage })))

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(mod => ({ default: mod.AdminDashboard })))
const ManageStudents = lazy(() => import('./pages/admin/ManageStudents').then(mod => ({ default: mod.ManageStudents })))
const ManageBuses = lazy(() => import('./pages/admin/ManageBuses').then(mod => ({ default: mod.ManageBuses })))
const ManageDrivers = lazy(() => import('./pages/admin/ManageDrivers').then(mod => ({ default: mod.ManageDrivers })))
const ManageRoutes = lazy(() => import('./pages/admin/ManageRoutes').then(mod => ({ default: mod.ManageRoutes })))
const AttendanceReports = lazy(() => import('./pages/admin/AttendanceReports').then(mod => ({ default: mod.AttendanceReports })))
const GoogleSheetsExport = lazy(() => import('./pages/admin/GoogleSheetsExport').then(mod => ({ default: mod.GoogleSheetsExport })))
const SettingsPage = lazy(() => import('./pages/admin/Settings').then(mod => ({ default: mod.Settings })))

// Student pages
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard').then(mod => ({ default: mod.StudentDashboard })))
const MyBus = lazy(() => import('./pages/student/MyBus').then(mod => ({ default: mod.MyBus })))
const MyRoute = lazy(() => import('./pages/student/MyRoute').then(mod => ({ default: mod.MyRoute })))
const DigitalBusPass = lazy(() => import('./pages/student/DigitalBusPass').then(mod => ({ default: mod.DigitalBusPass })))
const AttendanceHistory = lazy(() => import('./pages/student/AttendanceHistory').then(mod => ({ default: mod.AttendanceHistory })))
const Profile = lazy(() => import('./pages/student/Profile').then(mod => ({ default: mod.Profile })))

// Driver pages
const DriverDashboard = lazy(() => import('./pages/driver/DriverDashboard').then(mod => ({ default: mod.DriverDashboard })))
const AssignedBus = lazy(() => import('./pages/driver/AssignedBus').then(mod => ({ default: mod.AssignedBus })))
const StudentList = lazy(() => import('./pages/driver/StudentList').then(mod => ({ default: mod.StudentList })))
const MarkAttendance = lazy(() => import('./pages/driver/MarkAttendance').then(mod => ({ default: mod.MarkAttendance })))
const AttendanceHistoryDriver = lazy(() => import('./pages/driver/AttendanceHistory').then(mod => ({ default: mod.AttendanceHistory })))
const DriverProfile = lazy(() => import('./pages/driver/Profile').then(mod => ({ default: mod.DriverProfile })))

// 404 page
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(mod => ({ default: mod.NotFoundPage })))
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage').then(mod => ({ default: mod.UnauthorizedPage })))

export default function App() {
  const { session } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Wait for auth state to resolve
    if (session === null) {
      // Will be set by AuthProvider's onAuthStateChange
      return
    }
  }, [session])

  return (
    <Router>
      
      <Routes>
        {/* Public Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/" element={<LandingPage />} />

        {/* Protected routes with role-based access */}
        <Route path="/admin/overview" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute><ManageStudents /></ProtectedRoute>} />
        <Route path="/admin/buses" element={<ProtectedRoute><ManageBuses /></ProtectedRoute>} />
        <Route path="/admin/drivers" element={<ProtectedRoute><ManageDrivers /></ProtectedRoute>} />
        <Route path="/admin/routes" element={<ProtectedRoute><ManageRoutes /></ProtectedRoute>} />
        <Route path="/admin/attendance" element={<ProtectedRoute><AttendanceReports /></ProtectedRoute>} />
        <Route path="/admin/google-sheets-export" element={<ProtectedRoute><GoogleSheetsExport /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/my-bus" element={<ProtectedRoute><MyBus /></ProtectedRoute>} />
        <Route path="/student/my-route" element={<ProtectedRoute><MyRoute /></ProtectedRoute>} />
        <Route path="/student/digital-pass" element={<ProtectedRoute><DigitalBusPass /></ProtectedRoute>} />
        <Route path="/student/attendance-history" element={<ProtectedRoute><AttendanceHistory /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/driver/dashboard" element={<ProtectedRoute><DriverDashboard /></ProtectedRoute>} />
        <Route path="/driver/assigned-bus" element={<ProtectedRoute><AssignedBus /></ProtectedRoute>} />
        <Route path="/driver/student-list" element={<ProtectedRoute><StudentList /></ProtectedRoute>} />
        <Route path="/driver/mark-attendance" element={<ProtectedRoute><MarkAttendance /></ProtectedRoute>} />
        <Route path="/driver/attendance-history" element={<ProtectedRoute><AttendanceHistoryDriver /></ProtectedRoute>} />
        <Route path="/driver/profile" element={<ProtectedRoute><DriverProfile /></ProtectedRoute>} />

        {/* Fallback routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}