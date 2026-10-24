import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Button, Input, Table } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function AttendanceReports() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'all' as 'present' | 'absent' | 'late' | 'excused' | 'all'
  })

  // Fetch attendance reports with filters
  useEffect(() => {
    const loadAttendance = async () => {
      try {
        if (!session?.user?.id) return

        const startDate = filters.startDate
        const endDate = filters.endDate
        const status = filters.status

        let query = db.attendance.getByBusDate(startDate, endDate)

        if (status !== 'all') {
          // Filter by status - we'll do this client-side since the db helper doesn't have status filter
          const { data, error } = await query
          if (error) throw error
          const filtered = data?.filter((a: any) => a.attendance_status === status)
          setAttendance(filtered || [])
        } else {
          const { data, error } = await query
          if (error) throw error
          setAttendance(data || [])
        }
        setLoading(false)
      } catch (error: any) {
        toast.error('Error loading attendance reports:', error.message)
        setLoading(false)
      }
    }

    loadAttendance()
  }, [session?.user?.id, filters.startDate, filters.endDate, filters.status])

  const handleExportToSheets = async () => {
    if (attendance.length === 0) {
      toast.warning('No attendance data to export')
      return
    }

    try {
      const response = await fetch('/api/export-to-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendanceRecords: attendance,
          startDate: filters.startDate,
          endDate: filters.endDate
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        toast.success(result.message || 'Export to Google Sheets successful')
      } else {
        toast.error(result.error || 'Export failed')
      }
    } catch (error: any) {
      toast.error('Error exporting to Google Sheets:', error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900">Attendance Reports</h2>
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
        {/* Filters Section */}
        <Card>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Export Button */}
        <div className="mb-6">
          <button
            onClick={handleExportToSheets}
            className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-xl text-sm hover:bg-primary-700 focus:ring-2 focus-primary-500 focus:outline-none transition-colors"
            disabled={attendance.length === 0}
          >
            <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 9v6h-6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2-3L22 7z"/>
              <path fill="currentColor" d="M14 2v2h6v14h-2v5l-5-3-5 3v-5h-2v-2l5-3 5 3h2v2zm-6 7v2h4v2H8v-2H6v-2h4zm7.5-2.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zm-2 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zm-5.5 5.5c.82 0 1.5.66 1.5 1.5s-.66 1.5-1.5 1.5s-1.5-.66-1.5-1.5s.66-1.5 1.5-1.5zm1.5-8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zm0 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zm5.5 0c.83 0 1.5.67 1.5 1.5s-.66 1.5-1.5 1.5s-1.5-.66-1.5-1.5s.66-1.5 1.5-1.5zm-5.5-5.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zm0 5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5s.66-1.5 1.5-1.5zm0 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
            </svg>
            Export to Google Sheets
          </button>
        </div>

        {/* Attendance Table */}
        <Card title="Attendance Records">
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
                  { key: 'bus_plate', label: 'Bus' },
                  { key: 'attendance_date', label: 'Date' },
                  { key: 'attendance_status', label: 'Status' }
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