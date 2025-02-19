import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GradientButton } from '@/components/ui/gradient-button'

export function ProfileButton() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''

  return (
    <GradientButton
      onClick={() => navigate('/profile')}
      className="min-w-0 px-4 py-2"
    >
      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-white mr-2">
        {userName[0]?.toUpperCase()}
      </div>
      <span className="text-sm font-medium">{userName}</span>
    </GradientButton>
  )
} 