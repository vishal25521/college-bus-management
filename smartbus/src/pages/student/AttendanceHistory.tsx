import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Input, Table } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function AttendanceHistory() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch attendance history
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!session?.user?.id) return

        const { data, error } = await db.attendance.getByStudent(session.user.id)
        if (error) throw error
        setAttendance(data || [])
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
                  { key: 'bus_plate', label: 'Bus' },
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
      </main>
    </div>
  )
}