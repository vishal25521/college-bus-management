import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { reactToast } from '../utils/toast'

export default function UnauthorizedPage() {
  const { session, role } = useAuth()
  const navigate = () => window.location.href = '/login'

  useEffect(() => {
    // If user has a session but wrong role, redirect appropriately
    if (session?.user?.id && !role) {
      toast.error('Access denied. User role not found.')
      navigate()
    }
  }, [session?.user?.id, role])

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19 9v6h-6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2-3L22 7z"/>
            <path fill="currentColor" d="M14 2v2h6v14h-2v5l-5-3-5 3v-5h-2v-2l5-3 5 3h2v2zm-6 7v2h4v2H8v-2H6v-2h4zm7.5-2.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zm-2 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zm-5.5 5.5c.83 0 1.5.67 1.5 1.5s-.66 1.5-1.5 1.5s-1.5-.66-1.5-1.5s.66-1.5 1.5-1.5zm1.5-8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zm0 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zm5.5 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.66-1.5 1.5-1.5zm-5.5-5.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zm0 5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5s.66-1.5 1.5-1.5zm0 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-navy-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
        <button
          onClick={() => navigate()}
          className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-xl text-sm hover:bg-primary-700 focus:ring-2 focus-primary-500 focus:outline-none transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  )
}