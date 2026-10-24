import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { reactToast } from '../utils/toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleForgotPassword = async () => {
    setLoading(true)
    try {
      await supabase.auth.sendPasswordReset({
        email,
      })
      toast.success('Password reset link sent to your email')
      setTimeout(() => navigate('/login'), 3000)
    } catch (error: any) {
      toast.error('Error sending reset email: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-100 to-white p-6 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-navy-900 mb-2">Forgot Password</h2>
          <p className="text-gray-600">Enter your email address to receive a password reset link</p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus-primary-500 focus:border-transparent transition-colors"
              placeholder="enter your email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-xl text-sm hover:bg-primary-700 focus:ring-2 focus-primary-500 focus:outline-none transition-colors">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account? <a href="/register" className="font-medium text-primary-600 hover:underline">Register</a>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Already have an account? <a href="/login" className="font-medium text-primary-600 hover:underline">Login</a>
          </p>
        </div>
      </div>
    </div>
  )
}