import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Button, Input, Table } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function ManageRoutes() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch all routes
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        if (!session?.user?.id) return

        const { data, error } = await db.routes.getAll()
        if (error) throw error
        setRoutes(data)
        setLoading(false)
      } catch (error: any) {
        toast.error('Error loading routes:', error.message)
        setLoading(false)
      }
    }

    loadRoutes()
  }, [session?.user?.id])

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const routeName = (form.querySelector('[name="routeName"]') as HTMLInputElement).value
    const startLocation = (form.querySelector('[name="startLocation"]') as HTMLInputElement).value
    const endLocation = (form.querySelector('[name="endLocation"]') as HTMLInputElement).value

    try {
      await db.routes.create({
        route_name: routeName,
        start_location: startLocation,
        end_location: endLocation,
        status: 'active'
      })
      toast.success('Route added successfully')
      setRoutes([...routes, { id: crypto.randomUUID(), route_name: routeName, start_location, end_location, status: 'active' }])
      form.reset()
    } catch (error: any) {
      toast.error('Error adding route:', error.message)
    }
  }

  const handleEditRoute = async (routeId: string, e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const routeName = (form.querySelector('[name="routeName"]') as HTMLInputElement).value
    const startLocation = (form.querySelector('[name="startLocation"]') as HTMLInputElement).value
    const endLocation = (form.querySelector('[name="endLocation"]') as HTMLInputElement).value

    try {
      await db.routes.update(routeId, { route_name: routeName, start_location: startLocation, end_location: endLocation })
      toast.success('Route updated successfully')
      const index = routes.findIndex(r => r.id === routeId)
      if (index > -1) {
        setRoutes(routes.map((r, i) => i === index ? { ...r, route_name: routeName, start_location, end_location } : r))
      }
      form.reset()
    } catch (error: any) {
      toast.error('Error updating route:', error.message)
    }
  }

  const handleDeleteRoute = async (routeId: string) => {
    try {
      await db.routes.delete(routeId)
      toast.success('Route deleted successfully')
      setRoutes(routes.filter(r => r.id !== routeId))
    } catch (error: any) {
      toast.error('Error deleting route:', error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900">Manage Routes</h2>
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
        {/* Add Route Form */}
        <Card title="Add New Route">
          <form onSubmit={handleAddRoute} className="space-y-4">
            <div>
              <label htmlFor="routeName" className="block text-sm font-medium text-gray-700 mb-2">Route Name</label>
              <input 
                id="routeName" 
                type="text" 
                name="routeName" 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                placeholder="e.g., Route A-1"
              />
            </div>
            <div>
              <label htmlFor="startLocation" className="block text-sm font-medium text-gray-700 mb-2">Start Location</label>
              <input 
                id="startLocation" 
                type="text" 
                name="startLocation" 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="endLocation" className="block text-sm font-medium text-gray-700 mb-2">End Location</label>
              <input 
                id="endLocation" 
                type="text" 
                name="endLocation" 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
              />
            </div>
            <button type="submit" className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-xl text-sm hover:bg-primary-700 focus:ring-2 focus-primary-500 focus:outline-none transition-colors">
              Add Route
            </button>
          </form>
        </Card>

        {/* Routes List */}
        <Card title="Route Records">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <span>Loading routes...</span>
            </div>
          ) : routes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table
                data={routes}
                columns={[
                  { key: 'route_name', label: 'Route Name' },
                  { key: 'start_location', label: 'Start' },
                  { key: 'end_location', label: 'End' }
                ]}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No route records found</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}