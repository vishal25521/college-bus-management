import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Input } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function AssignedBus() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [busAssignment, setBusAssignment] = useState<any>(null)
  const [bus, setBus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch driver's bus assignment
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!session?.user?.id) return

        // Get driver's assigned buses
        const { data: driverBuses, error: driverBusesError } = await db.buses.getAll()
        if (driverBusesError) throw driverBusesError

        const driverAssignedBuses = driverBuses.filter((b: any) => b.driver_id === session.user.id)

        if (driverAssignedBuses.length > 0) {
          setBusAssignment({ bus: driverAssignedBuses[0] })
          setBus(driverAssignedBuses[0])
        } else {
          toast.info('No bus assigned to you. Contact admin.')
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
            <h2 className="text-xl font-bold text-navy-900">Assigned Bus</h2>
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
        <Card title="Assigned Bus">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <span>Loading bus assignment...</span>
            </div>
          ) : bus ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">Bus Number</p>
                  <p className="text-2xl font-bold text-navy-900">{bus.plate_number}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="text-2xl font-bold text-navy-900">{bus.capacity}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">Model</p>
                  <p className="text-2xl font-bold text-navy-900">{bus.model || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500">Status</p>
                <p className={getStatusClassName(bus.status)}>
                  {getStatusText(bus.status)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Assigned Route</p>
                {bus.route_id ? (
                  <p className="text-sm text-navy-600">Route assigned</p>
                ) : (
                  <p className="text-sm text-gray-500">No route assigned</p>
                )}
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