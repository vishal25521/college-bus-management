import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Button, Input, Table } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function ManageStudents() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: '',
    email: '',
    busId: '',
    seatNumber: ''
  })

  // Fetch all students with profile and bus info
  useEffect(() => {
    const loadStudents = async () => {
      try {
        if (!session?.user?.id) return

        const { data, error } = await db.profiles.getAllProfiles('student')
        if (error) throw error
        
        // Also fetch bus assignments for each student
        const studentsWithAssignments = await Promise.all(
          data.map(async (student) => {
            const { data: assignment, error: assignError } = await db.studentBuses.getByStudent(student.id)
            if (assignError) throw assignError
            
            let busInfo = null
            if (assignment && assignment.length > 0) {
              const { data: bus, error: busError } = await db.buses.getById(assignment[0].bus_id)
              if (busError) throw busError
              busInfo = bus
            }
            
            return { ...student, busInfo, assignments: assignment || [] }
          })
        )
        
        setStudents(studentsWithAssignments)
        setLoading(false)
      } catch (error: any) {
        toast.error('Error loading students:', error.message)
        setLoading(false)
      }
    }

    loadStudents()
  }, [session?.user?.id])

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Create profile first
      const { error: profileError } = await db.profiles.updateProfile(form.name || '', {
        full_name: form.name,
        role: 'student'
      })
      
      if (profileError) throw profileError
      
      // Assign student to bus
      const { error: assignError } = await db.studentBuses.assignStudent({
        student_id: form.name || '',  // This needs proper user ID
        bus_id: form.busId,
        seat_number: form.seatNumber,
        assigned_by: session?.user?.id
      })
      
      if (assignError) throw assignError
      
      toast.success('Student registered successfully')
      setForm({ name: '', email: '', busId: '', seatNumber: '' })
      // Refresh students list
      const { data: refreshed, error: refreshError } = await db.profiles.getAllProfiles('student')
      if (refreshError) throw refreshError
      setStudents(refreshed.map((s: any) => ({ ...s, busInfo: null, assignments: [] })))
    } catch (error: any) {
      toast.error('Error creating student:', error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900">Manage Students</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Welcome, {session?.user?.email?.split('@')[0] || 'Admin'}
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
        {/* Student Form Section */}
        <Card title="Register New Student">
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="studentName"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                placeholder="Enter student full name"
              />
            </div>

            <div>
              <label htmlFor="busAssignment" className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Bus
              </label>
              <select
                id="busAssignment"
                value={form.busId}
                onChange={(e) => setForm({ ...form, busId: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
              >
                <option value="">-- Select Bus --</option>
                {buses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.plate_number} ({bus.capacity} seats)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="seatNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Seat Number
              </label>
              <input
                id="seatNumber"
                type="text"
                value={form.seatNumber}
                onChange={(e) => setForm({ ...form, seatNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                placeholder="e.g., Seat 5A"
              />
            </div>

            <button type="submit" className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-xl text-sm hover:bg-primary-700 focus:ring-2 focus-primary-500 focus:outline-none transition-colors">
              Register Student
            </button>
          </form>
        </Card>

        {/* Students List Section */}
        <Card title="Student Records">
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
                  { key: 'busInfo', label: 'Bus Assignment' },
                  { key: 'assignments', label: 'Seat' }
                ]}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No student records found</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}