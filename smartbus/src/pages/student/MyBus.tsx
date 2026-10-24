import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Input } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function MyBus() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [busAssignment, setBusAssignment] = useState<any>(null)
  const [buses, setBuses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch student's bus assignment
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!session?.user?.id) return

        const { data: assignmentData, error: assignmentError } = await db.studentBuses.getByStudent(session.user.id)
        if (assignmentError) throw assignmentError

        if (assignmentData && assignmentData.length > 0) {
          setBusAssignment(assignmentData[0])

          // Get bus details
          const { data: busData, error: busError } = await db.buses.getById(assignmentData[0].bus_id)
          if (busError) throw busError

          setBuses([busData])
        } else {
          toast.info('No bus assignment found. Contact admin.')
        }
      } catch (error: any) {
        toast.error('Error loading bus assignment:', error.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [session?.user?.id])

  const getStatusClassName = (status: string) => {
    switch (status) {
      case 'active': return 'text-navy-600'
      case 'maintenance': return 'text-orange-600'
      case 'retired': return 'text-gray-600'
      default: return 'text-navy-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'maintenance': return 'Maintenance'
      case 'retired': return 'Retired'
      default: return 'Active'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900">My Bus</h2>
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
        <Card title="Bus Assignment">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <span>Loading bus assignment...</span>
            </div>
          ) : busAssignment ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">Bus Number</p>
                  <p className="text-2xl font-bold text-navy-900">{busAssignment?.bus?.plate_number || 'N/A'}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="text-2xl font-bold text-navy-900">{busAssignment?.route?.route_name || 'N/A'}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">Seat Number</p>
                  <p className="text-2xl font-bold text-navy-900">{busAssignment?.seat_number || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500">Bus Capacity</p>
                <p className="text-2xl font-bold text-navy-900">{busAssignment?.bus?.capacity || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={getStatusClassName(busAssignment?.bus?.status || 'active')}>
                  {getStatusText(busAssignment?.bus?.status || 'active')}
                </p>
              </div>
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