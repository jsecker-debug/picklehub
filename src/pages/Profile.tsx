import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Participant = {
  id: string
  name: string
  level: number
  gender: 'M' | 'F' | 'O'
  total_games_played: number
  wins: number
  losses: number
  rating_confidence: number
  rating_volatility: number
  created_at: string
}

export default function Profile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    level: '',
    gender: '',
    phone: ''
  })

  useEffect(() => {
    if (user) {
      fetchParticipant()
    }
  }, [user])

  const fetchParticipant = async () => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error

      setParticipant(data)
      const nameParts = data.name.split(' ')
      setFormData({
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' '),
        level: data.level.toString(),
        gender: data.gender,
        phone: user?.user_metadata?.phone || ''
      })
    } catch (error) {
      console.error('Error fetching participant:', error)
    }
  }

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

    try {
      // Update auth metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone
        }
      })

      if (updateError) throw updateError

      // Update participant record
      const { error: participantError } = await supabase
        .from('participants')
        .update({
          name: `${formData.firstName} ${formData.lastName}`,
          gender: formData.gender
        })
        .eq('id', user?.id)

      if (participantError) throw participantError

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated!",
      })
    } catch (error) {
      console.error('Profile update error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An error occurred while updating your profile',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user?.email || '', {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive"
      })
    }
  }

  if (!participant) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  name="firstName"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
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
              <label className="block text-sm font-medium text-gray-700">DUPR Rating</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border rounded-md bg-gray-100"
                value={formData.level}
                disabled
              />
              <p className="mt-1 text-sm text-gray-500">Rating is updated automatically based on game results</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                name="phone"
                type="tel"
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-between">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={handleResetPassword}>
                Reset Password
              </Button>
            </div>
          </form>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Statistics</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Games</p>
                <p className="text-lg font-medium">{participant.total_games_played}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Win/Loss Record</p>
                <p className="text-lg font-medium">{participant.wins}/{participant.losses}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 