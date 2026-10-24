import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Button, Input, Table } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut, Menu, ChartBar, Truck, Users as UsersIcon, Clock, Settings as SettingsIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function AdminDashboard() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalBuses: 0,
    totalDrivers: 0,
    activeRoutes: 0,
    attendancePercentage: 0
  })
  const [buses, setBuses] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch statistics using db helpers
  useEffect(() => {
    const loadStats = async () => {
      try {
        if (!session?.user?.id) return

        // Get total students
        const { count: studentCount, error: studentError } = await db.profiles.getAllProfiles('student')
          .then(r => ({ count: r?.length, error: null }))
          .catch(e => ({ count: 0, error: e.message }))

        if (studentError) throw new Error(studentError)

        // Get total buses
        const { count: busCount, error: busError } = await db.buses.getAll()
          .then(r => ({ count: r?.length, error: null }))
          .catch(e => ({ count: 0, error: e.message }))

        if (busError) throw new Error(busError)

        // Get total drivers
        const { count: driverCount, error: driverError } = await db.drivers.getAll()
          .then(r => ({ count: r?.length, error: null }))
          .catch(e => ({ count: 0, error: e.message }))

        if (driverError) throw new Error(driverError)

        // Get active routes
        const { count: routeCount, error: routeError } = await db.routes.getAll()
          .then(r => ({ count: r?.length, error: null }))
          .catch(e => ({ count: 0, error: e.message }))

        if (routeError) throw new Error(routeError)

        // Get attendance data for percentage calculation
        const { data: attendanceData, error: attendanceError } = await db.attendance.getByBusDate(
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        )

        if (attendanceError) throw attendanceError

        const presentCount = attendanceData?.filter((a: any) => a.attendance_status === 'present').length || 0
        const absentCount = attendanceData?.filter((a: any) => a.attendance_status === 'absent').length || 0
        const totalChecked = presentCount + absentCount
        const attendancePercent = totalChecked > 0 ? Math.round((presentCount / totalChecked) * 100) : 0

        setStats({
          totalStudents: studentCount || 0,
          totalBuses: busCount || 0,
          totalDrivers: driverCount || 0,
          activeRoutes: routeCount || 0,
          attendancePercentage: attendancePercent
        })
      } catch (error: any) {
        toast.error('Error loading statistics:', error.message)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [session?.user?.id])

  // Fetch buses
  useEffect(() => {
    const loadBuses = async () => {
      try {
        const { data, error } = await db.buses.getAll()
        if (error) throw error
        setBuses(data)
      } catch (error: any) {
        toast.error('Error loading buses:', error.message)
      }
    }
    loadBuses()
  }, [])

  // Fetch drivers
  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const { data, error } = await db.drivers.getAll()
        if (error) throw error
        setDrivers(data)
      } catch (error: any) {
        toast.error('Error loading drivers:', error.message)
      }
    }
    loadDrivers()
  }, [])

  // Fetch routes
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const { data, error } = await db.routes.getAll()
        if (error) throw error
        setRoutes(data)
      } catch (error: any) {
        toast.error('Error loading routes:', error.message)
      }
    }
    loadRoutes()
  }, [])

  // Fetch attendance
  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const { data, error } = await db.attendance.getByBusDate(
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        )
        if (error) throw error
        setAttendance(data || [])
      } catch (error: any) {
        toast.error('Error loading attendance:', error.message)
      }
    }
    loadAttendance()
  }, [])

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900">Admin Dashboard</h2>
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="py-4">
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-navy-900">{stats.totalStudents}</p>
            </div>
          </Card>
          <Card>
            <div className="py-4">
              <p className="text-sm text-gray-500">Total Buses</p>
              <p className="text-2xl font-bold text-navy-900">{stats.totalBuses}</p>
            </div>
          </Card>
          <Card>
            <div className="py-4">
              <p className="text-sm text-gray-500">Total Drivers</p>
              <p className="text-2xl font-bold text-navy-900">{stats.totalDrivers}</p>
            </div>
          </Card>
          <Card>
            <div className="py-4">
              <p className="text-sm text-gray-500">Active Routes</p>
              <p className="text-2xl font-bold text-navy-900">{stats.activeRoutes}</p>
            </div>
          </Card>
          <Card>
            <div className="py-4">
              <p className="text-sm text-gray-500">Attendance %</p>
              <p className="text-2xl font-bold text-navy-900">{stats.attendancePercentage}%</p>
            </div>
          </Card>
        </div>

        {/* Buses Management Section */}
        <Card title="Manage Buses">
          <div className="space-y-4">
            <form onSubmit={handleAddBus} className="space-y-3">
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

            <div className="space-y-3">
              {buses.map((bus) => (
                <div key={bus.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-navy-900">{bus.plate_number}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert('Edit bus functionality coming soon')}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBus(bus.id)}
                      className="text-sm text-danger-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Drivers Management Section */}
        <Card title="Manage Drivers">
          <div className="space-y-4">
            <form onSubmit={handleAddDriver} className="space-y-3">
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

            <div className="space-y-3">
              {drivers.map((driver) => (
                <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-navy-900">{driver.full_name}</span>
                  <span className="text-sm text-gray-500">{driver.license_number}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert('Edit driver functionality coming soon')}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDriver(driver.id)}
                      className="text-sm text-danger-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Routes Management Section */}
        <Card title="Manage Routes">
          <div className="space-y-4">
            <form onSubmit={handleAddRoute} className="space-y-3">
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

            <div className="space-y-3">
              {routes.map((route) => (
                <div key={route.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-navy-900">{route.route_name}</span>
                  <span className="text-sm text-gray-500">{route.start_location} → {route.end_location}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert('Edit route functionality coming soon')}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Attendance Section */}
        <Card title="Recent Attendance">
          <div className="space-y-4">
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
          </div>
        </Card>
      </main>
    </div>
  )
}