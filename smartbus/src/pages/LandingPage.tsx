import { useEffect } from 'react'
import toast from '../utils/toast'

export default function LandingPage() {
  useEffect(() => {
    // Show welcome toast on landing
    toast.info('Welcome to SmartBus - College Bus Management System')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-100 to-white p-6 md:p-8 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24">
            <path fill="currentColor" d="M2 7a2 2 0 012-2h3v9H4zm8 0a2 2 0 012-2h3v9h-3zm8 0a2 2 0 012-2h3v9h-3zM2 15a2 2 0 012-2h5v2h-5zm8 0a2 2 0 012-2h5v2h-5zM2 7a2 2 0 012-2h3v9H4zm8 0a2 2 0 012-2h3v9h-3zm8 0a2 2 0 012-2h3v9h-3zM2 15a2 2 0 012-2h5v2h-5zm8 0a2 2 0 012-2h5v2h-5z"/>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-navy-900 mb-4">SmartBus</h2>
        <p className="text-lg text-gray-600 mb-8">College Bus Management System</p>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium text-navy-900">Features</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Student Bus Assignments</li>
              <li>Driver Management</li>
              <li>Route Planning</li>
              <li>Attendance Tracking</li>
              <li>Google Sheets Integration</li>
              <li>Real-time Analytics</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-medium text-navy-900">Get Started</h3>
            <p className="text-gray-600 mb-4">Sign up or log in to access the full features of SmartBus:</p>
            <div className="flex gap-2">
              <a
                href="/register"
                className="flex-1 py-3 px-4 bg-primary-600 text-white font-medium rounded-xl text-sm hover:bg-primary-700 focus:ring-2 focus-primary-500 focus:outline-none transition-colors"
              >
                Register
              </a>
              <a
                href="/login"
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50 focus:ring-2 focus-primary-500 focus:outline-none transition-colors"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}