import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Button, Input, Table } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function ManageDrivers() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch all drivers
  useEffect(() => {
    const loadDrivers = async () => {
      try {
        if (!session?.user?.id) return

        const { data, error } = await db.drivers.getAll()
        if (error) throw error
        setDrivers(data)
        setLoading(false)
      } catch (error: any) {
        toast.error('Error loading drivers:', error.message)
        setLoading(false)
      }
    }

    loadDrivers()
  }, [session?.user?.id])

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const fullName = (form.querySelector('[name="fullName"]') as HTMLInputElement).value
    const email = (form.querySelector('[name="email"]') as HTMLInputElement).value
    const phone = (form.querySelector('[name="phone"]') as HTMLInputElement).value
    const licenseNumber = (form.querySelector('[name="licenseNumber"]') as HTMLInputElement).value
    const licenseExpiry = (form.querySelector('[name="licenseExpiry"]') as HTMLInputElement).value

    try {
      await db.drivers.create({
        full_name: fullName,
        email,
        phone,
        license_number: licenseNumber,
        license_expiry: licenseExpiry,
        status: 'available'
      })
      toast.success('Driver added successfully')
      setDrivers([...drivers, { id: crypto.randomUUID(), full_name: fullName, email, phone, license_number: licenseNumber, license_expiry: licenseExpiry, status: 'available' }])
      form.reset()
    } catch (error: any) {
      toast.error('Error adding driver:', error.message)
    }
  }

  const handleEditDriver = async (driverId: string, e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const fullName = (form.querySelector('[name="fullName"]') as HTMLInputElement).value
    const phone = (form.querySelector('[name="phone"]') as HTMLInputElement).value
    const status = (form.querySelector('[name="status"]') as HTMLInputElement).value

    try {
      await db.drivers.update(driverId, { full_name: fullName, phone, status })
      toast.success('Driver updated successfully')
      const index = drivers.findIndex(d => d.id === driverId)
      if (index > -1) {
        setDrivers(drivers.map((d, i) => i === index ? { ...d, full_name: fullName, phone, status } : d))
      }
      form.reset()
    } catch (error: any) {
      toast.error('Error updating driver:', error.message)
    }
  }

  const handleDeleteDriver = async (driverId: string) => {
    try {
      await db.drivers.delete(driverId)
      toast.success('Driver deleted successfully')
      setDrivers(drivers.filter(d => d.id !== driverId))
    } catch (error: any) {
      toast.error('Error deleting driver:', error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900">Manage Drivers</h2>
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
        {/* Add Driver Form */}
        <Card title="Add New Driver">
          <form onSubmit={handleAddDriver} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input 
                id="fullName" 
                type="text" 
                name="fullName" 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                id="email" 
                type="email" 
                name="email" 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input 
                id="phone" 
                type="text" 
                name="phone" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
              <input 
                id="licenseNumber" 
                type="text" 
                name="licenseNumber" 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                placeholder="e.g., LIC-12345"
              />
            </div>
            <div>
              <label htmlFor="licenseExpiry" className="block text-sm font-medium text-gray-700 mb-2">License Expiry</label>
              <input 
                id="licenseExpiry" 
                type="date" 
                name="licenseExpiry" 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
              />
            </div>
            <button type="submit" className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-xl text-sm hover:bg-primary-700 focus:ring-2 focus-primary-500 focus:outline-none transition-colors">
              Add Driver
            </button>
          </form>
        </Card>

        {/* Drivers List */}
        <Card title="Driver Records">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <span>Loading drivers...</span>
            </div>
          ) : drivers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table
                data={drivers}
                columns={[
                  { key: 'full_name', label: 'Name' },
                  { key: 'license_number', label: 'License Number' },
                  { key: 'phone', label: 'Phone' },
                  { key: 'status', label: 'Status' }
                ]}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No driver records found</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}