import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Input, Table } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function StudentList() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch students assigned to driver's bus
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

          // Also fetch bus info for each student
          const studentsWithBus = await Promise.all(
            validStudents.map(async (student: any) => {
              const { data: assignment, error: assignError } = await db.studentBuses.getByStudent(student.id)
              if (assignError) throw assignError
              
              let busInfo = null
              if (assignment && assignment.length > 0) {
                const { data: bus, error: busError } = await db.buses.getById(assignment[0].bus_id)
                if (busError) throw busError
                busInfo = bus
              }
              
              return { ...student, busInfo, assignment: assignment || [] }
            })
          )

          setStudents(studentsWithBus)
        } else {
          toast.info('No buses assigned to you. Contact admin.')
        }

        setLoading(false)
      } catch (error: any) {
        toast.error('Error loading student list:', error.message)
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
            <h2 className="text-xl font-bold text-navy-900">Student List</h2>
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
        <Card title="Assigned Students">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <span>Loading students...</span>
            </div>
          ) : students.length > 0 ? (
            <div className="overflow-x-auto">
              <Table
                data={students}
                columns={[
                  { key: 'full_name', label: 'Name' },
                  { key: 'email', label: 'Email' },
                  { key: 'busInfo', label: 'Bus' },
                  { key: 'assignment', label: 'Seat' }
                ]}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No students found</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}