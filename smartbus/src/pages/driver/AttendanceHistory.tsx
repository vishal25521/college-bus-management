import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Input, Table } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function AttendanceHistoryDriver() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch attendance history for driver's bus
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!session?.user?.id) return

        // Get driver's assigned buses
        const { data: driverBuses, error: driverBusesError } = await db.buses.getAll()
        if (driverBusesError) throw driverBusesError

        const driverAssignedBuses = driverBuses.filter((b: any) => b.driver_id === session.user.id)

        if (driverAssignedBuses.length > 0) {
          const busIds = driverAssignedBuses.map((b: any) => b.id)

          // Get attendance for each bus
          const attendancePromises = busIds.map((busId: string) =>
            db.attendance.getByBusDate('', new Date().toISOString().split('T')[0])
          )

          const allAttendance = await Promise.all(attendancePromises)
          const flattened = allAttendance.flat()
          
          // Get student names
          const studentIds = new Set<string>()
          flattened.forEach((a: any) => studentIds.add(a.student_id))

          const studentProfiles = await Promise.all(
            Array.from(studentIds).map((id: string) => db.profiles.getProfile(id))
          )

          const studentNameMap = new Map<string, string>()
          studentProfiles.forEach((p: any) => {
            if (p) studentNameMap.set(p.id, p.full_name || 'Unknown')
          })

          // Map attendance with student names
          const mappedAttendance = flattened.map((a: any) => ({
            ...a,
            student_name: studentNameMap.get(a.student_id) || 'Unknown'
          }))

          setAttendance(mappedAttendance)
        } else {
          toast.info('No buses assigned to you. Contact admin.')
        }

        setLoading(false)
      } catch (error: any) {
        toast.error('Error loading attendance history:', error.message)
        setLoading(false)
      }
    }

    loadData()
  }, [session?.user?.id])

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900">Attendance History</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Welcome, {session?.user?.email?.split('@')[0] || 'Driver'}
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
                  { key: 'student_name', label: 'Student' },
                  { key: 'attendance_date', label: 'Date' },
                  { key: 'attendance_status', label: 'Status' },
                  { key: 'bus_plate', label: 'Bus' }
                ]}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No attendance records found</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}