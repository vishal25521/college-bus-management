import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Button, Input, Table } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut, Menu, ChartBar, Truck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function DriverDashboard() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [bus, setBus] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [route, setRoute] = useState<any>(null)
  const [busStatus, setBusStatus] = useState<'active' | 'maintenance'>('active')
  const [loading, setLoading] = useState(true)

  // Fetch driver data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get assigned bus
        const { data: assignmentData, error: assignmentError } = await db.studentBuses.getByBus('')
        if (assignmentError) throw assignmentError
        
        // Find the bus assigned to this driver
        if (assignmentData && assignmentData.length > 0) {
          const busId = assignmentData[0].bus_id
          const { data: busData, error: busError } = await db.buses.getById(busId)
          if (busError) throw busError
          setBus(busData)
          
          // Get route details
          const { data: routeData, error: routeError } = await db.routes.getById(busData?.route_id)
          if (routeError) throw routeError
          setRoute(routeData)
        }
        
        // Get students assigned to this bus
        if (bus?.id) {
          const { data: studentsData, error: studentsError } = await db.studentBuses.getByBus(bus.id)
          if (studentsError) throw studentsError
          setStudents(studentsData)
        }
        
        // Get recent attendance
        if (bus?.id) {
          const { data: attendanceData, error: attendanceError } = await db.attendance.getByBusDate(bus.id, new Date().toISOString().split('T')[0])
          if (attendanceError) throw attendanceError
          setAttendance(attendanceData)
        }
      } catch (error: any) {
        toast.error('Error loading driver data:', error.message)
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
          <h2 className="text-2xl font-bold text-navy-900">Loading Driver Dashboard</h2>
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
            <h2 className="text-xl font-bold text-navy-900">Driver Dashboard</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Bus: {bus?.plate_number || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6 max-w-7xl mx-auto">
        {/* Bus Status */}
        {bus && (
          <Card title="Bus Status">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-2xl font-bold text-navy-900">{busStatus}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500">Students</p>
                <p className="text-2xl font-bold text-navy-900">{students.length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500">Route</p>
                <p className="text-2xl font-bold text-navy-900">{route?.route_name || 'N/A'}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Students List */}
        <Card title="Assigned Students">
          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <Table
                data={students}
                columns={[
                  { key: 'profiles.full_name', label: 'Student Name', className: 'text-left' },
                  { key: 'profiles.email', label: 'Email', className: 'text-left' },
                  { key: 'seat_number', label: 'Seat' }
                ]}
              />
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>No students assigned</p>
            </div>
          )}
        </Card>

        {/* Mark Attendance */}
        <Card title="Mark Daily Attendance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {students.map((student: any) => (
              <div key={student.id} className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <span className="font-medium text-gray-700">{student.profiles?.full_name || 'Unknown'}</span>
                  <Select
                    options={[
                      { value: 'present', label: 'Present' },
                      { value: 'absent', label: 'Absent' },
                      { value: 'late', label: 'Late' }
                    ]}
                    onChange={(e: any) => {
                      const status = e.target.value
                      // Mark attendance for this student
                      const { error } = db.attendance.create({
                        student_id: student.student_id,
                        bus_id: bus.id,
                        route_id: bus.route_id,
                        attendance_status: status,
                        attendance_date: new Date().toISOString().split('T')[0],
                        marked_by: session?.user?.id
                      })
                      if (error) toast.error('Error marking attendance:', error.message)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Attendance History */}
        <Card title="Attendance History">
          {attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <Table
                data={attendance}
                columns={[
                  { key: 'attendance_date', label: 'Date' },
                  { key: 'attendance_status', label: 'Status' }
                ]}
              />
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>No attendance records</p>
            </div>
          )}
        </Card>

        {/* Update Bus Status */}
        <Card title="Update Bus Status">
          <Button variant="primary" onClick={() => setBusStatus(busStatus === 'active' ? 'maintenance' : 'active')}>
            {busStatus === 'active' ? 'Mark as Maintenance' : 'Mark as Active'}
          </Button>
        </Card>
      </main>
    </div>
  )
}