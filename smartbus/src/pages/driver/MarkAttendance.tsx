import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Input, Button } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function MarkAttendance() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    studentId: '',
    attendanceStatus: 'present' as 'present' | 'absent' | 'late' | 'excused'
  })

  // Fetch students in driver's assigned buses
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!session?.user?.id) return

        // Get all student bus assignments
        const { data: assignments, error: assignmentsError } = await db.studentBuses.getAll()
        if (assignmentsError) throw assignmentsError

        // Get driver's assigned buses
        const { data: driverBuses, error: driverBusesError } = await db.buses.getAll()
        if (driverBusesError) throw driverBusesError

        const driverAssignedBuses = driverBuses.filter((b: any) => b.driver_id === session.user.id)

        if (driverAssignedBuses.length > 0) {
          // Get students assigned to driver's buses
          const studentIds = new Set<string>()
          assignments.forEach((a: any) => {
            if (driverAssignedBuses.some((db: any) => db.id === a.bus_id)) {
              studentIds.add(a.student_id)
            }
          })

          // Fetch student profiles
          const studentsPromises = Array.from(studentIds).map((studentId: string) => 
            db.profiles.getProfile(studentId)
          )
          
          const studentResults = await Promise.all(studentsPromises)
          const validStudents = studentResults
            .filter((p: any) => p && !p.error)
            .map((p: any) => p!)

          setStudents(validStudents)
        } else {
          toast.info('No buses assigned to you. Contact admin.')
        }

        setLoading(false)
      } catch (error: any) {
        toast.error('Error loading students:', error.message)
        setLoading(false)
      }
    }

    loadData()
  }, [session?.user?.id])

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const studentId = (form.querySelector('[name="studentId"]') as HTMLInputElement).value
    const status = (form.querySelector('[name="attendanceStatus"]') as HTMLInputElement).value

    try {
      const { data, error } = await db.attendance.markAttendance({
        student_id: studentId,
        bus_id: form.dataset?.busId || '',
        attendance_status: status,
        attendance_date: new Date().toISOString().split('T')[0],
        marked_by: session?.user?.id
      })

      if (error) throw error

      toast.success('Attendance marked successfully')
      setForm({ studentId: '', attendanceStatus: 'present' })
      
      // Refresh student list
      const { data: freshStudents, error: refreshError } = await db.studentBuses.getAll()
      if (refreshError) throw refreshError
      // Reload students...
    } catch (error: any) {
      toast.error('Error marking attendance:', error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900">Mark Attendance</h2>
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
        <Card title="Mark Student Attendance">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <span>Loading students...</span>
            </div>
          ) : students.length > 0 ? (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-navy-900">{student.full_name}</span>
                    <span className="text-sm text-gray-500">{student.email}</span>
                  </div>
                  
                  <select
                    defaultValue={form.attendanceStatus}
                    onChange={(e) => setForm({ ...form, attendanceStatus: e.target.value })}
                    className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                </div>
              ))}

              <div>
                <button
                  onClick={handleMarkAttendance}
                  disabled={form.studentId === ''}
                  className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-xl text-sm hover:bg-primary-700 focus:ring-2 focus-primary-500 focus:outline-none transition-colors"
                >
                  Mark Attendance
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No students found. Assign students to your bus first.</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}