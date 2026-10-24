import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Input, Button } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function Settings() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    schoolName: '',
    schoolAddress: '',
    contactEmail: '',
    phoneNumber: ''
  })

  // Fetch settings (in a real app, this would come from a settings table)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // For demo purposes, use existing profile data
        if (session?.user?.id) {
          const { data: profile, error } = await db.profiles.getProfile(session.user.id)
          if (error) throw error
          setSettings({
            schoolName: 'SmartBus College',
            schoolAddress: '123 College Avenue',
            contactEmail: profile?.email || '',
            phoneNumber: profile?.phone || ''
          })
        }
      } catch (error: any) {
        toast.error('Error loading settings:', error.message)
      }
    }

    loadSettings()
  }, [session?.user?.id])

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement

    try {
      // Update profile in Supabase
      const { error } = await db.profiles.updateProfile(session?.user?.id || '', {
        full_name: settings.schoolName,
        phone: settings.phoneNumber
      })

      if (error) throw error

      toast.success('Settings updated successfully')
    } catch (error: any) {
      toast.error('Error updating settings:', error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900">Settings</h2>
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
            <h3 className="text-lg font-bold text-navy-900 mb-4">Application Settings</h3>
            
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div>
                <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
                <input
                  id="schoolName"
                  type="text"
                  value={settings.schoolName}
                  onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                  placeholder="e.g., SmartBus College"
                />
              </div>

              <div>
                <label htmlFor="schoolAddress" className="block text-sm font-medium text-gray-700 mb-2">School Address</label>
                <input
                  id="schoolAddress"
                  type="text"
                  value={settings.schoolAddress}
                  onChange={(e) => setSettings({ ...settings, schoolAddress: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                  placeholder="e.g., 123 College Avenue"
                />
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                <input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                  placeholder="contact@college.edu"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  id="phoneNumber"
                  type="text"
                  value={settings.phoneNumber}
                  onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                  placeholder="e.g., +1-555-123-4567"
                />
              </div>

              <button type="submit" className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-xl text-sm hover:bg-primary-700 focus:ring-2 focus-primary-500 focus:outline-none transition-colors">
                Update Settings
              </button>
            </form>
          </div>
        </Card>
      </main>
    </div>
  )
}