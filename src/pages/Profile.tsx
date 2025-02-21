import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Camera } from 'lucide-react'
import { CropImageModal } from '@/components/ui/crop-image-modal'
import { useNavigate } from 'react-router-dom'
import { GradientButton } from '@/components/ui/gradient-button'

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
  avatar_url?: string
}

export default function Profile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    level: '',
    gender: '',
    phone: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchParticipant()
      fetchAvatarUrl()
    }
  }, [user])

  const fetchAvatarUrl = async () => {
    try {
      const { data: participant } = await supabase
        .from('participants')
        .select('avatar_url')
        .eq('id', user?.id)
        .single()

      if (participant?.avatar_url) {
        setAvatarUrl(participant.avatar_url)
        return
      }

      const { data: files } = await supabase
        .storage
        .from('profile_pictures')
        .list(`${user?.id}`, {
          limit: 1,
          sortBy: { column: 'name', order: 'desc' }
        })

      if (files && files.length > 0) {
        const { data: urlData } = await supabase
          .storage
          .from('profile_pictures')
          .getPublicUrl(`${user?.id}/${files[0].name}`)
        
        if (urlData?.publicUrl) {
          setAvatarUrl(urlData.publicUrl)
        }
      }
    } catch (error) {
      console.error('Error fetching avatar URL:', error)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return
    }
    const file = event.target.files[0]
    const imageUrl = URL.createObjectURL(file)
    setSelectedImage(imageUrl)
    setCropModalOpen(true)
  }

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    try {
      const filePath = `${user?.id}/avatar.jpg`
      setLoading(true)

      const { data: existingFiles } = await supabase
        .storage
        .from('profile_pictures')
        .list(`${user?.id}`)

      if (existingFiles && existingFiles.length > 0) {
        await supabase
          .storage
          .from('profile_pictures')
          .remove(existingFiles.map(file => `${user?.id}/${file.name}`))
      }

      const { error: uploadError } = await supabase.storage
        .from('profile_pictures')
        .upload(filePath, croppedImageBlob, { 
          upsert: true,
          contentType: 'image/jpeg'
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: urlData } = await supabase.storage
        .from('profile_pictures')
        .getPublicUrl(filePath)

      if (urlData?.publicUrl) {
        const timestamp = new Date().getTime()
        const urlWithTimestamp = `${urlData.publicUrl}?v=${timestamp}`
        setAvatarUrl(urlWithTimestamp)
        
        const { error: updateError } = await supabase
          .from('participants')
          .update({ avatar_url: urlWithTimestamp })
          .eq('id', user?.id)

        if (updateError) throw updateError

        await fetchAvatarUrl()

        toast({
          title: "Profile Picture Updated",
          description: "Your profile picture has been successfully updated!",
        })
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An error occurred while uploading your profile picture',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage)
        setSelectedImage(null)
      }
    }
  }

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
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone
        }
      })

      if (updateError) throw updateError

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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
      
      navigate('/auth/sign-in')
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An error occurred while logging out',
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
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 ring-2 ring-offset-2 ring-offset-background ring-muted">
                  <AvatarImage 
                    src={avatarUrl || undefined} 
                    className="object-cover"
                    style={{ width: '100%', height: '100%' }}
                  />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {formData.firstName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-0 right-0 p-1 rounded-full bg-white shadow-lg cursor-pointer 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Camera className="h-4 w-4 text-gray-600" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={loading}
                />
              </div>
              <p className="text-sm text-gray-500">
                Click to upload or change profile picture
              </p>
            </div>

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

            <div className="w-full">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4 mb-8">
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

            <div className="space-y-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleResetPassword}
                className="w-full"
              >
                Reset Password
              </Button>
              <GradientButton 
                type="button"
                onClick={handleLogout}
                className="w-full gradient-button-red"
              >
                Logout
              </GradientButton>
            </div>
          </form>

          {selectedImage && (
            <CropImageModal
              isOpen={cropModalOpen}
              onClose={() => {
                setCropModalOpen(false)
                URL.revokeObjectURL(selectedImage)
                setSelectedImage(null)
              }}
              imageSrc={selectedImage}
              onCropComplete={handleCropComplete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
