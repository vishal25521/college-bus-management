import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshSession: true,
    debug: false
  }
})

// ============================================================
// Database Query Functions
// ============================================================

// Profiles
export const db = {
  // Get user profile
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  // Get profile by ID (for admin views)
  getProfileById: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, auth.users(email, confirmed_at)')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  // Update profile
  updateProfile: async (userId: string, updates: { full_name?: string; phone?: string; avatar_url?: string }) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return data
  },

  // Get all profiles with role filter (admin only)
  getAllProfiles: async (role?: 'admin' | 'student' | 'driver') => {
    let query = supabase.from('profiles').select('*')
    
    if (role) {
      query = query.eq('role', role)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },
}

// Buses
export const buses = {
  getAll: async () => {
    const { data, error } = await supabase.from('buses').select(`
      *,
      profiles!driver_id(full_name, phone)
    `)
    
    if (error) throw error
    return data
  },

  getByPlate: async (plateNumber: string) => {
    const { data, error } = await supabase
      .from('buses')
      .select('*')
      .eq('plate_number', plateNumber)
      .single()
    
    if (error) throw error
    return data
  },

  getById: async (busId: string) => {
    const { data, error } = await supabase
      .from('buses')
      .select(`
        *,
        profiles!driver_id(full_name, phone)
      `)
      .eq('id', busId)
      .single()
    
    if (error) throw error
    return data
  },

  create: async (busData: { plate_number: string; capacity: number; model?: string; status?: string }) => {
    const { data, error } = await supabase
      .from('buses')
      .insert([busData])
      .select()
    
    if (error) throw error
    return data
  },

  update: async (busId: string, updates: { capacity?: number; model?: string; status?: string }) => {
    const { data, error } = await supabase
      .from('buses')
      .update(updates)
      .eq('id', busId)
      .select()
    
    if (error) throw error
    return data
  },

  delete: async (busId: string) => {
    const { error } = await supabase.from('buses').delete().eq('id', busId)
    
    if (error) throw error
  },
}

// Drivers
export const drivers = {
  getAll: async () => {
    const { data, error } = await supabase.from('drivers').select(`
      *,
      profiles(full_name, phone)
    `)
    
    if (error) throw error
    return data
  },

  getById: async (driverId: string) => {
    const { data, error } = await supabase
      .from('drivers')
      .select(`
        *,
        profiles(full_name, phone)
      `)
      .eq('id', driverId)
      .single()
    
    if (error) throw error
    return data
  },

  getByLicense: async (licenseNumber: string) => {
    const { data, error } = await supabase
      .from('drivers')
      .select()
      .eq('license_number', licenseNumber)
      .single()
    
    if (error) throw error
    return data
  },

  create: async (driverData: { full_name: string; email: string; phone?: string; license_number: string; license_expiry: string }) => {
    const { data, error } = await supabase.from('drivers').insert([driverData]).select()
    
    if (error) throw error
    return data
  },

  update: async (driverId: string, updates: any) => {
    const { data, error } = await supabase.from('drivers').update(updates).eq('id', driverId).select()
    
    if (error) throw error
    return data
  },
}

