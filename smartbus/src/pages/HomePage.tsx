import { HomeBus, HomeUser, HomeMail, HomeSettings } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-100 to-white p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-3">
            SmartBus
          </h1>
          <p className="text-lg text-gray-600">
            College Bus Management System
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-2xl mx-auto">

          {/* Statistics Cards */}
          <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow border border-gray-200">
            <div className="flex items-start justify-center">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mt-1">
                <HomeBus className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Buses</p>
                <p className="text-2xl font-bold text-navy-900">0</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow border border-gray-200">
            <div className="flex items-start justify-center">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mt-1">
                <HomeUser className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Students</p>
                <p className="text-2xl font-bold text-navy-900">0</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow border border-gray-200">
            <div className="flex items-start justify-center">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mt-1">
                <HomeMail className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Drivers</p>
                <p className="text-2xl font-bold text-navy-900">0</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow border border-gray-200">
            <div className="flex items-start justify-center">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mt-1">
                <HomeSettings className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Routes</p>
                <p className="text-2xl font-bold text-navy-900">0</p>
              </div>
            </div>
          </div>

        </div>

        {/* Call to Action or Feature Highlights */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-navy-900 mb-4 text-center">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-600">✓</p>
              <p className="text-sm text-gray-600">Bus CRUD Operations</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600">✓</p>
              <p className="text-sm text-gray-600">Student Management</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600">✓</p>
              <p className="text-sm text-gray-600">Attendance Tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}