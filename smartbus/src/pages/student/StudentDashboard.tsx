import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Button, Input, Table } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function StudentDashboard() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [studentData, setStudentData] = useState<any>(null)
  const [buses, setBuses] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch student data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!session?.user?.id) {
          toast.error('No user session found')
          navigate('/login', { replace: true })
          return
        }

        // Get student's bus assignment
        const { data: assignmentData, error: assignmentError } = await db.studentBuses.getByStudent(session.user.id)
        if (assignmentError) throw assignmentError

        if (assignmentData && assignmentData.length > 0) {
          setStudentData(assignmentData[0])

          // Get bus details
          const { data: busData, error: busError } = await db.buses.getById(assignmentData[0].bus_id)
          if (busError) throw busError

          setBuses([busData])

          // Get attendance history
          const { data: attendanceData, error: attendanceError } = await db.attendance.getByStudent(session.user.id)
          if (attendanceError) throw attendanceError
          setAttendance(attendanceData)
        } else {
          toast.info('No bus assignment found. Contact admin.')
        }
      } catch (error: any) {
        toast.error('Error loading student data:', error.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [session?.user?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full border-4 border-navy-200 border-t-2 w-16 h-16 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-navy-900">Loading Student Dashboard</h2>
          <p className="text-gray-600">Please wait while we load your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900">Student Dashboard</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Welcome, {session?.user?.email?.split('@')[0] || 'Student'}
              </span>
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="text-sm text-primary-600 hover:underline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6 max-w-7xl mx-auto">
        {/* Student Info */}
        {studentData && (
          <Card title="My Assignment">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500">Bus Number</p>
                <p className="text-2xl font-bold text-navy-900">{studentData?.bus?.plate_number || 'N/A'}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500">Route</p>
                <p className="text-2xl font-bold text-navy-900">{studentData?.route?.route_name || 'N/A'}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500">Seat</p>
                <p className="text-2xl font-bold text-navy-900">{studentData?.seat_number || 'N/A'}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Attendance History */}
        <Card title="Attendance History">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <span>Loading attendance...</span>
            </div>
          ) : attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <Table
                data={attendance}
                columns={[
                  { key: 'attendance_date', label: 'Date' },
                  { key: 'attendance_status', label: 'Status' },
                  { key: 'marked_by', label: 'Marked By' }
                ]}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No attendance records found</p>
            </div>
          )}
        </Card>

        {/* Digital Bus Pass */}
        <Card title="Digital Bus Pass">
          {studentData && studentData.bus ? (
            <div className="bg-navy-600 text-white p-6 rounded-2xl text-center">
              <h3 className="text-2xl font-bold mb-2">SMART BUS PASS</h3>
              <p className="text-lg mb-4">Student: {session?.user?.email?.split('@')[0] || 'Student'}</p>
              <p className="text-base mb-4">Bus: {studentData.bus.plate_number}</p>
              <p className="text-sm mb-4">Route: {studentData.route?.route_name || 'N/A'}</p>
              <p className="text-xs mb-6">Valid for: {new Date().toLocaleDateString()}</p>
              <div className="w-32 h-32 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-16 h-16 text-navy-600" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M2 7a2 2 0 012-2h3v9H4zm8 0a2 2 0 012-2h3v9h-3zm8 0a2 2 0 012-2h3v9h-3zM2 15a2 2 0 012-2h5v2h-5zm8 0a2 2 0 012-2h5v2h-5z"/>
                </svg>
              </div>
              <p className="text-sm text-gray-300">Present today</p>
            </div>
          ) : (
            <p className="text-gray-500">No bus assignment found</p>
          )}
        </Card>
      </main>
    </div>
  )
}