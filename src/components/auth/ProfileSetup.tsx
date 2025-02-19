import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/components/ui/use-toast'
import { useAuth } from '../../contexts/AuthContext'

export function ProfileSetup() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    level: '', // This is the DUPR rating
    gender: '',
    phone: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/auth/sign-in')
    } else if (!user.email_confirmed_at) {
      navigate('/auth/email-confirmation')
    }
  }, [user, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (!user) throw new Error('No user found')
      if (!user.email_confirmed_at) {
        navigate('/auth/email-confirmation')
        return
      }

      // Validate DUPR rating (level)
      const level = parseFloat(formData.level)
      if (isNaN(level) || level < 2 || level > 8) {
        throw new Error('DUPR rating must be between 2 and 8')
      }

      // First update auth metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone
        }
      })

      if (updateError) throw updateError

      // Then create participant record
      const { error: participantError } = await supabase
        .from('participants')
        .upsert([{
          id: user.id,
          name: `${formData.firstName} ${formData.lastName}`,
          level,
          gender: formData.gender,
          total_games_played: 0,
          wins: 0,
          losses: 0,
          rating_confidence: 1.0,
          rating_volatility: 1.0,
          created_at: new Date().toISOString()
        }], {
          onConflict: 'id'
        })

      if (participantError) {
        console.error('Participant creation error:', participantError)
        throw participantError
      }

      toast({
        title: "Profile Complete",
        description: "Your profile has been successfully set up!",
      })

      // Redirect to home page
      navigate('/home')
    } catch (error) {
      console.error('Profile setup error:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred while saving your profile'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Complete Your Profile</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please provide some additional information to complete your registration
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                DUPR Rating (2.00-8.00)
              </label>
              <input
                id="level"
                name="level"
                type="number"
                step="0.01"
                min="2"
                max="8"
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md"
                value={formData.level}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-md ${
              message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  )
} 