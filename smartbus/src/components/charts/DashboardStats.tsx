import React, { useEffect, useState } from 'react'
import { 
  Card, 
  Button, 
  Input, 
  Select 
} from '../ui'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts'

interface DashboardStatsProps {
  onRefresh?: () => void
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  onRefresh
}) => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch stats from Supabase
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real app, these would be actual Supabase queries
        // For now, we'll use placeholder data that will be replaced
        const { data, error } = await fetch('/api/stats').then(res => res.json())
        if (error) throw error
        setStats(data)
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [onRefresh])

  if (loading && !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Total Students"
          number="0"
          trend="+0%"
          icon="users"
        />
        <StatCard
          title="Active Buses"
          number="0"
          trend="+0%"
          icon="bus"
        />
        <StatCard
          title="Available Drivers"
          number="0"
          trend="+0%"
          icon="user-check"
        />
        <StatCard
          title="Daily Attendance"
          number="0%"
          trend="+0%"
          icon="calendar"
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Students Card */}
      <Card title="Total Registered Students">
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={stats?.students || []} loading={true}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="navy-600" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-500 mt-2">
          {stats?.totalStudents || 0} students registered
        </p>
      </Card>

      {/* Active Buses Card */}
      <Card title="Active Buses">
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={stats?.buses || []} loading={true}>
            <XAxis dataKey="plate_number" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="navy-600" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-500 mt-2">
          {stats?.activeBuses || 0} active buses
        </p>
      </Card>

      {/* Available Drivers Card */}
      <Card title="Available Drivers">
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={stats?.drivers || []} loading={true}>
            <XAxis dataKey="full_name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="navy-600" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-500 mt-2">
          {stats?.availableDrivers || 0} drivers available
        </p>
      </Card>

      {/* Daily Attendance Card */}
      <Card title="Daily Attendance Percentage">
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={stats?.attendance || []} loading={true}>
            <XAxis dataKey="date" />
            <YAxis min={0} max={100} />
            <Tooltip />
            <Legend />
            <Bar dataKey="percentage" fill="navy-600" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-500 mt-2">
          {stats?.dailyAttendance || 0}% attendance
        </p>
      </Card>
    </div>
  )
}

interface StatCardProps {
  title: string
  number: string
  trend: string
  icon: string
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  number,
  trend,
  icon
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center">
            {icon === 'users' && <svg className="w-5 h-5 text-navy-400" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>}
            {icon === 'bus' && <svg className="w-5 h-5 text-navy-400" viewBox="0 0 24 24"><path fill="currentColor" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2zm0-18h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
            {icon === 'user-check' && <svg className="w-5 h-5 text-navy-400" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15.16-4.23 1.16.89-5.23a1 1 0 0 0-1.73-1.06L8.16 12l-4.04 1.86a1 1 0 0 0-1.06 1.75l5.47 2.83 1.51-5.28a1 1 0 0 0-1.73-1.06L3.84 12z"/></svg>}
            {icon === 'calendar' && <svg className="w-5 h-5 text-navy-400" viewBox="0 0 24 24"><path fill="currentColor" d="M13 2V1h-2v20h2v-20zm-1 3H9c.03-2.87 2.23-5.5 5-5s5.02 2.13 5 5h-4z"/></svg>}
          </div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-navy-900">{number}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">{trend}</p>
      </div>
    </div>
  )
}