// Routes
export const routes = {
  getAll: async () => {
    const { data, error } = await supabase.from('routes').select(`
      *,
      profiles!created_by(full_name)
    `)
    
    if (error) throw error
    return data
  },

  getByName: async (routeName: string) => {
    const { data, error } = await supabase
      .from('routes')
      .select()
      .eq('route_name', routeName)
      .single()
    
    if (error) throw error
    return data
  },

  getById: async (routeId: string) => {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        *,
        profiles!created_by(full_name)
      `)
      .eq('id', routeId)
      .single()
    
    if (error) throw error
    return data
  },

  create: async (routeData: { route_name: string; description?: string; start_location: string; end_location: string; waypoints?: string; distance_km?: number; estimated_duration_minutes?: number; status?: string }) => {
    const { data, error } = await supabase.from('routes').insert([routeData]).select()
    
    if (error) throw error
    return data
  },

  update: async (routeId: string, updates: any) => {
    const { data, error } = await supabase.from('routes').update(updates).eq('id', routeId).select()
    
    if (error) throw error
    return data
  },
}

// Bus Stops
export const busStops = {
  getByRoute: async (routeId: string) => {
    const { data, error } = await supabase
      .from('bus_stops')
      .select('*')
      .eq('route_id', routeId)
      .order('stop_order')
    
    if (error) throw error
    return data
  },

  getById: async (stopId: string) => {
    const { data, error } = await supabase
      .from('bus_stops')
      .select()
      .eq('id', stopId)
      .single()
    
    if (error) throw error
    return data
  },

  create: async (stopData: { route_id: string; stop_name: string; address?: string; latitude?: number; longitude?: number; stop_order: number; is_pickup: boolean }) => {
    const { data, error } = await supabase.from('bus_stops').insert([stopData]).select()
    
    if (error) throw error
    return data
  },

  update: async (stopId: string, updates: any) => {
    const { data, error } = await supabase.from('bus_stops').update(updates).eq('id', stopId).select()
    
    if (error) throw error
    return data
  },
}

// Student Buses
export const studentBuses = {
  getByStudent: async (studentId: string) => {
    const { data, error } = await supabase
      .from('student_buses')
      .select(`
        *,
        buses(plate_number, capacity, status),
        routes(route_name)
      `)
      .eq('student_id', studentId)
      .eq('active', true)
    
    if (error) throw error
    return data
  },

  getByBus: async (busId: string) => {
    const { data, error } = await supabase
      .from('student_buses')
      .select(`
        *,
        profiles(full_name, email),
        routes(route_name)
      `)
      .eq('bus_id', busId)
      .eq('active', true)
    
    if (error) throw error
    return data
  },

  assignStudent: async (assignmentData: {
    student_id: string
    bus_id: string
    route_id?: string
    seat_number?: string
    assigned_by?: string
  }) => {
    // Check for existing assignment
    const { data: existing, error: checkError } = await supabase
      .from('student_buses')
      .select()
      .eq('student_id', assignmentData.student_id)
      .eq('bus_id', assignmentData.bus_id)
      .eq('active', true)
    
    if (checkError) throw checkError
    
    if (existing && existing.length > 0) {
      throw new Error('Student is already assigned to this bus')
    }
    
    const { data, error } = await supabase.from('student_buses').insert([
      {
        student_id: assignmentData.student_id,
        bus_id: assignmentData.bus_id,
        route_id: assignmentData.route_id,
        seat_number: assignmentData.seat_number,
        assigned_by: assignmentData.assigned_by,
      }
    ]).select()
    
    if (error) throw error
    return data
  },

  releaseStudent: async (studentId: string, busId: string) => {
    const { error } = await supabase.from('student_buses')
      .update({ active: false })
      .eq('student_id', studentId)
      .eq('bus_id', busId)
    
    if (error) throw error
  },
}

// Attendance
export const attendance = {
  getByStudent: async (studentId: string) => {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        buses(plate_number),
        routes(route_name),
        profiles!marked_by(full_name, role)
      `)
      .eq('student_id', studentId)
      .order('attendance_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  getByBusDate: async (busId: string, date: string) => {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        profiles(full_name, email),
        profiles!marked_by(full_name, role)
      `)
      .eq('bus_id', busId)
      .eq('attendance_date', date)
      .order('marked_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  markAttendance: async (attendanceData: {
    student_id: string
    bus_id: string
    route_id?: string
    attendance_status: 'present' | 'absent' | 'late' | 'excused'
    attendance_date: string
    marked_by?: string
  }) => {
    // Check for duplicate attendance
    const { data: existing, error: checkError } = await supabase
      .from('attendance')
      .select()
      .eq('student_id', attendanceData.student_id)
      .eq('bus_id', attendanceData.bus_id)
      .eq('attendance_date', attendanceData.attendance_date)
    
    if (checkError) throw checkError
    
    if (existing && existing.length > 0) {
      throw new Error('Attendance already marked for this student on this date')
    }
    
    const { data, error } = await supabase.from('attendance').insert([
      {
        student_id: attendanceData.student_id,
        bus_id: attendanceData.bus_id,
        route_id: attendanceData.route_id,
        attendance_status: attendanceData.attendance_status,
        attendance_date: attendanceData.attendance_date,
        marked_by: attendanceData.marked_by,
      }
    ]).select()
    
    if (error) throw error
    return data
  },

  getBusAttendanceSummary: async (busId: string, startDate?: string, endDate?: string) => {
    let query = supabase.from('attendance').select(`
      *,
      profiles(full_name, email),
      buses(plate_number)
    `).eq('bus_id', busId)
    
    if (startDate) {
      query = query.gte('attendance_date', startDate)
    }
    
    if (endDate) {
      query = query.lte('attendance_date', endDate)
    }
    
    const { data, error } = await query.order('attendance_date', { ascending: true })
    
    if (error) throw error
    return data
  },
}