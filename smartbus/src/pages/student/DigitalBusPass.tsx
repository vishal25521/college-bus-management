import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Input } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function DigitalBusPass() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [busPass, setBusPass] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch bus pass information
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!session?.user?.id) return

        // Get student's bus assignment
        const { data: assignmentData, error: assignmentError } = await db.studentBuses.getByStudent(session.user.id)
        if (assignmentError) throw assignmentError

        if (assignmentData && assignmentData.length > 0) {
          setBusPass({
            studentName: session?.user?.email?.split('@')[0] || 'Student',
            busNumber: assignmentData[0]?.bus?.plate_number || 'N/A',
            routeName: assignmentData[0]?.route?.route_name || 'N/A',
            seatNumber: assignmentData[0]?.seat_number || 'N/A',
            lastUpdated: new Date().toLocaleDateString(),
            isPresentToday: false // Will be checked against attendance
          })
        } else {
          toast.info('No bus assignment found. Contact admin.')
        }
      } catch (error: any) {
        toast.error('Error loading bus pass:', error.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [session?.user?.id])

  // Check if student is present today
  useEffect(() => {
    const checkTodayAttendance = async () => {
      try {
        if (!session?.user?.id) return

        const today = new Date().toISOString().split('T')[0]
        const { data: attendanceData, error: attendanceError } = await db.attendance.getByStudent(session.user.id)

        if (attendanceError) throw attendanceError

        if (attendanceData && attendanceData.length > 0) {
          const todayAttendance = attendanceData.find((a: any) => a.attendance_date === today)
          if (busPass) {
            setBusPass({ ...busPass, isPresentToday: todayAttendance?.attendance_status === 'present' })
          }
        }
      } catch (error: any) {
        // Ignore errors in attendance check
      }
    }

    checkTodayAttendance()
  }, [session?.user?.id, busPass])

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900">Digital Bus Pass</h2>
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

      <main className="py-6 max-w-7xl mx-auto">
        <Card title="Digital Bus Pass">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <span>Loading bus pass...</span>
            </div>
          ) : busPass ? (
            <div className="bg-navy-600 text-white p-8 rounded-2xl text-center min-h-[320px]">
              <h3 className="text-3xl font-bold mb-2">SMART BUS PASS</h3>
              <p className="text-lg mb-4">Student: {busPass.studentName}</p>
              <p className="text-base mb-4">Bus: {busPass.busNumber}</p>
              <p className="text-sm mb-4">Route: {busPass.routeName}</p>
              <p className="text-sm mb-6">Seat: {busPass.seatNumber}</p>
              <p className="text-xs mb-6">Valid for: {busPass.lastUpdated}</p>
              
              <div className="w-40 h-40 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-20 h-20 text-navy-600" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M2 7a2 2 0 012-2h3v9H4zm8 0a2 2 0 012-2h3v9h-3zm8 0a2 2 0 012-2h3v9h-3zM2 15a2 2 0 012-2h5v2h-5zm8 0a2 2 0 012-2h5v2h-5z"/>
                </svg>
              </div>
              
              {busPass.isPresentToday ? (
                <p className="text-sm text-green-300">Present today</p>
              ) : (
                <p className="text-sm text-yellow-300">Not marked present today</p>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No bus assignment found</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}