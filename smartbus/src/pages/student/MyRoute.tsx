import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Input } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function MyRoute() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [routeInfo, setRouteInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch route information
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!session?.user?.id) return

        // Get student's bus assignment first
        const { data: assignmentData, error: assignmentError } = await db.studentBuses.getByStudent(session.user.id)
        if (assignmentError) throw assignmentError

        if (assignmentData && assignmentData.length > 0 && assignmentData[0].route_id) {
          // Get route details
          const { data: routeData, error: routeError } = await db.routes.getById(assignmentData[0].route_id)
          if (routeError) throw routeError

          setRouteInfo(routeData)
        } else {
          toast.info('No route assignment found. Contact admin.')
        }
      } catch (error: any) {
        toast.error('Error loading route information:', error.message)
      } finally {
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
            <h2 className="text-xl font-bold text-navy-900">My Route</h2>
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
        <Card title="Route Information">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <span>Loading route...</span>
            </div>
          ) : routeInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">Route Name</p>
                  <p className="text-2xl font-bold text-navy-900">{routeInfo?.route_name || 'N/A'}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">Start Location</p>
                  <p className="text-2xl font-bold text-navy-900">{routeInfo?.start_location || 'N/A'}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">End Location</p>
                  <p className="text-2xl font-bold text-navy-900">{routeInfo?.end_location || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500">Distance</p>
                <p className="text-2xl font-bold text-navy-900">{routeInfo?.distance_km !== undefined ? routeInfo.distance_km + ' km' : 'N/A'}</p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500">Estimated Duration</p>
                <p className="text-2xl font-bold text-navy-900">{routeInfo?.estimated_duration_minutes !== undefined ? routeInfo.estimated_duration_minutes + ' min' : 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No route assignment found</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}