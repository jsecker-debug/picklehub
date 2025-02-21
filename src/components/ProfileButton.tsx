import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GradientButton } from '@/components/ui/gradient-button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function ProfileButton() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState(0)

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''

  useEffect(() => {
    if (user) {
      fetchAvatarUrl()
    }
  }, [user, lastRefresh])

  const fetchAvatarUrl = async () => {
    try {
      // First try to get the URL from the participants table
      const { data: participant } = await supabase
        .from('participants')
        .select('avatar_url')
        .eq('id', user?.id)
        .single()

      if (participant?.avatar_url) {
        // If URL already has a timestamp, use it as is
        if (participant.avatar_url.includes('?v=')) {
          setAvatarUrl(participant.avatar_url)
        } else {
          // Add timestamp to prevent caching
          const timestamp = new Date().getTime()
          setAvatarUrl(`${participant.avatar_url}?v=${timestamp}`)
        }
        return
      }

      // Fallback to checking storage directly
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
          const timestamp = new Date().getTime()
          setAvatarUrl(`${urlData.publicUrl}?v=${timestamp}`)
        }
      }
    } catch (error) {
      console.error('Error fetching avatar URL:', error)
    }
  }

  // Function to force refresh the avatar
  const refreshAvatar = () => {
    setLastRefresh(Date.now())
  }

  return (
    <GradientButton
      onClick={() => navigate('/profile')}
      className="min-w-0 px-4 py-2"
    >
      <Avatar className="h-6 w-6 mr-2 ring-1 ring-offset-1 ring-offset-background ring-muted">
        <AvatarImage 
          src={avatarUrl || undefined} 
          className="object-cover"
          style={{ width: '100%', height: '100%' }}
        />
        <AvatarFallback className="text-sm bg-white/20 text-white">
          {userName[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">{userName}</span>
    </GradientButton>
  )
} 