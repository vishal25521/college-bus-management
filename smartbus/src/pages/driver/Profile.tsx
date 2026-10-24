import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import { Card, Input, Button } from '../../components/ui'
import { Home, Users, Calendar, Mail, Plus, Settings, Edit, Delete, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../../utils/toast'

export default function DriverProfile() {
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch profile data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!session?.user?.id) return

        const { data, error } = await db.profiles.getProfile(session.user.id)
        if (error) throw error
        setProfile(data)
        setLoading(false)
      } catch (error: any) {
        toast.error('Error loading profile:', error.message)
        setLoading(false)
      }
    }

    loadData()
  }, [session?.user?.id])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement

    try {
      const { error } = await db.profiles.updateProfile(session?.user?.id || '', {
        full_name: (form.querySelector('[name="fullName"]') as HTMLInputElement).value,
        phone: (form.querySelector('[name="phone"]') as HTMLInputElement).value,
      })

      if (error) throw error

      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error('Error updating profile:', error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900">Driver Profile</h2>
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
        <Card>
          <div className="px-6 py-4">
            <h3 className="text-lg font-bold text-navy-900 mb-4">Driver Profile Information</h3>
            
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <span>Loading profile...</span>
              </div>
            ) : profile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={profile.full_name || ''}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={session?.user?.email || ''}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                    readOnly
                  />
                </div>

                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    License Number
                  </label>
                  <input
                    id="licenseNumber"
                    type="text"
                    value={profile.license_number || ''}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                    placeholder="e.g., LIC-12345"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="text"
                    value={profile.phone || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
                    placeholder="e.g., +1-555-123-4567"
                  />
                </div>

                <button type="submit" className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-xl text-sm hover:bg-primary-700 focus:ring-2 focus-primary-500 focus:outline-none transition-colors">
                  Update Profile
                </button>
              </form>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>Profile loading...</p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}