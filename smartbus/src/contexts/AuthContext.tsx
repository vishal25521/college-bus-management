import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import toast from '../utils/toast'

export interface AuthContextType {
  session: any
  role: 'admin' | 'student' | 'driver' | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, role: string, name: string) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any>(null)
  const [role, setRole] = useState<'admin' | 'student' | 'driver' | null>(null)
  const [loading, setLoading] = useState(true)

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        
        if (session?.user?.id) {
          // Fetch user role from profiles table
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single()
            
            if (error) throw error
            setRole(data?.role || null)
          } catch (error: any) {
            toast.error('Error fetching user role:', error.message)
            setRole(null)
          }
        } else {
          setRole(null)
        }
        
        setLoading(false)
      }
    )

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        toast.error('Login failed: ' + error.message)
        throw error
      }
    } catch (error: any) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Register function
  const register = async (email: string, password: string, role: string, name: string) => {
    setLoading(true)
    try {
      // First create the auth user
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (authError) {
        toast.error('Registration failed: ' + authError.message)
        throw authError
      }
      
      // Then create the profile
      if (supabase.auth.user()) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: supabase.auth.user()?.id,
            role,
            full_name: name,
          })
        
        if (profileError) {
          toast.error('Profile creation failed: ' + profileError.message)
          throw profileError
        }
      }
    } catch (error: any) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast.error('Logout failed: ' + error.message)
        throw error
      }
    } catch (error: any) {
      throw error
    } finally {
      setSession(null)
      setRole(null)
      setLoading(false)
    }
  }

  // Forgot password
  const forgotPassword = async (email: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.sendPasswordReset({
        email,
      })
      
      if (error) {
        toast.error('Error sending reset email: ' + error.message)
        throw error
      }
    } catch (error: any) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Reset password with token
  const resetPassword = async (token: string, newPassword: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.update({
        type: 'recovery',
        token,
        password: newPassword,
      })
      
      if (error) {
        toast.error('Password reset failed: ' + error.message)
        throw error
      }
    } catch (error: any) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ session, role, loading, login, register, logout, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

// exports are done individually above (useAuth on line 6, AuthProvider on line 12)