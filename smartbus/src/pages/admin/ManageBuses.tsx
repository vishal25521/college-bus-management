import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Button, Input, Table } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function ManageBuses() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [buses, setBuses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch all buses
  useEffect(() => {
    const loadBuses = async () => {
      try {
        if (!session?.user?.id) return

        const { data, error } = await db.buses.getAll()
        if (error) throw error
        setBuses(data)
        setLoading(false)
      } catch (error: any) {
        toast.error('Error loading buses:', error.message)
        setLoading(false)
      }
    }

    loadBuses()
  }, [session?.user?.id])

  const handleAddBus = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const plateNumber = (form.querySelector('[name="plateNumber"]') as HTMLInputElement).value
    const capacity = (form.querySelector('[name="capacity"]') as HTMLInputElement).value
    const model = (form.querySelector('[name="model"]') as HTMLInputElement).value

    try {
      await db.buses.create({ plate_number: plateNumber, capacity: Number(capacity), model, status: 'active' })
      toast.success('Bus added successfully')
      setBuses([...buses, { id: crypto.randomUUID(), plate_number: plateNumber, capacity: Number(capacity), model, status: 'active' }])
      form.reset()
    } catch (error: any) {
      toast.error('Error adding bus:', error.message)
    }
  }

  const handleEditBus = async (busId: string, e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const capacity = (form.querySelector('[name="capacity"]') as HTMLInputElement).value
    const model = (form.querySelector('[name="model"]') as HTMLInputElement).value
    const status = (form.querySelector('[name="status"]') as HTMLInputElement).value

    try {
      await db.buses.update(busId, { capacity: Number(capacity), model, status })
      toast.success('Bus updated successfully')
      const index = buses.findIndex(b => b.id === busId)
      if (index > -1) {
        setBuses(buses.map((b, i) => i === index ? { ...b, capacity: Number(capacity), model, status } : b))
      }
      form.reset()
    } catch (error: any) {
      toast.error('Error updating bus:', error.message)
    }
  }

  const handleDeleteBus = async (busId: string) => {
    // Check if bus has students assigned
    const { data: assignments, error: assignError } = await db.studentBuses.getByBus(busId)
    if (assignError) throw assignError
    if (assignments && assignments.length > 0) {
      toast.error('Cannot delete bus. It has students assigned.')
      return
    }

    try {
      await db.buses.delete(busId)
      toast.success('Bus deleted successfully')
      setBuses(buses.filter(b => b.id !== busId))
    } catch (error: any) {
      toast.error('Error deleting bus:', error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900">Manage Buses</h2>
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
        {/* Add Bus Form */}
        <Card title="Add New Bus">
          <form onSubmit={handleAddBus} className="space-y-4">
            <div>
              <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
              <input 
                id="plateNumber" 
                type="text" 
                name="plateNumber" 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                placeholder="e.g., ABC-1234"
              />
            </div>
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
              <input 
                id="capacity" 
                type="number" 
                name="capacity" 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                min="10" max="60"
              />
            </div>
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <input 
                id="model" 
                type="text" 
                name="model" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                placeholder="e.g., Volvo B7R"
              />
            </div>
            <button type="submit" className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-xl text-sm hover:bg-primary-700 focus:ring-2 focus-primary-500 focus:outline-none transition-colors">
              Add Bus
            </button>
          </form>
        </Card>

        {/* Buses List */}
        <Card title="Bus Records">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <span>Loading buses...</span>
            </div>
          ) : buses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table
                data={buses}
                columns={[
                  { key: 'plate_number', label: 'Plate Number' },
                  { key: 'capacity', label: 'Capacity' },
                  { key: 'model', label: 'Model' },
                  { key: 'status', label: 'Status' }
                ]}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No bus records found</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}