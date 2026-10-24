import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Input, Button } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function GoogleSheetsExport() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle')
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  // Fetch attendance records for export
  useEffect(() => {
    const loadAttendance = async () => {
      try {
        if (!session?.user?.id) return

        const { data, error } = await db.attendance.getByBusDate(
          dateRange.startDate,
          dateRange.endDate
        )
        if (error) throw error
        setAttendanceRecords(data || [])
      } catch (error: any) {
        toast.error('Error loading attendance records:', error.message)
      }
    }

    loadAttendance()
  }, [session?.user?.id, dateRange.startDate, dateRange.endDate])

  const handleExportToSheets = async () => {
    if (attendanceRecords.length === 0) {
      toast.warning('No attendance data to export')
      return
    }

    setExportStatus('exporting')

    try {
      // In a real implementation, this would call a serverless function or API endpoint
      // that handles the Google Apps Script integration securely
      const response = await fetch('/api/export-to-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendanceRecords,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        setExportStatus('success')
        toast.success(result.message || 'Export to Google Sheets successful')
        
        // Clear records after successful export
        setTimeout(() => {
          setExportStatus('idle')
          setAttendanceRecords([])
        }, 3000)
      } else {
        setExportStatus('error')
        toast.error(result.error || 'Export failed')
      }
    } catch (error: any) {
      setExportStatus('error')
      toast.error('Error exporting to Google Sheets: ' + error.message)
    }
  }

  const handleDateRangeChange = (e: any) => {
    const value = e.target.value
    if (e.target.name === 'startDate') {
      setDateRange({ ...dateRange, startDate: value })
    } else {
      setDateRange({ ...dateRange, endDate: value })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900">Google Sheets Export</h2>
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
        <Card>
          <div className="px-6 py-4">
            <h3 className="text-lg font-bold text-navy-900 mb-4">Export Attendance to Google Sheets</h3>

            {/* Date Range Selector */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateRangeChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateRangeChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Attendance Preview */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Records to export: {attendanceRecords.length}
              </label>
              {attendanceRecords.length > 0 && (
                <p className="text-xs text-gray-500 mb-2">
                  Will export {attendanceRecords.length} attendance records
                </p>
              )}
            </div>

            {/* Export Button */}
            <div className="mb-6">
              <Button
                onClick={handleExportToSheets}
                disabled={exportStatus !== 'idle' || attendanceRecords.length === 0}
                className="w-full"
              >{exportStatus === 'exporting' ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-current border-transparent rounded-full"/>
                    Exporting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M19 9v6h-6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2-3L22 7z"/></svg>
                    Export to Google Sheets
                  </span>
                )}
              </Button>
            </div>

            {/* Export Status */}
            {exportStatus === 'success' && (
              <div className="p-3 bg-green-100 text-green-800 rounded-xl mb-4">
                <span className="text-sm">Export successful!</span>
              </div>
            )}
            {exportStatus === 'error' && (
              <div className="p-3 bg-red-100 text-red-800 rounded-xl mb-4">
                <span className="text-sm">Export failed. Please try again.</span>
              </div>
            )}

            {/* Records Preview */}
            {attendanceRecords.length > 0 && (
              <div className="overflow-x-auto mt-4">
                <Table
                  data={attendanceRecords}
                  columns={[
                    { key: 'student_name', label: 'Student Name' },
                    { key: 'bus_plate', label: 'Bus Number' },
                    { key: 'attendance_date', label: 'Date' },
                    { key: 'attendance_status', label: 'Status' }
                  ]}
                />
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}