import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { CropImageModal } from '@/components/ui/crop-image-modal'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { PlayerStats } from '@/components/profile/PlayerStats'
import { ProfileActions } from '@/components/profile/ProfileActions'

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
            <ProfileAvatar
              avatarUrl={avatarUrl}
              firstName={formData.firstName}
              loading={loading}
              onImageSelect={handleImageSelect}
            />

            <ProfileForm
              formData={formData}
              onChange={handleChange}
            />

            <div className="w-full">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            <PlayerStats
              totalGames={participant.total_games_played}
              wins={participant.wins}
              losses={participant.losses}
            />

            <ProfileActions
              onResetPassword={handleResetPassword}
              onLogout={handleLogout}
            />
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
