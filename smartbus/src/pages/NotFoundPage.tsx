import { HomeAlert } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 flex items-center justify-center text-center">
      <div className="bg-white rounded-3xl p-8 max-w-md shadow-2xl border border-gray-200">
        <div className="text-6xl mb-4">404</div>
        <h1 className="text-2xl font-bold text-navy-900 mb-3">Page Not Found</h1>
        <p className="text-gray-600 mb-6">The page you are looking for does not exist.</p>
        <div>
          <a href="/" className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
            Go to Home
          </a>
        </div>
      </div>
    </div>
  )
}